import {
    PayDialogFinishedServerAction,
    PayDialogStatuses,
    SaluteHandler,
    createInvoice,
    TaxSystemTypes,
    NdsTypes,
    findInvoiceById,
} from '@salutejs/scenario';
import { v4 as uuid } from 'uuid';

import {
    ActionType,
    CheckPaymentStatusAction,
    PayAction,
    PaymentInvoiceStatuses,
    ScenarioHandler,
    ScenarioRequest,
    ServerActionType,
} from '../types';
import { getOrderDate, isTest, isSaluteCommand, rubleToPenny, sendError } from '../utils';

interface OrderBundleItem {
    positionId: number;
    name: string;
    quantity: number;
    price: number;
    id: number;
}
const getOrderBundleItem = ({ positionId, name, quantity, price, id }: OrderBundleItem) => ({
    position_id: positionId,
    name,
    quantity: {
        value: quantity,
        measure: 'шт.',
    },
    item_amount: rubleToPenny(price * quantity),
    currency: 'RUB' as const,
    item_code: String(id),
    item_price: rubleToPenny(price),
    tax_type: NdsTypes.without,
    tax_sum: 0,
});

export const payment: ScenarioHandler = async ({ req, res }) => {
    const { recipientInfo, order } = req.state || {};
    const serverAction = req.serverAction as PayAction;

    if (!recipientInfo || !order) {
        return;
    }

    const { email, phone, address } = recipientInfo.recipient;
    const { city, street, house, flat } = address;
    const orderDate = getOrderDate();

    const orderBundle = !isTest()
        ? order.items.map((item, index) => getOrderBundleItem({ ...item, positionId: index + 1 }))
        : order.items
              .slice(0, 10)
              .map((item, index) => getOrderBundleItem({ ...item, positionId: index + 1, price: 0.1, quantity: 1 }));

    const amount = orderBundle.reduce((acc, item) => acc + item.item_price * item.quantity.value, 0);

    const { invoice_id: invoiceId, error } = await createInvoice({
        invoice: {
            purchaser: {
                phone,
                email,
            },
            delivery_info: {
                address: {
                    country: 'RU',
                    city,
                    address: [street, house, flat].filter((value) => value).join(', '),
                },
                delivery_type: 'courier',
            },
            order: {
                order_id: uuid(),
                order_date: orderDate,
                order_number: serverAction.payload.orderNumber,
                // TODO: уточнить нужен ли номер заказа order_number:
                currency: 'RUB',
                language: 'ru-RU',
                service_id: process.env.SMARTPAY_SERVICEID || '',
                purpose: 'ИП Марков Игорь Владимирович',
                description: 'Покупка в магазине CCCSTORE',
                amount,
                tax_system: TaxSystemTypes.uproshennui,
                order_bundle: orderBundle,
            },
        },
    });

    if (typeof invoiceId === 'undefined') {
        sendError(res, error.error_description, error.error_description);
        return;
    }

    res.askPayment(invoiceId);
};

export const paymentFinished: SaluteHandler<ScenarioRequest> = async ({ req, res }) => {
    const {
        parameters: {
            payment_response: { response_code: responseCode, invoice_id: invoiceId },
        },
    } = (req.serverAction as unknown) as PayDialogFinishedServerAction;

    switch (responseCode) {
        case PayDialogStatuses.success: {
            /* Не проверяем сразу же статус платежа в сценарии, т.к. отваливаемся по таймауту vps.
               На клиенте после получения экшена 'paymentFinished' направляем сервер экшен
               checkPaymentStatus, в котором проверяем статус
            */
            res.appendCommand<ActionType>({
                type: 'paymentFinished',
                payload: { invoiceId },
            });
            return;
        }
        case PayDialogStatuses.rejected: {
            sendError(res, responseCode.toString(), 'Оплата отклонена');
            return;
        }
        case PayDialogStatuses.timesUp: {
            sendError(res, responseCode.toString(), 'Время оплаты счета истекло');
            return;
        }
        case PayDialogStatuses.unavailable: {
            sendError(res, responseCode.toString(), 'Оплата недоступна');
            return;
        }
        default:
            sendError(res, responseCode.toString(), `Ошибка ${responseCode}`);
    }
};

const isCheckPaymentAction = (action: unknown): action is CheckPaymentStatusAction =>
    isSaluteCommand(action) && action.type === ServerActionType.CHECK_PAYMENT_STATUS;

export const checkPaymentStatus: SaluteHandler<ScenarioRequest> = async ({ req, res }) => {
    if (!isCheckPaymentAction(req.serverAction)) {
        return;
    }

    const {
        payload: { invoiceId },
    } = req.serverAction;

    const { invoice_status: invoiceStatus } = await findInvoiceById(invoiceId, {
        wait: 5,
    });

    let failedResult;

    switch (invoiceStatus) {
        case PaymentInvoiceStatuses.confirmed:
            res.appendCommand<ActionType>({ type: 'paymentConfirmed' });
            return;
        case PaymentInvoiceStatuses.executed:
            res.appendCommand<ActionType>({
                type: 'paymentFinished',
                payload: { invoiceId },
            });
            return;
        case PaymentInvoiceStatuses.cancelled:
            failedResult = 'заказ отменен пользователем';
            break;
        case PaymentInvoiceStatuses.reversed:
            failedResult = 'заказ отменен продавцом';
            break;
        case PaymentInvoiceStatuses.refunded:
            failedResult = 'осуществлен полный возврат';
            break;
        default:
    }

    if (failedResult) {
        sendError(res, failedResult);
    }
};

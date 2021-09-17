import { SaluteHandler } from '@salutejs/scenario';
import { v4 as uuid } from 'uuid';

import { CreateOrderResponse } from '../intergration/types';
import { getToken, isAxiosError, request } from '../intergration/request';
import { ScenarioAppState, ActionType, RecipientInfo as ExternalRecipient, Order as ExternalOrder } from '../types';
import { endpoints } from '../intergration/endpoints';

interface Recipient {
    name: string;
    last_name: string;
    email: string;
    phone: string;
}

type Payment = { type: 'CACH' | 'PREPAY' };

interface Location {
    country: string;
    city: string;
    region?: string;
    sub_region?: string;
}

interface Address {
    street: string;
    house: string;
    apartment: string;
}

interface Product {
    code: string;
    quantity: number;
    price: number;
}

interface Order {
    recipient: Recipient;
    payment: Payment;
    location: Location;
    address: Address;
    goods: Product[];
    comment?: string;
}

export interface OrderRequestData {
    order_number_client: string;
    order_comment?: string;
}
export interface OrderRegistrationRequestData extends OrderRequestData {
    order: Order;
}

const normalizePhone = (value: string): string => {
    const phone = value.replace(/[+()-]/g, '');
    return `+7${phone.length === 11 ? phone.slice(1) : phone}`;
};

const orderRegistrationRequestDataAdapter = (
    recipient: ExternalRecipient['recipient'],
    order: ExternalOrder,
    clientOrderNumber: string,
): OrderRegistrationRequestData => {
    const { name, phone, email } = recipient;
    const [firstName, ...lastName] = name.split(' ');
    const {
        address: { city, street, house, flat },
    } = recipient;

    return {
        order: {
            recipient: {
                name: firstName,
                last_name: lastName.join(),
                email,
                phone: normalizePhone(phone),
            },
            payment: {
                type: 'PREPAY',
            },
            location: {
                country: 'RU',
                city,
            },
            address: {
                street,
                house,
                apartment: flat || 'Частный дом', // Если нет квартиры хардкодим частный дом (требование API)
            },
            goods: order.items.map(({ id, price, quantity }) => ({
                code: String(id),
                price: price * 100,
                quantity,
            })),
        },
        order_number_client: clientOrderNumber,
    };
};

export const createOrder: SaluteHandler = async ({ req, res }) => {
    const { order, recipientInfo } = req.state as ScenarioAppState;

    if (!order || !recipientInfo) {
        res.appendError({
            code: 400,
            description: 'Не передан заказ для регистрации',
        });

        return;
    }
    try {
        await getToken();

        const body = orderRegistrationRequestDataAdapter(recipientInfo.recipient, order, uuid());

        const { data: createdOrder } = await request.post<CreateOrderResponse>(endpoints.create, body);

        res.appendCommand<ActionType>({
            type: 'getOrderNumber',
            payload: {
                orderNumber: createdOrder.data.order_number,
            },
        });
    } catch (error) {
        if (isAxiosError<CreateOrderResponse>(error)) {
            console.error('ERROR', error.toJSON());
        } else {
            console.error('ERROR', error);
        }
        

        res.appendError({
            code: 400,
            description: 'Bad request',
        });
    }
};

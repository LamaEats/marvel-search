import { SaluteHandler } from '@salutejs/scenario';
import { CreateOrderResponse } from '../intergration/types';
import { getToken, request } from '../intergration/request';
import { ScenarioAppState, ActionType } from '../types';
import { endpoints } from '../intergration/endpoints';
import { access } from './access';

export const createOrder: SaluteHandler = async ({ req, res }) => {
    const { order, recipientInfo } = req.state as ScenarioAppState;

    console.log(order)

    if (!order || !recipientInfo) {
        res.appendError({
            code: 400,
            description: 'Не передан заказ для регистрации',
        });

        return;
    }
    try {
        console.log(access.value);
        await getToken();

        const { data: createdOrder } = await request.post<CreateOrderResponse>(endpoints.create, {
            order,
        });

        res.appendCommand<ActionType>({
            type: 'getOrderNumber',
            payload: {
                orderNumber: createdOrder.data.order_number,
            },
        });
    } catch (error) {
        console.error('ERROR', error);

        res.appendError({
            code: 400,
            description: 'Bad request'
        })
    }
};

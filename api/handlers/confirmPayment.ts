import { SaluteHandler } from '@salutejs/scenario';

import { endpoints } from '../intergration/endpoints';
import { request } from '../intergration/request';
import { PaymentConfirm } from '../types';

export const confirmPayment: SaluteHandler = ({ req }) => {
    const action = req.serverAction as PaymentConfirm;

    if (action.payload.clientId) {
        request.post(endpoints.paymentStatus, {
            order_number_client: action.payload.clientId
        });
    }
}
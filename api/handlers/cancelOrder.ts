import { SaluteHandler } from "@salutejs/scenario";
import { endpoints } from "../intergration/endpoints";
import { request } from "../intergration/request";
import { PaymentError } from "../types";

export const cancelOrder: SaluteHandler = async ({ req }) => {
    const action = req.serverAction as PaymentError;

    if (action.payload.clientId) {
        request.post(endpoints.cancel, {
            order_number_client: action.payload.clientId
        })
    }
}
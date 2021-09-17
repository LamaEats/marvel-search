import { config as dotEnv } from 'dotenv';
import path from 'path';

import { isTest } from "../utils";

dotEnv({
    path: path.resolve(__dirname, '../..', 'config.env'),
});

const endpoint = ([s]: TemplateStringsArray): string => {
    let base = process.env.CCCSTORE_API;

    if (isTest()) {
        base = process.env.CCCSTORE_API_TEST;
    }

    return `/${base}/${s}`;
};

interface Endpoints {
    readonly create: string;
    readonly cancel: string;
    readonly paymentStatus: string;
    readonly paymentCancel: string;
    readonly token: string;
}

export const endpoints: Endpoints = {
    create: endpoint`sale/order/create/`,
    cancel: endpoint`sale/order/cancel/`,
    paymentStatus: endpoint`sale/order/payment/status_paid/`,
    paymentCancel: endpoint`sale/order/payment/status_cancel/`,
    token: endpoint`token/`,
};
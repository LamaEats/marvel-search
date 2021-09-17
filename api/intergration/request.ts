import axios, { AxiosResponse, AxiosError } from 'axios';
import { isTest } from '../utils';
import { endpoints } from './endpoints';

import { access } from '../handlers/access'
import { Response } from './types';

export const request = axios.create({
    baseURL: process.env.CCCSTORE_API_BASE_URL,
    data: {
        token: access.value,
    },
});

interface Credentials {
    login: string;
    password: string;
}

const getCredentials = (): Credentials => {
    const released = !isTest();

    const credentials = {
        login: released ? process.env.CCCSTORE_LOGIN : process.env.CCCSTORE_LOGIN_TEST,
        password: released ? process.env.CCCSTORE_PASSWORD : process.env.CCCSTORE_PASSWORD_TEST,
    };
    return credentials as NonNullable<Credentials>;
};

export const isAxiosError = <T>(error: unknown): error is AxiosError<T> => {
    if (!(error instanceof Error)) {
        return false;
    }

    if ('isAxiosError' in error) {
        return (error as AxiosError).isAxiosError
    }

    return false;
}

export const getToken = () => {
    return new Promise((resolve, reject) => {
        const { login, password } = getCredentials();

        request.post(endpoints.token, {
            client_login: login,
            client_password: password,
        }, {
            baseURL: process.env.CCCSTORE_API_BASE_URL,
        }).then((res) => {
            const {
                data: { status, data, errors },
            } = res;

            if (status === 'success') {
                access.value = data.token;
            } else {
                reject(errors[0].message);
            }

            resolve(undefined);
        }, reject)
    })
}

request.interceptors.request.use(async (config) => {
    if (config.url && !config.url.includes('token')) {
        await getToken();

        // Подклеиваем токен в тело запроса
        config.data = {
            ...config.data,
            token: access.value,
        };
    }

    return config;
})

request.interceptors.response.use((response: AxiosResponse<Response>) => {
    console.log('========== RESPONSE ===========')
    console.log(JSON.stringify(response.data, null, 4));

    const { data } = response;

    if (data.status === 'error') {
        return Promise.reject(data.errors);
    }
    return Promise.resolve(response);
});


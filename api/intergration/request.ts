import https from 'http';
import axios, { AxiosResponse } from 'axios';
import { isTest } from '../utils';
import { endpoints } from './endpoints';

import { access } from '../handlers/access'
import { Response, TokenResponse } from './types';

const originalRequest = https.request;

https.request = function wrapMethodRequest(...args) {
    console.log('========== OUTGOING REQUEST ===========')
    console.log(args[0]);
 
    return originalRequest.call(this, ...args as Parameters<typeof originalRequest>);
}

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
    // const { login, password } = getCredentials();
    // console.log(login, password);

    // axios.post(endpoints.token, {
    //     client_login: login,
    //     client_password: password,
    // }, {
    //     baseURL: process.env.CCCSTORE_API_BASE_URL,
    // }).then((res) => {
    //     const {
    //         data: { status, data, errors },
    //     } = res;

    //     if (status === 'success') {
    //         access.value = data.token;
    //     } else {
    //         Promise.reject(errors[0].message);
    //     }
    // })
    // try {
    //     const {
    //         data: { status, data, errors },
    //     } = await axios.post<TokenResponse>(endpoints.token, {
    //         client_login: login,
    //         client_password: password,
    //     }, {
    //         baseURL: process.env.CCCSTORE_API_BASE_URL
    //     });

    //     if (status === 'success') {
    //         access.value = data.token;
    //     } else {
    //         Promise.reject(errors[0].message)
    //     }
    // } catch (error) {
    //     Promise.reject(error);
    // }

    // Promise.resolve();
}

// request.interceptors.request.use(async (config) => {
//     if ((config.method || '').toUpperCase() === 'POST') {
//         try {
//             if (!access.value) {
//                 await getToken();
//             }
//         }
//         catch(error) {
//             throw error
//         }
//     }

//     return Promise.resolve(config)
// })

request.interceptors.response.use((response: AxiosResponse<Response>) => {
    console.log('========== RESPONSE ===========')
    console.log(JSON.stringify(response.data, null, 4));

    const { data } = response;

    if (data.status === 'error') {
        return Promise.reject(data.errors);
    }
    return Promise.resolve(response);
});


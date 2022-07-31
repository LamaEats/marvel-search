import axios from 'axios';
import md5 from 'md5';

import { Endpoint, EndpointResponse, Params } from './endpoints';
import './loadConfig';

interface RequestGet {
    <T extends Endpoint>(path: T, defaultParams?: Partial<Params<T>>): (
        values: Partial<Params<T>>,
    ) => Promise<EndpointResponse[typeof path]>;
}

const parseQuery = <Q extends string, V extends Record<any, any>>(query: Q, val: V): string => {
    return query.replace(/{(.+?)}/gi, (_, key: string) => {
        const [name, type] = key.split(':') as [keyof V, ...string[]];

        if (val[name]) {
            const n = name as string;
            if (type && type !== 'custom') {
                if (typeof val[n] !== type) {
                    throw new TypeError(`'${n}' type not equals '${type}'`);
                }
            }

            return `${n}=${val[n]}`;
        }

        return '';
    });
};

export const replacePlaceholders = <T extends Endpoint, P extends Partial<Params<T>>>(
    string: T,
    obj?: P,
): [string, P] => {
    if (obj == null) {
        return [string, {} as P];
    }

    let [cleanUrl, query] = string.split('?');

    cleanUrl = cleanUrl.replace(/{(.+?)}/gi, (_: string, key: string) => {
        const [name, type] = key.split(':') as [keyof P, ...string[]];
        const n = name as string;

        const val = obj[name];

        if (val) {
            if (type && type !== 'custom') {
                if (typeof val !== type) {
                    throw new TypeError(`'${n}' type not equals '${type}'`);
                }
            }

            delete obj[name];

            return val as unknown as string;
        }

        return '';
    });

    if (query && query.length) {
        query = parseQuery(query, obj);
    }

    return [cleanUrl, obj];
};

const httpClient = axios.create({
    baseURL: process.env.REACT_APP_API_GATEAWAY,
    params: {
        apikey: process.env.REACT_APP_API_KEY,
    },
});

httpClient.interceptors.request.use(
    (config) => {
        const now = Date.now();
        config.params = {
            ...config.params,
            ts: now,
            hash: md5(String(now) + process.env.REACT_APP_PRIVATE_KEY + process.env.REACT_APP_API_KEY),
        };

        return config;
    },
    (error) => {
        console.error(error.toJSON());

        throw error;
    },
);

export const get: RequestGet = (endpoint, defaultParams) => {
    return async (params) => {
        const [path, restParams] = replacePlaceholders(endpoint, { ...defaultParams, ...params });

        return httpClient
            .get(path, {
                params: restParams,
            })
            .then((response) => response.data);
    };
};

export const search = get(Endpoint.characters);
export const character = get(Endpoint.character);
export const characterContent = get(Endpoint.characterContent, { limit: 20, offset: 0 });

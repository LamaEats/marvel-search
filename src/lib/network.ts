import axios from 'axios';

interface RequestGet {
    <R, R1 = R>(path: string, dataGetter?: (res: R) => R1): <P extends Params>(
        values?: P,
    ) => typeof dataGetter extends void ? Promise<R> : Promise<R1>;
}

export type Params = Record<string, unknown>;

export const prepareRelativePath = (path: string): string => {
    let url: URL | string;
    try {
        url = new URL(path);
    } catch (_) {
        url = path;
    }

    if (typeof url === 'string') {
        return url;
    }

    return `${url.pathname}${url.search}`;
};

export const replacePlaceholders = <P extends Params>(string: string, obj?: P): [string, P] => {
    if (obj == null) {
        return [prepareRelativePath(string), {} as P];
    }

    const restParams = { ...obj };
    const nextString = string.replace(/{(.+?)}/gi, (_match, key) => {
        if (obj[key] != null) {
            delete restParams[key];

            return obj[key] as string;
        }

        return '';
    });

    return [prepareRelativePath(nextString), restParams];
};

const httpClient = axios.create();

export const get: RequestGet = (endpoint, dataGetter) => {
    return async (params) => {
        const [path, restParams] = replacePlaceholders(endpoint, params);

        return httpClient
            .get(path, {
                params: restParams,
            })
            .then((response) => response.data)
            .then((response) => {
                if (dataGetter) {
                    return dataGetter(response);
                }

                return response;
            });
    };
};

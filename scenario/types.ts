import { VercelRequest, VercelResponse } from '@vercel/node';
import { AppState, NLPRequest, SaluteHandler, SaluteRequest, SaluteRequestVariable, SaluteResponse, ScenarioSchema } from '@salutejs/scenario';


import { ActionType, Hero } from '../src/types/types';
import { Endpoint, EndpointResponse } from './endpoints';

interface Request extends VercelRequest {
    body: NLPRequest;
}
export interface ApiHandler {
    (req: Request, res: VercelResponse): void;
}

export interface ScenarioSession {
    [key: string]: unknown;
}

type Action<T extends string, P> = {
    type: T;
    payload: P extends void ? never : P;
};

export type State = {
    screen: Screen;
    character: Required<Hero>;
} & AppState;

interface ServerAction {
    [ActionType.Search]: Action<ActionType.Search, { search: string }>;
    [ActionType.Results]: Action<ActionType.Results, { type: string; id: number }>;
    [key: string]: any;
}

export type ScenarioRequest = SaluteRequest<SaluteRequestVariable, AppState, ServerAction[string]>;
export type ScenarioHandler = SaluteHandler<ScenarioRequest, ScenarioSession>;

export type Handler<
    E extends Endpoint,
    Rq extends SaluteRequest = ScenarioRequest,
    S extends Record<string, unknown> = Record<string, unknown>,
    Rs extends SaluteResponse = SaluteResponse,
    H extends Record<string, unknown> = Record<string, unknown>,
> = {
    (
        options: {
            req: Rq;
            res: Rs;
            session: S;
            history: H;
            apiResponse?: EndpointResponse[E]
        },
        dispatch?: (path: string[]) => void,
    ): void;
    (
        options: {
            req: Rq;
            res: Rs;
            session: S;
            history: H;
            apiResponse?: EndpointResponse[E]
        },
        dispatch?: (path: string[]) => void,
    ): Promise<void>;
};

export type HandleSchema<K extends Endpoint, Rq extends SaluteRequest, Sh extends Handler<K>> = Record<
    string,
    {
        match: (req: Rq) => boolean;
        schema?: string;
        handle: Sh;
        children?: HandleSchema<K, Rq, Sh>;
        apiCall?: K extends Endpoint ? (req: Rq) => Promise<EndpointResponse[K]> : never
    }
>;

export type ScenarioHandleSchemaMap<K extends Endpoint> = HandleSchema<K, ScenarioRequest, Handler<K>>;
export type ScenarioHandleSchema<K extends Endpoint = Endpoint> = ScenarioHandleSchemaMap<K>[string];

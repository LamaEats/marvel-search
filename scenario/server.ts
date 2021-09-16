import { VercelRequest, VercelResponse } from '@vercel/node';
import { NLPRequest, SaluteHandler, SaluteRequest, SaluteRequestVariable, ScenarioSchema } from '@salutejs/scenario';
import { AppState } from '@salutejs/types';
import { ActionType } from '../src/types/types';

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

interface ServerAction {
    [key: string]: any;
    [ActionType.Search]: Action<ActionType.Search, { search: string }>;
    [ActionType.Results]: Action<ActionType.Results, { type: string; id: number }>;
}

export type ScenarioRequest = SaluteRequest<SaluteRequestVariable, AppState, ServerAction[string]>;
export type ScenarioHandler = SaluteHandler<ScenarioRequest, ScenarioSession>;

export type HandlerConfig = ScenarioSchema<ScenarioRequest, ScenarioHandler>[string];

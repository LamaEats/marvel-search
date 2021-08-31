import { VercelRequest, VercelResponse } from '@vercel/node';
import { NLPRequest, SaluteHandler, SaluteRequest, SaluteRequestVariable } from '@salutejs/scenario';

interface Request extends VercelRequest {
    body: NLPRequest;
}
export interface ApiHandler {
    (req: Request, res: VercelResponse): void;
}

export interface ScenarioSession {
    [key: string]: unknown;
}

export interface ScenarioHandler<T extends SaluteRequestVariable, S extends ScenarioSession = ScenarioSession>
    extends SaluteHandler<SaluteRequest<T>, S extends ScenarioSession ? S : Record<string, unknown>> {}

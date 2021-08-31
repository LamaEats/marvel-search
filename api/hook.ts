import { ApiHandler } from '../src/types/server';
import { v4 as uuid } from 'uuid';

import {
    createUserScenario,
    createSystemScenario,
    createSaluteRequest,
    createSaluteResponse,
    createScenarioWalker,
} from '@salutejs/scenario';
import { SaluteMemoryStorage } from '@salutejs/storage-adapter-memory';

import { noMatchHandler, runAppHandler } from './handlers';

const userScenario = createUserScenario({});

const scenarioWalker = createScenarioWalker({
    systemScenario: createSystemScenario({
        RUN_APP: runAppHandler,
        NO_MATCH: noMatchHandler,
    }),
    userScenario,
});

const storage = new SaluteMemoryStorage();

const handle: ApiHandler = async (request, response) => {
    const { body } = request;
    const req = createSaluteRequest(body);
    const res = createSaluteResponse(body);

    let sessionId: string;

    if (body.uuid && body.uuid.userId) {
        sessionId = body.uuid.userId;
    } else {
        sessionId = uuid();
    }

    const session = await storage.resolve(sessionId);

    await scenarioWalker({ req, res, session });
    await storage.save({ id: sessionId, session });

    response.status(200).json(res.message);
};

module.exports = handle;

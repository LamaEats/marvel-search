import path from 'path';
import fs, { } from 'fs'
import { config as dotEnv } from 'dotenv';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { v4 } from 'uuid';
import { createSaluteRequest, createSaluteResponse, createScenarioWalker } from '@salutejs/scenario';
import { SaluteMemoryStorage } from '@salutejs/storage-adapter-memory';
import { SmartAppBrainRecognizer } from '@salutejs/recognizer-smartapp-brain';

import { systemScenario, userScenario, intents } from './scenario';
import { ServerAction } from './types';
// import { IncomingRequest, OutcomingResponse } from './types';

dotEnv({
    path: path.resolve(__dirname, '..', 'config.env'),
});

const storage = new SaluteMemoryStorage();

const scenarioWalker = createScenarioWalker({
    intents,
    recognizer: new SmartAppBrainRecognizer('e604b3b8-b452-4f31-bae9-4a41a88faf22'),
    systemScenario,
    userScenario,
});

const makeDir = () => {
    return new Promise((resolve, reject) => {
        fs.mkdir(path.join(__dirname, '..', 'responces'), (error) => {
            if (error != null) {
                reject(error);
            }

            resolve(void 0);
        })
    })
}

const writeJSONRequest = async <T>(val:T, name: string): Promise<void> => {
    console.log(__dirname);
    const dir = path.resolve(__dirname, '..', 'responces');

    if (!fs.existsSync(dir)) {
        await makeDir();
    }

    if (fs.existsSync(`${dir}/${name}.json`)) {
        return;
    }

    fs.writeFile(`${dir}/${name}.json`, JSON.stringify(val, null, 4), {
        encoding: 'utf-8',
    }, (error) => {
        if (error != null) {
            console.error(error);
        }
    })
}


module.exports = async (request: VercelRequest, response: VercelResponse) => {
    if (request.method === 'GET') {
        response.status(200).json({ message: 'OK' });
        return;
    }

    const { body } = request;
    const req = createSaluteRequest(body);
    const res = createSaluteResponse(body);

    const sessionId = body.uuid.userId || v4();
    const session = await storage.resolve(sessionId);

    // if (req.serverAction && 'payload' in req.serverAction) {
    //     const action = req.serverAction.payload as ServerAction;
    //     console.log('WRITE JSON CALL for: ', action.type)
    //     writeJSONRequest(request.body, action.type);
    // }

    // console.log('Session', session);

    await scenarioWalker({ req, res, session });
    await storage.save({ id: sessionId, session });

    response.status(200).json(res.message);
}

// module.exports = async function (request: IncomingRequest, response: OutcomingResponse) {
//     if (request.path?.includes('hook')) {
//         const { body } = request;
//         const req = createSaluteRequest(body);
//         const res = createSaluteResponse(body);

//         const sessionId = body.uuid.userId || v4();
//         const session = await storage.resolve(sessionId);

//         if (req?.serverAction != null) {
//             console.log('SERVER_ACTION', req.serverAction);
//         }

//         await scenarioWalker({ req, res, session });
//         await storage.save({ id: sessionId, session });

//         return response.status(200).succeed(res.message);
//     }

//     const reply = `Hello from NodeJS14-graphql function!\nYou said: ${request.body}\n`;

//     return response.status(200).succeed(reply);
// }

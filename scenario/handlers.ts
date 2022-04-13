import { AppState, createIntents, createMatchers, SaluteHandler, SaluteRequest, ScenarioSchema } from '@salutejs/scenario';
import { GalleryCardParams } from '@sberdevices/plasma-temple';

import { createMediaUrl } from '../src/lib/createMediaUrl';
import { characterContent, search } from './network';
import {
    ScenarioHandleSchema,
    ScenarioHandleSchemaMap,
    ScenarioRequest,
    State,
} from './types';
import { ActionType, Screen } from '../src/types/types';

import { intents } from '../src/intents.json';
import { Endpoint, EndpointResponse } from './endpoints';
import assert from 'assert';
import { cache } from './cache';
import { CharacterDataWrapper } from '../src/types/data';
import { hookLog } from './debug';

const intentsMap = createIntents(intents);

const { action, intent, match, state } = createMatchers<ScenarioRequest, typeof intentsMap>();

const oneOf =
    (...matchers: ((req: SaluteRequest) => boolean)[]) =>
    (req: SaluteRequest): boolean => {
        return matchers.some((matcher) => matcher(req));
    };

const stateGuard = (state?: AppState): state is Extract<State, AppState> => {
    if (!state) {
        return false;
    }

    return 'screen' in state;
};

export const runAppHandler: SaluteHandler = ({ res }) => {
    res.appendBubble('Начнем');
    res.appendCommand({
        type: 'pushHistory',
        payload: {
            history: {
                name: Screen.Search,
            },
        },
    });
};
// @ts-ignore
export const noMatchHandler: SaluteHandler = ({ res }) => {
    res.setPronounceText('Я не понимаю');
    res.appendBubble('Я не понимаю');
};

const searchAction: ScenarioHandleSchema<Endpoint.characters> = {
    match: oneOf(action(ActionType.Search), intent('/Hero')),

    apiCall: async (req) => {
        let query: string;

        if (req.serverAction) {
            const { payload } = req.serverAction;
            assert(('search' in payload), 'Missed handler');

            query = payload.search;
        } else {
            const val = JSON.parse(req.variant.slots[0].value) as { id: number; query: string };
            query = val.query;
        }

        return search({
            name: query,
        });
    },

    handle: async ({ res, apiResponse }) => {
        assert(apiResponse, 'No Content');

        const {
            data: {
                results: [character],
            },
        } = apiResponse;

        const contentKeys: Array<keyof Pick<typeof character, 'comics' | 'series' | 'stories' | 'events'>> = [
            'comics',
            'series',
            'stories',
            'events',
        ];

        const items = contentKeys.reduce((acc, key) => {
            const list = character[key];

            if (list.returned > 0) {
                acc.push({ type: key, count: list.returned });
            }

            return acc;
        }, [] as Array<{ type: keyof Pick<typeof character, 'comics' | 'series' | 'stories' | 'events'>; count: number }>);

        const prepareData = {
            character: {
                name: character.name,
                id: character.id,
                image: {
                    src: createMediaUrl(character.thumbnail, 'full_size'),
                },
            },
            availableContent: items,
        };

        res.appendCommand({
            type: ActionType.Results,
            payload: prepareData,
        });
    },
};

const contentAction: ScenarioHandleSchema<Endpoint.characterContent> = {
    match: match(oneOf(action(ActionType.Results), intent('/HeroContent')), state({ screen: Screen.Results })),
    apiCall: (req) => {
        const { state } = req;

        assert(stateGuard(state), 'Missed handler');

        const character = state.character.id;
        let type: string;

        if (req.serverAction) {
            const { payload } = req.serverAction;

            type = payload.type;
        } else {
            const val = JSON.parse(req.variant.slots[0].value) as { type: string };
            type = val.type;
        }

        return characterContent({ character, type });
    },
    handle: async ({ req, res }) => {
        const apiResponse = cache.get(ActionType.Results) as Exclude<EndpointResponse[Endpoint], CharacterDataWrapper>;
        assert(apiResponse, 'no cache');

        const {
            data: { results },
        } = apiResponse;

        const cards: GalleryCardParams[] = results.map((result, index) => {
            return {
                image: {
                    src: createMediaUrl(result.thumbnail, 'portrait_uncanny'),
                },
                id: result.id,
                label: result.title,
                position: index + 1,
            };
        });

        let type: string;

        if (req.serverAction) {
            const { payload } = req.serverAction;

            type = payload.type;
        } else {
            const val = JSON.parse(req.variant.slots[0].value) as { type: string };
            type = val.type;
        }

        res.appendCommand({
            type: ActionType.Content,
            payload: {
                type,
                activeGalleryIndex: 0,
                gallery: {
                    activeCardIndex: 0,
                    items: cards,
                },
            },
        });
    },
};

const contentMoreAction: ScenarioHandleSchema<any> = {
    match: action(ActionType.ContentMore),
    handle: async ({ req, res }) => {
        const { state } = req;

        if (!stateGuard(state)) {
            return;
        }

        const { payload } = req.serverAction!;

        if (!('type' in payload)) {
            return;
        }

        res.appendCommand({
            type: ActionType.ContentMore,
            payload: {},
        });
    },
};

const openFromItemSelector: ScenarioHandleSchema<any> = {
    match: match(oneOf(intent('/HeroNumber')), state({ screen: Screen.Content })),
    handle: async ({ req, res }) => {
        console.log(req);
    },
};

export const handlers = {
    [ActionType.Search]: searchAction,
    [ActionType.Results]: contentAction,
    [ActionType.HeroNumber]: openFromItemSelector,
    [ActionType.ContentMore]: contentMoreAction,
};

export const applyMiddlewares =
    <T extends Endpoint>(...middlewares: Array<(ex: ScenarioHandleSchema<T>) => ScenarioHandleSchema<T>>) =>
    (executer: ScenarioHandleSchema<T>): ScenarioHandleSchema<T> =>
        middlewares.reduce((r, m) => m(r), executer);

export const preprocessHandle = <K extends Endpoint>(map: ScenarioHandleSchemaMap<K>): ScenarioSchema => {
    const nextMap: ScenarioSchema = {};
    const keys = Object.keys(map) as ActionType[];
    for (const key of keys) {
        const handler = map[key];
        const { apiCall, handle } = handler;

        nextMap[key] = {
            ...handler,
            handle: async (opts, dispatch) => {
                const { req } = opts;

                if (apiCall) {
                    hookLog('call api from state')
                    cache.set(key, await apiCall(req));
                    hookLog('set cached response by key', key);
                }

                await handle({
                    ...opts,
                    // @ts-ignore
                    apiResponse: cache.get(key),
                }, dispatch);
            },
        };
    }

    return map;
};

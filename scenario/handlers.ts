import { createIntents, createMatchers, SaluteHandler, SaluteRequest } from '@salutejs/scenario';
import { GalleryCardParams } from '@sberdevices/plasma-temple';

import { createMediaUrl } from '../src/lib/createMediaUrl';
import { characterContent, search } from './network';
import { HandlerConfig, ScenarioRequest } from './server';
import { ActionType, Screen } from '../src/types/types';

import { intents } from '../src/intents.json'

const intentsMap = createIntents(intents);

const { action, intent } = createMatchers<ScenarioRequest, typeof intentsMap>();

const oneOf = (...matchers: ((req: SaluteRequest) => boolean)[]) => (req: SaluteRequest): boolean => {
    return matchers.some((matcher) => matcher(req));
}

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

export const noMatchHandler: SaluteHandler = ({ res }) => {
    res.setPronounceText('Я не понимаю');
    res.appendBubble('Я не понимаю');
};

const searchAction: HandlerConfig = {
    match: oneOf(action(ActionType.Search), intent('/Hero')),
    handle: async ({ req, res }) => {
        let query: string;
        

        if (req.serverAction) {
            const { payload } = req.serverAction;
            if (!('search' in payload)) {
                return;
            }

            query = payload.search;
        } else {
            const val = JSON.parse(req.variant.slots[0].value) as { id: number; query: string }
            query = val.query;
        }

        const {
            data: {
                results: [character],
            },
        } = await search({ name: query });

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
        }, [] as Array<{ type: keyof Pick<typeof character, 'comics' | 'series' | 'stories' | 'events'>, count: number }>);

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

const contentAction: HandlerConfig = {
    match: action(ActionType.Results),
    handle: async ({ req, res }) => {
        const { payload } = req.serverAction!;

        if (!('type' in payload)) {
            return;
        }

        const { data } = await characterContent({ character: payload.id, type: payload.type });

        const { results } = data;

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

        res.appendCommand({
            type: ActionType.Content,
            payload: {
                type: payload.type,
                activeGalleryIndex: 0,
                gallery: {
                    activeCardIndex: 0,
                    items: cards,
                },
            }
        })
    },
} 

const contentMoreAction: HandlerConfig = {
    match: action(ActionType.ContentMore),
    handle: async ({ req, res }) => {
        const { payload } = req.serverAction!;
        // const { } = req.state;

        if (!('type' in payload)) {
            return;
        }

        res.appendCommand({
            type: ActionType.ContentMore,
            payload: {},
        });
    },
};

export const handlers = {
    [ActionType.Search]: searchAction,
    [ActionType.Results]: contentAction,
};

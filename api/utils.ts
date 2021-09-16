import { AppState, createMatchers, SaluteCommand, SaluteRequest, SaluteResponse } from '@salutejs/scenario';

import config from './config';
import { intents } from './scenario';
import { ActionType, CommonAppState, ScenarioRequest } from './types';

const { selectItem } = createMatchers<ScenarioRequest, typeof intents>();

export const get = <D extends Record<string, any>, R>(source: D, path: string[] | string, defaulValue: R): R => {
    if (source == null || !path.length) {
        return defaulValue;
    }

    const paths = Array.isArray(path) ? path : path.split('.');

    const len = paths.length;
    let result = source;

    for (let i = 0; i < len; i += 1) {
        result = result[paths[i]];

        if (result == null) {
            return defaulValue;
        }
    }

    return result as R;
};

export const isSaluteCommand = (action: unknown): action is SaluteCommand =>
    typeof action === 'object' && action !== null && 'type' in action && 'payload' in action;

export const pushItemSelectorCommand = (req: SaluteRequest, res: SaluteResponse, selector: AppState) => {
    const item = selectItem(selector)(req) || {};

    if (isSaluteCommand(item.action)) {
        res.appendCommand(item.action);
    }
};

export const sendError = (res: SaluteResponse, error: string, bubbleError = config.message.error) => {
    res.setPronounceText(bubbleError);
    res.appendBubble(bubbleError);
    res.appendCommand<ActionType>({
        type: 'error',
        payload: { error },
    });
};

export const isGoodConfidence = (req: SaluteRequest) => {
    const confidence = get(req, 'inference.variants.0.confidence', 0);
    return confidence > 0.7;
};

export const getLastWord = (value: string): string => value.split(' ').slice(-1)[0];

export const screenMatcher = (screens: Array<keyof CommonAppState>) => (req: ScenarioRequest) =>
    // @ts-ignore
    screens.some((screen) => screen === get(req, 'state.screen', ''));

export const getOrderDate = () => {
    const date = new Date();
    const offset = date.getTimezoneOffset() / 60;
    const sign = offset > 0 ? '-' : '+';

    return `${date.toISOString().split('.')[0]}${sign}${Math.abs(offset).toString().padStart(2, '0')}`;
};

export const rubleToPenny = (value: number) => value * 100;

export const isTest = () => process.env.ENV !== 'prod';

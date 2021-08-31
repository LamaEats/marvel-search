import { SaluteHandler } from '@salutejs/scenario';
import { Screen } from '../src/types';

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

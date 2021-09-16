import {
    createIntents,
    createMatchers,
    createSystemScenario,
    createUserScenario,
    SaluteHandler,
    SaluteResponse,
    ScenarioSchema,
} from '@salutejs/scenario';
import assert from 'assert';

import config from './config';
import { cancelOrder } from './handlers/cancelOrder';
import { checkCartQuantityLimit, doneAddToCart, doneClearCart, doneRemoveFromCart } from './handlers/cart';
import { confirmPayment } from './handlers/confirmPayment';
import { createOrder } from './handlers/createOrder';
import { checkPaymentStatus, payment, paymentFinished } from './handlers/payment';
import model from './intents.json';
import {
    ActionType,
    CartQuantityLimitAction,
    // CommonAppState,
    DoneAddToCartAction,
    ErrorAction,
    ScenarioRequest,
    ServerAction,
    ServerActionType,
} from './types';
import { get, getLastWord, isGoodConfidence, pushItemSelectorCommand, screenMatcher, sendError } from './utils';

// const { pushScreen } = getActionCreators<CommonAppState>();
const pushScreen = (to: string) => ({
    type: 'pushHistory',
    payload: {
        history: {
            name: to,
        }
    }
}) 

export const intents = createIntents<typeof model.intents>(model.intents);

const handlers = {
    [ServerActionType.DONE_ADD_TO_CART]: doneAddToCart,
    [ServerActionType.DONE_REMOVE_FROM_CART]: doneRemoveFromCart,
    [ServerActionType.DONE_CLEAR_CART]: doneClearCart,
    [ServerActionType.CHECK_PAYMENT_STATUS]: checkPaymentStatus,
    [ServerActionType.CART_QUANTITY_LIMIT]: checkCartQuantityLimit,
    [ServerActionType.PAY]: payment,
    [ServerActionType.ERROR]: () => null,
    [ServerActionType.CREATE_ORDER]: createOrder,
    [ServerActionType.PAYMENT_ERROR]: cancelOrder,
    [ServerActionType.PAYMENT_CONFIRM]: confirmPayment,
}

export const systemScenario = createSystemScenario({
    RUN_APP: ({ res }) => {
        res.appendSuggestions(config.suggestions.main);
    },
    NO_MATCH: ({ res }) => {
        res.setPronounceText('Я не понимаю');
    },
    PAY_DIALOG_FINISHED: paymentFinished,
});

const { intent, match, state, action } = createMatchers<ScenarioRequest, typeof intents>();

const confirmReject: ScenarioSchema = {
    Confirm: {
        match: intent('/ConfirmReject/Confirm'),
        handle: ({ res }) => res.appendCommand<ActionType>({ type: 'confirm' }),
    },
    Reject: {
        match: intent('/ConfirmReject/Reject'),
        handle: ({ res }) => res.appendCommand<ActionType>({ type: 'reject' }),
    },
};

const checkOnOneProductInCart = (req: ScenarioRequest, res: SaluteResponse, moreThanOneProductPhrase: string) => {
    const items = get(req, 'state.item_selector.items', []);

    if (!items.length) {
        res.setPronounceText('В корзине нет товаров');
        return false;
    }

    if (items.length > 1) {
        res.setPronounceText(moreThanOneProductPhrase);
        return false;
    }

    return true;
};

export const userScenario = createUserScenario<ScenarioRequest>({
    OpenMain: {
        match: match(intent('/Navigation/OpenMain'), (req) => !state({ screen: 'main' })(req), isGoodConfidence),
        handle: ({ res }) => res.appendCommand(pushScreen('main')),
    },
    OpenAbout: {
        match: match(intent('/Navigation/OpenAbout'), state({ screen: 'main' })),
        handle: ({ res }) => res.appendCommand(pushScreen('about')),
    },
    OpenDelivery: {
        match: match(intent('/Navigation/OpenDelivery'), state({ screen: 'about' })),
        handle: ({ res }) => res.appendCommand(pushScreen('delivery')),
    },
    OpenContacts: {
        match: match(intent('/Navigation/OpenContacts'), state({ screen: 'about' })),
        handle: ({ res }) => res.appendCommand(pushScreen('contacts')),
    },
    OpenAddresses: {
        match: match(intent('/Navigation/OpenAddresses'), state({ screen: 'about' })),
        handle: ({ res }) => res.appendCommand(pushScreen('addresses')),
    },
    OpenLegalInfo: {
        match: match(intent('/Navigation/OpenLegalInfo'), state({ screen: 'about' })),
        handle: ({ res }) => res.appendCommand(pushScreen('legalInfo')),
    },
    OpenCatalog: {
        match: match(intent('/Navigation/OpenCatalog'), (req) => !state({ screen: 'catalog' })(req)),
        handle: ({ res }) => res.appendCommand(pushScreen('catalog')),
    },
    OpenCategoryCatalog: {
        match: match(intent('/Navigation/OpenCatalogCategory'), state({ screen: 'catalog' })),
        handle: ({ req, res }) => {
            const { category } = req.variables;

            assert(typeof category === 'string');

            const { id } = JSON.parse(category);

            pushItemSelectorCommand(req, res, { id });
        },
    },
    OpenItemByIndex: {
        match: match(intent('/Navigation/OpenItemByIndex'), screenMatcher(['main', 'catalog'])),
        handle: ({ req, res }) => {
            const { number, ordinal } = req.variables;
            const index = number || ordinal;

            if (index === undefined) {
                res.setPronounceText('Я не понимаю');
                return;
            }
            pushItemSelectorCommand(req, res, { number: Number(index) });
        },
    },
    OpenGoods: {
        match: match(intent('/Navigation/OpenGoods'), screenMatcher(['main', 'catalog'])),
        handle: ({ req, res }) => {
            const { product } = req.variables;

            assert(typeof product === 'string');

            const { id } = JSON.parse(product);

            pushItemSelectorCommand(req, res, { id });
        },
    },
    FillName: {
        match: match(intent('/Form/Name'), state({ screen: 'recipient', active: 'name' })),
        handle: ({ req, res }) => {
            const { name, surname } = req.variables;

            assert(typeof name === 'string');

            res.appendCommand<ActionType>({
                type: 'fieldFill',
                payload: { value: [`${getLastWord(name)} ${surname}`] },
            });
        },
        children: confirmReject,
    },
    FillPhone: {
        match: match(intent('/Form/Phone'), state({ screen: 'recipient', active: 'phone' })),
        handle: ({ req, res }) => {
            const { phone } = req.variables;

            assert(typeof phone === 'string');

            res.appendCommand<ActionType>({ type: 'fieldFill', payload: { value: [phone] } });
        },
        children: confirmReject,
    },
    OpenCart: {
        match: match(intent('/Navigation/OpenCart'), (req) => !screenMatcher(['makeOrder'])(req)),
        handle: ({ res }) => res.appendCommand(pushScreen('cart')),
    },
    AddToCart: {
        match: match(intent('/Cart/AddToCart'), screenMatcher(['product'])),
        handle: ({ req, res }) => {
            const { quantity = '1' } = req.variables;

            assert(typeof quantity === 'string');

            res.appendCommand<ActionType>({ type: 'addToCart', payload: { quantity: +quantity } });
        },
    },
    DoneAddToCart: {
        match: action(ServerActionType.DONE_ADD_TO_CART),
        handle: ({ req, res }) => {
            const serverAction = req.serverAction as DoneAddToCartAction;
            const { quantity } = serverAction.payload;

            if (quantity > 0) {
                res.setPronounceText(`Добавил ${quantity} в корзину`);
            } else {
                res.setPronounceText(`Удалили ${Math.abs(quantity)} из корзины`);
            }
        },
    },
    DoneRemoveFromCart: {
        match: action(ServerActionType.DONE_REMOVE_FROM_CART),
        handle: ({ res }) => {
            res.setPronounceText('Удалили из корзины');
        },
    },
    DoneClearCart: {
        match: action(ServerActionType.DONE_CLEAR_CART),
        handle: ({ res }) => {
            res.setPronounceText('Очистил');
        },
    },
    ChangeQuantityPlus: {
        match: match(intent('/Cart/ChangeQuantityPlus'), screenMatcher(['cart']), isGoodConfidence),
        handle: ({ req, res }) => {
            if (
                !checkOnOneProductInCart(
                    req,
                    res,
                    'В корзине более одного товара. Я не понимаю количество какого товара изменить'
                )
            ) {
                return;
            }

            const { quantity = '1' } = req.variables;

            assert(typeof quantity === 'string');

            res.appendCommand<ActionType>({ type: 'addToCart', payload: { quantity: +quantity } });
        },
    },
    ChangeQuantityMinus: {
        match: match(intent('/Cart/ChangeQuantityMinus'), screenMatcher(['cart']), isGoodConfidence),
        handle: ({ req, res }) => {
            if (
                !checkOnOneProductInCart(
                    req,
                    res,
                    'В корзине более одного товара. Я не понимаю количество какого товара изменить'
                )
            ) {
                return;
            }

            const { quantity = '1' } = req.variables;

            assert(typeof quantity === 'string');

            res.appendCommand<ActionType>({ type: 'addToCart', payload: { quantity: -quantity } });
        },
    },
    RemoveFromCart: {
        match: match(intent('/Cart/RemoveFromCart'), screenMatcher(['cart'])),
        handle: ({ req, res }) => {
            if (!checkOnOneProductInCart(req, res, 'В корзине более одного товара. Я не понимаю какой товар удалить')) {
                return;
            }

            res.setPronounceText('Подтвердите удаление товара из корзины');
        },
        children: {
            Confirm: {
                match: intent('/ConfirmReject/Confirm'),
                handle: ({ res }) => {
                    res.appendCommand<ActionType>({ type: 'removeFromCart' });
                },
            },
            Reject: {
                match: intent('/ConfirmReject/Reject'),
                handle: ({ res }) => res.setPronounceText('Хорошо оставил в корзине'),
            },
        },
    },
    ClearCart: {
        match: match(intent('/Cart/ClearCart'), screenMatcher(['cart'])),
        handle: ({ req, res }) => {
            const items = get(req, 'state.item_selector.items', []);

            if (!items.length) {
                res.setPronounceText('В корзине нет товаров');
                return;
            }
            res.setPronounceText('Подтвердите удаление всех товаров из корзины');
        },
        children: {
            Confirm: {
                match: intent('/ConfirmReject/Confirm'),
                handle: ({ res }) => {
                    res.appendCommand<ActionType>({ type: 'clearCart' });
                },
            },
            Reject: {
                match: intent('/ConfirmReject/Reject'),
                handle: ({ res }) => res.setPronounceText('Хорошо оставил в корзине'),
            },
        },
    },
    MakeOrder: {
        match: match(intent('/Cart/MakeOrder'), screenMatcher(['cart'])),
        handle: ({ res }) => {
            res.appendCommand<ActionType>({ type: 'makeOrder' });
        },
    },
    Error: {
        match: action(ServerActionType.ERROR),
        handle: ({ req, res }) => {
            const serverAction = req.serverAction as ErrorAction;
            const { error } = serverAction.payload;
            sendError(res, error, error);
        },
    },
    ChangeRecipient: {
        match: match(intent('/Order/RecipientInfo'), screenMatcher(['makeOrder'])),
        handle: ({ res }) => {
            res.appendCommand<ActionType>({ type: 'changeRecipient' });
        },
    },
    ChangeDelivery: {
        match: match(intent('/Order/Delivery'), screenMatcher(['makeOrder'])),
        handle: ({ res }) => {
            res.appendCommand<ActionType>({ type: 'changeDelivery' });
        },
    },
    CartQuantityLimit: {
        match: action(ServerActionType.CART_QUANTITY_LIMIT),
        handle: ({ req, res }) => {
            const serverAction = req.serverAction as CartQuantityLimitAction;
            const { limit } = serverAction.payload;
            const message = `К сожалению не могу добавить в корзину больше ${limit} товаров`;

            res.setPronounceText(message);
            res.appendBubble(message);
        },
    },
    AskPayment: {
        match: match(intent('/Order/Payment'), screenMatcher(['makeOrder'])),
        handle: ({ res }) => {
            // Стартуем оплату экшеном от клиента иначе отваливаемся по таймауту vps
            // Клиенту просто сообщаем, что необходимо стартовать оплату
            res.appendCommand<ActionType>({ type: 'startPayment' });
        },
    },
    Payment: {
        match: match(action(ServerActionType.PAY), screenMatcher(['makeOrder'])),
        handle: payment,
    },
    PaymentStatus: {
        match: action(ServerActionType.CHECK_PAYMENT_STATUS),
        handle: checkPaymentStatus,
    },
    CreateOrder: {
        match: action(ServerActionType.CREATE_ORDER),
        handle: createOrder,
    },
    PaymentError: {
        match: action(ServerActionType.PAYMENT_ERROR),
        handle: cancelOrder,
    },
    PaymentConfirm: {
        match: action(ServerActionType.PAYMENT_CONFIRM),
        handle: confirmPayment,
    },
    CALL_SCENARIO: {
        match: action('CALL_SCENARIO'),
        handle: async (obj) => {
            const { payload } = obj.req.serverAction as ServerAction;

            let handler: SaluteHandler | void = handlers[payload.type];

            if (typeof handler === 'function') {
                await handler(obj);
            }
        }
    }
});

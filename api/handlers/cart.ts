import { SaluteHandler } from "@salutejs/scenario";
import { ActionType, CartQuantityLimitAction, DoneAddToCartAction } from "../types";

export const doneAddToCart: SaluteHandler = ({ req, res }) => {
    const serverAction = req.serverAction as DoneAddToCartAction;
    const { quantity } = serverAction.payload;

    if (quantity > 0) {
        res.setPronounceText(`Добавил ${quantity} в корзину`);
    } else {
        res.setPronounceText(`Удалили ${Math.abs(quantity)} из корзины`);
    }
}

export const doneRemoveFromCart: SaluteHandler = ({ res }) => {
    res.setPronounceText('Удалили из корзины');
}

export const doneClearCart: SaluteHandler = ({ res }) => {
    res.setPronounceText('Очистил');
}

export const checkCartQuantityLimit: SaluteHandler = ({ req, res }) => {
    const serverAction = req.serverAction as CartQuantityLimitAction;
    const { limit } = serverAction.payload;
    const message = `К сожалению не могу добавить в корзину больше ${limit} товаров`;

    res.setPronounceText(message);
    res.appendBubble(message);
}

export const pay: SaluteHandler = ({ res }) => {
    res.appendCommand<ActionType>({ type: 'makeOrder' });
}
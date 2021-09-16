import { AppState, SaluteRequest, SaluteHandler, SaluteRequestVariable, NLPRequest } from '@salutejs/scenario';
import { FormState, GalleryPageState } from '@sberdevices/plasma-temple';
import { IncomingHttpHeaders, OutgoingHttpHeaders } from 'node:http';

// TODO: CartItem и Order необходимо импортировать из @sberdevices/plasma-temple https://jira.sberdevices.ru/browse/FRNTND-1662
export interface CartItem {
    id: number;
    name: string;
    quantity: number;
    price: number;
    nameDetails?: string;
    imageSrc?: string;
}

export interface Order {
    items: CartItem[];
    price: number;
    quantity: number;
}

export interface Address {
    country?: string;
    city: string;
    street: string;
    house: string;
    flat?: string;
    entrance?: string;
    floor?: string;
    comment?: string;
}

export interface Recipient {
    name: string;
    phone: string;
    email: string;
    address: Address;
}

export interface RecipientInfo {
    recipient: Recipient;
    address: {};
}

export interface ScenarioAppState extends AppState {
    screen?: keyof CommonAppState;
    active?: 'name' | 'address' | 'date' | 'phone' | 'email';
    order?: Order;
    recipientInfo?: RecipientInfo;
}

export interface ScenarioIntentsVariables extends SaluteRequestVariable {
    // https://github.com/sberdevices/salutejs/issues/170
    // @ts-ignore
    product?: string;
    // @ts-ignore
    number?: string;
    // @ts-ignore
    ordinal?: string;
    // @ts-ignore
    category?: string;
    // @ts-ignore
    quantity?: string;
}

export type ScenarioRequest = SaluteRequest<ScenarioIntentsVariables, ScenarioAppState>;
export type ScenarioHandler = SaluteHandler<ScenarioRequest>;

interface OrderData extends FormState {
    name: string;
    date: Date;
    address: string;
    phone: string;
    email: string;
    selectedItem: number;
}

export interface CommonAppState {
    main: null;
    catalog: GalleryPageState;
    product: null;
    history: null;
    about: null;
    makeOrder: OrderData;
    recipient: null;
    orderSuccess: null;
    orderError: null;
    cart: null;
    delivery: null;
    contacts: null;
    addresses: null;
    legalInfo: null;
}

export type ActionType =
    | {
        type: 'fieldFill';
        payload: {
            value: string[];
        };
    }
    | {
        type: 'confirm';
    }
    | {
        type: 'reject';
    }
    | {
        type: 'addToCart';
        payload: {
            quantity: number;
        };
    }
    | {
        type: 'removeFromCart';
    }
    | {
        type: 'clearCart';
    }
    | {
        type: 'makeOrder';
    }
    | {
        type: 'startPayment';
    }
    | {
        type: 'error';
        payload: { error: string; };
    }
    | {
        type: 'paymentFinished';
        payload: { invoiceId: string; };
    }
    | {
        type: 'paymentConfirmed';
    }
    | {
        type: 'changeRecipient';
    }
    | {
        type: 'changeDelivery';
    }
    | {
        type: 'accessToken';
        payload: { token: string; };
    }
    | {
        type: 'getOrderNumber';
        payload: { orderNumber: string; };
    };

export enum ServerActionType {
    DONE_ADD_TO_CART = 'doneAddToCart',
    DONE_REMOVE_FROM_CART = 'doneRemoveFromCart',
    DONE_CLEAR_CART = 'doneClearCart',
    CHECK_PAYMENT_STATUS = 'checkPaymentStatus',
    CART_QUANTITY_LIMIT = 'cartQuantityLimit',
    PAY = 'pay',
    GET_ACCESS_TOKEN = 'getAccessToken',
    ERROR = 'error',
    CREATE_ORDER = 'createOrder',
    PAYMENT_ERROR = 'paymentError',
    PAYMENT_CONFIRM = 'paymentConfirm',
}

export type DoneAddToCartAction = { type: ServerActionType.DONE_ADD_TO_CART; payload: { quantity: number; }; };
export type CheckPaymentStatusAction = { type: ServerActionType.CHECK_PAYMENT_STATUS; payload: { invoiceId: string; }; };
export type CartQuantityLimitAction = { type: ServerActionType.CART_QUANTITY_LIMIT; payload: { limit: number; }; };
export type CreateOrderAction = { type: ServerActionType.CREATE_ORDER, payload: Order; };
export type ErrorAction = { type: ServerActionType.ERROR; payload: { error: string; }; };
export type PayAction = { type: ServerActionType.PAY; payload: { orderNumber: string; }; };
export type PaymentError = { type: ServerActionType.PAYMENT_ERROR, payload: { clientId: string; }; };
export type PaymentConfirm = { type: ServerActionType.PAYMENT_CONFIRM, payload: { clientId: string; }; };

export type ServerAction = {
    type: 'CALL_SCENARIO',
    payload: | DoneAddToCartAction
    | CheckPaymentStatusAction
    | CartQuantityLimitAction
    | CreateOrderAction
    | ErrorAction
    | PaymentConfirm
    | PaymentError
    | PayAction;
};

// TODO: Необходимо использовать PaymentInvoiceStatuses из @salutejs/scenario https://github.com/sberdevices/salutejs/issues/168
export enum PaymentInvoiceStatuses {
    /** заказ оплачен */
    confirmed = 'confirmed',
    /** заказ создан и ожидает выбора платежного инструмента */
    created = 'created',
    /** заказ находится в процессе оплаты */
    executed = 'executed',
    /** деньги временно заблокированы (только для двухстадийного платежа */
    paid = 'paid',
    /** заказ отменен пользователем */
    cancelled = 'cancelled',
    /** заказ отменен продавцом */
    reversed = 'reversed',
    /** осуществлен полный возвра */
    refunded = 'refunded',
}

export interface IncomingRequest {
    body: NLPRequest;
    headers: IncomingHttpHeaders;
    method: string;
    query?: Record<string, string>;
    path?: string;
}

export interface OutcomingResponse {
    status(value: number): OutcomingResponse;
    headers(value: Partial<OutgoingHttpHeaders>): OutcomingResponse;
    succeed<T>(value: T): void;
    succeedFile<T>(value: T): void;
    fail<T>(value: T): void;
}

export interface ResponseError {
    message: string;
    code: string;
    customData: Record<string, unknown>[];
}

export interface Response<T extends {} = {}> {
    status: 'error' | 'success';
    data: T;
    errors: ResponseError[];
}

export type TokenResponse = Response<{ token: string; }>;
export type CreateOrderResponse = Response<{ order_number: string; }>;

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

export namespace Order {
    export interface Recipient {
        name: string;
        last_name: string;
        email: string;
        phone: string;
    }

    export type Payment = { type: 'CACH' | 'PREPAY'; };

    export interface Location {
        country: string;
        city: string;
        region?: string;
        sub_region?: string;
    }

    export interface Address {
        street: string;
        house: string;
        apartment: string;
    }

    export interface Product {
        code: string;
        quantity: number;
        price: number;
    }

    export interface Order {
        recipient: Order.Recipient;
        payment: Order.Payment;
        location: Order.Location;
        address: Order.Address;
        goods: Order.Product[];
        comment?: string;
    }
}


export interface OrderRequestData {
    order_number_client: string;
    order_comment?: string;
}

export interface OrderRegistrationRequestData extends OrderRequestData {
    order: Order.Order;
}

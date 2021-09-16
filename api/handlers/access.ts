export interface Token {
    value: string;
    drop(): void;
}

class Access implements Token {
    constructor(private token: string = '') {}

    get value() {
        return this.token;
    }

    set value(val: string) {
        this.token = val;
    }

    public drop() {
        this.token = '';
    }
}

export const access = new Access()
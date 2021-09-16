import React from "react";

export interface HeroContextImpl {
    hero: {
        picture: string | void;
        id: number | void;
        name: string | void;
    };
    reset(): void;
}

const hero = (): HeroContextImpl => {
    let picture: string | void;
    let id: number | void;
    let name: string | void;

    return {
        get hero() {
            return {
                picture,
                id,
                name,
            }
        },
        set hero (val) {
            ({ picture, id, name } = val);
        },
        reset() {
            picture = id = name = undefined;
        },
    };
};

export const HeroContext = React.createContext(hero());
import React from 'react';
import { PageComponent, PlasmaApp, Action } from '@sberdevices/plasma-temple';

export type PlasmaAppProps = React.ComponentPropsWithoutRef<typeof PlasmaApp>;

export type AppHeaderProps = PlasmaAppProps['header'];
export type AssistantProps = PlasmaAppProps['assistantParams'];
export type OnStartFn = PlasmaAppProps['onStart'];

export enum Screen {
    Search = 'search',
}
export interface PageState {
    main: {};
    [Screen.Search]: {};
}

export interface PageParams {
    [Screen.Search]: void;
}

export type PageComponentProps<K extends keyof PageState> = React.ComponentProps<
    PageComponent<PageState, K, PageParams>
>;

export enum ActionType {
    Search = 'Search',
}

interface ActionPayload<T extends ActionType, P extends Record<string, unknown> = any> {
    type: T;
    payload: P extends void ? never : P;
}

export type AssistantDataAction = Action<ActionPayload<ActionType.Search, { query: string }>>;

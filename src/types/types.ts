import React from 'react';
import { PageComponent, PlasmaApp, Action, GalleryPageState } from '@sberdevices/plasma-temple';
import { Character } from './data';

export type PlasmaAppProps = React.ComponentPropsWithoutRef<typeof PlasmaApp>;

export type AppHeaderProps = PlasmaAppProps['header'];
export type AssistantProps = PlasmaAppProps['assistantParams'];
export type OnStartFn = PlasmaAppProps['onStart'];

export enum Screen {
    Search = 'search',
    Results = 'results',
    Content = 'content',
}

export enum ActionType {
    Search = 'Search',
    Results = 'Results',
    Content = 'Content',
    ContentMore = 'ContentMore',
}

export type AvailableContent = Array<{
    type: keyof Pick<Character, 'comics' | 'events' | 'series' | 'stories'>;
    count: number;
}>;

export type ResultsScreenState = {
    character: {
        name: string;
        id: number;
        image: {
            src: string;
        };
    };
    availableContent: AvailableContent;
}

export type ContentScreenState = {
    activeGalleryIndex: GalleryPageState['activeGalleryIndex'];
    gallery: GalleryPageState['gallery'];
};

export interface PageState {
    [Screen.Search]: {};
    [Screen.Results]: ResultsScreenState;
    [Screen.Content]: ContentScreenState;
}

export interface PageParams {
    [Screen.Search]: void;
}

export type PageComponentProps<K extends keyof PageState> = React.ComponentProps<
    PageComponent<PageState, K, PageParams>
>;

type ActionPayload<T extends ActionType, P extends Record<string, unknown> = any> = {
    type: T;
    payload: P extends void ? never : P;
};

export type AssistantDataAction =
    | Action<ActionPayload<ActionType.Search, { query: string }>>
    | Action<ActionPayload<ActionType.Results, ResultsScreenState>>
    | Action<ActionPayload<ActionType.Content, ContentScreenState>>;

export type ScenarioAction = AssistantDataAction['smart_app_data'];
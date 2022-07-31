import React from 'react';
import {
    PageComponent,
    PlasmaApp,
    AssistantAction,
    GalleryCardEntity,
} from '@salutejs/plasma-temple';
import { Character } from './data';

export type PlasmaAppProps = React.ComponentPropsWithoutRef<typeof PlasmaApp>;

export type AppHeaderProps = PlasmaAppProps['header'];
export type AssistantProps = PlasmaAppProps['assistantParams'];
export type OnStartFn = PlasmaAppProps['onStart'];

export enum Screen {
    Search = 'search',
    Results = 'results',
    Content = 'content',
    Detail = 'Detail',
}

export enum ActionType {
    Search = 'Search',
    Results = 'Results',
    Content = 'Content',
    ContentMore = 'ContentMore',
    Detail = 'Detail',
}
export type ContentTypes = keyof Pick<Character, 'comics' | 'events' | 'series' | 'stories'>
export type AvailableContentItem = {
    type: ContentTypes;
    count: number;
};

export type AvailableContent = Array<AvailableContentItem>;

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
    activeGalleryIndex: number;
    items: GalleryCardEntity[];
};

export interface PageState {
    [Screen.Search]: {};
    [Screen.Results]: ResultsScreenState;
    [Screen.Content]: ContentScreenState;
    [Screen.Detail]: null;
}

export interface PageParams {
    [Screen.Search]: void;
}

export type PageComponentProps<K extends keyof PageState> = React.ComponentProps<
    PageComponent<PageState, K, PageParams>
>;

interface Action<T extends ActionType, P extends Record<string, unknown>> extends AssistantAction {
    type: T;
    payload: P extends void ? never : P;
}

export type AssistantDataAction =
    | Action<ActionType.Search, { query: string }>
    | Action<ActionType.Results, ResultsScreenState>
    | Action<ActionType.Content, ContentScreenState>;

export type ScenarioAction = AssistantDataAction;

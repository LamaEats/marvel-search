import React from 'react';
import { PlasmaApp, Page } from '@salutejs/plasma-temple';

import { AppHeaderProps, AssistantProps, Screen } from './types/types';

const assistantParams: Partial<AssistantProps> = {
    initPhrase: 'запусти мой герой',
    token: process.env.REACT_APP_SMARTAPP_TOKEN ?? '',
};

const headerProps: AppHeaderProps = {
    title: 'Marvel Search',
    logo: 'logo.svg',
};

const Search = Page.lazy(() => import('./pages/Search'));
const Results = Page.lazy(() => import('./pages/Results'));
const Content = Page.lazy(() => import('./pages/Content'));

export const App: React.FC = () => (
    <PlasmaApp assistantParams={assistantParams as AssistantProps} header={headerProps}>
        <Page name={Screen.Search} component={Search} />
        <Page name={Screen.Results} component={Results} />
        <Page name={Screen.Content} component={Content} />
    </PlasmaApp>
);

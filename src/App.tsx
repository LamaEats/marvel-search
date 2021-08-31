import React from 'react';
import { PlasmaApp, Page } from '@sberdevices/plasma-temple';
import { AssistantProps } from '@sberdevices/plasma-temple/dist/assistant';

import { AppHeaderProps, Screen } from './types';

const assistantParams: Partial<AssistantProps> = {
    initPhrase: 'запусти мой герой',
    token: process.env.REACT_APP_SMARTAPP_TOKEN ?? '',
};

const headerProps: AppHeaderProps = {
    title: 'Marvel Search',
    logo: 'logo.svg',
};

const Search = Page.lazy(() => import('./pages/Search'));

export const App: React.FC = () => (
    <PlasmaApp assistantParams={assistantParams as AssistantProps} header={headerProps}>
        <Page name={Screen.Search} component={Search} />
    </PlasmaApp>
);

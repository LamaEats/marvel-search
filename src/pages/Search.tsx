import React from 'react';
import { ActionType, AssistantDataAction, PageComponentProps, ScenarioAction, Screen } from '../types/types';
import { Form, FormField, Header, Input, useAssistantOnSmartAppData, VoiceField } from '@salutejs/plasma-temple';
import { HeroContext } from '../context/hero';

const SearchForm: React.FC<{ onSubmit: (...args: any) => void }> = ({ onSubmit }) => {
    return (
        <Form sequence={['search']} initialData={{ search: '' }} initialField="search" onSubmit={onSubmit}>
            {({ active, onChange, onSubmit, data }) => (
                <>
                    <FormField name="search" active={active}>
                        <VoiceField
                            labels={{
                                one: 'Имя героя',
                                suggestion: 'Имя героя',
                                reject: 'Нет, ввести другую',
                            }}
                            onSubmit={onSubmit}
                            onChange={onChange}
                            value={data.search}
                            manualMode={false}
                        >
                            <Input value={data.search} onChange={onChange} onSubmit={onSubmit} label="Имя героя" />
                        </VoiceField>
                    </FormField>
                </>
            )}
        </Form>
    );
};

const Search: React.FC<PageComponentProps<Screen.Search>> = ({ header, assistant, pushHistory }) => {
    const ctx = React.useContext(HeroContext);

    const actionHandler = React.useCallback((action: ScenarioAction) => {
        if (action.type !== ActionType.Results) {
            return;
        }

        const { payload } = action;

        ctx.hero = {
            ...payload.character,
            picture: payload.character.image.src,
        };

        pushHistory(Screen.Results, payload);
    }, [ctx, pushHistory]);

    const onSubmitHandler = React.useCallback(
        (data) => {
            assistant?.sendAction<ScenarioAction>(
                {
                    type: ActionType.Search,
                    payload: data,
                },
                actionHandler,
            );
        },
        [actionHandler, assistant],
    );

    useAssistantOnSmartAppData(actionHandler)
    return (
        <>
            <Header {...header} />
            <SearchForm onSubmit={onSubmitHandler} />
        </>
    );
};

export default Search;

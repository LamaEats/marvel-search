import React from 'react';
import styled from 'styled-components';
import {
    GalleryCardParams,
    GalleryCardProps,
    GalleryWithNavigation,
    Header,
    isSberBoxLike,
    useAssistantAppState,
    useAssistantOnSmartAppData,
} from '@sberdevices/plasma-temple';
import { Card, CardContent, CardBody, Display3, CardHeadline3 } from '@sberdevices/plasma-ui';

import { ActionType, AssistantDataAction, PageComponentProps, ScenarioAction, Screen } from '../types/types';
import { Hero } from '../components/Hero';

const cardWidth = isSberBoxLike() ? '392px' : '330px';
const cardHeight = isSberBoxLike() ? '128px' : '112px';

const StyledCategoryCard = styled(Card)`
    width: ${cardWidth};
    height: ${cardHeight};
`;

const StyledCardName = styled(CardHeadline3)`
    height: 80px;
`;

const StyledCategoryName = styled(StyledCardName)`
    position: relative;
    text-align: center;
    display: inline-flex;
    align-items: center;
    z-index: 1;
`;

const StyledCardContent = styled(CardContent)`
    text-transform: capitalize;
    background: linear-gradient(180deg, rgba(8, 8, 8, 0.5) 0%, rgba(0, 0, 0, 0.74) 100%);
`;

const ContentCard: React.FC<GalleryCardProps> = ({ card, focused }) => {
    const isFocused = isSberBoxLike() && focused;

    return (
        <StyledCategoryCard focused={isFocused} tabIndex={0}>
            <CardBody>
                <StyledCardContent cover>
                    <StyledCategoryName>{card.label}</StyledCategoryName>
                </StyledCardContent>
            </CardBody>
        </StyledCategoryCard>
    );
};

const title = {
    comics: 'Комиксы',
    events: 'События',
    series: 'Серии',
    stories: 'Истории',
};

const StyledTitle = styled(Display3)`
    position: relative;
    z-index: 1;
`

const Results: React.FC<PageComponentProps<Screen.Results>> = ({ header, state, assistant, pushHistory }) => {
    const itemsToRender: GalleryCardParams[] = React.useMemo(() => {
        return state.availableContent.map((item, index) => ({
            id: index,
            type: item.type,
            label: title[item.type],
            position: index + 1,
            image: {
                src: '',
            },
        }));
    }, [state.availableContent]);

    const onClickHandler = React.useCallback(
        (val: GalleryCardParams) => {
            assistant?.sendAction<ScenarioAction>(
                {
                    type: ActionType.Results,
                    payload: {
                        type: val.type,
                    },
                },
                (action) => {
                    if (action.type === ActionType.Content) {
                        pushHistory(Screen.Content, action.payload);
                    }
                },
            );
        },
        [assistant, pushHistory],
    );

    useAssistantAppState({
        screen: Screen.Results,
        character: state.character,
        item_selector: {
            items: itemsToRender.map(({ label, ...item }) => ({
                ...item,
                id: String(item.id),
                title: label,
                action: {
                    type: ActionType.Results,
                    payload: {
                        type: item.type,
                    },
                },
            })),
        },
    });

    useAssistantOnSmartAppData<AssistantDataAction>((action) => {
        if (action.type === ActionType.Content) {
            pushHistory(Screen.Content, action.payload);
        }
    });

    return (
        <>
            <Hero />
            <Header {...header} />
            <StyledTitle mb="16x">{state.character.name}</StyledTitle>
            <GalleryWithNavigation
                items={itemsToRender}
                onItemClick={onClickHandler}
                Component={ContentCard}
                activeIndex={0}
            />
        </>
    );
};

export default Results;

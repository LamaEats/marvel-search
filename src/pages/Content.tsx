import React from 'react';
import {
    GalleryCardProps,
    GalleryPage,
    getMediaObjectSrc,
    useAssistantAppState,
    AssistantAppState,
} from '@sberdevices/plasma-temple';

import { ActionType, ContentScreenState, PageComponentProps, Screen } from '../types/types';
import { Hero } from '../components/Hero';
import { CardBody, CardMedia, CardBody1, Card, mediaQuery, CardBadge, CardContent } from '@sberdevices/plasma-ui';
import styled, { css } from 'styled-components';

const StyledCard = styled(Card)`
    width: 392px;
    ${mediaQuery(
        'M',
        2,
    )(
        css`
            width: 332px;
        `,
    )}
`;

const StyledCardContent = styled(CardContent)`
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 200px;
`;

const StyledCardIndex = styled(CardBadge)`
    position: absolute;
    top: 16px;
    left: 16px;
`;

const ContentCard: React.FC<GalleryCardProps> = ({ card, focused, index }) => {
    return (
        <StyledCard focused={focused} data-cy={`gallery-card-${index}`}>
            <CardBody>
                <CardMedia base="div" src={getMediaObjectSrc(card.image)} ratio="9 / 16" data-cy="gallery-card-media">
                    {card.position && (
                        <StyledCardIndex view="secondary" size="l" circled text={String(card.position)} />
                    )}
                </CardMedia>
                <StyledCardContent cover>
                    <CardBody1 lines={2}>{card.label}</CardBody1>
                </StyledCardContent>
            </CardBody>
        </StyledCard>
    );
};

function createItemSelector(state: ContentScreenState): AssistantAppState {
    if (!Array.isArray(state.gallery)) {
        return {
            item_selector: {
                items: state.gallery.items.map((item) => ({
                    title: item.label,
                    number: item.position,
                    action: {
                        type: ActionType.Detail,
                        payload: {
                            id: item.id,
                        },
                    },
                })),
            },
        };
    }

    return {
        item_selector: {
            items: [],
        }
    };
    
}

export const Content: React.FC<PageComponentProps<Screen.Content>> = ({ header, changeState, state }) => {
    const onClickHandler = React.useCallback(() => {}, []);

    useAssistantAppState({
        screen: Screen.Content,
        ...createItemSelector(state),
    });

    return (
        <>
            <Hero />
            <GalleryPage
                header={header}
                changeState={changeState}
                state={state}
                onCardClick={onClickHandler}
                galleryCard={ContentCard}
            />
        </>
    );
};

export default Content;

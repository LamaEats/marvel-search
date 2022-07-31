import React from 'react';
import { CardBody, CardMedia, CardBody1, Card, mediaQuery, CardBadge, CardContent } from '@salutejs/plasma-ui';
import styled, { css } from 'styled-components';
import {
    getMediaObjectSrc,
    useAssistantAppState,
    AssistantAppState,
    Gallery,
    SingleGalleryEntity,
    isSberBoxLike,
    GalleryNewCardProps,
    Header,
} from '@salutejs/plasma-temple';

import { ActionType, ContentScreenState, PageComponentProps, Screen } from '../types/types';
import { Hero } from '../components/Hero';

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

const ContentCard: React.FC<GalleryNewCardProps> = ({ entity, isActive, index }) => {
    return (
        <StyledCard focused={isActive} data-cy={`gallery-card-${index}`}>
            <CardBody>
                <CardMedia base="div" src={getMediaObjectSrc(entity.image)} ratio="9 / 16" data-cy="gallery-card-media">
                    {entity.position && (
                        <StyledCardIndex view="secondary" size="l" circled text={String(entity.position)} />
                    )}
                </CardMedia>
                <StyledCardContent cover>
                    <CardBody1 lines={2}>{entity.name}</CardBody1>
                </StyledCardContent>
            </CardBody>
        </StyledCard>
    );
};

function createItemSelector(state: ContentScreenState): AssistantAppState {
    if (Array.isArray(state.items)) {
        return {
            item_selector: {
                items: state.items.map((item) => ({
                    title: item.name,
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
        },
    };
}

export const Content: React.FC<PageComponentProps<Screen.Content>> = ({ header, state }) => {
    // const onClickHandler = React.useCallback(() => {}, []);
    const itemsToRender: SingleGalleryEntity = React.useMemo(() => {
        return {
            items: state.items,
        };
    }, [state.items]);

    useAssistantAppState({
        screen: Screen.Content,
        ...createItemSelector(state),
    });

    return (
        <>
            <Hero />
            <Header {...header} />
            <Gallery items={itemsToRender} galleryCard={ContentCard} autoFocus={isSberBoxLike()} />
        </>
    );
};

export default Content;

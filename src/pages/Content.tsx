import React from 'react';
import {
    GalleryCardProps,
    GalleryPage,
    getMediaObjectSrc,
    useAssistantAppState,
    AssistantAppState,
} from '@sberdevices/plasma-temple';

import { ActionType, ContentScreenState, PageComponentProps, ScenarioAction, Screen } from '../types/types';
import { Hero } from '../components/Hero';
import { CardBody, CardMedia, CardBody1, Card, mediaQuery, CardBadge, CardContent } from '@sberdevices/plasma-ui';
import styled, { css } from 'styled-components';
import { useIntersection } from '../hooks/useIntersection';

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

const ContentCard = React.forwardRef<HTMLDivElement, GalleryCardProps>(({ card, focused, index }, ref) => {
    return (
        <StyledCard focused={focused} data-cy={`gallery-card-${index}`} ref={ref}>
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
});

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
            currentCount: state.gallery.items.length,
        };
    }

    return {
        item_selector: {
            items: [],
        },
        currentCount: 0,
    };
}

export const Content: React.FC<PageComponentProps<Screen.Content>> = ({ header, changeState, state, assistant }) => {
    const intersectingRef = React.useRef<HTMLDivElement>(null);
    const onClickHandler = React.useCallback(() => {}, []);

    useAssistantAppState({
        screen: Screen.Content,
        ...createItemSelector(state),
    });

    const lastIndex = React.useMemo(() => {
        if (Array.isArray(state.gallery)) {
            return 0;
        }

        return state.gallery.items.length;
    }, [state.gallery]);

    const onScrollBottom = React.useCallback(() => {
        assistant?.sendAction<ScenarioAction>({
            type: ActionType.ContentMore,
            payload: {
                offset: lastIndex,
            },
        }, (action) => {
            if (action.type !== ActionType.ContentMore) {
                return;
            }
            if (Array.isArray(state.gallery)) {
                return;
            }

            changeState({
                ...state,
                gallery: {
                    ...state.gallery,
                    items: state.gallery.items.concat(action.payload)
                }
            })
        });
    }, [assistant, changeState, state, lastIndex]);

    useIntersection(intersectingRef, onScrollBottom);

    return (
        <>
            <Hero />
            <GalleryPage
                header={header}
                changeState={changeState}
                state={state}
                onCardClick={onClickHandler}
                galleryCard={(props) => {
                    return <ContentCard {...props} ref={props.index === lastIndex ? intersectingRef : null} />;
                }}
            />
        </>
    );
};

export default Content;

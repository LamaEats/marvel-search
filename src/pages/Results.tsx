import React from 'react';
import styled from 'styled-components';
import {
    Gallery,
    GalleryNewCardProps,
    Header,
    isSberBoxLike,
    SingleGalleryEntity,
} from '@salutejs/plasma-temple';
import { Card, CardContent, CardContentProps, CardBody, Display3, CardHeadline3 } from '@salutejs/plasma-ui';

import {
    ActionType,
    PageComponentProps,
    ScenarioAction,
    Screen,
    ContentTypes,
    AvailableContentItem,
} from '../types/types';
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

const StyledCardContent = styled(CardContent)<StyledCardContentProps>`
    text-transform: capitalize;
    background: linear-gradient(180deg, rgba(8, 8, 8, 0.5) 0%, rgba(0, 0, 0, 0.74) 100%)
        ${(props) => (props.backgroundImage ? `, url("${props.backgroundImage}")` : '')};
`;

type StyledCardContentProps = CardContentProps & {
    backgroundImage?: string;
};

type ContentCard = GalleryNewCardProps<ContentTypes, AvailableContentItem>;

const ContentCard: React.FC<ContentCard> = ({ entity, isActive }) => {
    return (
        <StyledCategoryCard focused={isActive}>
            <CardBody>
                <StyledCardContent cover>
                    <StyledCategoryName>{entity.name}</StyledCategoryName>
                </StyledCardContent>
            </CardBody>
        </StyledCategoryCard>
    );
};


const Results: React.FC<PageComponentProps<Screen.Results>> = ({ header, state, assistant, pushHistory }) => {
    const itemsToRender: SingleGalleryEntity<ContentTypes, AvailableContentItem> = React.useMemo(() => {
        return {
            items: state.availableContent.map((item, index) => ({
                id: item.type,
                name: item.type as string,
                position: index + 1,
                image: {
                    src: '',
                },
                ...item,
            })),
        };
    }, [state.availableContent]);

    const onClickHandler = React.useCallback(
        (val: ContentCard['entity']) => {
            assistant?.sendAction<ScenarioAction>(
                {
                    type: ActionType.Results,
                    payload: {
                        type: val.name,
                        id: state.character.id,
                    },
                },
                (action) => {
                    if (action.type === ActionType.Content) {
                        pushHistory(Screen.Content, action.payload);
                    }
                },
            );
        },
        [assistant, pushHistory, state.character.id],
    );

    return (
        <>
            <Hero />
            <Header {...header} />
            <Display3 mb="16x">{state.character.name}</Display3>
            <Gallery autoFocus={isSberBoxLike()} items={itemsToRender} galleryCard={ContentCard} onCardClick={onClickHandler} />
        </>
    );
};

export default Results;

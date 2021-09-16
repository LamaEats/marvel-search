import React from 'react';
import styled from 'styled-components';
import { GalleryCardParams, GalleryCardProps, GalleryWithNavigation, Header, isSberBoxLike } from '@sberdevices/plasma-temple';
import { Card, CardContent, CardContentProps, CardBody, Display3, CardHeadline3 } from '@sberdevices/plasma-ui';

import { ActionType, PageComponentProps, ScenarioAction, Screen } from '../types/types';
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

const ContentCard: React.FC<GalleryCardProps> = ({ card, focused }) => {
    const isFocused = isSberBoxLike() && focused;

    return (
        <StyledCategoryCard focused={isFocused}>
            <CardBody>
                <StyledCardContent cover>
                    <StyledCategoryName>{card.label}</StyledCategoryName>
                </StyledCardContent>
            </CardBody>
        </StyledCategoryCard>
    );
};


const Results: React.FC<PageComponentProps<Screen.Results>> = ({ header, state, assistant, pushHistory }) => {
    const itemsToRender: GalleryCardParams[] = React.useMemo(() => {
        return state.availableContent.map((item, index) => ({
            id: index,
            label: item.type,
            position: index + 1,
            image: {
                src: '',
            },
        }))
    }, [state.availableContent]);

    const onClickHandler = React.useCallback((val: GalleryCardParams) => {
        assistant?.sendAction<ScenarioAction>({
            type: ActionType.Results,
            payload: {
                type: val.label,
                id: state.character.id,
            }
        }, (action) => {
            if (action.type === ActionType.Content) {
                pushHistory(Screen.Content, action.payload);
            }
        })
    }, [assistant, pushHistory, state.character.id]);

    return (
        <>
            <Hero />
            <Header {...header} />
            <Display3 mb="16x">{state.character.name}</Display3>
            <GalleryWithNavigation items={itemsToRender} onItemClick={onClickHandler} Component={ContentCard} />
        </>
    );
};

export default Results;

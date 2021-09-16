import React from 'react';
import styled from 'styled-components';
import { FullScreenBackgroundWrapper } from '@sberdevices/plasma-temple';
import { HeroContext } from '../context/hero';

const StyledBackgroundImage = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
`;

export const Hero: React.FC = () => {
    const hero = React.useContext(HeroContext);

    if (!hero.hero.picture) {
        return null;
    }

    return (
        <FullScreenBackgroundWrapper>
            <StyledBackgroundImage src={hero.hero.picture || ''} data-cy="background-image" />
        </FullScreenBackgroundWrapper>
    );
};

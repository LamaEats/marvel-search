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
    const { hero } = React.useContext(HeroContext);

    if (!hero.picture) {
        return null;
    }
    
    const picture = hero.picture.replace(/^(https?:)/, '');

    return (
        <FullScreenBackgroundWrapper>
            <StyledBackgroundImage src={hero.hero.picture || ''} data-cy="background-image" />
        </FullScreenBackgroundWrapper>
    );
};

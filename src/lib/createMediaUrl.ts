import { Image } from '../types/data';

type PortraitSize = 
| 'portrait_small'
| 'portrait_medium'
| 'portrait_xlarge'
| 'portrait_fantastic'
| 'portrait_uncanny'
| 'portrait_incredible';

type SquareSize = 
| 'standard_small'
| 'standard_medium'
| 'standard_large'
| 'standard_xlarge'
| 'standard_fantastic'
| 'standard_amazing';

type LandscapeSize = 
| 'landscape_small'
| 'landscape_medium'
| 'landscape_large'
| 'landscape_xlarge'
| 'landscape_amazing'
| 'landscape_incredible'

export type Size = PortraitSize | SquareSize | LandscapeSize | 'detail' | 'full_size'

export const createMediaUrl = (thumbnail: Image, size: Size): string => {
    let result: string;
    if (size === 'full_size') {
        result = `${thumbnail.path}.${thumbnail.extension}`;
    }

    result = `${thumbnail.path}/${size}.${thumbnail.extension}`;

    // avoid mixed content between resources
    return result.replace(/^(https?:)/, '');
};

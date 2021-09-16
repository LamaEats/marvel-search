import { CharacterDataWrapper, ComicDataWrapper, EventDataWrapper, SeriesDataWrapper, StoryDataWrapper } from "../src/types/data";

type NameToTypeMap = {
    boolean: boolean;
    number: number;
    string: string;
};

type RemoveSymbolFromEnd<TUrl, TSymbol extends string> = TUrl extends `${infer S}${TSymbol}` ? S : TUrl;
type RemoveTailFromUrl<TUrl> = RemoveSymbolFromEnd<RemoveSymbolFromEnd<TUrl, '?'>, '/'>;

type NormalizeUrlPathSegment<TSegment, TPrefix extends string> = TSegment extends `{${string}:${string}}`
    ? TSegment
    : TSegment extends `{${infer S}}`
    ? `{${S}:string}`
    : TSegment extends `${TPrefix}${infer S}`
    ? `{${S}:string}`
    : TSegment;

type NormalizeUrlPath<
    TPath,
    TDelimiter extends string,
    TPrefix extends string,
> = TPath extends `${infer H}${TDelimiter}${infer T}`
    ? `${NormalizeUrlPathSegment<H, TPrefix>}${TDelimiter}${NormalizeUrlPath<T, TDelimiter, TPrefix>}`
    : NormalizeUrlPathSegment<TPath, TPrefix>;

type NormalizeUrlWithoutTail<TUrl> = TUrl extends `${infer H}?${infer T}`
    ? `${NormalizeUrlPath<H, '/', ':'>}?${NormalizeUrlPath<T, '&', ''>}`
    : NormalizeUrlPath<TUrl, '/', ':'>;

export type NormalizeUrl<TUrl> = NormalizeUrlWithoutTail<RemoveTailFromUrl<TUrl>>;

type getTypeFromMap<TName> = TName extends keyof NameToTypeMap ? NameToTypeMap[TName] : unknown;
type ParamsToUnion<TUrl> = TUrl extends `${string}{${infer N}:${infer T}}${infer O}`
    ? [N, getTypeFromMap<T>] | ParamsToUnion<O>
    : never;
type ParamsForNormalizedUrl<TUrl> = { [K in ParamsToUnion<TUrl> as K[0]]: K[1] };
export type Params<TUrl> = ParamsForNormalizedUrl<NormalizeUrl<TUrl>>;
export type ClearUrl<TUrl> = RemoveSymbolFromEnd<RemoveSymbolFromEnd<TUrl, `{${string}}`>, '?'>;

export type QueryParams = `${string}:${string}`;

export enum Endpoint {
    characters = '/v1/public/characters?{name:string}',
    character = '/v1/public/characters/{character:number}',
    characterContent = '/v1/public/characters/{character:number}/{type:string}?{limit:number}&{offset:number}',
}

export interface EndpointResponse {
    [Endpoint.characters]: CharacterDataWrapper;
    [Endpoint.character]: CharacterDataWrapper;
    [Endpoint.characterContent]: ComicDataWrapper | EventDataWrapper | SeriesDataWrapper | StoryDataWrapper;
}

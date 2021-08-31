interface DataContainer<T> {
    offset: number;
    limit: number;
    total: number;
    count: number;
    results: Array<T>;
}

interface ResponseDataWrapper<T> {
    code: number;
    status: string;
    copyright: string;
    attributionText: string;
    attributionHTML: string;
    data: DataContainer<T>;
    etag: string;
}

interface DataList<T> {
    available: number;
    returned: number;
    collectionURI: string;
    items: Array<T>;
}

interface Url {
    type: string;
    url: string;
}
interface Image {
    path: string;
    extension: string;
}

interface Character {
    id: number;
    name: string;
    description: string;
    modified: Date;
    resourceURI: string;
    urls: Array<Url>;
    thumbnail: Image;
    comics: DataList<ComicSummary>;
    stories: DataList<StorySummary>;
    events: DataList<EventSummary>;
    series: DataList<SeriesSummary>;
}

interface ComicSummary {
    resourceURI: string;
    name: string;
}

interface StorySummary {
    resourceURI: string;
    name: string;
    type: string;
}

interface EventSummary {
    resourceURI: string;
    name: string;
}

interface SeriesSummary {
    resourceURI: string;
    name: string;
}
interface Comic {
    id: number;
    digitalId: number;
    title: string;
    issueNumber: number;
    variantDescription: string;
    description: string;
    modified: Date;
    isbn: string;
    upc: string;
    diamondCode: string;
    ean: string;
    issn: string;
    format: string;
    pageCount: number;
    textObjects: Array<TextObject>;
    resourceURI: string;
    urls: Array<Url>;
    series: SeriesSummary;
    variants: Array<ComicSummary>;
    collections: Array<ComicSummary>;
    collectedIssues: Array<ComicSummary>;
    dates: Array<ComicDate>;
    prices: Array<ComicPrice>;
    thumbnail: Image;
    images: Array<Image>;
    creators: DataList<CreatorSummary>;
    characters: DataList<CharacterSummary>;
    stories: DataList<StorySummary>;
    events: DataList<EventSummary>;
}
interface TextObject {
    type: string;
    language: string;
    text: string;
}
interface ComicDate {
    type: string;
    date: Date;
}
interface ComicPrice {
    type: string;
    price: number;
}
interface CreatorList {
    available: number;
    returned: number;
    collectionURI: string;
    items: Array<CreatorSummary>;
}
interface CreatorSummary {
    resourceURI: string;
    name: string;
    role: string;
}
interface CharacterList {
    available: number;
    returned: number;
    collectionURI: string;
    items: Array<CharacterSummary>;
}
interface CharacterSummary {
    resourceURI: string;
    name: string;
    role: string;
}
interface Event {
    id: number;
    title: string;
    description: string;
    resourceURI: string;
    urls: Array<Url>;
    modified: Date;
    start: Date;
    end: Date;
    thumbnail: Image;
    comics: DataList<ComicSummary>;
    stories: DataList<StorySummary>;
    series: DataList<SeriesSummary>;
    characters: DataList<CharacterSummary>;
    creators: DataList<CreatorSummary>;
    next: EventSummary;
    previous: EventSummary;
}

interface Series {
    id: number;
    title: string;
    description: string;
    resourceURI: string;
    urls: Array<Url>;
    startYear: number;
    endYear: number;
    rating: string;
    modified: Date;
    thumbnail: Image;
    comics: DataList<ComicSummary>;
    stories: DataList<StorySummary>;
    events: DataList<EventSummary>;
    characters: CharacterList;
    creators: CreatorList;
    next: SeriesSummary;
    previous: SeriesSummary;
}

interface Story {
    id: number;
    title: string;
    description: string;
    resourceURI: string;
    type: string;
    modified: Date;
    thumbnail: Image;
    comics: DataList<ComicSummary>;
    series: DataList<SeriesSummary>;
    events: DataList<EventSummary>;
    characters: CharacterList;
    creators: CreatorList;
    originalissue: ComicSummary;
}

interface Creator {
    id: number;
    firstName: string;
    middleName: string;
    lastName: string;
    suffix: string;
    fullName: string;
    modified: Date;
    resourceURI: string;
    urls: Array<Url>;
    thumbnail: Image;
    events: DataList<EventSummary>;
    comics: DataList<ComicSummary>;
    stories: DataList<StorySummary>;
    series: DataList<SeriesSummary>;
}

export type CharacterDataWrapper = ResponseDataWrapper<Character>;
export type ComicDataWrapper = ResponseDataWrapper<Comic>;
export type EventDataWrapper = ResponseDataWrapper<Event>;
export type SeriesDataWrapper = ResponseDataWrapper<Series>;
export type StoryDataWrapper = ResponseDataWrapper<Story>;
export type CreatorDataWrapper = ResponseDataWrapper<Creator>;

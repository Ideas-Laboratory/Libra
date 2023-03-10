import { Instrument } from "./instrument";
import { Interactor } from "./interactor";
import { Layer } from "./layer";
import { AllRecordingComponents } from "./history";
export declare const LibraSymbol: unique symbol;
export declare enum QueryType {
    Shape = 0,
    Data = 1,
    Attr = 2
}
export declare enum ShapeQueryType {
    SurfacePoint = 0,
    Point = 1,
    Circle = 2,
    Rect = 3,
    Polygon = 4
}
export declare enum DataQueryType {
    Quantitative = 0,
    Nominal = 1,
    Temporal = 2
}
export type Transformation = {
    (domain: any): number;
    invert(range: number): any;
    copy(): Transformation;
    domain?(): any[];
    domain?(newDomain: any[]): Transformation;
    range?(): number[];
    range?(newRange: number[]): Transformation;
    clamp?(bool: boolean): Transformation;
};
export type ShapeBasedQuery = SurfacePointQuery | PointQuery | CircleQuery | RectQuery | PolygonQuery;
export type SurfacePointQuery = {
    baseOn: QueryType.Shape;
    type: ShapeQueryType.SurfacePoint;
    x: number;
    y: number;
};
export type PointQuery = {
    baseOn: QueryType.Shape;
    type: ShapeQueryType.Point;
    x: number;
    y: number;
};
export type CircleQuery = {
    baseOn: QueryType.Shape;
    type: ShapeQueryType.Circle;
    x: number;
    y: number;
    r: number;
};
export type RectQuery = {
    baseOn: QueryType.Shape;
    type: ShapeQueryType.Rect;
    x: number;
    y: number;
    width: number;
    height: number;
};
export type PolygonQuery = {
    baseOn: QueryType.Shape;
    type: ShapeQueryType.Polygon;
    points: {
        x: number;
        y: number;
    }[];
};
export type DataBasedQuery = QuantitativeQuery | NominalQuery | TemporalQuery;
export type QuantitativeQuery = {
    baseOn: QueryType.Data;
    type: DataQueryType.Quantitative;
} & ({
    attrName: string;
    extent: [number, number];
} | {
    attrName: string[];
    extent: [number, number][];
});
export type NominalQuery = {
    baseOn: QueryType.Data;
    type: DataQueryType.Nominal;
} & ({
    attrName: string;
    extent: unknown[];
} | {
    attrName: string[];
    extent: unknown[][];
});
export type TemporalQuery = {
    baseOn: QueryType.Data;
    type: DataQueryType.Temporal;
} & ({
    attrName: string;
    extent: [Date, Date];
    dateParser?: (value: unknown) => Date;
} | {
    attrName: string[];
    extent: [Date, Date][];
    dateParser?: ((value: unknown) => Date)[];
});
export type AttributeBasedQuery = {
    baseOn: QueryType.Attr;
    type: string;
    attrName: string;
    value: unknown;
};
export type ArbitraryQuery = ShapeBasedQuery | DataBasedQuery | AttributeBasedQuery;
export type CommonHandlerInput<T> = {
    self: T;
    layer: Layer<any>;
    instrument: Instrument;
    interactor: Interactor;
    [parameter: string]: any;
};
declare class NonsenseClass {
}
type FindableListType<T> = T[] & T & {
    find(name: string, defaultValue?: string): FindableListType<T>;
    add(...args: any[]): FindableListType<T>;
    remove(name: string): FindableListType<T>;
    join(extents: any[]): FindableListType<T>;
    filter(extents: any[]): FindableListType<T>;
};
export declare function makeFindableList<T extends AllRecordingComponents>(list: any, typing: {
    new (...args: any[]): NonsenseClass;
} | {
    initialize(...args: any[]): T;
}, addFunc: (newElement: T) => void, removeFunc: (element: T) => void, self: AllRecordingComponents): FindableListType<T>;
export declare function getTransform(elem: SVGElement): number[];
/**
 * Parse an event selector string.
 * Returns an array of event stream definitions.
 */
export declare function parseEventSelector(selector: string): (EventStream | {
    between: (EventStream | BetweenEventStream)[];
    stream: BetweenEventStream[];
})[];
export type EventStream = {
    source: string;
    type: string;
    markname?: string;
    marktype?: string;
    consume?: boolean;
    filter?: string[];
    throttle?: number;
    debounce?: number;
};
export type BetweenEventStream = (EventStream & {
    between: (EventStream | BetweenEventStream)[];
}) | {
    between: (EventStream | BetweenEventStream)[];
    stream: BetweenEventStream[];
};
export declare function deepClone(obj: any): any;
export declare const global: {
    stopTransient: boolean;
};
export {};

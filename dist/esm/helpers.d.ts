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
    Quantitative2D = 1,
    Nominal = 2,
    Temporal = 3
}
export declare type Transformation = {
    (domain: any): number;
    invert(range: number): any;
    copy(): Transformation;
    domain?(): any[];
    domain?(newDomain: any[]): Transformation;
    range?(): number[];
    range?(newRange: number[]): Transformation;
    clamp?(bool: boolean): Transformation;
};
export declare type ShapeBasedQuery = SurfacePointQuery | PointQuery | CircleQuery | RectQuery | PolygonQuery;
export declare type SurfacePointQuery = {
    baseOn: QueryType.Shape;
    type: ShapeQueryType.SurfacePoint;
    x: number;
    y: number;
};
export declare type PointQuery = {
    baseOn: QueryType.Shape;
    type: ShapeQueryType.Point;
    x: number;
    y: number;
};
export declare type CircleQuery = {
    baseOn: QueryType.Shape;
    type: ShapeQueryType.Circle;
    x: number;
    y: number;
    r: number;
};
export declare type RectQuery = {
    baseOn: QueryType.Shape;
    type: ShapeQueryType.Rect;
    x: number;
    y: number;
    width: number;
    height: number;
};
export declare type PolygonQuery = {
    baseOn: QueryType.Shape;
    type: ShapeQueryType.Polygon;
    points: {
        x: number;
        y: number;
    }[];
};
export declare type DataBasedQuery = QuantitativeQuery | Quantitative2DQuery | NominalQuery | TemporalQuery;
export declare type QuantitativeQuery = {
    baseOn: QueryType.Data;
    type: DataQueryType.Quantitative;
    attrName: string;
    extent: [number, number];
};
export declare type Quantitative2DQuery = {
    baseOn: QueryType.Data;
    type: DataQueryType.Quantitative2D;
    attrNameX: string;
    extentX: [number, number];
    attrNameY: string;
    extentY: [number, number];
};
export declare type NominalQuery = {
    baseOn: QueryType.Data;
    type: DataQueryType.Nominal;
    attrName: string;
    extent: unknown[];
};
export declare type TemporalQuery = {
    baseOn: QueryType.Data;
    type: DataQueryType.Temporal;
    attrName: string;
    extent: [Date, Date];
    dateParser?: (value: unknown) => Date;
};
export declare type AttributeBasedQuery = {
    baseOn: QueryType.Attr;
    type: string;
    attrName: string;
    value: unknown;
};
export declare type ArbitraryQuery = ShapeBasedQuery | DataBasedQuery | AttributeBasedQuery;
export declare type CommonHandlerInput<T> = {
    self: T;
    layer: Layer<any>;
    instrument: Instrument;
    interactor: Interactor;
    [parameter: string]: any;
};
declare class NonsenseClass {
}
export declare function makeFindableList<T extends AllRecordingComponents>(list: any, typing: {
    new (...args: any[]): NonsenseClass;
} | {
    initialize(...args: any[]): T;
}, addFunc: (newElement: T) => void, removeFunc: (element: T) => void, self: AllRecordingComponents): any;
export declare function getTransform(elem: SVGElement): number[];
/**
 * Parse an event selector string.
 * Returns an array of event stream definitions.
 */
export declare function parseEventSelector(selector: string): (EventStream | {
    between: (EventStream | BetweenEventStream)[];
    stream: BetweenEventStream[];
})[];
export declare type EventStream = {
    source: string;
    type: string;
    markname?: string;
    marktype?: string;
    consume?: boolean;
    filter?: string[];
    throttle?: number;
    debounce?: number;
};
export declare type BetweenEventStream = (EventStream & {
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

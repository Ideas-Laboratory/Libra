import { Instrument } from "./instrument";
import { Interactor } from "./interactor";
import { Layer } from "./layer";
export declare type Transformation = {
    (domain: any): number;
    inverse(range: number): any;
};
export declare type ShapeBasedQuery = {
    baseOn: "shape";
    type: string;
    [parameter: string]: any;
};
export declare type DataBasedQuery = {
    baseOn: "data";
    type: string;
    [parameter: string]: any;
};
export declare type AttributeBasedQuery = {
    baseOn: "attr" | "attribute";
    type: string;
    [parameter: string]: any;
};
export declare type ArbitraryQuery = ShapeBasedQuery | DataBasedQuery | AttributeBasedQuery;
export declare type CommonHandlerInput<T> = {
    self: T;
    layer: Layer<any>;
    instrument: Instrument;
    interactor: Interactor;
    [parameter: string]: any;
};
export declare function makeFindableList(list: any): any;
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

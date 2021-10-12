import { Instrument } from "./instrument";
import { Interactor } from "./interactor";
import { Layer } from "./layer";

export type Transformation = (domain: any) => number;
export type ShapeBasedQuery = {
  baseOn: "shape";
  type: string;
  [parameter: string]: any;
};

export type DataBasedQuery = {
  baseOn: "data";
  type: string;
  [parameter: string]: any;
};

export type AttributeBasedQuery = {
  baseOn: "attr" | "attribute";
  type: string;
  [parameter: string]: any;
};

export type ArbitraryQuery =
  | ShapeBasedQuery
  | DataBasedQuery
  | AttributeBasedQuery;

export type CommonHandlerInput<T> = {
  self: T;
  layer: Layer<any>;
  instrument: Instrument;
  interactor: Interactor;
};

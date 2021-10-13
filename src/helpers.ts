import { Instrument } from "./instrument";
import { Interactor } from "./interactor";
import { Layer } from "./layer";

// We assume the transformation in Libra are all affined
export type Transformation = {
  (domain: any): number;
  inverse(range: number): any;
};

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
  [parameter: string]: any;
};

export function makeFindableList(list: any) {
  return new Proxy(list, {
    get(target, p) {
      if (p === "find") {
        return (name: string) =>
          makeFindableList(target.filter((item) => item.isInstanceOf(name)));
      }
    },
  });
}

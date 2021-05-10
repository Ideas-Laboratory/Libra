import Layer from "../layer";

interface QueryConstructor {
  new (name: string): Query;
}

export = class Query {
  constructor(name: string): Query;
  clone(): Query;
  update(): void;
  result(): any[];
  bindLayer(layer: Layer): void;
};

export function register(
  name: string,
  optionOrQuery:
    | Query
    | {
        constructor?: QueryConstructor;
        extraParams?: any[];
      }
): boolean;

export function initialize(name: string): Query;

export function unregister(name: string): boolean;

import Layer from "../layer";

interface SelectorConstructor {
  new (name: string): Selector;
}

export = class Selector {
  constructor(name: string): Selector;
  clone(): Selector;
  update(): void;
  result(): any[];
  bindLayer(layer: Layer): void;
};

export function register(
  name: string,
  optionOrSelector:
    | Selector
    | {
        constructor?: SelectorConstructor;
        extraParams?: any[];
      }
): boolean;

export function initialize(name: string): Selector;

export function unregister(name: string): boolean;

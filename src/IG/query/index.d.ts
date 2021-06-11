import Layer from "../layer";

interface SelectionManagerConstructor {
  new (name: string): SelectionManager;
}

export = class SelectionManager {
  constructor(name: string): SelectionManager;
  clone(): SelectionManager;
  update(): void;
  result(): any[];
  bindLayer(layer: Layer): void;
};

export function register(
  name: string,
  optionOrSelectionManager:
    | SelectionManager
    | {
        constructor?: SelectionManagerConstructor;
        extraParams?: any[];
      }
): boolean;

export function initialize(name: string): SelectionManager;

export function unregister(name: string): boolean;

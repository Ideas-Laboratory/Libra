import helpers from "../helpers";

interface InteractorConstructor {
  new (name: string): SelectionManager;
}

export = class Interactor {
  constructor(name: string): Interactor;
  clone(): Interactor;
  dispatch(event: helpers.Event): void;
};

export function register(
  name: string,
  optionOrInteractor:
    | Interactor
    | {
        constructor?: InteractorConstructor;
        extraParams?: any[];
        startActions?: string[];
        runningActions?: string[];
        outsideActions?: string[];
        stopActions?: string[];
        abortActions?: string[];
        backInsideActions?: string[];
      }
): boolean;

export function initialize(name: string): Interactor;

export function unregister(name: string): boolean;

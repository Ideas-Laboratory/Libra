import * as helpers from "../helpers";
import SelectionManager from "../selectionManager";
import Interactor from "../interactor";
import Layer from "../layer";

type ConvertEventToFreedom = (
  event: helpers.Event,
  selectionManager: SelectionManager
) => helpers.AvailableFreedomType;

type InstrumentRelationOption =
  | {
      attribute: string;
      const: helpers.AvailableFreedomType;
    }
  | {
      attribute: string;
      interactor: Interactor;
      [command: string]: ConvertEventToFreedom;
    };

type InstrumentAssociateOption =
  | {
      selectionManager?: SelectionManager;
      relations: InstrumentRelationOption[];
    }
  | {
      selectionManager?: SelectionManager;
      relation: InstrumentRelationOption;
    };

interface InstrumentConstructor {
  new (name: string): Instrument;
}

export = class Instrument {
  constructor(name: string): Instrument;
  clone(): Instrument;
  dispatch(event: Event): void;
  associate(option: InstrumentAssociateOption): void;
  attach(views: HTMLOrSVGElement | HTMLOrSVGElement[]): void;
};

export function register(
  name: string,
  optionOrInstrument:
    | Instrument
    | {
        constructor?: InstrumentConstructor;
        selectionManager: SelectionManager;
        relations?: InstrumentRelationOption[];
        views?: HTMLOrSVGElement[];
        view?: HTMLOrSVGElement;
        preInstall?: (instrument: Instrument) => void;
        postInstall?: (instrument: Instrument) => void;
      }
): boolean;

export function initialize(name: string): Instrument;

export function unregister(name: string): boolean;

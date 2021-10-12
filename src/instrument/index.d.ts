import { Interactor } from "../interactor";
import * as helpers from "../helpers";
import { Command } from "../command";
import { Layer } from "../layer";

type InstrumentInitOption = {
  on?: {
    [action: string]:
      | (<T>(options: helpers.CommonHandlerInput<T>) => void)
      | Command;
  };
  interactors?: (Interactor | { interactor: Interactor; options: any })[];
  layers?: (Layer<any> | { layer: Layer<any>; options: any })[];
  [param: string]: any;
};

type InstrumentInitTemplate = InstrumentInitOption & {
  constructor?: InstrumentConstructor;
};

export declare class Instrument {
  constructor(baseName: string, options: InstrumentInitOption);

  on(
    action: string,
    feedforwardOrCommand:
      | (<T>(options: helpers.CommonHandlerInput<T>) => void)
      | Command
  ): void;
  use(interactor: Interactor, options: any): void;
  attach(layer: Layer<any>, options: any): void;
}

export default interface InstrumentConstructor {
  new (baseName: string, options: InstrumentInitOption): Instrument;

  register(baseName: string, options: InstrumentInitTemplate): void;
  initialize(baseName: string, options: InstrumentInitOption): Instrument;
  findInstrument(baseNameOrRealName: string): Instrument[];
}

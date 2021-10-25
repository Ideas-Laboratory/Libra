import { Interactor } from "../interactor";
import * as helpers from "../helpers";
import { Command } from "../command";
import { Layer } from "../layer";

type InstrumentInitOption = {
  name?: string;
  on?: {
    [action: string]:
      | (<T>(options: helpers.CommonHandlerInput<T>) => void)
      | Command;
  };
  interactors?: (Interactor | { interactor: Interactor; options: any })[];
  layers?: (Layer<any> | { layer: Layer<any>; options: any })[];
  sharedVar?: { [varName: string]: any };
  preInitialize?: (instrument: Instrument) => void;
  postInitialize?: (instrument: Instrument) => void;
  preUse?: (instrument: Instrument, layer: Layer<any>) => void;
  postUse?: (instrument: Instrument, layer: Layer<any>) => void;
  [param: string]: any;
};

interface InstrumentConstructor {
  new (baseName: string, options: InstrumentInitOption): Instrument;

  register(baseName: string, options: InstrumentInitTemplate): void;
  unregister(baseName: string): boolean;
  initialize(baseName: string, options: InstrumentInitOption): Instrument;
  findService(baseNameOrRealName: string): Instrument[];
}

type InstrumentInitTemplate = InstrumentInitOption & {
  constructor?: InstrumentConstructor;
};

const registeredInstruments: { [name: string]: InstrumentInitTemplate } = {};
const instanceInstruments: Instrument[] = [];

export default class Instrument {
  _baseName: string;
  _name: string;
  _userOptions: InstrumentInitOption;
  _on: {
    [action: string]:
      | (<T>(options: helpers.CommonHandlerInput<T>) => void)
      | Command;
  };
  _interactors: (Interactor | { interactor: Interactor; options: any })[];
  _layers: (Layer<any> | { layer: Layer<any>; options: any })[];
  _sharedVar: { [varName: string]: any };
  _preInitialize?: (instrument: Instrument) => void;
  _postInitialize?: (instrument: Instrument) => void;
  _preUse?: (instrument: Instrument, layer: Layer<any>) => void;
  _postUse?: (instrument: Instrument, layer: Layer<any>) => void;

  constructor(baseName: string, options: InstrumentInitOption) {
    options.preInitialize && options.preInitialize.call(this, this);
    this._baseName = baseName;
    this._userOptions = options;
    this._name = options.name ?? baseName;
    this._on = options.on ?? {};
    this._interactors = options.interactors ?? [];
    this._layers = options.layers ?? [];
    this._sharedVar = options.sharedVar ?? {};
    this._preInitialize = options.preInitialize ?? null;
    this._postInitialize = options.postInitialize ?? null;
    this._preUse = options.preUse ?? null;
    this._postUse = options.postUse ?? null;
    options.postInitialize && options.postInitialize.call(this, this);
  }

  on(
    action: string,
    feedforwardOrCommand:
      | (<T>(options: helpers.CommonHandlerInput<T>) => void)
      | Command
  ) {
    this._on[action] = feedforwardOrCommand;
  }

  use(interactor: Interactor, options: any) {
    interactor.preUse(this);
    // TODO: inject options
    if (arguments.length >= 2) {
      this._interactors.push({ interactor, options });
    } else {
      this._interactors.push(interactor);
    }
    interactor.postUse(this);
  }

  attach(layer: Layer<any>, options: any) {
    this.preUse(layer);
    if (arguments.length >= 2) {
      this._layers.push({ layer, options });
    } else {
      this._layers.push(layer);
    }
    this.postUse(layer);
  }

  getSharedVar(sharedName: string, options: any): any {
    if (!(sharedName in this._sharedVar) && "defaultValue" in options) {
      this.setSharedVar(sharedName, options.defaultValue, options);
    }
    return this._sharedVar[sharedName];
  }

  setSharedVar(sharedName: string, value: any, options: any) {
    this._sharedVar[sharedName] = value;
    if (this._on[`update:${sharedName}`]) {
      const feedforwardOrCommand = this._on[`update:${sharedName}`];
      if (feedforwardOrCommand instanceof Command) {
        feedforwardOrCommand.execute({
          self: this,
          layer: null,
          instrument: this,
          interactor: null,
        });
      } else {
        feedforwardOrCommand({
          self: this,
          layer: null,
          instrument: this,
          interactor: null,
        });
      }
    }
  }

  watchSharedVar(sharedName: string, handler: Command) {
    this.on(`update:${sharedName}`, handler);
  }

  preUse(layer: Layer<any>) {
    this._preUse && this._preUse.call(this, this, layer);
  }

  postUse(layer: Layer<any>) {
    this._postUse && this._postUse.call(this, this, layer);
  }

  isInstanceOf(name: string): boolean {
    return this._baseName === name || this._name === name;
  }
}

export function register(
  baseName: string,
  options: InstrumentInitTemplate
): void {
  registeredInstruments[baseName] = options;
}
export function unregister(baseName: string): boolean {
  delete registeredInstruments[baseName];
  return true;
}
export function initialize(
  baseName: string,
  options: InstrumentInitOption
): Instrument {
  const mergedOptions = Object.assign(
    {},
    registeredInstruments[baseName] ?? { constructor: Instrument },
    options
  );
  const service = new mergedOptions.constructor(baseName, mergedOptions);
  return service;
}
export function findInstrument(baseNameOrRealName: string): Instrument[] {
  return instanceInstruments.filter((instrument) =>
    instrument.isInstanceOf(baseNameOrRealName)
  );
}

(Instrument as any).register = register;
(Instrument as any).initialize = initialize;
(Instrument as any).findInstrument = findInstrument;

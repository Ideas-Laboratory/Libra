import { Interactor } from "../interactor";
import * as helpers from "../helpers";
import { Command } from "../command";
import { Layer } from "../layer";

type InstrumentInitOption = {
  name?: string;
  on?: {
    [action: string]: (
      | (<T>(options: helpers.CommonHandlerInput<T>) => void)
      | Command
    )[];
  };
  interactors?: (
    | string
    | Interactor
    | { interactor: string | Interactor; options: any }
  )[];
  layers?: (Layer<any> | { layer: Layer<any>; options: any })[];
  sharedVar?: { [varName: string]: any };
  preInitialize?: (instrument: Instrument) => void;
  postInitialize?: (instrument: Instrument) => void;
  preUse?: (instrument: Instrument, layer: Layer<any>) => void;
  postUse?: (instrument: Instrument, layer: Layer<any>) => void;
  [param: string]: any;
};

type InstrumentInitTemplate = InstrumentInitOption & {
  [param: string]: any;
  constructor?: typeof Instrument;
};

const registeredInstruments: { [name: string]: InstrumentInitTemplate } = {};
const instanceInstruments: Instrument[] = [];

export default class Instrument {
  _baseName: string;
  _name: string;
  _userOptions: InstrumentInitOption;
  _on: {
    [action: string]: (
      | (<T>(options: helpers.CommonHandlerInput<T>) => void)
      | Command
    )[];
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
    this._preInitialize = options.preInitialize ?? null;
    this._postInitialize = options.postInitialize ?? null;
    this._preUse = options.preUse ?? null;
    this._postUse = options.postUse ?? null;
    this._baseName = baseName;
    this._userOptions = options;
    this._name = options.name ?? baseName;
    this._on = options.on ?? {};
    this._interactors = [];
    this._layers = [];
    if (options.interactors) {
      options.interactors.forEach((interactor) => {
        if (typeof interactor === "string") {
          this.use(Interactor.initialize(interactor));
        } else if ("options" in interactor) {
          if (typeof interactor.interactor === "string") {
            this.use(
              Interactor.initialize(interactor.interactor, interactor.options)
            );
          } else {
            this.use(interactor.interactor, interactor.options);
          }
        } else {
          this.use(interactor);
        }
      });
    }
    if (options.layers) {
      options.layers.forEach((layer) => {
        if ("options" in layer) {
          this.attach(layer.layer, layer.options);
        } else {
          this.attach(layer);
        }
      });
    }
    this._sharedVar = options.sharedVar ?? {};
    options.postInitialize && options.postInitialize.call(this, this);
  }

  on(
    action: string,
    feedforwardOrCommand:
      | (<T>(options: helpers.CommonHandlerInput<T>) => void)
      | Command
  ) {
    if (!this._on[action]) {
      this._on[action] = [];
    }
    this._on[action].push(feedforwardOrCommand);
  }

  off(
    action: string,
    feedforwardOrCommand:
      | (<T>(options: helpers.CommonHandlerInput<T>) => void)
      | Command
  ) {
    if (!this._on[action]) return;
    if (this._on[action].includes(feedforwardOrCommand)) {
      this._on[action].splice(
        this._on[action].indexOf(feedforwardOrCommand),
        1
      );
    }
  }

  use(interactor: Interactor, options?: any) {
    interactor.preUse(this);
    // TODO: inject options
    if (arguments.length >= 2) {
      this._interactors.push({ interactor, options });
    } else {
      this._interactors.push(interactor);
    }
    interactor.setActions(
      interactor.getActions().map((action) => ({
        ...action,
        sideEffect: (options) => {
          action.sideEffect && action.sideEffect(options);
          this._on[action.action] &&
            this._on[action.action].forEach((command) => {
              if (command instanceof Command) {
                command.execute({
                  ...options,
                  self: this,
                  instrument: this,
                });
              } else {
                command({
                  ...options,
                  self: this,
                  instrument: this,
                });
              }
            });
        },
      }))
    );
    this._layers.forEach((layer) => {
      let layr: Layer<any>;
      if (layer instanceof Layer) {
        layr = layer;
      } else {
        layr = layer.layer;
      }
      interactor
        .getAcceptEvents()
        .forEach((event) =>
          layr
            .getContainerGraphic()
            .addEventListener(event, (e) => interactor.dispatch(e, layr))
        );
    });
    interactor.postUse(this);
  }

  attach(layer: Layer<any>, options?: any) {
    this.preUse(layer);
    if (arguments.length >= 2) {
      this._layers.push({ layer, options });
    } else {
      this._layers.push(layer);
    }
    this.postUse(layer);
  }

  getSharedVar(sharedName: string, options?: any): any {
    if (!(sharedName in this._sharedVar) && options && "defaultValue" in options) {
      this.setSharedVar(sharedName, options.defaultValue, options);
    }
    return this._sharedVar[sharedName];
  }

  setSharedVar(sharedName: string, value: any, options?: any) {
    this._sharedVar[sharedName] = value;
    if (this._on[`update:${sharedName}`]) {
      const feedforwardOrCommands = this._on[`update:${sharedName}`];
      feedforwardOrCommands.forEach((feedforwardOrCommand) => {
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
      });
    }
  }

  watchSharedVar(sharedName: string, handler: Command) {
    this.on(`update:${sharedName}`, handler);
  }

  preUse(layer: Layer<any>) {
    this._preUse && this._preUse.call(this, this, layer);
    this._interactors.forEach((interactor) => {
      let inter: Interactor;
      if (interactor instanceof Interactor) {
        inter = interactor;
      } else {
        inter = interactor.interactor;
      }
      inter
        .getAcceptEvents()
        .forEach((event) =>
          layer
            .getContainerGraphic()
            .addEventListener(event, (e) => inter.dispatch(e, layer))
        );
    });
  }

  postUse(layer: Layer<any>) {
    this._postUse && this._postUse.call(this, this, layer);
  }

  isInstanceOf(name: string): boolean {
    return this._baseName === name || this._name === name;
  }

  static register(baseName: string, options: InstrumentInitTemplate): void {
    registeredInstruments[baseName] = options;
  }
  static unregister(baseName: string): boolean {
    delete registeredInstruments[baseName];
    return true;
  }
  static initialize(
    baseName: string,
    options?: InstrumentInitOption
  ): Instrument {
    const mergedOptions = Object.assign(
      {},
      registeredInstruments[baseName] ?? { constructor: Instrument },
      options ?? {},
      {
        on: Object.assign(
          {},
          (registeredInstruments[baseName] ?? {}).on ?? {},
          options?.on ?? {}
        ),
      }
    );
    const service = new mergedOptions.constructor(baseName, mergedOptions);
    return service;
  }
  static findInstrument(baseNameOrRealName: string): Instrument[] {
    return instanceInstruments.filter((instrument) =>
      instrument.isInstanceOf(baseNameOrRealName)
    );
  }
}

export const register = Instrument.register;
export const unregister = Instrument.unregister;
export const initialize = Instrument.initialize;
export const findInstrument = Instrument.findInstrument;

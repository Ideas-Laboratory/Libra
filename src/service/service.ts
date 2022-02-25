import { Command } from "../command";
import { Instrument } from "../instrument";
import { Layer } from "../layer";
import * as helpers from "../helpers";

type ServiceInitOption = {
  name?: string;
  on?: {
    [action: string]: (
      | (<T>(options: helpers.CommonHandlerInput<T>) => Promise<void> | void)
      | Command
    )[];
  };
  sharedVar?: { [key: string]: any };
  preInitialize?: (service: InteractionService) => void;
  postInitialize?: (service: InteractionService) => void;
  preUpdate?: (service: InteractionService) => void;
  postUpdate?: (service: InteractionService) => void;
  preAttach?: (service: InteractionService, instrument: Instrument) => void;
  postUse?: (service: InteractionService, instrument: Instrument) => void;
  [param: string]: any;
};

type ServiceInitTemplate = ServiceInitOption & {
  [param: string]: any;
  constructor?: typeof InteractionService;
};

const registeredServices: { [name: string]: ServiceInitTemplate } = {};
export const instanceServices: InteractionService[] = [];

export default class InteractionService {
  _baseName: string;
  _name: string;
  _userOptions: ServiceInitOption;
  // _on: {
  //   [action: string]: (
  //     | (<T>(options: helpers.CommonHandlerInput<T>) => Promise<void> | void)
  //     | Command
  //   )[];
  // };
  _sharedVar: { [key: string]: any };
  _preInitialize?: (service: InteractionService) => void;
  _postInitialize?: (service: InteractionService) => void;
  _preUpdate?: (service: InteractionService) => void;
  _postUpdate?: (service: InteractionService) => void;
  _preAttach?: (service: InteractionService, instrument: Instrument) => void;
  _postUse?: (service: InteractionService, instrument: Instrument) => void;
  _layerInstances: Layer<any>[];

  constructor(baseName: string, options: ServiceInitOption) {
    options.preInitialize && options.preInitialize.call(this, this);
    this._baseName = baseName;
    this._userOptions = options;
    this._name = options.name ?? baseName;
    // this._on = options.on ?? {};
    this._sharedVar = {};
    this._layerInstances = [];
    this._preInitialize = options.preInitialize ?? null;
    this._postInitialize = options.postInitialize ?? null;
    this._preUpdate = options.preUpdate ?? null;
    this._postUpdate = options.postUpdate ?? null;
    this._preAttach = options.preAttach ?? null;
    this._postUse = options.postUse ?? null;
    Object.entries(options.sharedVar || {}).forEach((entry) => {
      this.setSharedVar(entry[0], entry[1]);
    });
    instanceServices.push(this);
    options.postInitialize && options.postInitialize.call(this, this);
  }

  // on(action: string, command: Command): void {
  //   if (!this._on[action]) {
  //     this._on[action] = [];
  //   }
  //   this._on[action].push(command);
  // }

  getSharedVar(sharedName: string, options?: any): any {
    if (
      options &&
      options.layer &&
      !this._layerInstances.includes(options.layer)
    ) {
      return undefined;
    }
    if (
      !(sharedName in this._sharedVar) &&
      options &&
      "defaultValue" in options
    ) {
      this.setSharedVar(sharedName, options.defaultValue, options);
    }
    return this._sharedVar[sharedName];
  }

  async setSharedVar(sharedName: string, value: any, options?: any) {
    this.preUpdate();
    this._sharedVar[sharedName] = value;
    // if (this._on.update) {
    //   for (let command of this._on.update) {
    //     if (command instanceof Function) {
    //       await command({
    //         self: this,
    //         layer: options?.layer ?? null,
    //         instrument: options?.instrument ?? null,
    //         interactor: options?.interactor ?? null,
    //       });
    //     } else {
    //       await command.execute({
    //         self: this,
    //         layer: options?.layer ?? null,
    //         instrument: options?.instrument ?? null,
    //         interactor: options?.interactor ?? null,
    //       });
    //     }
    //   }
    // }
    // if (this._on[`update:${sharedName}`]) {
    //   for (let command of this._on[`update:${sharedName}`]) {
    //     if (command instanceof Function) {
    //       await command({
    //         self: this,
    //         layer: options?.layer ?? null,
    //         instrument: options?.instrument ?? null,
    //         interactor: options?.interactor ?? null,
    //       });
    //     } else {
    //       await command.execute({
    //         self: this,
    //         layer: options?.layer ?? null,
    //         instrument: options?.instrument ?? null,
    //         interactor: options?.interactor ?? null,
    //       });
    //     }
    //   }
    // }
    this.postUpdate();
  }

  // watchSharedVar(sharedName: string, handler: Command) {
  //   this.on(`update:${sharedName}`, handler);
  // }

  preUpdate() {
    this._preUpdate && this._preUpdate.call(this, this);
  }

  postUpdate() {
    this._postUpdate && this._postUpdate.call(this, this);
  }

  preAttach(instrument: Instrument) {
    this._preAttach && this._preAttach.call(this, this, instrument);
  }

  postUse(instrument: Instrument) {
    this._postUse && this._postUse.call(this, this, instrument);
  }

  isInstanceOf(name: string): boolean {
    return this._baseName === name || this._name === name;
  }

  static register(baseName: string, options: ServiceInitTemplate): void {
    registeredServices[baseName] = options;
  }
  static unregister(baseName: string): boolean {
    delete registeredServices[baseName];
    return true;
  }
  static initialize(
    baseName: string,
    options?: ServiceInitOption
  ): InteractionService {
    const mergedOptions = Object.assign(
      {},
      registeredServices[baseName] ?? { constructor: InteractionService },
      options ?? {},
      {
        // needs to deep merge object
        on: Object.assign(
          {},
          (registeredServices[baseName] ?? {}).on ?? {},
          options?.on ?? {}
        ),
        sharedVar: Object.assign(
          {},
          (registeredServices[baseName] ?? {}).sharedVar ?? {},
          options?.sharedVar ?? {}
        ),
      }
    );
    const service = new mergedOptions.constructor(baseName, mergedOptions);
    return service;
  }
  static findService(baseNameOrRealName: string): InteractionService[] {
    return instanceServices.filter((service) =>
      service.isInstanceOf(baseNameOrRealName)
    );
  }
}

export const register = InteractionService.register;
export const unregister = InteractionService.unregister;
export const initialize = InteractionService.initialize;
export const findService = InteractionService.findService;

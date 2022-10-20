import { Command } from "../command";
import { Instrument } from "../instrument";
import { Layer } from "../layer";
import * as helpers from "../helpers";
import { GraphicalTransformer } from "../transformer";

type ServiceInitOption = {
  name?: string;
  on?: {
    [action: string]: (
      | (<T>(options: helpers.CommonHandlerInput<T>) => Promise<void> | void)
      | Command
    )[];
  };
  layer?: Layer<any>;
  sharedVar?: { [key: string]: any };
  transformers?: GraphicalTransformer[];
  services?: Service[];
  preInitialize?: (service: Service) => void;
  postInitialize?: (service: Service) => void;
  preUpdate?: (service: Service) => void;
  postUpdate?: (service: Service) => void;
  preAttach?: (service: Service, instrument: Instrument) => void;
  postUse?: (service: Service, instrument: Instrument) => void;
  [param: string]: any;
};

type ServiceInitTemplate = ServiceInitOption & {
  [param: string]: any;
  constructor?: typeof Service;
};

const registeredServices: { [name: string]: ServiceInitTemplate } = {};
export const instanceServices: Service[] = [];

export default class Service {
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
  _linkCache: { [linkProp: string]: any } = {};
  _preInitialize?: (service: Service) => void;
  _postInitialize?: (service: Service) => void;
  _preUpdate?: (service: Service) => void;
  _postUpdate?: (service: Service) => void;
  _preAttach?: (service: Service, instrument: Instrument) => void;
  _postUse?: (service: Service, instrument: Instrument) => void;
  _layerInstances: Layer<any>[];
  _transformers: GraphicalTransformer[] = [];
  _services: Service[] = [];

  constructor(baseName: string, options: ServiceInitOption) {
    options.preInitialize && options.preInitialize.call(this, this);
    this._baseName = baseName;
    this._userOptions = options;
    this._name = options.name ?? baseName;
    // this._on = options.on ?? {};
    this._sharedVar = {};
    this._transformers = options.transformers ?? [];
    this._services = options.services ?? [];
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
    if (options.layer) {
      this._layerInstances.push(options.layer);
    }
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
      this._layerInstances.length &&
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
    const linkProps =
      this.getSharedVar("linkProps") || Object.keys(this._sharedVar);
    if (this._sharedVar.linking) {
      for (let prop of linkProps) {
        if (this._linkCache[prop] === this._sharedVar[prop]) continue;
        this._sharedVar.linking.setSharedVar(prop, this._sharedVar[prop]);
      }
    }
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

  get transformers() {
    return helpers.makeFindableList(
      this._transformers.slice(0),
      GraphicalTransformer,
      (e) => this._transformers.push(e),
      (e) => {
        e.setSharedVars({
          selectionResult: [],
          layoutResult: null,
          result: null,
        });
        this._transformers.splice(this._transformers.indexOf(e), 1);
      },
      this
    );
  }

  get services() {
    return helpers.makeFindableList(
      this._services.slice(0),
      Service,
      (e) => this._services.push(e),
      (e) => {
        Object.entries({
          selectionResult: [],
          layoutResult: null,
          result: null,
        }).forEach(([k, v]) => {
          e.setSharedVar(k, v);
        });
        this._services.splice(this._services.indexOf(e), 1);
      },
      this
    );
  }

  static register(baseName: string, options: ServiceInitTemplate): void {
    registeredServices[baseName] = options;
  }
  static unregister(baseName: string): boolean {
    delete registeredServices[baseName];
    return true;
  }
  static initialize(baseName: string, options?: ServiceInitOption): Service {
    const mergedOptions = Object.assign(
      { constructor: Service },
      registeredServices[baseName] ?? {},
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
        params: Object.assign(
          {},
          (registeredServices[baseName] ?? ({} as any)).params ?? {},
          options?.params ?? {}
        ),
      }
    );
    const service = new mergedOptions.constructor(baseName, mergedOptions);
    return service;
  }
  static findService(baseNameOrRealName: string): Service[] {
    return instanceServices.filter((service) =>
      service.isInstanceOf(baseNameOrRealName)
    );
  }
}

export const register = Service.register;
export const unregister = Service.unregister;
export const initialize = Service.initialize;
export const findService = Service.findService;

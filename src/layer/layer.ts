import { ExternalService, findService } from "../service";
import * as helpers from "../helpers";
import { Command } from "../command";

type LayerInitOption = {
  name?: string;
  container: HTMLElement;
  transformation?: { [scaleName: string]: helpers.Transformation };
  services?: (
    | string
    | ExternalService
    | { service: string | ExternalService; options: any }
  )[];
  sharedVar?: { [varName: string]: any };
  redraw?: <T>(
    data: any,
    scale: helpers.Transformation,
    selection: T[]
  ) => void;
  preInitialize?: <T>(layer: Layer<T>) => void;
  postInitialize?: <T>(layer: Layer<T>) => void;
  preUpdate?: <T>(layer: Layer<T>) => void;
  postUpdate?: <T>(layer: Layer<T>) => void;
  [param: string]: any;
};

interface LayerConstructor {
  new <T>(baseName: string, options: LayerInitOption): Layer<T>;
}

type LayerInitTemplate = LayerInitOption & { constructor?: LayerConstructor };

const registeredLayers: { [name: string]: LayerInitTemplate } = {};
const instanceLayers: Layer<any>[] = [];

export default class Layer<T> {
  _baseName: string;
  _name: string;
  _userOptions: LayerInitOption;
  _transformation: { [scaleName: string]: helpers.Transformation };
  _transformationWatcher: { [scaleName: string]: (Function | Command)[] };
  _services: (
    | string
    | ExternalService
    | { service: string | ExternalService; options: any }
  )[];
  _serviceInstances: ExternalService[];
  _graphic: T;
  _container: HTMLElement;
  _sharedVar: { [varName: string]: any };
  _sharedVarWatcher: { [varName: string]: (Function | Command)[] };
  _redraw?: <T>(
    data: any,
    scale: helpers.Transformation,
    selection: T[]
  ) => void;
  _preInitialize?: <T>(layer: Layer<T>) => void;
  _postInitialize?: <T>(layer: Layer<T>) => void;
  _preUpdate?: <T>(layer: Layer<T>) => void;
  _postUpdate?: <T>(layer: Layer<T>) => void;

  constructor(baseName: string, options: LayerInitOption) {
    options.preInitialize && options.preInitialize.call(this, this);
    this._baseName = baseName;
    this._userOptions = options;
    this._name = options.name ?? baseName;
    this._transformation = options.transformation ?? {};
    this._services = options.services ?? [];
    this._container = options.container;
    this._sharedVar = options.sharedVar ?? {};
    this._sharedVarWatcher = {};
    this._transformationWatcher = {};
    this._serviceInstances = [];
    this._redraw = options.redraw;
    this._preInitialize = options.preInitialize ?? null;
    this._postInitialize = options.postInitialize ?? null;
    this._preUpdate = options.preUpdate ?? null;
    this._postUpdate = options.postUpdate ?? null;
    this._services.forEach((service) => {
      if (typeof service === "string" || !("options" in service)) {
        this.use(service);
      } else {
        this.use(service.service, service.options);
      }
    });
    instanceLayers.push(this);
    this._postInitialize && this._postInitialize.call(this, this);
  }
  getGraphic(): T {
    return this._graphic;
  }
  getContainerGraphic(): HTMLElement {
    return this._container;
  }
  getVisualElements(): T[] {
    return [];
  }
  getSharedVar(sharedName: string, defaultValue?: any): any {
    if (sharedName in this._sharedVar) {
      return this._sharedVar[sharedName];
    } else {
      this.setSharedVar(sharedName, defaultValue);
      return defaultValue;
    }
  }
  setSharedVar(sharedName: string, value: any): void {
    this._preUpdate && this._preUpdate.call(this, this);
    const oldValue = this._sharedVar[sharedName];
    this._sharedVar[sharedName] = value;
    if (sharedName in this._sharedVarWatcher) {
      this._sharedVarWatcher[sharedName].forEach((callback) => {
        if (callback instanceof Command) {
          callback.execute({
            self: this,
            layer: this,
            instrument: null,
            interactor: null,
            value,
            oldValue,
          });
        } else {
          callback({ value, oldValue });
        }
      });
    }
    this._postUpdate && this._postUpdate.call(this, this);
  }
  watchSharedVar(sharedName: string, handler: Function | Command): void {
    if (!(sharedName in this._sharedVarWatcher)) {
      this._sharedVarWatcher[sharedName] = [];
    }
    this._sharedVarWatcher[sharedName].push(handler);
  }
  getTransformation(
    scaleName: string,
    defaultValue?: helpers.Transformation
  ): helpers.Transformation {
    if (scaleName in this._transformation) {
      return this._transformation[scaleName];
    } else {
      this.setTransformation(scaleName, defaultValue);
      return defaultValue;
    }
  }
  setTransformation(
    scaleName: string,
    transformation: helpers.Transformation
  ): void {
    // TODO: implement responsive viewport
    this._preUpdate && this._preUpdate.call(this, this);
    const oldValue = this._transformation[scaleName];
    this._transformation[scaleName] = transformation;
    if (scaleName in this._transformationWatcher) {
      this._transformationWatcher[scaleName].forEach((callback) => {
        if (callback instanceof Command) {
          callback.execute({
            self: this,
            layer: this,
            instrument: null,
            interactor: null,
            value: transformation,
            oldValue,
          });
        } else {
          callback({ value: transformation, oldValue });
        }
      });
    }
    this._postUpdate && this._postUpdate.call(this, this);
  }
  watchTransformation(scaleName: string, handler: Function | Command): void {
    if (!(scaleName in this._transformationWatcher)) {
      this._transformationWatcher[scaleName] = [];
    }
    this._transformationWatcher[scaleName].push(handler);
  }
  redraw(data: any, scale: helpers.Transformation, selection: T[]): void {
    this._preUpdate && this._preUpdate.call(this, this);
    if (this._redraw && this._redraw instanceof Function) {
      this._redraw(data, scale, selection);
    }
    this._postUpdate && this._postUpdate.call(this, this);
  }
  preUpdate() {
    this._preUpdate && this._preUpdate.call(this, this);
  }
  postUpdate() {
    this._postUpdate && this._postUpdate.call(this, this);
  }
  query(options: helpers.ArbitraryQuery): T[] {
    return [];
  }
  _use(service: ExternalService, options?: any) {
    service.preUse(this);
    // TODO: inject into service
    this._serviceInstances.push(service);
    service.postUse(this);
  }
  use(service: string | ExternalService, options?: any) {
    if (this._services.includes(service)) {
      return;
    }
    if (arguments.length >= 2) {
      this._services.push({ service, options });
    } else {
      this._services.push(service);
    }
    if (typeof service === "string") {
      const services = findService(service);
      services.forEach((service) => this._use(service, options));
    } else {
      this._use(service, options);
    }
  }
  isInstanceOf(name: string): boolean {
    return this._baseName === name || this._name === name;
  }

  get services() {
    return helpers.makeFindableList(this._serviceInstances.slice(0));
  }
}

export function register(baseName: string, options: LayerInitTemplate): void {
  registeredLayers[baseName] = options;
}
export function unregister(baseName: string): boolean {
  delete registeredLayers[baseName];
  return true;
}
export function initialize<T>(
  baseName: string,
  options: LayerInitOption
): Layer<T> {
  const mergedOptions = Object.assign(
    {},
    registeredLayers[baseName] ?? { constructor: Layer },
    options,
    {
      // needs to deep merge object
      transformation: Object.assign(
        {},
        (registeredLayers[baseName] ?? {}).transformation ?? {},
        options.transformation ?? {}
      ),
      sharedVar: Object.assign(
        {},
        (registeredLayers[baseName] ?? {}).sharedVar ?? {},
        options.sharedVar ?? {}
      ),
    }
  );
  const layer = new mergedOptions.constructor<T>(baseName, mergedOptions);
  return layer;
}
export function findLayer(baseNameOrRealName: string): Layer<any>[] {
  return instanceLayers.filter((layer) =>
    layer.isInstanceOf(baseNameOrRealName)
  );
}

(Layer as any).register = register;
(Layer as any).initialize = initialize;
(Layer as any).findLayer = findLayer;

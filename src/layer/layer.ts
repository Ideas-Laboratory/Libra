import { ExternalService } from "../service";
import * as helpers from "../helpers";
import { Command } from "../command";

type LayerInitOption = {
  name?: string;
  container: HTMLElement;
  transformation?: { [scaleName: string]: helpers.Transformation };
  services?: (ExternalService | { service: ExternalService; options: any })[];
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
  _services: (ExternalService | { service: ExternalService; options: any })[];
  _graphic: T;
  _container: HTMLElement;
  _sharedVar: { [varName: string]: any };
  _sharedVarWatcher: { [varName: string]: (Function | Command)[] };
  _redraw?: <T>(
    data: any,
    scale: helpers.Transformation,
    selection: T[]
  ) => void;
  _preInitialize: <T>(layer: Layer<T>) => void;
  _postInitialize: <T>(layer: Layer<T>) => void;
  _preUpdate: <T>(layer: Layer<T>) => void;
  _postUpdate: <T>(layer: Layer<T>) => void;

  constructor(baseName: string, options: LayerInitOption) {
    this._baseName = baseName;
    this._userOptions = options;
    this._name = options.name ?? baseName;
    this._transformation = options.transformation ?? {};
    this._services = options.services ?? [];
    this._container = options.container;
    this._sharedVar = options.sharedVar ?? {};
    this._sharedVarWatcher = {};
    this._transformationWatcher = {};
    this._redraw = options.redraw;
    this._preInitialize = options.preInitialize ?? null;
    this._postInitialize = options.postInitialize ?? null;
    this._preUpdate = options.preUpdate ?? null;
    this._postUpdate = options.postUpdate ?? null;
    instanceLayers.push(this);
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
  }
  watchTransformation(scaleName: string, handler: Function | Command): void {
    if (!(scaleName in this._transformationWatcher)) {
      this._transformationWatcher[scaleName] = [];
    }
    this._transformationWatcher[scaleName].push(handler);
  }
  redraw(data: any, scale: helpers.Transformation, selection: T[]): void {
    if (this._redraw && this._redraw instanceof Function) {
      this._redraw(data, scale, selection);
    }
  }
  query(options: helpers.ArbitraryQuery): T[] {
    return [];
  }
  use(service: ExternalService, options?: any) {}
  isInstanceOf(name: string): boolean {
    return this._baseName === name || this._name === name;
  }
}

export function register(baseName: string, options: LayerInitTemplate): void {}
export function initialize<T>(
  baseName: string,
  options: LayerInitOption
): Layer<T> {}
export function findLayer(baseNameOrRealName: string): Layer<any>[] {
  return instanceLayers.filter((layer) =>
    layer.isInstanceOf(baseNameOrRealName)
  );
}

(Layer as any).register = register;
(Layer as any).initialize = initialize;
(Layer as any).findLayer = findLayer;

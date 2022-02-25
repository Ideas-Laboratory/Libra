import { Layer } from "../layer";

type TransformerInitOption = {
  name?: string;
  layer?: Layer<any>;
  sharedVar?: { [varName: string]: any };
  redraw?: (option: { [name: string]: any }) => void;
  [param: string]: any;
};

type TransformerInitTemplate = TransformerInitOption & {
  [param: string]: any;
  constructor?: typeof GraphicalTransformer;
};

const registeredTransformers: { [name: string]: TransformerInitTemplate } = {};
const instanceTransformers: GraphicalTransformer[] = [];

export default class GraphicalTransformer {
  _baseName: string;
  _name: string;
  _userOptions: TransformerInitOption;

  _sharedVar: { [varName: string]: any };
  _redraw: (option: any) => void;
  _layer: Layer<any>;

  constructor(baseName: string, options: TransformerInitOption) {
    this._baseName = baseName;
    this._userOptions = options;

    this._sharedVar = options.sharedVar ?? {};
    this._redraw = options.redraw ?? (() => {});
    this._layer = options.layer;

    this.redraw();
  }

  getSharedVar(name: string) {
    return this._sharedVar[name];
  }

  setSharedVar(name: string, value: any) {
    this._sharedVar[name] = value;
    this.redraw();
  }

  redraw() {
    this._redraw({});
  }

  isInstanceOf(name: string): boolean {
    return this._baseName === name || this._name === name;
  }

  static register(baseName: string, options: TransformerInitTemplate): void {
    registeredTransformers[baseName] = options;
  }
  static unregister(baseName: string): boolean {
    delete registeredTransformers[baseName];
    return true;
  }
  static initialize(
    baseName: string,
    options?: TransformerInitOption
  ): GraphicalTransformer {
    const mergedOptions = Object.assign(
      {},
      registeredTransformers[baseName] ?? { constructor: GraphicalTransformer },
      options ?? {},
      {
        sharedVar: Object.assign(
          {},
          (registeredTransformers[baseName] ?? {}).sharedVar ?? {},
          options?.sharedVar ?? {}
        ),
      }
    );
    const service = new mergedOptions.constructor(baseName, mergedOptions);
    return service;
  }
  static findTransformer(baseNameOrRealName: string): GraphicalTransformer[] {
    return instanceTransformers.filter((transformer) =>
      transformer.isInstanceOf(baseNameOrRealName)
    );
  }
}

export const register = GraphicalTransformer.register;
export const unregister = GraphicalTransformer.unregister;
export const initialize = GraphicalTransformer.initialize;
export const findTransformer = GraphicalTransformer.findTransformer;

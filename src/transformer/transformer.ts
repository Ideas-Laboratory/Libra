import { Layer } from "../layer";
import * as helpers from "../helpers";

type TransformerInitOption = {
  name?: string;
  layer?: Layer<any>;
  sharedVar?: { [varName: string]: any };
  redraw?: (option: { [name: string]: any }) => void;
  transient?: boolean;
  [param: string]: any;
};

type TransformerInitTemplate = TransformerInitOption & {
  [param: string]: any;
  constructor?: typeof GraphicalTransformer;
};

const registeredTransformers: { [name: string]: TransformerInitTemplate } = {};
export const instanceTransformers: GraphicalTransformer[] = [];

let transientQueue = [];
const transientCleaner = () => {
  let transientElement;
  while ((transientElement = transientQueue.pop())) {
    try {
      transientElement.remove(); // TODO: other VIS toolkit APIs
    } catch (e) {
      // ignore?
    }
  }
  if (!helpers.global.stopTransient) {
    instanceTransformers
      .filter((transformer) => transformer._transient)
      .forEach((transformer) => transformer.redraw());
  }
  requestAnimationFrame(transientCleaner);
};

requestAnimationFrame(transientCleaner);

export default class GraphicalTransformer {
  _baseName: string;
  _name: string;
  _userOptions: TransformerInitOption;

  _sharedVar: { [varName: string]: any };
  _redraw: (option: any) => void;
  _layer: Layer<any>;
  _transient: boolean;

  [helpers.LibraSymbol] = true;

  constructor(baseName: string, options: TransformerInitOption) {
    this._baseName = baseName;
    this._userOptions = options;
    this._name = options.name ?? this._baseName;
    this._sharedVar = options.sharedVar ?? {};
    this._redraw = options.redraw ?? (() => {});
    this._layer = options.layer;
    this._transient = options.transient ?? false;

    this.redraw();
  }

  getSharedVar(name: string) {
    return this._sharedVar[name];
  }

  setSharedVar(name: string, value: any) {
    this._sharedVar[name] = value;
    this.redraw();
  }

  setSharedVars(obj: { [key: string]: any }) {
    Object.entries(obj).forEach(([k, v]) => (this._sharedVar[k] = v));
    this.redraw();
  }

  redraw(transient: boolean = false) {
    if (!this._layer && !this.getSharedVar("layer")) return;
    const layer = this._layer || this.getSharedVar("layer");
    transient = transient || this._transient;
    let preDrawElements = [],
      postDrawElements = [],
      changedLayers = new Set([layer]);
    if (transient) {
      preDrawElements = layer.getVisualElements();
      if (!layer._getLayerFromQueue) {
        layer._getLayerFromQueue = layer.getLayerFromQueue;
        layer.getLayerFromQueue = function () {
          const result = layer._getLayerFromQueue(...arguments);
          preDrawElements = preDrawElements.concat(result.getVisualElements());
          changedLayers.add(result);
          return result;
        };
      }
    }
    this._redraw({
      layer,
      transformer: this,
    });
    if (transient) {
      layer.getLayerFromQueue = layer._getLayerFromQueue;
      delete layer._getLayerFromQueue;
      changedLayers.forEach((layer) => {
        // postDrawElements = layer.getVisualElements();
        // const topLevelElements = postDrawElements.filter(
        //   (el) => !postDrawElements.find((e) => e !== el && e.contains(el))
        // );
        postDrawElements = postDrawElements.concat(
          Array.prototype.slice.call(layer.getGraphic().childNodes)
        );
        const transientElements = postDrawElements.filter(
          (el) => !preDrawElements.includes(el)
        );
        transientQueue = transientQueue.concat(transientElements);
      });
    }
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
      { constructor: GraphicalTransformer },
      registeredTransformers[baseName] ?? {},
      options ?? {},
      {
        sharedVar: Object.assign(
          {},
          (registeredTransformers[baseName] ?? {}).sharedVar ?? {},
          options?.sharedVar ?? {}
        ),
      }
    );
    const transformer = new mergedOptions.constructor(baseName, mergedOptions);
    instanceTransformers.push(transformer);
    return transformer;
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

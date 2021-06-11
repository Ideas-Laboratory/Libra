import * as helpers from "../helpers";
import Tool from "../tool";

type LayerListenOption =
  | {
      layers: Layer[];
      updateCommand: () => void;
    }
  | {
      layer: Layer;
      updateCommand: () => void;
    }
  | {
      tools: Tool[];
      [command: string]: () => void;
    }
  | {
      tool: Tool;
      [command: string]: () => void;
    };

interface LayerConstructor {
  new (name: string): Layer;
}

export = class Layer {
  constructor(name: string): Layer;
  listen(option: LayerListenOption): void;
  getGraphic(): HTMLOrSVGElement;
  getRootGraphic(): HTMLOrSVGElement;
  getSharedScale(name: string): any;
  setSharedScale(name: string, scale: any): void;

  getObjects(): any[];
  onObject(pointer: helpers.Point): boolean;
  query(selector: string): any[];
  pick(shape: helpers.ShapeDescriptor): any[];
  find(dataFilter: (data: any) => boolean): any[];
};

export function register(
  name: string,
  optionOrLayer:
    | Layer
    | {
        constructor?: LayerConstructor;
        listen?: LayerListenOption | LayerListenOption[];
        preInstall?: (layer: Layer) => void;
        postInstall?: (layer: Layer) => void;
      }
): boolean;

export function initialize(name: string): Layer;

export function unregister(name: string): boolean;

export function query(name: string): Layer[];

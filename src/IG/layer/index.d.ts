import * as helpers from "../helpers";
import Tool from "../tool";

type LayerAttachOption =
  | {
      precondition?: boolean | ((event: helpers.Event) => boolean);
      tools: Tool[];
    }
  | {
      precondition?: boolean | ((event: helpers.Event) => boolean);
      tool: Tool;
    };

type LayerListenOption =
  | {
      layers: Layer[];
      frameCommand: () => void;
    }
  | {
      layer: Layer;
      frameCommand: () => void;
    };

interface LayerConstructor {
  new (name: string): Layer;
}

export = class Layer {
  constructor(name: string): Layer;
  attach(option: LayerAttachOption): void;
  listen(option: LayerListenOption): void;
};

export function register(
  name: string,
  optionOrLayer:
    | Layer
    | {
        constructor?: LayerConstructor;
        attach?: LayerAttachOption | LayerListenOption[];
        listen?: LayerListenOption | LayerListenOption[];
      }
): boolean;

export function initialize(name: string): Layer;

export function unregister(name: string): boolean;

export function query(name: string): Layer[];

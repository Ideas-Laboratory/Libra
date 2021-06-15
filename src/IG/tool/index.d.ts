import * as helpers from "../helpers";
import SelectionManager from "../query";
import Interactor from "../interactor";
import Layer from "../layer";

type ConvertEventToFreedom = (
  event: helpers.Event,
  query: SelectionManager
) => helpers.AvailableFreedomType;

type ToolRelationOption =
  | {
      attribute: string;
      const: helpers.AvailableFreedomType;
    }
  | {
      attribute: string;
      interactor: Interactor;
      [command: string]: ConvertEventToFreedom;
    };

type ToolAssociateOption =
  | {
      selectionManager?: SelectionManager;
      relations: ToolRelationOption[];
    }
  | {
      selectionManager?: SelectionManager;
      relation: ToolRelationOption;
    };

interface ToolConstructor {
  new (name: string): Tool;
}

export = class Tool {
  constructor(name: string): Tool;
  clone(): Tool;
  dispatch(event: Event): void;
  associate(option: ToolAssociateOption): void;
  attach(views: HTMLOrSVGElement | HTMLOrSVGElement[]): void;
};

export function register(
  name: string,
  optionOrTool:
    | Tool
    | {
        constructor?: ToolConstructor;
        selectionManager: SelectionManager;
        relations?: ToolRelationOption[];
        views?: HTMLOrSVGElement[];
        view?: HTMLOrSVGElement;
        preInstall?: (tool: Tool) => void;
        postInstall?: (tool: Tool) => void;
      }
): boolean;

export function initialize(name: string): Tool;

export function unregister(name: string): boolean;

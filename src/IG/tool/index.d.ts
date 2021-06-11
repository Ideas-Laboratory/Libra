import * as helpers from "../helpers";
import SelectionManager from "../query";
import Interactor from "../interactor";

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
      command?: ConvertEventToFreedom;
      activeCommand?: ConvertEventToFreedom;
      frameCommand?: ConvertEventToFreedom;
      terminateCommand?: ConvertEventToFreedom;
    };

type ToolAssociateOption =
  | {
      query?: SelectionManager;
      relations: ToolRelationOption[];
    }
  | {
      query?: SelectionManager;
      relation: ToolRelationOption;
    };

interface ToolConstructor {
  new (name: string): Tool;
}

export = class Tool {
  constructor(name: string): Tool;
  clone(): Tool;
  dispatch(event: helpers.Event): void;
  associate(option: ToolAssociateOption): void;
};

export function register(
  name: string,
  optionOrTool:
    | Tool
    | {
        constructor?: ToolConstructor;
        query: SelectionManager;
        relations?: ToolRelationOption[];
      }
): boolean;

export function initialize(name: string): Tool;

export function unregister(name: string): boolean;

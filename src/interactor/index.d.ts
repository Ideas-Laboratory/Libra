import { Instrument } from "../instrument";
import * as helpers from "../helpers";

type SideEffect = (options: helpers.CommonHandlerInput<any>) => void;

type InteractorInnerAction = {
  action: string;
  events: string[];
  fromState?: string;
  toState?: string;
  sideEffect: SideEffect;
};

type InteractorInitOption = {
  state: string;
  actions: InteractorInnerAction[];
  preInitialize?: (interactor: Interactor) => void;
  postInitialize?: (interactor: Interactor) => void;
  preUse?: (interactor: Interactor, instrument: Instrument) => void;
  postUse?: (interactor: Interactor, instrument: Instrument) => void;
  [param: string]: any;
};

type InteractorInitTemplate = InteractorInitOption & {
  constructor?: InteractorConstructor;
};

export declare class Interactor {
  constructor(baseName: string, options: InteractorInitOption);

  getActions(): InteractorInnerAction[];
  setActions(actions: InteractorInnerAction[]);
  getEvents(): string[];
  dispatch(event: string): void;
  isInstanceOf(name: string): boolean;
}

export default interface InteractorConstructor {
  new (baseName: string, options: InteractorInitOption): Interactor;

  register(baseName: string, options: InteractorInitTemplate): void;
  unregister(baseName: string): boolean;
  initialize(baseName: string, options: InteractorInitOption): Interactor;
  findInteractor(baseNameOrRealName: string): Interactor[];
}

export function register(
  baseName: string,
  options: InteractorInitTemplate
): void;
export function unregister(baseName: string): boolean;
export function initialize(
  baseName: string,
  options: InteractorInitOption
): Interactor;
export function findInteractor(baseNameOrRealName: string): Interactor[];

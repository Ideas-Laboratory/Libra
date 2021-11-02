import { Instrument } from "../instrument";
import * as helpers from "../helpers";

type SideEffect = (options: helpers.CommonHandlerInput<any>) => void;

type InteractorInnerAction = {
  action: string;
  events: string[];
  transition?: [string, string][];
  sideEffect?: SideEffect;
};

type InteractorInitOption = {
  name?: string;
  state: string;
  actions?: InteractorInnerAction[];
  preInitialize?: (interactor: Interactor) => void;
  postInitialize?: (interactor: Interactor) => void;
  preUse?: (interactor: Interactor, instrument: Instrument) => void;
  postUse?: (interactor: Interactor, instrument: Instrument) => void;
  [param: string]: any;
};

type InteractorInitTemplate = InteractorInitOption & {
  [param: string]: any;
  constructor?: typeof Interactor;
};

const registeredInteractors: { [name: string]: InteractorInitTemplate } = {};
const instanceInteractors: Interactor[] = [];

export default class Interactor {
  _baseName: string;
  _name: string;
  _userOptions: InteractorInitOption;
  _state: string;
  _actions: InteractorInnerAction[];
  _preInitialize?: (interactor: Interactor) => void;
  _postInitialize?: (interactor: Interactor) => void;
  _preUse?: (interactor: Interactor, instrument: Instrument) => void;
  _postUse?: (interactor: Interactor, instrument: Instrument) => void;

  constructor(baseName: string, options: InteractorInitOption) {
    options.preInitialize && options.preInitialize.call(this, this);
    this._baseName = baseName;
    this._userOptions = options;
    this._name = options.name ?? baseName;
    this._state = options.state;
    this._actions = options.actions ?? [];
    this._preInitialize = options.preInitialize ?? null;
    this._postInitialize = options.postInitialize ?? null;
    this._preUse = options.preUse ?? null;
    this._postUse = options.postUse ?? null;
    options.postInitialize && options.postInitialize.call(this, this);
  }

  getActions(): InteractorInnerAction[] {
    return this._actions.slice(0);
  }

  setActions(actions: InteractorInnerAction[]) {
    const mergeActions = actions.concat(this._actions);
    this._actions = mergeActions.filter(
      (action, i) =>
        i === mergeActions.findIndex((a) => a.action === action.action)
    );
  }

  _parseEvent(event: string) {
    const flatStream = (
      stream:
        | helpers.EventStream
        | {
            between: (helpers.EventStream | helpers.BetweenEventStream)[];
            stream: helpers.BetweenEventStream[];
          }
    ) =>
      "stream" in stream
        ? stream.between.concat(stream.stream).flatMap(flatStream)
        : "between" in stream
        ? (stream as any).between
            .concat([{ type: (stream as any).type }])
            .flatMap(flatStream)
        : stream.type;

    return helpers.parseEventSelector(event).flatMap(flatStream);
  }

  getAcceptEvents(): string[] {
    return this._actions.flatMap((action) =>
      action.events.flatMap((event) => this._parseEvent(event))
    );
  }

  dispatch(event: string | Event): void {
    const moveAction = this._actions.find(
      (action) =>
        (event instanceof Event
          ? action.events.includes(event.type)
          : action.events.includes(event)) &&
        (!action.transition ||
          action.transition.find((transition) => transition[0] === this._state))
    );
    if (moveAction) {
      const moveTransition =
        moveAction.transition &&
        moveAction.transition.find(
          (transition) => transition[0] === this._state
        );
      if (moveTransition) {
        this._state = moveTransition[1];
      }
      if (moveAction.sideEffect) {
        moveAction.sideEffect({
          self: this,
          layer: null,
          instrument: null,
          interactor: this,
          event,
        });
      }
    }
  }

  preUse(instrument: Instrument) {
    this._preUse && this._preUse.call(this, this, instrument);
  }

  postUse(instrument: Instrument) {
    this._postUse && this._postUse.call(this, this, instrument);
  }

  isInstanceOf(name: string): boolean {
    return this._baseName === name || this._name === name;
  }

  static register(baseName: string, options: InteractorInitTemplate): void {
    registeredInteractors[baseName] = options;
  }

  static unregister(baseName: string): boolean {
    delete registeredInteractors[baseName];
    return true;
  }
  static initialize(
    baseName: string,
    options?: InteractorInitOption
  ): Interactor {
    const mergedOptions = Object.assign(
      {},
      registeredInteractors[baseName] ?? { constructor: Interactor },
      options
    );
    const service = new mergedOptions.constructor(baseName, mergedOptions);
    return service;
  }
  static findInteractor(baseNameOrRealName: string): Interactor[] {
    return instanceInteractors.filter((instrument) =>
      instrument.isInstanceOf(baseNameOrRealName)
    );
  }
}

export const register = Interactor.register;
export const unregister = Interactor.unregister;
export const initialize = Interactor.initialize;
export const findInteractor = Interactor.findInteractor;

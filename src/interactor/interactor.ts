import { Instrument } from "../instrument";
import * as helpers from "../helpers";
import { Layer } from "../layer";
import Actions from "./actions.jsgf";

type SideEffect = (options: helpers.CommonHandlerInput<any>) => Promise<void>;

type OriginInteractorInnerAction = {
  action: string;
  events: string[];
  transition?: [string, string][];
  sideEffect?: SideEffect;
};

type EventFilterFunc = (event: Event) => boolean;
type LibraEventStream = helpers.EventStream & {
  filterFuncs?: EventFilterFunc[];
};
type InteractorInnerAction = OriginInteractorInnerAction & {
  eventStreams: LibraEventStream[];
};

type InteractorInitOption = {
  name?: string;
  state: string;
  actions?: OriginInteractorInnerAction[];
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

const SR =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const SGL =
  (window as any).SpeechGrammarList || (window as any).webkitSpeechGrammarList;

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
  _modalities: { [key: string]: any };

  constructor(baseName: string, options: InteractorInitOption) {
    options.preInitialize && options.preInitialize.call(this, this);
    this._baseName = baseName;
    this._userOptions = options;
    this._name = options.name ?? baseName;
    this._state = options.state;
    this._actions = helpers
      .deepClone(options.actions ?? [])
      .map(transferInteractorInnerAction);
    this._modalities = {};
    this._preInitialize = options.preInitialize ?? null;
    this._postInitialize = options.postInitialize ?? null;
    this._preUse = options.preUse ?? null;
    this._postUse = options.postUse ?? null;
    instanceInteractors.push(this);
    options.postInitialize && options.postInitialize.call(this, this);
  }

  enableModality(modal: "speech") {
    switch (modal) {
      case "speech":
        if (this._modalities["speech"]) break;
        const recognition = new SR();
        this._modalities["speech"] = recognition;
        const speechRecognitionList = new SGL();
        speechRecognitionList.addFromString(Actions);
        recognition.grammars = speechRecognitionList;
        // recognition.continuous = true;
        recognition.lang = "en-US";
        break;
    }
  }

  disableModality(modal: "speech") {
    switch (modal) {
      case "speech":
        if (this._modalities["speech"]) {
          this._modalities.speech.onresult = null;
          this._modalities.speech.onend = null;
          this._modalities["speech"].abort();
          this._modalities["speech"] = null;
        }
        break;
    }
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
      action.eventStreams.flatMap((eventStream) => eventStream.type)
    );
  }

  async dispatch(event: string | Event, layer?: Layer<any>): Promise<boolean> {
    const moveAction = this._actions.find((action) => {
      const events = action.eventStreams.map((es) => es.type);
      let inculdeEvent = false;
      if (events.includes("*")) inculdeEvent = true;
      if (event instanceof Event) {
        inculdeEvent = action.eventStreams
          .filter((es) => es.type === event.type)
          .some((es) =>
            es.filterFuncs ? es.filterFuncs.every((f) => f(event)) : true
          );
      } else {
        if (events.includes(event)) inculdeEvent = true;
      }
      return (
        inculdeEvent &&
        (!action.transition ||
          action.transition.find(
            (transition) =>
              transition[0] === this._state || transition[0] === "*"
          ))
      );
    });
    if (moveAction) {
      if (event instanceof Event) {
        event.preventDefault();
        event.stopPropagation();
      }
      const moveTransition =
        moveAction.transition &&
        moveAction.transition.find(
          (transition) => transition[0] === this._state || transition[0] === "*"
        );
      if (moveTransition) {
        this._state = moveTransition[1];
      }
      if (this._state.startsWith("speech:")) {
        this.enableModality("speech");
        try {
          this._modalities.speech.start();
        } catch {
          // just ignore if already started
        }
        this._modalities.speech.onresult = (e) => {
          const result = e.results[e.resultIndex][0];
          this.dispatch(result.transcript, layer);
        };
        this._modalities.speech.onend = (e) => {
          this._modalities.speech.start();
        };
      } else {
        this.disableModality("speech");
      }
      if (moveAction.sideEffect) {
        try {
          await moveAction.sideEffect({
            self: this,
            layer,
            instrument: null,
            interactor: this,
            event,
          });
        } catch (e) {
          console.error(e);
        }
      }
      return true;
    }
    return false;
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
      options ?? {}
    );
    const service = new mergedOptions.constructor(
      baseName,
      mergedOptions as InteractorInitTemplate
    );
    return service;
  }
  static findInteractor(baseNameOrRealName: string): Interactor[] {
    return instanceInteractors.filter((instrument) =>
      instrument.isInstanceOf(baseNameOrRealName)
    );
  }
}

function transferInteractorInnerAction(
  originAction: OriginInteractorInnerAction
): InteractorInnerAction {
  const eventStreams: helpers.EventStream[] = originAction.events.map(
    (evtSelector) =>
      helpers.parseEventSelector(evtSelector)[0] as helpers.EventStream
  ); // do not accept combinator
  return {
    ...originAction,
    eventStreams: eventStreams.map((es) => transferEventStream(es)),
  };
}

function transferEventStream(es: helpers.EventStream): LibraEventStream {
  return es.filter
    ? {
        ...es,
        filterFuncs: es.filter
          ? es.filter.map(
              (f) => new Function("event", `return ${f}`) as EventFilterFunc
            )
          : [],
      }
    : { ...es };
}

export const register = Interactor.register;
export const unregister = Interactor.unregister;
export const initialize = Interactor.initialize;
export const findInteractor = Interactor.findInteractor;

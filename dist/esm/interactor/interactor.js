var _a;
import * as helpers from "../helpers";
import Actions from "./actions.jsgf";
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
const SGL = window.SpeechGrammarList || window.webkitSpeechGrammarList;
const registeredInteractors = {};
export const instanceInteractors = [];
export default class Interactor {
    constructor(baseName, options) {
        this[_a] = true;
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
        options.postInitialize && options.postInitialize.call(this, this);
    }
    enableModality(modal) {
        switch (modal) {
            case "speech":
                if (this._modalities["speech"])
                    break;
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
    disableModality(modal) {
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
    getActions() {
        return this._actions.slice(0);
    }
    setActions(actions) {
        const mergeActions = actions.concat(this._actions);
        this._actions = mergeActions.filter((action, i) => i === mergeActions.findIndex((a) => a.action === action.action));
    }
    _parseEvent(event) {
        const flatStream = (stream) => "stream" in stream
            ? stream.between.concat(stream.stream).flatMap(flatStream)
            : "between" in stream
                ? stream.between
                    .concat([{ type: stream.type }])
                    .flatMap(flatStream)
                : stream.type;
        return helpers.parseEventSelector(event).flatMap(flatStream);
    }
    getAcceptEvents() {
        return [
            ...new Set(this._actions
                .flatMap((action) => action.eventStreams.flatMap((eventStream) => eventStream.type))
                .concat(["contextmenu"])),
        ];
    }
    async dispatch(event, layer) {
        const moveAction = this._actions.find((action) => {
            const events = action.eventStreams.map((es) => es.type);
            let inculdeEvent = false;
            if (events.includes("*"))
                inculdeEvent = true;
            if (event instanceof Event) {
                inculdeEvent = action.eventStreams
                    .filter((es) => es.type === event.type)
                    .some((es) => es.filterFuncs ? es.filterFuncs.every((f) => f(event)) : true);
            }
            else {
                if (events.includes(event))
                    inculdeEvent = true;
            }
            return (inculdeEvent &&
                (!action.transition ||
                    action.transition.find((transition) => transition[0] === this._state || transition[0] === "*")));
        });
        if (moveAction) {
            // if (event instanceof Event) {
            //   event.preventDefault();
            //   event.stopPropagation();
            // }
            const moveTransition = moveAction.transition &&
                moveAction.transition.find((transition) => transition[0] === this._state || transition[0] === "*");
            if (moveTransition) {
                this._state = moveTransition[1];
                if (this._state.startsWith("speech:")) {
                    this.enableModality("speech");
                    try {
                        this._modalities.speech.start();
                    }
                    catch {
                        // just ignore if already started
                    }
                    this._modalities.speech.onresult = (e) => {
                        const result = e.results[e.resultIndex][0];
                        this.dispatch(result.transcript, layer);
                    };
                    this._modalities.speech.onend = (e) => {
                        this._modalities.speech.start();
                    };
                }
                else {
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
                    }
                    catch (e) {
                        console.error(e);
                    }
                }
                return true;
            }
        }
        return false;
    }
    preUse(instrument) {
        this._preUse && this._preUse.call(this, this, instrument);
    }
    postUse(instrument) {
        this._postUse && this._postUse.call(this, this, instrument);
    }
    isInstanceOf(name) {
        return ("Interactor" == name || this._baseName === name || this._name === name);
    }
    static register(baseName, options) {
        registeredInteractors[baseName] = options;
    }
    static unregister(baseName) {
        delete registeredInteractors[baseName];
        return true;
    }
    static initialize(baseName, options) {
        const mergedOptions = Object.assign({ constructor: Interactor }, registeredInteractors[baseName] ?? {}, options ?? {});
        const interactor = new mergedOptions.constructor(baseName, mergedOptions);
        instanceInteractors.push(interactor);
        return interactor;
    }
    static findInteractor(baseNameOrRealName) {
        return instanceInteractors.filter((instrument) => instrument.isInstanceOf(baseNameOrRealName));
    }
}
_a = helpers.LibraSymbol;
export function transferInteractorInnerAction(originAction) {
    const eventStreams = originAction.events.map((evtSelector) => {
        if (typeof evtSelector === "string") {
            return helpers.parseEventSelector(evtSelector)[0];
        }
        else {
            const es = helpers.parseEventSelector("*")[0];
            es.filterFuncs = [evtSelector];
        }
    }); // do not accept combinator
    return {
        ...originAction,
        eventStreams: eventStreams.map((es) => transferEventStream(es)),
    };
}
function transferEventStream(es) {
    return es.filter
        ? {
            ...es,
            filterFuncs: es.filter
                ? es.filter.map((f) => new Function("event", `return ${f}`))
                : [],
        }
        : { ...es };
}
export const register = Interactor.register;
export const unregister = Interactor.unregister;
export const initialize = Interactor.initialize;
export const findInteractor = Interactor.findInteractor;

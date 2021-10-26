import * as helpers from "../helpers";
const registeredInteractors = {};
const instanceInteractors = [];
export default class Interactor {
    constructor(baseName, options) {
        var _a, _b, _c, _d, _e, _f;
        options.preInitialize && options.preInitialize.call(this, this);
        this._baseName = baseName;
        this._userOptions = options;
        this._name = (_a = options.name) !== null && _a !== void 0 ? _a : baseName;
        this._state = options.state;
        this._actions = (_b = options.actions) !== null && _b !== void 0 ? _b : [];
        this._preInitialize = (_c = options.preInitialize) !== null && _c !== void 0 ? _c : null;
        this._postInitialize = (_d = options.postInitialize) !== null && _d !== void 0 ? _d : null;
        this._preUse = (_e = options.preUse) !== null && _e !== void 0 ? _e : null;
        this._postUse = (_f = options.postUse) !== null && _f !== void 0 ? _f : null;
        options.postInitialize && options.postInitialize.call(this, this);
    }
    getActions() {
        return this._actions.slice(0);
    }
    setActions(actions) {
        this._actions = this._actions.concat(actions);
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
        return this._actions.flatMap((action) => action.events.flatMap((event) => this._parseEvent(event)));
    }
    dispatch(event) {
        const moveAction = this._actions.find((action) => action.events.includes(event) &&
            (!action.transition ||
                action.transition.find((transition) => transition[0] === this._state)));
        if (moveAction) {
            const moveTransition = moveAction.transition &&
                moveAction.transition.find((transition) => transition[0] === this._state);
            if (moveTransition) {
                this._state = moveTransition[1];
            }
            if (moveAction.sideEffect) {
                moveAction.sideEffect({
                    self: this,
                    layer: null,
                    instrument: null,
                    interactor: this,
                });
            }
        }
    }
    preUse(instrument) {
        this._preUse && this._preUse.call(this, this, instrument);
    }
    postUse(instrument) {
        this._postUse && this._postUse.call(this, this, instrument);
    }
    isInstanceOf(name) {
        return this._baseName === name || this._name === name;
    }
}
export function register(baseName, options) {
    registeredInteractors[baseName] = options;
}
export function unregister(baseName) {
    delete registeredInteractors[baseName];
    return true;
}
export function initialize(baseName, options) {
    var _a;
    const mergedOptions = Object.assign({}, (_a = registeredInteractors[baseName]) !== null && _a !== void 0 ? _a : { constructor: Interactor }, options);
    const service = new mergedOptions.constructor(baseName, mergedOptions);
    return service;
}
export function findInteractor(baseNameOrRealName) {
    return instanceInteractors.filter((instrument) => instrument.isInstanceOf(baseNameOrRealName));
}
Interactor.register = register;
Interactor.initialize = initialize;
Interactor.findInteractor = findInteractor;

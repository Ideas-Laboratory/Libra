import { Command } from "../command";
const registeredInstruments = {};
const instanceInstruments = [];
export default class Instrument {
    constructor(baseName, options) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        options.preInitialize && options.preInitialize.call(this, this);
        this._baseName = baseName;
        this._userOptions = options;
        this._name = (_a = options.name) !== null && _a !== void 0 ? _a : baseName;
        this._on = (_b = options.on) !== null && _b !== void 0 ? _b : {};
        this._interactors = (_c = options.interactors) !== null && _c !== void 0 ? _c : [];
        this._layers = (_d = options.layers) !== null && _d !== void 0 ? _d : [];
        this._sharedVar = (_e = options.sharedVar) !== null && _e !== void 0 ? _e : {};
        this._preInitialize = (_f = options.preInitialize) !== null && _f !== void 0 ? _f : null;
        this._postInitialize = (_g = options.postInitialize) !== null && _g !== void 0 ? _g : null;
        this._preUse = (_h = options.preUse) !== null && _h !== void 0 ? _h : null;
        this._postUse = (_j = options.postUse) !== null && _j !== void 0 ? _j : null;
        options.postInitialize && options.postInitialize.call(this, this);
    }
    on(action, feedforwardOrCommand) {
        this._on[action] = feedforwardOrCommand;
    }
    use(interactor, options) {
        interactor.preUse(this);
        // TODO: inject options
        if (arguments.length >= 2) {
            this._interactors.push({ interactor, options });
        }
        else {
            this._interactors.push(interactor);
        }
        interactor.postUse(this);
    }
    attach(layer, options) {
        this.preUse(layer);
        if (arguments.length >= 2) {
            this._layers.push({ layer, options });
        }
        else {
            this._layers.push(layer);
        }
        this.postUse(layer);
    }
    getSharedVar(sharedName, options) {
        if (!(sharedName in this._sharedVar) && "defaultValue" in options) {
            this.setSharedVar(sharedName, options.defaultValue, options);
        }
        return this._sharedVar[sharedName];
    }
    setSharedVar(sharedName, value, options) {
        this._sharedVar[sharedName] = value;
        if (this._on[`update:${sharedName}`]) {
            const feedforwardOrCommand = this._on[`update:${sharedName}`];
            if (feedforwardOrCommand instanceof Command) {
                feedforwardOrCommand.execute({
                    self: this,
                    layer: null,
                    instrument: this,
                    interactor: null,
                });
            }
            else {
                feedforwardOrCommand({
                    self: this,
                    layer: null,
                    instrument: this,
                    interactor: null,
                });
            }
        }
    }
    watchSharedVar(sharedName, handler) {
        this.on(`update:${sharedName}`, handler);
    }
    preUse(layer) {
        this._preUse && this._preUse.call(this, this, layer);
    }
    postUse(layer) {
        this._postUse && this._postUse.call(this, this, layer);
    }
    isInstanceOf(name) {
        return this._baseName === name || this._name === name;
    }
}
export function register(baseName, options) {
    registeredInstruments[baseName] = options;
}
export function unregister(baseName) {
    delete registeredInstruments[baseName];
    return true;
}
export function initialize(baseName, options) {
    var _a, _b, _c, _d;
    const mergedOptions = Object.assign({}, (_a = registeredInstruments[baseName]) !== null && _a !== void 0 ? _a : { constructor: Instrument }, options, {
        on: Object.assign({}, (_c = ((_b = registeredInstruments[baseName]) !== null && _b !== void 0 ? _b : {}).on) !== null && _c !== void 0 ? _c : {}, (_d = options.on) !== null && _d !== void 0 ? _d : {}),
    });
    const service = new mergedOptions.constructor(baseName, mergedOptions);
    return service;
}
export function findInstrument(baseNameOrRealName) {
    return instanceInstruments.filter((instrument) => instrument.isInstanceOf(baseNameOrRealName));
}
Instrument.register = register;
Instrument.initialize = initialize;
Instrument.findInstrument = findInstrument;

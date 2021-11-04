import { Interactor } from "../interactor";
import { Command } from "../command";
import { Layer } from "../layer";
const registeredInstruments = {};
const instanceInstruments = [];
export default class Instrument {
    constructor(baseName, options) {
        var _a, _b, _c, _d, _e, _f, _g;
        options.preInitialize && options.preInitialize.call(this, this);
        this._preInitialize = (_a = options.preInitialize) !== null && _a !== void 0 ? _a : null;
        this._postInitialize = (_b = options.postInitialize) !== null && _b !== void 0 ? _b : null;
        this._preUse = (_c = options.preUse) !== null && _c !== void 0 ? _c : null;
        this._postUse = (_d = options.postUse) !== null && _d !== void 0 ? _d : null;
        this._baseName = baseName;
        this._userOptions = options;
        this._name = (_e = options.name) !== null && _e !== void 0 ? _e : baseName;
        this._on = (_f = options.on) !== null && _f !== void 0 ? _f : {};
        this._interactors = [];
        this._layers = [];
        if (options.interactors) {
            options.interactors.forEach((interactor) => {
                if (typeof interactor === "string") {
                    this.use(Interactor.initialize(interactor));
                }
                else if ("options" in interactor) {
                    if (typeof interactor.interactor === "string") {
                        this.use(Interactor.initialize(interactor.interactor, interactor.options));
                    }
                    else {
                        this.use(interactor.interactor, interactor.options);
                    }
                }
                else {
                    this.use(interactor);
                }
            });
        }
        if (options.layers) {
            options.layers.forEach((layer) => {
                if ("options" in layer) {
                    this.attach(layer.layer, layer.options);
                }
                else {
                    this.attach(layer);
                }
            });
        }
        this._sharedVar = (_g = options.sharedVar) !== null && _g !== void 0 ? _g : {};
        options.postInitialize && options.postInitialize.call(this, this);
    }
    on(action, feedforwardOrCommand) {
        if (!this._on[action]) {
            this._on[action] = [];
        }
        this._on[action].push(feedforwardOrCommand);
    }
    off(action, feedforwardOrCommand) {
        if (!this._on[action])
            return;
        if (this._on[action].includes(feedforwardOrCommand)) {
            this._on[action].splice(this._on[action].indexOf(feedforwardOrCommand), 1);
        }
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
        interactor.setActions(interactor.getActions().map((action) => ({
            ...action,
            sideEffect: (options) => {
                action.sideEffect && action.sideEffect(options);
                this._on[action.action] &&
                    this._on[action.action].forEach((command) => command({
                        ...options,
                        self: this,
                        instrument: this,
                    }));
            },
        })));
        this._layers.forEach((layer) => {
            let layr;
            if (layer instanceof Layer) {
                layr = layer;
            }
            else {
                layr = layer.layer;
            }
            interactor
                .getAcceptEvents()
                .forEach((event) => layr
                .getContainerGraphic()
                .addEventListener(event, (e) => interactor.dispatch(e, layr)));
        });
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
            const feedforwardOrCommands = this._on[`update:${sharedName}`];
            feedforwardOrCommands.forEach((feedforwardOrCommand) => {
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
            });
        }
    }
    watchSharedVar(sharedName, handler) {
        this.on(`update:${sharedName}`, handler);
    }
    preUse(layer) {
        this._preUse && this._preUse.call(this, this, layer);
        this._interactors.forEach((interactor) => {
            let inter;
            if (interactor instanceof Interactor) {
                inter = interactor;
            }
            else {
                inter = interactor.interactor;
            }
            inter
                .getAcceptEvents()
                .forEach((event) => layer
                .getContainerGraphic()
                .addEventListener(event, (e) => inter.dispatch(e, layer)));
        });
    }
    postUse(layer) {
        this._postUse && this._postUse.call(this, this, layer);
    }
    isInstanceOf(name) {
        return this._baseName === name || this._name === name;
    }
    static register(baseName, options) {
        registeredInstruments[baseName] = options;
    }
    static unregister(baseName) {
        delete registeredInstruments[baseName];
        return true;
    }
    static initialize(baseName, options) {
        var _a, _b, _c, _d;
        const mergedOptions = Object.assign({}, (_a = registeredInstruments[baseName]) !== null && _a !== void 0 ? _a : { constructor: Instrument }, options !== null && options !== void 0 ? options : {}, {
            on: Object.assign({}, (_c = ((_b = registeredInstruments[baseName]) !== null && _b !== void 0 ? _b : {}).on) !== null && _c !== void 0 ? _c : {}, (_d = options === null || options === void 0 ? void 0 : options.on) !== null && _d !== void 0 ? _d : {}),
        });
        const service = new mergedOptions.constructor(baseName, mergedOptions);
        return service;
    }
    static findInstrument(baseNameOrRealName) {
        return instanceInstruments.filter((instrument) => instrument.isInstanceOf(baseNameOrRealName));
    }
}
export const register = Instrument.register;
export const unregister = Instrument.unregister;
export const initialize = Instrument.initialize;
export const findInstrument = Instrument.findInstrument;

import { Interactor } from "../interactor";
import { Command } from "../command";
import { Layer } from "../layer";
const registeredInstruments = {};
const instanceInstruments = [];
const EventDispatcher = new Map();
const EventQueue = [];
let eventHandling = false;
export default class Instrument {
    constructor(baseName, options) {
        options.preInitialize && options.preInitialize.call(this, this);
        this._preInitialize = options.preInitialize ?? null;
        this._postInitialize = options.postInitialize ?? null;
        this._preAttach = options.preAttach ?? null;
        this._postUse = options.postUse ?? null;
        this._baseName = baseName;
        this._userOptions = options;
        this._name = options.name ?? baseName;
        this._on = options.on ?? {};
        this._interactors = [];
        this._layers = [];
        this._sharedVar = options.sharedVar ?? {};
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
        options.postInitialize && options.postInitialize.call(this, this);
    }
    emit(action, options) {
        if (this._on[action]) {
            this._on[action].forEach((feedforwardOrCommand) => {
                if (feedforwardOrCommand instanceof Command) {
                    feedforwardOrCommand.execute(Object.assign({
                        self: this,
                        layer: null,
                        instrument: this,
                        interactor: null,
                    }, options || {}));
                }
                else {
                    feedforwardOrCommand(Object.assign({
                        self: this,
                        layer: null,
                        instrument: this,
                        interactor: null,
                    }, options || {}));
                }
            });
        }
    }
    on(action, feedforwardOrCommand) {
        if (action instanceof Array) {
            action.forEach((action) => {
                if (!this._on[action]) {
                    this._on[action] = [];
                }
                this._on[action].push(feedforwardOrCommand);
            });
        }
        else {
            if (!this._on[action]) {
                this._on[action] = [];
            }
            this._on[action].push(feedforwardOrCommand);
        }
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
            sideEffect: async (options) => {
                action.sideEffect && action.sideEffect(options);
                if (this._on[action.action]) {
                    for (let command of this._on[action.action]) {
                        if (command instanceof Command) {
                            await command.execute({
                                ...options,
                                self: this,
                                instrument: this,
                            });
                        }
                        else {
                            await command({
                                ...options,
                                self: this,
                                instrument: this,
                            });
                        }
                    }
                }
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
            interactor.getAcceptEvents().forEach((event) => {
                if (!EventDispatcher.has(layr.getContainerGraphic())) {
                    EventDispatcher.set(layr.getContainerGraphic(), new Map());
                }
                if (!EventDispatcher.get(layr.getContainerGraphic()).has(event)) {
                    layr
                        .getContainerGraphic()
                        .addEventListener(event, this._dispatch.bind(this, layr, event));
                    EventDispatcher.get(layr.getContainerGraphic()).set(event, []);
                }
                EventDispatcher.get(layr.getContainerGraphic())
                    .get(event)
                    .push([interactor, layr]);
            });
        });
        interactor.postUse(this);
    }
    attach(layer, options) {
        this.preAttach(layer);
        if (arguments.length >= 2) {
            this._layers.push({ layer, options });
        }
        else {
            this._layers.push(layer);
        }
        this.postUse(layer);
    }
    getSharedVar(sharedName, options) {
        if (!(sharedName in this._sharedVar) &&
            options &&
            "defaultValue" in options) {
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
    preAttach(layer) {
        this._preAttach && this._preAttach.call(this, this, layer);
        this._interactors.forEach((interactor) => {
            let inter;
            if (interactor instanceof Interactor) {
                inter = interactor;
            }
            else {
                inter = interactor.interactor;
            }
            inter.getAcceptEvents().forEach((event) => {
                if (!EventDispatcher.has(layer.getContainerGraphic())) {
                    EventDispatcher.set(layer.getContainerGraphic(), new Map());
                }
                if (!EventDispatcher.get(layer.getContainerGraphic()).has(event)) {
                    layer
                        .getContainerGraphic()
                        .addEventListener(event, this._dispatch.bind(this, layer, event));
                    EventDispatcher.get(layer.getContainerGraphic()).set(event, []);
                }
                EventDispatcher.get(layer.getContainerGraphic())
                    .get(event)
                    .push([inter, layer]);
            });
        });
    }
    async _dispatch(layer, event, e) {
        e.preventDefault();
        e.stopPropagation();
        if (eventHandling) {
            let existingEventIndex = EventQueue.findIndex((e) => e.instrument === this && e.layer === layer && e.eventType === event);
            if (existingEventIndex >= 0) {
                EventQueue.splice(existingEventIndex, 1);
            }
            EventQueue.push({ instrument: this, layer, eventType: event, event: e });
            return;
        }
        eventHandling = true;
        const layers = EventDispatcher.get(layer.getContainerGraphic())
            .get(event)
            .filter(([interactor, layr]) => layr._order >= 0);
        layers.sort((a, b) => b[1]._order - a[1]._order);
        e.handledLayers = [];
        for (let [inter, layr] of layers) {
            e.handled = false;
            await inter.dispatch(e, layr);
            if (e.handled == true) {
                e.handledLayers.push(layr._name);
                if (e.passThrough == false) {
                    break;
                }
            }
        }
        eventHandling = false;
        if (EventQueue.length) {
            const eventDescription = EventQueue.shift();
            eventDescription.instrument._dispatch(eventDescription.layer, eventDescription.eventType, eventDescription.event);
        }
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
        const mergedOptions = Object.assign({}, registeredInstruments[baseName] ?? { constructor: Instrument }, options ?? {}, {
            on: Object.assign({}, (registeredInstruments[baseName] ?? {}).on ?? {}, options?.on ?? {}),
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

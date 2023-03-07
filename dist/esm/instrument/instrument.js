var _a;
import { Interactor } from "../interactor";
import * as helpers from "../helpers";
import { Command } from "../command";
import { Layer } from "../layer";
import { Service, findService } from "../service";
import { GraphicalTransformer } from "../transformer";
import SelectionService from "../service/selectionService";
const registeredInstruments = {};
export const instanceInstruments = [];
const EventDispatcher = new Map();
const EventQueue = [];
let eventHandling = false;
export default class Instrument {
    constructor(baseName, options) {
        this._transformers = [];
        this._linkCache = {};
        this[_a] = true;
        options.preInitialize && options.preInitialize.call(this, this);
        this._preInitialize = options.preInitialize ?? null;
        this._postInitialize = options.postInitialize ?? null;
        this._preAttach = options.preAttach ?? null;
        this._postUse = options.postUse ?? null;
        this._baseName = baseName;
        this._userOptions = options;
        this._name = options.name ?? baseName;
        // this._on = helpers.deepClone(options.on ?? {});
        this._on = Object.assign({}, options.on ?? {});
        this._interactors = [];
        this._layers = [];
        this._layerInteractors = new Map();
        this._services = options.services ?? [];
        this._serviceInstances = [];
        this._sharedVar = options.sharedVar ?? {};
        this._transformers = options.transformers ?? [];
        if (options.interactors) {
            options.interactors.forEach((interactor) => {
                if (typeof interactor === "string") {
                    this.useInteractor(Interactor.initialize(interactor));
                }
                else if ("options" in interactor) {
                    if (typeof interactor.interactor === "string") {
                        this.useInteractor(Interactor.initialize(interactor.interactor, interactor.options));
                    }
                    else {
                        this.useInteractor(interactor.interactor, interactor.options);
                    }
                }
                else {
                    this.useInteractor(interactor);
                }
            });
        }
        this._services.forEach((service) => {
            if (typeof service === "string" || !("options" in service)) {
                this.useService(service);
            }
            else {
                this.useService(service.service, service.options);
            }
        });
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
        return this;
    }
    off(action, feedforwardOrCommand) {
        if (!this._on[action])
            return;
        if (this._on[action].includes(feedforwardOrCommand)) {
            this._on[action].splice(this._on[action].indexOf(feedforwardOrCommand), 1);
        }
        return this;
    }
    _use(service, options) {
        service.preAttach(this);
        this._serviceInstances.push(service);
        service.postUse(this);
    }
    useService(service, options) {
        if (typeof service !== "string" &&
            this._serviceInstances.includes(service)) {
            return;
        }
        if (arguments.length >= 2) {
            this._services.push({ service, options });
        }
        else {
            this._services.push(service);
        }
        if (typeof service === "string") {
            const services = findService(service);
            services.forEach((service) => this._use(service, options));
        }
        else {
            this._use(service, options);
        }
    }
    useInteractor(interactor, options) {
        interactor.preUse(this);
        // TODO: inject options
        if (arguments.length >= 2) {
            this._interactors.push({ interactor, options });
        }
        else {
            this._interactors.push(interactor);
        }
        this._layers.forEach((layer) => {
            let layr;
            if (layer instanceof Layer) {
                layr = layer;
            }
            else {
                layr = layer.layer;
            }
            if (!this._layerInteractors.has(layr)) {
                this._layerInteractors.set(layr, []);
            }
            const copyInteractor = Interactor.initialize(interactor._baseName, interactor._userOptions);
            this._layerInteractors.get(layr).push(copyInteractor);
            copyInteractor.setActions(copyInteractor.getActions().map((action) => ({
                ...action,
                sideEffect: async (options) => {
                    action.sideEffect && action.sideEffect(options);
                    if (this._on[action.action]) {
                        for (let command of this._on[action.action]) {
                            try {
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
                            catch (e) {
                                console.error(e);
                            }
                        }
                    }
                },
            })));
            copyInteractor.getAcceptEvents().forEach((event) => {
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
                    .push([
                    copyInteractor,
                    layr,
                    layer instanceof Layer ? null : layer.options,
                    this,
                ]);
            });
        });
        interactor.postUse(this);
    }
    attach(layer, options) {
        if (this._layers.find((l) => l instanceof Layer ? l === layer : l.layer === layer))
            return; // Reject for duplicated attach
        this.preAttach(layer, options ?? null);
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
        // const linkProps =
        //   this.getSharedVar("linkProps") || Object.keys(this._sharedVar);
        // if (this._sharedVar.linking) {
        //   for (let prop of linkProps) {
        //     if (this._linkCache[prop] === this._sharedVar[prop]) continue;
        //     this._sharedVar.linking.setSharedVar(prop, this._sharedVar[prop]);
        //   }
        // }
    }
    watchSharedVar(sharedName, handler) {
        this.on(`update:${sharedName}`, handler);
    }
    preAttach(layer, options) {
        this._preAttach && this._preAttach.call(this, this, layer);
        this._interactors.forEach((interactor) => {
            let inter;
            if (interactor instanceof Interactor) {
                inter = interactor;
            }
            else {
                inter = interactor.interactor;
            }
            if (!this._layerInteractors.has(layer)) {
                this._layerInteractors.set(layer, []);
            }
            const copyInteractor = Interactor.initialize(inter._baseName, inter._userOptions);
            this._layerInteractors.get(layer).push(copyInteractor);
            copyInteractor.setActions(copyInteractor.getActions().map((action) => ({
                ...action,
                sideEffect: async (options) => {
                    action.sideEffect && action.sideEffect(options);
                    if (this._on[action.action]) {
                        for (let command of this._on[action.action]) {
                            try {
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
                            catch (e) {
                                console.error(e);
                            }
                        }
                    }
                },
            })));
            copyInteractor.getAcceptEvents().forEach((event) => {
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
                    .push([copyInteractor, layer, options, this]);
            });
        });
    }
    async _dispatch(layer, event, e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
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
            .filter(([_, layr]) => layr._order >= 0);
        layers.sort((a, b) => b[1]._order - a[1]._order);
        let handled = false;
        for (let [inter, layr, layerOption, instrument] of layers) {
            if (e instanceof MouseEvent) {
                if (layr._name?.toLowerCase().replaceAll("-", "").replaceAll("_", "") ===
                    "backgroundlayer" ||
                    layr._name?.toLowerCase().replaceAll("-", "").replaceAll("_", "") ===
                        "bglayer" ||
                    (layerOption && layerOption.pointerEvents === "all")) {
                    // Default is `all` for BGLayer
                }
                else if (!layerOption || layerOption.pointerEvents === "viewport") {
                    // Default is `viewport` for layers
                    const maybeD3Layer = layr;
                    if (maybeD3Layer._offset &&
                        maybeD3Layer._width &&
                        maybeD3Layer._height) {
                        if (e.offsetX < maybeD3Layer._offset.x ||
                            e.offsetX > maybeD3Layer._offset.x + maybeD3Layer._width ||
                            e.offsetY < maybeD3Layer._offset.y ||
                            e.offsetY > maybeD3Layer._offset.y + maybeD3Layer._height) {
                            continue;
                        }
                    }
                }
                else {
                    // Others is `visiblePainted`
                    const query = layr.picking({
                        baseOn: helpers.QueryType.Shape,
                        type: helpers.ShapeQueryType.Point,
                        x: e.clientX,
                        y: e.clientY,
                    });
                    if (query.length <= 0)
                        continue;
                }
            }
            try {
                let flag = await inter.dispatch(e, layr);
                // if (flag && e instanceof MouseEvent) {
                //   handled = true;
                //   break;
                // }
            }
            catch (e) {
                console.error(e);
                break;
            }
        }
        // if (!handled && e instanceof MouseEvent) {
        //   // default fallback of BGLayer
        //   helpers.global.stopTransient = true;
        // } else {
        //   helpers.global.stopTransient = false;
        // }
        eventHandling = false;
        if (EventQueue.length) {
            const eventDescription = EventQueue.shift();
            eventDescription.instrument._dispatch(eventDescription.layer, eventDescription.eventType, eventDescription.event);
        }
    }
    postUse(layer) {
        const graphic = layer.getGraphic();
        graphic && graphic.style && (graphic.style.pointerEvents = "auto");
        this._postUse && this._postUse.call(this, this, layer);
    }
    isInstanceOf(name) {
        return this._baseName === name || this._name === name;
    }
    get services() {
        return helpers.makeFindableList(this._serviceInstances.slice(0), Service, this.useService.bind(this), () => {
            throw new Error("Do not support dynamic change service yet");
        }, this);
    }
    get transformers() {
        return helpers.makeFindableList(this._transformers.slice(0), GraphicalTransformer, (e) => this._transformers.push(e), (e) => this._transformers.splice(this._transformers.indexOf(e), 1), this);
    }
    static register(baseName, options) {
        registeredInstruments[baseName] = options;
    }
    static unregister(baseName) {
        delete registeredInstruments[baseName];
        return true;
    }
    static initialize(baseName, options) {
        const mergedOptions = Object.assign({ constructor: Instrument }, registeredInstruments[baseName] ?? {}, options ?? {}, {
            on: helpers.deepClone(Object.assign({}, (registeredInstruments[baseName] ?? {}).on ?? {}, options?.on ?? {})),
            sharedVar: Object.assign({}, (registeredInstruments[baseName] ?? {}).sharedVar ?? {}, options?.sharedVar ?? {}),
        });
        const instrument = new mergedOptions.constructor(baseName, mergedOptions);
        instanceInstruments.push(instrument);
        return instrument;
    }
    static findInstrument(baseNameOrRealName) {
        return instanceInstruments.filter((instrument) => instrument.isInstanceOf(baseNameOrRealName));
    }
    static build(options) {
        if (!(options.inherit in registeredInstruments)) {
            throw new Error(`Instrument ${options.inherit} is not registered, please register it first`);
        }
        const inheritOption = Object.assign({ constructor: Instrument }, registeredInstruments[options.inherit], {
            sharedVar: Object.assign({}, registeredInstruments[options.inherit].sharedVar ?? {}, options.sharedVar ?? {}),
        });
        if (options.layers) {
            inheritOption.layers = options.layers;
        }
        if (options.flow) {
            let prevComponent = null;
            let prevType = null;
            for (let i = options.flow.length - 1; i >= 0; i--) {
                const componentOption = options.flow[i];
                if (componentOption instanceof Function) {
                    const newPrevComponent = [];
                    let newPrevType = null;
                    for (let j = 0; j < inheritOption.layers.length; j++) {
                        const layer = inheritOption.layers[j];
                        const generatedOption = componentOption(layer, j);
                        if (generatedOption.type.includes("Transformer")) {
                            let transformer;
                            if (generatedOption.name) {
                                if (GraphicalTransformer.findTransformer(generatedOption.name)
                                    .length > 0) {
                                    transformer = GraphicalTransformer.findTransformer(generatedOption.name)[0];
                                }
                            }
                            if (!transformer)
                                transformer = GraphicalTransformer.initialize(generatedOption.type, {
                                    name: generatedOption.name,
                                    sharedVar: {
                                        ...(options.sharedVar || {}),
                                        ...(generatedOption.sharedVar || {}),
                                    },
                                });
                            newPrevComponent.push(transformer);
                            newPrevType = "Transformer";
                        }
                        else if (generatedOption.type.includes("Service")) {
                            let service;
                            if (generatedOption.name) {
                                if (Service.findService(generatedOption.name).length > 0) {
                                    service = Service.findService(generatedOption.name)[0];
                                }
                            }
                            if (!service)
                                service = Service.initialize(generatedOption.type, {
                                    ...generatedOption,
                                    ...(prevComponent
                                        ? prevType == "Transformer"
                                            ? {
                                                transformers: prevComponent instanceof Array
                                                    ? prevComponent
                                                    : [prevComponent],
                                            }
                                            : {
                                                services: prevComponent instanceof Array
                                                    ? prevComponent
                                                    : [prevComponent],
                                            }
                                        : {}),
                                    sharedVar: {
                                        ...(options.sharedVar || {}),
                                        ...(generatedOption.sharedVar || {}),
                                    },
                                });
                            if (generatedOption.dimension &&
                                service instanceof SelectionService) {
                                service = service.dimension(generatedOption.dimension);
                                if (generatedOption.layers) {
                                    service._layerInstances = generatedOption.layers.slice(0);
                                }
                                if (generatedOption.sharedVar) {
                                    service.setSharedVars(generatedOption.sharedVar);
                                }
                            }
                            newPrevComponent.push(service);
                            newPrevType = "Service";
                        }
                    }
                    prevComponent = newPrevComponent;
                    prevType = newPrevType;
                }
                else if (componentOption instanceof Array) {
                    const newPrevComponent = [];
                    let newPrevType = null;
                    for (let j = 0; j < componentOption.length; j++) {
                        const component = componentOption[j];
                        if (component instanceof GraphicalTransformer) {
                            newPrevComponent.push(component);
                            newPrevType = "Transformer";
                        }
                        else if (component instanceof Service) {
                            if (prevType == "Transformer") {
                                component._transformers.push(...(prevComponent instanceof Array
                                    ? prevComponent
                                    : [prevComponent]));
                            }
                            else {
                                component._services.push(...(prevComponent instanceof Array
                                    ? prevComponent
                                    : [prevComponent]));
                            }
                            newPrevComponent.push(component);
                            newPrevType = "Service";
                        }
                        else if (component.type.includes("Transformer")) {
                            let transformer;
                            if (component.name) {
                                if (GraphicalTransformer.findTransformer(component.name).length > 0) {
                                    transformer = GraphicalTransformer.findTransformer(component.name)[0];
                                }
                            }
                            if (!transformer)
                                transformer = GraphicalTransformer.initialize(component.type, {
                                    name: component.name,
                                    sharedVar: {
                                        ...(options.sharedVar || {}),
                                        ...(component.sharedVar || {}),
                                    },
                                });
                            newPrevComponent.push(transformer);
                            newPrevType = "Transformer";
                        }
                        else if (component.type.includes("Service")) {
                            let service;
                            if (component.name) {
                                if (Service.findService(component.name).length > 0) {
                                    service = Service.findService(component.name)[0];
                                }
                            }
                            if (!service)
                                service = Service.initialize(component.type, {
                                    ...component,
                                    ...(prevComponent
                                        ? prevType == "Transformer"
                                            ? {
                                                transformers: prevComponent instanceof Array
                                                    ? prevComponent
                                                    : [prevComponent],
                                            }
                                            : {
                                                services: prevComponent instanceof Array
                                                    ? prevComponent
                                                    : [prevComponent],
                                            }
                                        : {}),
                                    sharedVar: {
                                        ...(options.sharedVar || {}),
                                        ...(component.sharedVar || {}),
                                    },
                                });
                            if (component.dimension && service instanceof SelectionService) {
                                service = service.dimension(component.dimension);
                                if (component.layers) {
                                    service._layerInstances = component.layers.slice(0);
                                }
                                if (component.sharedVar) {
                                    service.setSharedVars(component.sharedVar);
                                }
                            }
                            newPrevComponent.push(service);
                            newPrevType = "Service";
                        }
                    }
                    prevComponent = newPrevComponent;
                    prevType = newPrevType;
                }
                else if (componentOption instanceof GraphicalTransformer) {
                    prevComponent = componentOption;
                    prevType = "Transformer";
                }
                else if (componentOption instanceof Service) {
                    if (prevType == "Transformer") {
                        componentOption._transformers.push(...(prevComponent instanceof Array
                            ? prevComponent
                            : [prevComponent]));
                    }
                    else {
                        componentOption._services.push(...(prevComponent instanceof Array
                            ? prevComponent
                            : [prevComponent]));
                    }
                    prevComponent = componentOption;
                    prevType = "Service";
                }
                else if (componentOption.type.includes("Transformer")) {
                    let transformer;
                    if (componentOption.name) {
                        if (GraphicalTransformer.findTransformer(componentOption.name).length >
                            0) {
                            transformer = GraphicalTransformer.findTransformer(componentOption.name)[0];
                        }
                    }
                    if (!transformer)
                        transformer = GraphicalTransformer.initialize(componentOption.type, {
                            name: componentOption.name,
                            sharedVar: {
                                ...(options.sharedVar || {}),
                                ...(componentOption.sharedVar || {}),
                            },
                        });
                    prevComponent = transformer;
                    prevType = "Transformer";
                }
                else if (componentOption.type.includes("Service")) {
                    let service;
                    if (componentOption.name) {
                        if (Service.findService(componentOption.name).length > 0) {
                            service = Service.findService(componentOption.name)[0];
                        }
                    }
                    if (!service)
                        service = Service.initialize(componentOption.type, {
                            ...componentOption,
                            ...(prevComponent
                                ? prevType == "Transformer"
                                    ? {
                                        transformers: prevComponent instanceof Array
                                            ? prevComponent
                                            : [prevComponent],
                                    }
                                    : {
                                        services: prevComponent instanceof Array
                                            ? prevComponent
                                            : [prevComponent],
                                    }
                                : {}),
                            sharedVar: {
                                ...(options.sharedVar || {}),
                                ...(componentOption.sharedVar || {}),
                            },
                        });
                    if (componentOption.dimension &&
                        service.isInstanceOf("SelectionService")) {
                        service = service.dimension(componentOption.dimension);
                        if (componentOption.layers) {
                            service._layerInstances = componentOption.layers.slice(0);
                        }
                        if (componentOption.sharedVar) {
                            service.setSharedVars(componentOption.sharedVar);
                        }
                    }
                    prevComponent = service;
                    prevType = "Service";
                }
            }
            if (prevComponent) {
                if (prevType == "Transformer") {
                    inheritOption.transformers = inheritOption.transformers || [];
                    if (prevComponent instanceof Array) {
                        inheritOption.transformers.push(...prevComponent);
                    }
                    else {
                        inheritOption.transformers.push(prevComponent);
                    }
                }
                else {
                    inheritOption.services = inheritOption.services || [];
                    if (prevComponent instanceof Array) {
                        inheritOption.services.push(...prevComponent);
                    }
                    else {
                        inheritOption.services.push(prevComponent);
                    }
                }
            }
        }
        const instrument = new inheritOption.constructor(options.inherit, inheritOption);
        instanceInstruments.push(instrument);
        return instrument;
    }
}
_a = helpers.LibraSymbol;
export const register = Instrument.register;
export const unregister = Instrument.unregister;
export const initialize = Instrument.initialize;
export const findInstrument = Instrument.findInstrument;

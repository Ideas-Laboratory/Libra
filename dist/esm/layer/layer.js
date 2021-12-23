import { InteractionService, findService } from "../service";
import * as helpers from "../helpers";
import { Command } from "../command";
const registeredLayers = {};
const instanceLayers = [];
const siblingLayers = new Map();
const orderLayers = new Map();
export default class Layer {
    constructor(baseName, options) {
        options.preInitialize && options.preInitialize.call(this, this);
        this._baseName = baseName;
        this._userOptions = options;
        this._name = options.name ?? baseName;
        this._transformation = options.transformation ?? {};
        this._services = options.services ?? [];
        this._container = options.container;
        this._sharedVar = options.sharedVar ?? {};
        this._sharedVarWatcher = {};
        this._transformationWatcher = {};
        this._serviceInstances = [];
        this._order = 0;
        this._redraw = options.redraw;
        this._preInitialize = options.preInitialize ?? null;
        this._postInitialize = options.postInitialize ?? null;
        this._preUpdate = options.preUpdate ?? null;
        this._postUpdate = options.postUpdate ?? null;
        this._services.forEach((service) => {
            if (typeof service === "string" || !("options" in service)) {
                this.use(service);
            }
            else {
                this.use(service.service, service.options);
            }
        });
        instanceLayers.push(this);
        this._postInitialize && this._postInitialize.call(this, this);
    }
    getGraphic() {
        return this._graphic;
    }
    getContainerGraphic() {
        return this._container;
    }
    getVisualElements() {
        return [];
    }
    cloneVisualElements(element, deep = false) {
        return element.cloneNode(deep);
    }
    getSharedVar(sharedName, defaultValue) {
        if (sharedName in this._sharedVar) {
            return this._sharedVar[sharedName];
        }
        else {
            this.setSharedVar(sharedName, defaultValue);
            return defaultValue;
        }
    }
    setSharedVar(sharedName, value) {
        this.preUpdate();
        const oldValue = this._sharedVar[sharedName];
        this._sharedVar[sharedName] = value;
        if (sharedName in this._sharedVarWatcher) {
            this._sharedVarWatcher[sharedName].forEach((callback) => {
                if (callback instanceof Command) {
                    callback.execute({
                        self: this,
                        layer: this,
                        instrument: null,
                        interactor: null,
                        value,
                        oldValue,
                    });
                }
                else {
                    callback({ value, oldValue });
                }
            });
        }
        this.postUpdate();
    }
    watchSharedVar(sharedName, handler) {
        if (!(sharedName in this._sharedVarWatcher)) {
            this._sharedVarWatcher[sharedName] = [];
        }
        this._sharedVarWatcher[sharedName].push(handler);
    }
    getTransformation(scaleName, defaultValue) {
        if (scaleName in this._transformation) {
            return this._transformation[scaleName];
        }
        else {
            this.setTransformation(scaleName, defaultValue);
            return defaultValue;
        }
    }
    setTransformation(scaleName, transformation) {
        // TODO: implement responsive viewport
        this.preUpdate();
        const oldValue = this._transformation[scaleName];
        this._transformation[scaleName] = transformation;
        if (scaleName in this._transformationWatcher) {
            this._transformationWatcher[scaleName].forEach((callback) => {
                if (callback instanceof Command) {
                    callback.execute({
                        self: this,
                        layer: this,
                        instrument: null,
                        interactor: null,
                        value: transformation,
                        oldValue,
                    });
                }
                else {
                    callback({ value: transformation, oldValue });
                }
            });
        }
        this.postUpdate();
    }
    watchTransformation(scaleName, handler) {
        if (!(scaleName in this._transformationWatcher)) {
            this._transformationWatcher[scaleName] = [];
        }
        this._transformationWatcher[scaleName].push(handler);
    }
    redraw(data, scale, selection) {
        this.preUpdate();
        if (this._redraw && this._redraw instanceof Function) {
            this._redraw(data, scale, selection);
        }
        this.postUpdate();
    }
    preUpdate() {
        this._preUpdate && this._preUpdate.call(this, this);
    }
    postUpdate() {
        this._postUpdate && this._postUpdate.call(this, this);
    }
    query(options) {
        return [];
    }
    _use(service, options) {
        service.preAttach(this);
        this._serviceInstances.push(service);
        service.postUse(this);
    }
    use(service, options) {
        if (this._services.includes(service)) {
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
    getSiblingLayer(siblingLayerName) {
        if (!siblingLayers.has(this)) {
            siblingLayers.set(this, { [this._name]: this });
        }
        if (!orderLayers.has(this)) {
            orderLayers.set(this, { [this._name]: 0 });
        }
        const siblings = siblingLayers.get(this);
        if (!(siblingLayerName in siblings)) {
            const layer = Layer.initialize(this._baseName, {
                ...this._userOptions,
                name: siblingLayerName,
            });
            siblings[siblingLayerName] = layer;
            layer.getGraphic() &&
                layer.getGraphic().style &&
                (layer.getGraphic().style.pointerEvents = "none");
            // only receive events by main layer
        }
        if (!(siblingLayerName in orderLayers.get(this))) {
            orderLayers.get(this)[siblingLayerName] = -1;
        }
        return siblings[siblingLayerName];
    }
    setLayersOrder(layerNameOrderKVPairs) {
        if (!siblingLayers.has(this)) {
            siblingLayers.set(this, { [this._name]: this });
        }
        if (!orderLayers.has(this)) {
            orderLayers.set(this, { [this._name]: 0 });
        }
        const orders = orderLayers.get(this);
        Object.entries(layerNameOrderKVPairs).forEach(([layerName, order]) => {
            orders[layerName] = order;
            if (order >= 0) {
                const graphic = this.getSiblingLayer(layerName).getGraphic();
                graphic && graphic.style && (graphic.style.pointerEvents = "auto");
                graphic && graphic.style && (graphic.style.display = "initial");
            }
            else {
                const graphic = this.getSiblingLayer(layerName).getGraphic();
                graphic && graphic.style && (graphic.style.pointerEvents = "none");
                graphic && graphic.style && (graphic.style.display = "none");
            }
            this.getSiblingLayer(layerName)._order = order;
        });
    }
    isInstanceOf(name) {
        return this._baseName === name || this._name === name;
    }
    get services() {
        return helpers.makeFindableList(this._serviceInstances.slice(0), InteractionService, this.use.bind(this));
    }
}
export function register(baseName, options) {
    registeredLayers[baseName] = options;
}
export function unregister(baseName) {
    delete registeredLayers[baseName];
    return true;
}
export function initialize(baseName, options) {
    const mergedOptions = Object.assign({}, registeredLayers[baseName] ?? { constructor: Layer }, options ?? {}, {
        // needs to deep merge object
        transformation: Object.assign({}, (registeredLayers[baseName] ?? {}).transformation ?? {}, options?.transformation ?? {}),
        sharedVar: Object.assign({}, (registeredLayers[baseName] ?? {}).sharedVar ?? {}, options?.sharedVar ?? {}),
    });
    const layer = new mergedOptions.constructor(baseName, mergedOptions);
    return layer;
}
export function findLayer(baseNameOrRealName) {
    return instanceLayers.filter((layer) => layer.isInstanceOf(baseNameOrRealName));
}
Layer.register = register;
Layer.initialize = initialize;
Layer.findLayer = findLayer;

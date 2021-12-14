import { InteractionService, findService } from "../service";
import * as helpers from "../helpers";
import { Command } from "../command";
const registeredLayers = {};
const instanceLayers = [];
const siblingLayers = new Map();
export default class Layer {
    constructor(baseName, options) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        options.preInitialize && options.preInitialize.call(this, this);
        this._baseName = baseName;
        this._userOptions = options;
        this._name = (_a = options.name) !== null && _a !== void 0 ? _a : baseName;
        this._transformation = (_b = options.transformation) !== null && _b !== void 0 ? _b : {};
        this._services = (_c = options.services) !== null && _c !== void 0 ? _c : [];
        this._container = options.container;
        this._sharedVar = (_d = options.sharedVar) !== null && _d !== void 0 ? _d : {};
        this._sharedVarWatcher = {};
        this._transformationWatcher = {};
        this._serviceInstances = [];
        this._redraw = options.redraw;
        this._preInitialize = (_e = options.preInitialize) !== null && _e !== void 0 ? _e : null;
        this._postInitialize = (_f = options.postInitialize) !== null && _f !== void 0 ? _f : null;
        this._preUpdate = (_g = options.preUpdate) !== null && _g !== void 0 ? _g : null;
        this._postUpdate = (_h = options.postUpdate) !== null && _h !== void 0 ? _h : null;
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
        service.preUse(this);
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
        return siblings[siblingLayerName];
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
    var _a, _b, _c, _d, _e, _f, _g;
    const mergedOptions = Object.assign({}, (_a = registeredLayers[baseName]) !== null && _a !== void 0 ? _a : { constructor: Layer }, options !== null && options !== void 0 ? options : {}, {
        // needs to deep merge object
        transformation: Object.assign({}, (_c = ((_b = registeredLayers[baseName]) !== null && _b !== void 0 ? _b : {}).transformation) !== null && _c !== void 0 ? _c : {}, (_d = options === null || options === void 0 ? void 0 : options.transformation) !== null && _d !== void 0 ? _d : {}),
        sharedVar: Object.assign({}, (_f = ((_e = registeredLayers[baseName]) !== null && _e !== void 0 ? _e : {}).sharedVar) !== null && _f !== void 0 ? _f : {}, (_g = options === null || options === void 0 ? void 0 : options.sharedVar) !== null && _g !== void 0 ? _g : {}),
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

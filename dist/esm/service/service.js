const registeredServices = {};
const instanceServices = [];
export default class InteractionService {
    constructor(baseName, options) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        options.preInitialize && options.preInitialize.call(this, this);
        this._baseName = baseName;
        this._userOptions = options;
        this._name = (_a = options.name) !== null && _a !== void 0 ? _a : baseName;
        this._on = (_b = options.on) !== null && _b !== void 0 ? _b : {};
        this._sharedVar = (_c = options.sharedVar) !== null && _c !== void 0 ? _c : {};
        this._layerInstances = [];
        this._preInitialize = (_d = options.preInitialize) !== null && _d !== void 0 ? _d : null;
        this._postInitialize = (_e = options.postInitialize) !== null && _e !== void 0 ? _e : null;
        this._preUpdate = (_f = options.preUpdate) !== null && _f !== void 0 ? _f : null;
        this._postUpdate = (_g = options.postUpdate) !== null && _g !== void 0 ? _g : null;
        this._preUse = (_h = options.preUse) !== null && _h !== void 0 ? _h : null;
        this._postUse = (_j = options.postUse) !== null && _j !== void 0 ? _j : null;
        options.postInitialize && options.postInitialize.call(this, this);
    }
    on(action, command) {
        this._on[action] = command;
    }
    getSharedVar(sharedName, options) {
        if (!(sharedName in this._sharedVar) && "defaultValue" in options) {
            this.setSharedVar(sharedName, options.defaultValue, options);
        }
        return this._sharedVar[sharedName];
    }
    setSharedVar(sharedName, value, options) {
        this.preUpdate();
        this._sharedVar[sharedName] = value;
        if (this._on.update) {
            this._on.update.execute({
                self: this,
                layer: null,
                instrument: null,
                interactor: null,
            });
        }
        if (this._on[`update:${sharedName}`]) {
            this._on[`update:${sharedName}`].execute({
                self: this,
                layer: null,
                instrument: null,
                interactor: null,
            });
        }
        this.postUpdate();
    }
    watchSharedVar(sharedName, handler) {
        this.on(`update:${sharedName}`, handler);
    }
    preUpdate() {
        this._preUpdate && this._preUpdate.call(this, this);
    }
    postUpdate() {
        this._postUpdate && this._postUpdate.call(this, this);
    }
    preUse(layer) {
        this._preUse && this._preUse.call(this, this, layer);
        this._layerInstances.push(layer);
    }
    postUse(layer) {
        this._postUse && this._postUse.call(this, this, layer);
    }
    isInstanceOf(name) {
        return this._baseName === name || this._name === name;
    }
}
export function register(baseName, options) {
    registeredServices[baseName] = options;
}
export function unregister(baseName) {
    delete registeredServices[baseName];
    return true;
}
export function initialize(baseName, options) {
    var _a, _b, _c, _d, _e, _f, _g;
    const mergedOptions = Object.assign({}, (_a = registeredServices[baseName]) !== null && _a !== void 0 ? _a : { constructor: InteractionService }, options, {
        // needs to deep merge object
        on: Object.assign({}, (_c = ((_b = registeredServices[baseName]) !== null && _b !== void 0 ? _b : {}).on) !== null && _c !== void 0 ? _c : {}, (_d = options.on) !== null && _d !== void 0 ? _d : {}),
        sharedVar: Object.assign({}, (_f = ((_e = registeredServices[baseName]) !== null && _e !== void 0 ? _e : {}).sharedVar) !== null && _f !== void 0 ? _f : {}, (_g = options.sharedVar) !== null && _g !== void 0 ? _g : {}),
    });
    const service = new mergedOptions.constructor(baseName, mergedOptions);
    return service;
}
export function findService(baseNameOrRealName) {
    return instanceServices.filter((service) => service.isInstanceOf(baseNameOrRealName));
}
InteractionService.register = register;
InteractionService.initialize = initialize;
InteractionService.findService = findService;

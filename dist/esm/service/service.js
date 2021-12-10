const registeredServices = {};
export const instanceServices = [];
export default class InteractionService {
    constructor(baseName, options) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        options.preInitialize && options.preInitialize.call(this, this);
        this._baseName = baseName;
        this._userOptions = options;
        this._name = (_a = options.name) !== null && _a !== void 0 ? _a : baseName;
        this._on = (_b = options.on) !== null && _b !== void 0 ? _b : {};
        this._sharedVar = {};
        this._layerInstances = [];
        this._preInitialize = (_c = options.preInitialize) !== null && _c !== void 0 ? _c : null;
        this._postInitialize = (_d = options.postInitialize) !== null && _d !== void 0 ? _d : null;
        this._preUpdate = (_e = options.preUpdate) !== null && _e !== void 0 ? _e : null;
        this._postUpdate = (_f = options.postUpdate) !== null && _f !== void 0 ? _f : null;
        this._preUse = (_g = options.preUse) !== null && _g !== void 0 ? _g : null;
        this._postUse = (_h = options.postUse) !== null && _h !== void 0 ? _h : null;
        Object.entries(options.sharedVar || {}).forEach((entry) => {
            this.setSharedVar(entry[0], entry[1]);
        });
        instanceServices.push(this);
        options.postInitialize && options.postInitialize.call(this, this);
    }
    on(action, command) {
        if (!this._on[action]) {
            this._on[action] = [];
        }
        this._on[action].push(command);
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
        this.preUpdate();
        this._sharedVar[sharedName] = value;
        if (this._on.update) {
            this._on.update.forEach((command) => {
                var _a, _b, _c;
                return command.execute({
                    self: this,
                    layer: (_a = options === null || options === void 0 ? void 0 : options.layer) !== null && _a !== void 0 ? _a : null,
                    instrument: (_b = options === null || options === void 0 ? void 0 : options.instrument) !== null && _b !== void 0 ? _b : null,
                    interactor: (_c = options === null || options === void 0 ? void 0 : options.interactor) !== null && _c !== void 0 ? _c : null,
                });
            });
        }
        if (this._on[`update:${sharedName}`]) {
            this._on[`update:${sharedName}`].forEach((command) => {
                var _a, _b, _c;
                return command.execute({
                    self: this,
                    layer: (_a = options === null || options === void 0 ? void 0 : options.layer) !== null && _a !== void 0 ? _a : null,
                    instrument: (_b = options === null || options === void 0 ? void 0 : options.instrument) !== null && _b !== void 0 ? _b : null,
                    interactor: (_c = options === null || options === void 0 ? void 0 : options.interactor) !== null && _c !== void 0 ? _c : null,
                });
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
    static register(baseName, options) {
        registeredServices[baseName] = options;
    }
    static unregister(baseName) {
        delete registeredServices[baseName];
        return true;
    }
    static initialize(baseName, options) {
        var _a, _b, _c, _d, _e, _f, _g;
        const mergedOptions = Object.assign({}, (_a = registeredServices[baseName]) !== null && _a !== void 0 ? _a : { constructor: InteractionService }, options !== null && options !== void 0 ? options : {}, {
            // needs to deep merge object
            on: Object.assign({}, (_c = ((_b = registeredServices[baseName]) !== null && _b !== void 0 ? _b : {}).on) !== null && _c !== void 0 ? _c : {}, (_d = options === null || options === void 0 ? void 0 : options.on) !== null && _d !== void 0 ? _d : {}),
            sharedVar: Object.assign({}, (_f = ((_e = registeredServices[baseName]) !== null && _e !== void 0 ? _e : {}).sharedVar) !== null && _f !== void 0 ? _f : {}, (_g = options === null || options === void 0 ? void 0 : options.sharedVar) !== null && _g !== void 0 ? _g : {}),
        });
        const service = new mergedOptions.constructor(baseName, mergedOptions);
        return service;
    }
    static findService(baseNameOrRealName) {
        return instanceServices.filter((service) => service.isInstanceOf(baseNameOrRealName));
    }
}
export const register = InteractionService.register;
export const unregister = InteractionService.unregister;
export const initialize = InteractionService.initialize;
export const findService = InteractionService.findService;

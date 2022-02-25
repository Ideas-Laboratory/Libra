const registeredTransformers = {};
const instanceTransformers = [];
export default class GraphicalTransformer {
    constructor(baseName, options) {
        this._baseName = baseName;
        this._userOptions = options;
        this._sharedVar = options.sharedVar ?? {};
        this._redraw = options.redraw ?? (() => { });
        this._layer = options.layer;
        this.redraw();
    }
    getSharedVar(name) {
        return this._sharedVar[name];
    }
    setSharedVar(name, value) {
        this._sharedVar[name] = value;
        this.redraw();
    }
    redraw() {
        this._redraw({});
    }
    isInstanceOf(name) {
        return this._baseName === name || this._name === name;
    }
    static register(baseName, options) {
        registeredTransformers[baseName] = options;
    }
    static unregister(baseName) {
        delete registeredTransformers[baseName];
        return true;
    }
    static initialize(baseName, options) {
        const mergedOptions = Object.assign({}, registeredTransformers[baseName] ?? { constructor: GraphicalTransformer }, options ?? {}, {
            sharedVar: Object.assign({}, (registeredTransformers[baseName] ?? {}).sharedVar ?? {}, options?.sharedVar ?? {}),
        });
        const service = new mergedOptions.constructor(baseName, mergedOptions);
        return service;
    }
    static findTransformer(baseNameOrRealName) {
        return instanceTransformers.filter((transformer) => transformer.isInstanceOf(baseNameOrRealName));
    }
}
export const register = GraphicalTransformer.register;
export const unregister = GraphicalTransformer.unregister;
export const initialize = GraphicalTransformer.initialize;
export const findTransformer = GraphicalTransformer.findTransformer;

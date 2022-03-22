import * as helpers from "../helpers";
const registeredTransformers = {};
const instanceTransformers = [];
let transientQueue = [];
const transientCleaner = () => {
    let transientElement;
    while ((transientElement = transientQueue.pop())) {
        try {
            transientElement.remove(); // TODO: other VIS toolkit APIs
        }
        catch (e) {
            // ignore?
        }
    }
    if (!helpers.global.stopTransient) {
        instanceTransformers
            .filter((transformer) => transformer._transient)
            .forEach((transformer) => transformer.redraw());
    }
    requestAnimationFrame(transientCleaner);
};
requestAnimationFrame(transientCleaner);
export default class GraphicalTransformer {
    constructor(baseName, options) {
        this._baseName = baseName;
        this._userOptions = options;
        this._name = options.name ?? this._baseName;
        this._sharedVar = options.sharedVar ?? {};
        this._redraw = options.redraw ?? (() => { });
        this._layer = options.layer;
        this._transient = options.transient ?? false;
        this.redraw();
        instanceTransformers.push(this);
    }
    getSharedVar(name) {
        return this._sharedVar[name];
    }
    setSharedVar(name, value) {
        this._sharedVar[name] = value;
        this.redraw();
    }
    setSharedVars(obj) {
        Object.entries(obj).forEach(([k, v]) => (this._sharedVar[k] = v));
        this.redraw();
    }
    redraw(transient = false) {
        if (!this._layer && !this.getSharedVar("layer"))
            return;
        const layer = this._layer || this.getSharedVar("layer");
        transient = transient || this._transient;
        let preDrawElements = [], postDrawElements = [];
        if (transient) {
            preDrawElements = layer.getVisualElements();
        }
        this._redraw({
            layer,
            transformer: this,
        });
        if (transient) {
            postDrawElements = layer.getVisualElements();
            const topLevelElements = postDrawElements.filter((el) => !postDrawElements.find((e) => e !== el && e.contains(el)));
            const transientElements = topLevelElements.filter((el) => !preDrawElements.includes(el));
            transientQueue = transientQueue.concat(transientElements);
        }
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
        const transformer = new mergedOptions.constructor(baseName, mergedOptions);
        instanceTransformers.push(transformer);
        return transformer;
    }
    static findTransformer(baseNameOrRealName) {
        return instanceTransformers.filter((transformer) => transformer.isInstanceOf(baseNameOrRealName));
    }
}
export const register = GraphicalTransformer.register;
export const unregister = GraphicalTransformer.unregister;
export const initialize = GraphicalTransformer.initialize;
export const findTransformer = GraphicalTransformer.findTransformer;

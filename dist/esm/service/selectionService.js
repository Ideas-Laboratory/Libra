import Service from "./service";
import * as helpers from "../helpers";
import { GraphicalTransformer } from "../transformer";
export default class SelectionService extends Service {
    constructor(baseName, options) {
        super(baseName, {
            ...options,
            resultAlias: options?.resultAlias ?? "selectionResult",
        });
        this._currentDimension = [];
        this._transformers.push(GraphicalTransformer.initialize("SelectionTransformer", {
            transient: true,
            sharedVar: {
                [this._resultAlias]: [],
                layer: null,
                highlightColor: options?.sharedVar?.highlightColor,
                highlightAttrValues: options?.sharedVar?.highlightAttrValues,
            },
        }));
        this._selectionMapping = new Map();
        Object.entries({
            ...(this._userOptions?.query?.attrName
                ? typeof this._userOptions.query.attrName === "string"
                    ? {
                        [this._userOptions.query.attrName]: this._userOptions?.query?.extent ?? [],
                    }
                    : Object.fromEntries(this._userOptions.query.attrName.map((attr, i) => [
                        attr,
                        this._userOptions?.query?.extent?.[i] ?? [],
                    ]))
                : {}),
            ...(this._sharedVar?.attrName
                ? typeof this._sharedVar.attrName === "string"
                    ? {
                        [this._sharedVar.attrName]: this._sharedVar?.extent ?? [],
                    }
                    : Object.fromEntries(this._sharedVar.attrName.map((attr, i) => [
                        attr,
                        this._sharedVar?.extent?.[i] ?? [],
                    ]))
                : {}),
        })
            .filter(([_, v]) => v instanceof Array)
            .forEach(([key, value]) => this._selectionMapping.set(key, value));
    }
    async setSharedVar(sharedName, value, options) {
        if (options &&
            options.layer &&
            this._layerInstances.length !== 0 &&
            !this._layerInstances.includes(options.layer)) {
            return;
        }
        this.preUpdate();
        this._sharedVar[sharedName] = value;
        if ((options?.layer || this._layerInstances.length == 1) &&
            this._userOptions.query) {
            const layer = options?.layer || this._layerInstances[0];
            if (this._nextTick) {
                return;
            }
            this._nextTick = requestAnimationFrame(async () => {
                this._evaluate(layer);
            });
        }
        else {
            this.postUpdate();
        }
    }
    _evaluate(layer) {
        if (!layer)
            return;
        this._oldResult = this._result;
        this._result = layer.picking({
            ...this._userOptions.query,
            ...this._sharedVar,
        });
        const selectionLayer = layer
            .getLayerFromQueue("selectionLayer")
            .getGraphic();
        while (selectionLayer.firstChild) {
            selectionLayer.removeChild(selectionLayer.lastChild);
        }
        if (this._sharedVar.deepClone) {
            let resultNodes = [];
            let refNodes = [];
            this._result.forEach((node) => {
                if (node !== layer.getGraphic()) {
                    let k = refNodes.length;
                    for (let i = 0; i < k; i++) {
                        const refNode = refNodes[i];
                        const resultNode = resultNodes[i];
                        if (node.contains(refNode)) {
                            refNodes.splice(i, 1);
                            resultNodes.splice(i, 1);
                            resultNode.remove();
                            i--;
                            k--;
                        }
                    }
                    resultNodes.push(layer.cloneVisualElements(node, true));
                    refNodes.push(node);
                }
            });
            this._services.forEach((service) => {
                service.setSharedVar(this._resultAlias, resultNodes);
            });
            this._transformers.forEach((transformer) => {
                transformer.setSharedVars({
                    layer: layer.getLayerFromQueue("selectionLayer"),
                    [this._resultAlias]: resultNodes,
                });
            });
        }
        else {
            this._services.forEach((service) => {
                service.setSharedVar(this._resultAlias, this._result.map((node) => layer.cloneVisualElements(node, false)));
            });
            this._transformers.forEach((transformer) => {
                transformer.setSharedVars({
                    layer: layer.getLayerFromQueue("selectionLayer"),
                    [this._resultAlias]: this._result.map((node) => layer.cloneVisualElements(node, false)),
                });
            });
        }
        this._nextTick = 0;
        this.postUpdate();
    }
    isInstanceOf(name) {
        return ("SelectionService" === name ||
            this._baseName === name ||
            this._name === name);
    }
    /** Cross filter */
    dimension(dimension, formatter) {
        let dimArr = [];
        let fmtArr = [];
        if (typeof dimension === "string") {
            dimArr = [dimension];
            fmtArr = [formatter ?? ((d) => d)];
        }
        else {
            dimArr = helpers.deepClone(dimension);
            fmtArr =
                formatter ?? dimArr.map(() => (d) => d);
        }
        const zipArr = dimArr.map((d, i) => [d, fmtArr[i]]);
        this._currentDimension = zipArr;
        return new Proxy(this, {
            get(target, p) {
                if (p === "dimension") {
                    return target.dimension.bind(target);
                }
                else if (p === "_currentDimension") {
                    return zipArr;
                }
                else {
                    return target[p];
                }
            },
            set(target, p, value) {
                target[p] = value;
                return true;
            },
        });
    }
    filter(extent, options) {
        if (options &&
            options.layer &&
            this._layerInstances.length !== 0 &&
            !this._layerInstances.includes(options.layer)) {
            return this;
        }
        const layer = options?.layer || this._layerInstances[0];
        if (this._currentDimension.length === 0 &&
            extent instanceof Array &&
            extent.length > 0) {
            if (this._sharedVar.attrName) {
                this._userOptions.query.attrName = this._sharedVar.attrName;
            }
            if (this._userOptions.query.attrName) {
                this.dimension(this._userOptions.query.attrName).filter(extent);
            }
        }
        else if (this._currentDimension.length === 1 &&
            extent instanceof Array &&
            extent.length > 0 &&
            !(extent[0] instanceof Array)) {
            this._selectionMapping.set(this._currentDimension[0][0], this._currentDimension[0][1](extent)
                .sort((a, b) => typeof a === "number" ? a - b : a < b ? -1 : a == b ? 0 : 1));
            this._sharedVar.attrName = [...this._selectionMapping.keys()];
            this._sharedVar.extent = [...this._selectionMapping.values()];
            this._evaluate(layer);
            this._services.forEach((service) => {
                service.setSharedVar("extents", this.extents);
            });
            this._transformers.forEach((transformer) => {
                transformer.setSharedVar("extents", this.extents);
            });
        }
        else if (this._currentDimension.length === extent.length &&
            extent.every((ex) => ex instanceof Array)) {
            this._currentDimension.forEach((dim, i) => {
                this._selectionMapping.set(dim[0], dim[1](extent[i]).sort((a, b) => typeof a === "number" ? a - b : a < b ? -1 : a == b ? 0 : 1));
            });
            this._sharedVar.attrName = [...this._selectionMapping.keys()];
            this._sharedVar.extent = [...this._selectionMapping.values()];
            this._evaluate(layer);
            this._services.forEach((service) => {
                service.setSharedVar("extents", this.extents);
            });
            this._transformers.forEach((transformer) => {
                transformer.setSharedVar("extents", this.extents);
            });
        }
        return this;
    }
    get extents() {
        return Object.fromEntries(this._selectionMapping.entries());
    }
}
Service.SelectionService = SelectionService;
Service.register("SelectionService", {
    constructor: SelectionService,
});
Service.register("SurfacePointSelectionService", {
    constructor: SelectionService,
    query: {
        baseOn: helpers.QueryType.Shape,
        type: helpers.ShapeQueryType.SurfacePoint,
        x: 0,
        y: 0,
    },
});
Service.register("PointSelectionService", {
    constructor: SelectionService,
    query: {
        baseOn: helpers.QueryType.Shape,
        type: helpers.ShapeQueryType.Point,
        x: 0,
        y: 0,
    },
});
Service.register("RectSelectionService", {
    constructor: SelectionService,
    query: {
        baseOn: helpers.QueryType.Shape,
        type: helpers.ShapeQueryType.Rect,
        x: 0,
        y: 0,
        width: 1,
        height: 1,
    },
});
Service.register("CircleSelectionService", {
    constructor: SelectionService,
    query: {
        baseOn: helpers.QueryType.Shape,
        type: helpers.ShapeQueryType.Circle,
        x: 0,
        y: 0,
        r: 1,
    },
});
Service.register("PolygonSelectionService", {
    constructor: SelectionService,
    query: {
        baseOn: helpers.QueryType.Shape,
        type: helpers.ShapeQueryType.Polygon,
        points: [],
    },
});
Service.register("QuantitativeSelectionService", {
    constructor: SelectionService,
    query: {
        baseOn: helpers.QueryType.Data,
        type: helpers.DataQueryType.Quantitative,
        attrName: "",
        extent: [0, 0],
    },
});

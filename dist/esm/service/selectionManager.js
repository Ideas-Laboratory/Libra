import InteractionService from "./service";
import * as helpers from "../helpers";
import * as d3 from "d3";
export default class SelectionManager extends InteractionService {
    constructor() {
        super(...arguments);
        this._oldResult = [];
        this._result = [];
        this._nextTick = 0;
    }
    setSharedVar(sharedName, value, options) {
        this.preUpdate();
        this._sharedVar[sharedName] = value;
        if (((options === null || options === void 0 ? void 0 : options.layer) || this._layerInstances.length == 1) &&
            this._userOptions.query) {
            const layer = (options === null || options === void 0 ? void 0 : options.layer) || this._layerInstances[0];
            if (this._nextTick) {
                cancelAnimationFrame(this._nextTick);
            }
            this._nextTick = requestAnimationFrame(() => {
                this._oldResult = this._result;
                this._result = layer.query({
                    ...this._userOptions.query,
                    ...this._sharedVar,
                });
                const selectionLayer = layer
                    .getSiblingLayer("selectionLayer")
                    .getGraphic();
                while (selectionLayer.firstChild) {
                    selectionLayer.removeChild(selectionLayer.lastChild);
                }
                this._result.forEach((node) => selectionLayer.appendChild(d3.select(node).clone(false).node()));
                this._nextTick = 0;
                if (this._on.update) {
                    this._on.update.forEach((command) => {
                        var _a, _b, _c;
                        return command.execute({
                            self: this,
                            layer: (_a = options === null || options === void 0 ? void 0 : options.layer) !== null && _a !== void 0 ? _a : (this._layerInstances.length == 1
                                ? this._layerInstances[0]
                                : null),
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
                            layer: (_a = options === null || options === void 0 ? void 0 : options.layer) !== null && _a !== void 0 ? _a : (this._layerInstances.length == 1
                                ? this._layerInstances[0]
                                : null),
                            instrument: (_b = options === null || options === void 0 ? void 0 : options.instrument) !== null && _b !== void 0 ? _b : null,
                            interactor: (_c = options === null || options === void 0 ? void 0 : options.interactor) !== null && _c !== void 0 ? _c : null,
                        });
                    });
                }
                this.postUpdate();
            });
        }
        else {
            if (this._on.update) {
                this._on.update.forEach((command) => {
                    var _a, _b, _c;
                    return command.execute({
                        self: this,
                        layer: (_a = options === null || options === void 0 ? void 0 : options.layer) !== null && _a !== void 0 ? _a : (this._layerInstances.length == 1
                            ? this._layerInstances[0]
                            : null),
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
                        layer: (_a = options === null || options === void 0 ? void 0 : options.layer) !== null && _a !== void 0 ? _a : (this._layerInstances.length == 1
                            ? this._layerInstances[0]
                            : null),
                        instrument: (_b = options === null || options === void 0 ? void 0 : options.instrument) !== null && _b !== void 0 ? _b : null,
                        interactor: (_c = options === null || options === void 0 ? void 0 : options.interactor) !== null && _c !== void 0 ? _c : null,
                    });
                });
            }
            this.postUpdate();
        }
    }
    isInstanceOf(name) {
        return ("SelectionManager" === name ||
            this._baseName === name ||
            this._name === name);
    }
    get results() {
        return this._result;
    }
    get oldResults() {
        return this._oldResult;
    }
}
InteractionService.register("SelectionManager", {
    constructor: SelectionManager,
});
InteractionService.register("SurfacePointSelectionManager", {
    constructor: SelectionManager,
    query: {
        baseOn: helpers.QueryType.Shape,
        type: helpers.ShapeQueryType.SurfacePoint,
        x: 0,
        y: 0,
    },
});
InteractionService.register("PointSelectionManager", {
    constructor: SelectionManager,
    query: {
        baseOn: helpers.QueryType.Shape,
        type: helpers.ShapeQueryType.Point,
        x: 0,
        y: 0,
    },
});
InteractionService.register("RectSelectionManager", {
    constructor: SelectionManager,
    query: {
        baseOn: helpers.QueryType.Shape,
        type: helpers.ShapeQueryType.Rect,
        x: 0,
        y: 0,
        width: 1,
        height: 1,
    },
});
InteractionService.register("CircleSelectionManager", {
    constructor: SelectionManager,
    query: {
        baseOn: helpers.QueryType.Shape,
        type: helpers.ShapeQueryType.Circle,
        x: 0,
        y: 0,
        r: 1,
    },
});
InteractionService.register("PolygonSelectionManager", {
    constructor: SelectionManager,
    query: {
        baseOn: helpers.QueryType.Shape,
        type: helpers.ShapeQueryType.Polygon,
        points: [],
    },
});

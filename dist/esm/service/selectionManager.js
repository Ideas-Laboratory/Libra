import InteractionService from "./service";
import * as helpers from "../helpers";
export default class SelectionManager extends InteractionService {
    constructor() {
        super(...arguments);
        this._oldResult = [];
        this._result = [];
    }
    setSharedVar(sharedName, value, options) {
        var _a, _b, _c, _d, _e, _f;
        this.preUpdate();
        this._sharedVar[sharedName] = value;
        if (this._on.update) {
            this._on.update.execute({
                self: this,
                layer: (_a = options === null || options === void 0 ? void 0 : options.layer) !== null && _a !== void 0 ? _a : (this._layerInstances.length == 1 ? this._layerInstances[0] : null),
                instrument: (_b = options === null || options === void 0 ? void 0 : options.instrument) !== null && _b !== void 0 ? _b : null,
                interactor: (_c = options === null || options === void 0 ? void 0 : options.interactor) !== null && _c !== void 0 ? _c : null,
            });
        }
        if (this._on[`update:${sharedName}`]) {
            this._on[`update:${sharedName}`].execute({
                self: this,
                layer: (_d = options === null || options === void 0 ? void 0 : options.layer) !== null && _d !== void 0 ? _d : (this._layerInstances.length == 1 ? this._layerInstances[0] : null),
                instrument: (_e = options === null || options === void 0 ? void 0 : options.instrument) !== null && _e !== void 0 ? _e : null,
                interactor: (_f = options === null || options === void 0 ? void 0 : options.interactor) !== null && _f !== void 0 ? _f : null,
            });
        }
        if (((options === null || options === void 0 ? void 0 : options.layer) || this._layerInstances.length == 1) &&
            this._userOptions.query) {
            this._oldResult = this._result;
            this._result = ((options === null || options === void 0 ? void 0 : options.layer) || this._layerInstances[0]).query({
                ...this._userOptions.query,
                ...this._sharedVar,
            });
        }
        this.postUpdate();
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

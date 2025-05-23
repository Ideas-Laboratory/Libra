import InteractionService from "./service";
import * as helpers from "../helpers";
export default class SelectionManager extends InteractionService {
    constructor() {
        super(...arguments);
        this._oldResult = [];
        this._result = [];
        this._nextTick = 0;
    }
    async setSharedVar(sharedName, value, options) {
        if (options &&
            options.layer &&
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
                            resultNodes.push(layer.cloneVisualElements(node, this._sharedVar.deepClone));
                            refNodes.push(node);
                        }
                    });
                    resultNodes.forEach((resultNode) => selectionLayer.appendChild(resultNode));
                }
                else {
                    this._result.forEach((node) => selectionLayer.appendChild(layer.cloneVisualElements(node)));
                }
                this._nextTick = 0;
                // if (this._on.update) {
                //   for (let command of this._on.update) {
                //     if (command instanceof Function) {
                //       await command({
                //         self: this,
                //         layer:
                //           options?.layer ??
                //           (this._layerInstances.length == 1
                //             ? this._layerInstances[0]
                //             : null),
                //         instrument: options?.instrument ?? null,
                //         interactor: options?.interactor ?? null,
                //       });
                //     } else {
                //       await command.execute({
                //         self: this,
                //         layer:
                //           options?.layer ??
                //           (this._layerInstances.length == 1
                //             ? this._layerInstances[0]
                //             : null),
                //         instrument: options?.instrument ?? null,
                //         interactor: options?.interactor ?? null,
                //       });
                //     }
                //   }
                // }
                // if (this._on[`update:${sharedName}`]) {
                //   for (let command of this._on[`update:${sharedName}`]) {
                //     if (command instanceof Function) {
                //       await command({
                //         self: this,
                //         layer:
                //           options?.layer ??
                //           (this._layerInstances.length == 1
                //             ? this._layerInstances[0]
                //             : null),
                //         instrument: options?.instrument ?? null,
                //         interactor: options?.interactor ?? null,
                //       });
                //     } else {
                //       await command.execute({
                //         self: this,
                //         layer:
                //           options?.layer ??
                //           (this._layerInstances.length == 1
                //             ? this._layerInstances[0]
                //             : null),
                //         instrument: options?.instrument ?? null,
                //         interactor: options?.interactor ?? null,
                //       });
                //     }
                //   }
                // }
                this.postUpdate();
            });
        }
        else {
            // if (this._on.update) {
            //   for (let command of this._on.update) {
            //     if (command instanceof Function) {
            //       await command({
            //         self: this,
            //         layer:
            //           options?.layer ??
            //           (this._layerInstances.length == 1
            //             ? this._layerInstances[0]
            //             : null),
            //         instrument: options?.instrument ?? null,
            //         interactor: options?.interactor ?? null,
            //       });
            //     } else {
            //       await command.execute({
            //         self: this,
            //         layer:
            //           options?.layer ??
            //           (this._layerInstances.length == 1
            //             ? this._layerInstances[0]
            //             : null),
            //         instrument: options?.instrument ?? null,
            //         interactor: options?.interactor ?? null,
            //       });
            //     }
            //   }
            // }
            // if (this._on[`update:${sharedName}`]) {
            //   for (let command of this._on[`update:${sharedName}`]) {
            //     if (command instanceof Function) {
            //       await command({
            //         self: this,
            //         layer:
            //           options?.layer ??
            //           (this._layerInstances.length == 1
            //             ? this._layerInstances[0]
            //             : null),
            //         instrument: options?.instrument ?? null,
            //         interactor: options?.interactor ?? null,
            //       });
            //     } else {
            //       await command.execute({
            //         self: this,
            //         layer:
            //           options?.layer ??
            //           (this._layerInstances.length == 1
            //             ? this._layerInstances[0]
            //             : null),
            //         instrument: options?.instrument ?? null,
            //         interactor: options?.interactor ?? null,
            //       });
            //     }
            //   }
            // }
            this.postUpdate();
        }
    }
    isInstanceOf(name) {
        return ("SelectionManager" === name ||
            this._baseName === name ||
            this._name === name);
    }
    get results() {
        if (this._nextTick) {
            return new Promise((res) => {
                window.requestAnimationFrame(() => {
                    res(this._result);
                });
            });
        }
        return this._result;
    }
    get oldResults() {
        if (this._nextTick) {
            return new Promise((res) => {
                window.requestAnimationFrame(() => {
                    res(this._oldResult);
                });
            });
        }
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

import InteractionService from "./service";
import * as helpers from "../helpers";
import { GraphicalTransformer } from "../transformer";
export default class SelectionService extends InteractionService {
    constructor(baseName, options) {
        super(baseName, options);
        this._oldResult = [];
        this._result = [];
        this._nextTick = 0;
        this._transformers = [];
        this._transformers.push(GraphicalTransformer.initialize("SelectionTransformer", {
            transient: true,
            sharedVar: {
                selectionResult: [],
                layer: null,
            },
        }));
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
                            resultNodes.push(layer.cloneVisualElements(node, this._sharedVar.deepClone));
                            refNodes.push(node);
                        }
                    });
                    this._transformers.forEach((transformer) => {
                        transformer.setSharedVars({
                            layer: layer.getLayerFromQueue("selectionLayer"),
                            selectionResult: resultNodes,
                        });
                    });
                }
                else {
                    this._transformers.forEach((transformer) => {
                        transformer.setSharedVars({
                            layer: layer.getLayerFromQueue("selectionLayer"),
                            selectionResult: this._result.map((node) => layer.cloneVisualElements(node)),
                        });
                    });
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
        return ("SelectionService" === name ||
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
InteractionService.SelectionService = SelectionService;
InteractionService.register("SelectionService", {
    constructor: SelectionService,
});
InteractionService.register("SurfacePointSelectionService", {
    constructor: SelectionService,
    query: {
        baseOn: helpers.QueryType.Shape,
        type: helpers.ShapeQueryType.SurfacePoint,
        x: 0,
        y: 0,
    },
});
InteractionService.register("PointSelectionService", {
    constructor: SelectionService,
    query: {
        baseOn: helpers.QueryType.Shape,
        type: helpers.ShapeQueryType.Point,
        x: 0,
        y: 0,
    },
});
InteractionService.register("RectSelectionService", {
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
InteractionService.register("CircleSelectionService", {
    constructor: SelectionService,
    query: {
        baseOn: helpers.QueryType.Shape,
        type: helpers.ShapeQueryType.Circle,
        x: 0,
        y: 0,
        r: 1,
    },
});
InteractionService.register("PolygonSelectionService", {
    constructor: SelectionService,
    query: {
        baseOn: helpers.QueryType.Shape,
        type: helpers.ShapeQueryType.Polygon,
        points: [],
    },
});
InteractionService.register("QuantitativeSelectionService", {
    constructor: SelectionService,
    query: {
        baseOn: helpers.QueryType.Data,
        type: helpers.DataQueryType.Quantitative,
        attrName: "",
        extent: [0, 0],
    },
});
InteractionService.register("Quantitative2DSelectionService", {
    constructor: SelectionService,
    query: {
        baseOn: helpers.QueryType.Data,
        type: helpers.DataQueryType.Quantitative2D,
        attrNameX: "",
        attrNameY: "",
        extentX: [0, 0],
        extentY: [0, 0],
    },
});

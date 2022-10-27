import Service from "./service";
import * as helpers from "../helpers";
import * as d3 from "d3";
import { GraphicalTransformer } from "../transformer";

export default class SelectionService extends Service {
  _oldResult: any = [];
  _result: any = [];
  // _nextTick: number = 0;
  _transformers: GraphicalTransformer[] = [];
  _currentDimension = [];

  constructor(baseName: string, options: any) {
    super(baseName, options);
    this._transformers.push(
      GraphicalTransformer.initialize("SelectionTransformer", {
        transient: true,
        sharedVar: {
          [this._resultAlias || "selectionResult"]: [],
          layer: null,
          highlightColor: options?.sharedVar?.highlightColor,
          highlightAttrValues: options?.sharedVar?.highlightAttrValues,
        },
      })
    );
  }

  async setSharedVar(sharedName: string, value: any, options?: any) {
    if (
      options &&
      options.layer &&
      this._layerInstances.length !== 0 &&
      !this._layerInstances.includes(options.layer)
    ) {
      return;
    }
    this.preUpdate();
    this._sharedVar[sharedName] = value;
    if (
      (options?.layer || this._layerInstances.length == 1) &&
      this._userOptions.query
    ) {
      const layer = options?.layer || this._layerInstances[0];
      // if (this._nextTick) {
      //   return;
      // }
      // this._nextTick = requestAnimationFrame(async () => {
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
        let resultNodes: Element[] = [];
        let refNodes: Element[] = [];
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
          service.setSharedVar(
            this._resultAlias || "selectionResult",
            resultNodes
          );
        });
        this._transformers.forEach((transformer) => {
          transformer.setSharedVars({
            layer: layer.getLayerFromQueue("selectionLayer"),
            [this._resultAlias || "selectionResult"]: resultNodes,
          });
        });
      } else {
        this._services.forEach((service) => {
          service.setSharedVar(
            this._resultAlias || "selectionResult",
            this._result.map((node) => layer.cloneVisualElements(node, false))
          );
        });
        this._transformers.forEach((transformer) => {
          transformer.setSharedVars({
            layer: layer.getLayerFromQueue("selectionLayer"),
            [this._resultAlias || "selectionResult"]: this._result.map((node) =>
              layer.cloneVisualElements(node, false)
            ),
          });
        });
      }

      // this._nextTick = 0;
      this.postUpdate();
      // });
    } else {
      this.postUpdate();
    }
  }

  isInstanceOf(name: string): boolean {
    return (
      "SelectionService" === name ||
      this._baseName === name ||
      this._name === name
    );
  }

  /** Cross filter */
  dimension() {}

  filter() {}

  async join() {
    const result = await this.results;
    if (this._joinServices && this._joinServices.length) {
      await Promise.all(
        this._joinServices.map(async (s) => {
          await s.setSharedVar(this._resultAlias || "selectionResult", result);
          return (s as any).results;
        })
      );
    } else {
      await Promise.all(
        this._services.map(async (s) => {
          await s.setSharedVar(this._resultAlias || "selectionResult", result);
          return (s as any).results;
        })
      );
    }
    if (this._joinTransformers && this._joinTransformers.length) {
      await Promise.all(
        this._joinTransformers.map((t) =>
          t.setSharedVar(this._resultAlias || "selectionResult", result)
        )
      );
    } else {
      await Promise.all(
        this._transformers.map((t) =>
          t.setSharedVar(this._resultAlias || "selectionResult", result)
        )
      );
    }
  }
}

(Service as any).SelectionService = SelectionService;

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

Service.register("Quantitative2DSelectionService", {
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

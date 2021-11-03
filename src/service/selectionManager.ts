import InteractionService from "./service";
import * as helpers from "../helpers";

export default class SelectionManager extends InteractionService {
  _oldResult: any = [];
  _result: any = [];

  setSharedVar(sharedName: string, value: any, options?: any) {
    this.preUpdate();
    this._sharedVar[sharedName] = value;
    if (
      (options?.layer || this._layerInstances.length == 1) &&
      this._userOptions.query
    ) {
      const layer = options?.layer || this._layerInstances[0];
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
      this._result.forEach((node) =>
        selectionLayer.appendChild(node.cloneNode(false))
      );
    }
    if (this._on.update) {
      this._on.update.forEach((command) =>
        command.execute({
          self: this,
          layer:
            options?.layer ??
            (this._layerInstances.length == 1 ? this._layerInstances[0] : null),
          instrument: options?.instrument ?? null,
          interactor: options?.interactor ?? null,
        })
      );
    }
    if (this._on[`update:${sharedName}`]) {
      this._on[`update:${sharedName}`].forEach((command) =>
        command.execute({
          self: this,
          layer:
            options?.layer ??
            (this._layerInstances.length == 1 ? this._layerInstances[0] : null),
          instrument: options?.instrument ?? null,
          interactor: options?.interactor ?? null,
        })
      );
    }

    this.postUpdate();
  }

  isInstanceOf(name: string): boolean {
    return (
      "SelectionManager" === name ||
      this._baseName === name ||
      this._name === name
    );
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

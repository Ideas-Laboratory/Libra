import InteractionService from "./service";
import * as helpers from "../helpers";

export default class SelectionManager extends InteractionService {
  _oldResult: any = [];
  _result: any = [];

  setSharedVar(sharedName: string, value: any, options?: any) {
    this.preUpdate();
    this._sharedVar[sharedName] = value;
    if (this._on.update) {
      this._on.update.execute({
        self: this,
        layer:
          options?.layer ??
          (this._layerInstances.length == 1 ? this._layerInstances[0] : null),
        instrument: options?.instrument ?? null,
        interactor: options?.interactor ?? null,
      });
    }
    if (this._on[`update:${sharedName}`]) {
      this._on[`update:${sharedName}`].execute({
        self: this,
        layer:
          options?.layer ??
          (this._layerInstances.length == 1 ? this._layerInstances[0] : null),
        instrument: options?.instrument ?? null,
        interactor: options?.interactor ?? null,
      });
    }
    if (
      (options?.layer || this._layerInstances.length == 1) &&
      this._userOptions.query
    ) {
      this._oldResult = this._result;
      this._result = (options?.layer || this._layerInstances[0]).query({
        ...this._userOptions.query,
        ...this._sharedVar,
      });
    }
    this.postUpdate();
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
  },
});

import { makeComposableSelectionManager } from "../helpers";
import SelectionManager from "./index";

export default class UnionSelectionManager extends SelectionManager {
  selectionManagers = [];

  constructor(name = "UnionSelectionManager") {
    super(name);

    return makeComposableSelectionManager(this);
  }

  evaluate() {
    const result = [];
    this.selectionManagers.forEach((selectionManager) => {
      selectionManager.result.forEach((x) => {
        if (!result.includes(x)) {
          result.push(x);
        }
      });
    });
    this._result = result;
  }
}

SelectionManager.register("UnionSelectionManager", {
  constructor: UnionSelectionManager,
});

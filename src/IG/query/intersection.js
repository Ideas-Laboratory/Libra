import { makeComposableSelectionManager } from "../helpers";
import SelectionManager from "./index";

export default class IntersectionSelectionManager extends SelectionManager {
  selectionManagers = [];

  constructor(name = "IntersectionSelectionManager") {
    super(name);

    return makeComposableSelectionManager(this);
  }

  evaluate() {
    let result = null;
    this.selectionManagers.forEach((selectionManager) => {
      if (!result) result = selectionManager.result;
      else result = selectionManager.result.filter((x) => result.includes(x));
    });
    this._result = result;
  }
}

SelectionManager.register("IntersectionSelectionManager", {
  constructor: IntersectionSelectionManager,
});

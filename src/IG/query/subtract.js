import { makeComposableSelectionManager } from "../helpers";
import SelectionManager from "./index";

export default class SubtractSelectionManager extends SelectionManager {
  selectionManagers = [];

  constructor(name = "SubtractSelectionManager") {
    super(name);

    return makeComposableSelectionManager(this);
  }

  evaluate() {
    let result = null;
    this.selectionManagers.forEach((selectionManager) => {
      if (!result) result = selectionManager.result;
      else result = result.filter((x) => !selectionManager.result.includes(x));
    });
    this._result = result;
  }
}

SelectionManager.register("SubtractSelectionManager", {
  constructor: SubtractSelectionManager,
});

import SelectionManager from "./index";

export default class NothingSelectionManager extends SelectionManager {
  evaluate() {}
}

SelectionManager.register("NothingSelectionManager", {
  constructor: NothingSelectionManager,
});

import SelectionManager from "./index";

export default class DataSelectionManager extends SelectionManager {
  field = null;
  min = -Infinity;
  max = Infinity;

  evaluate() {
    if (!this.field) {
      return (this._result = []);
    }
    let result = [];
    this._layers.forEach((layer) => {
      result = result.concat(
        layer.find(
          (datum) =>
            datum &&
            datum[this.field] >= this.min &&
            datum[this.field] <= this.max
        )
      );
    });
    this._result = [...new Set(result)];
  }
}

SelectionManager.register("DataSelectionManager", {
  constructor: DataSelectionManager,
});

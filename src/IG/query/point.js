import SelectionManager from "./index";

export default class PointSelectionManager extends SelectionManager {
  x = 0;
  y = 0;

  evaluate() {
    let result = [];
    this._layers.forEach((layer) => {
      result = result.concat(
        layer.pick({
          type: "point",
          x: this.x,
          y: this.y,
        })
      );
    });
    this._result = [...new Set(result)];
  }
}

SelectionManager.register("PointSelectionManager", {
  constructor: PointSelectionManager,
});

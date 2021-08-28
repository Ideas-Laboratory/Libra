import SelectionManager from "./index";

export default class PointSelectionManager extends SelectionManager {
  x = 0;
  y = 0;

  evaluate() {
    let result = [];
    this._layers.forEach((layer) => {
      const rootBBox = layer.getRootGraphic().getBoundingClientRect();
      const selfBBox = layer.getGraphic().getBoundingClientRect();
      result = result.concat(
        layer.pick({
          type: "point",
          x: this.x + selfBBox.left - rootBBox.left,
          y: this.y + selfBBox.top - rootBBox.top,
        })
      );
    });
    this._result = [...new Set(result)];
  }
}

SelectionManager.register("PointSelectionManager", {
  constructor: PointSelectionManager,
});

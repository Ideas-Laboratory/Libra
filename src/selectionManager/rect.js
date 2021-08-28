import SelectionManager from "./index";

export default class RectSelectionManager extends SelectionManager {
  x = 0;
  y = 0;
  width = 0;
  height = 0;

  evaluate() {
    let result = [];
    this._layers.forEach((layer) => {
      const rootBBox = layer.getRootGraphic().getBoundingClientRect();
      const selfBBox = layer.getGraphic().getBoundingClientRect();
      result = result.concat(
        layer.pick({
          type: "rect",
          x:
            (this.width < 0 ? this.x + this.width : this.x) +
            selfBBox.left -
            rootBBox.left,
          y:
            (this.height < 0 ? this.y + this.height : this.y) +
            selfBBox.top -
            rootBBox.top,
          width: Math.abs(this.width),
          height: Math.abs(this.height),
        })
      );
    });
    this._result = [...new Set(result)];
  }
}

SelectionManager.register("RectSelectionManager", {
  constructor: RectSelectionManager,
});

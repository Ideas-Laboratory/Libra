import SelectionManager from "./index";

export default class CircleSelectionManager extends SelectionManager {
  cx = 0;
  cy = 0;
  r = 0;

  evaluate() {
    if (
      !this._layers[0] ||
      !this._layers[0].objects ||
      !(this._layers[0].objects instanceof Function)
    )
      return;
    const objects = this._layers[0].objects();
    let root = this._layers[0]._root;
    let bbox = { left: 0, top: 0 };
    if (root) {
      root = root.node ? root.node() : root;
      if (root.getBoundingClientRect) {
        bbox = root.getBoundingClientRect();
      }
    }
    const result = new Set();
    let x1 = this.cx - this.r;
    let y1 = this.cy - this.r;
    let x2 = this.cx + this.r;
    let y2 = this.cy + this.r;
    for (let i = x1; i < x2; i++) {
      for (let j = y1; j < y2; j++) {
        if (result.size === objects.length) {
          break;
        }
        if (
          Math.sqrt(
            Math.pow(i - this.cx, 2) + Math.sqrt(Math.pow(j - this.cy, 2))
          ) > this.r
        )
          continue;
        let elements = document.elementsFromPoint(i + bbox.left, j + bbox.top);
        [...objects].forEach((obj) => {
          if (
            obj.node ? elements.includes(obj.node()) : elements.includes(obj)
          ) {
            result.add(obj);
          }
        });
      }
    }
    this._result = [...result];
  }
}

SelectionManager.register("CircleSelectionManager", {
  constructor: CircleSelectionManager,
});

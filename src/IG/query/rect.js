import Selector from "./index";

export default class RectSelector extends Selector {
  x = 0;
  y = 0;
  width = 0;
  height = 0;

  evaluate() {
    if (
      !this._layer ||
      !this._layer.objects ||
      !(this._layer.objects instanceof Function)
    )
      return;
    const objects = this._layer.objects();
    let root = this._layer._root;
    let bbox = { left: 0, top: 0 };
    if (root) {
      root = root.node ? root.node() : root;
      if (root.getBoundingClientRect) {
        bbox = root.getBoundingClientRect();
      }
    }
    const result = new Set();
    let x = this.width < 0 ? this.x - this.width : this.x;
    let y = this.height < 0 ? this.y - this.height : this.y;
    let width = Math.abs(this.width);
    let height = Math.abs(this.height);
    for (let i = x; i < x + width; i++) {
      for (let j = y; j < y + height; j++) {
        if (result.size === objects.length) {
          break;
        }
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

Selector.register("RectSelector", { constructor: RectSelector });

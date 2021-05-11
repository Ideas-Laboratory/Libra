import Query from "./index";

export default class CircleQuery extends Query {
  cx = 0;
  cy = 0;
  r = 0;

  update() {
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

Query.register("CircleQuery", { constructor: CircleQuery });

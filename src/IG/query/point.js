import Query from "./index";

export default class PointQuery extends Query {
  x = 0;
  y = 0;

  update() {
    if (
      !this._layer ||
      !this._layer.objects ||
      !(this._layer.objects instanceof Function)
    )
      return;
    const objects = [...this._layer.objects()];
    let root = this._layer._root;
    let bbox = { left: 0, top: 0 };
    if (root) {
      root = root.node ? root.node() : root;
      if (root.getBoundingClientRect) {
        bbox = root.getBoundingClientRect();
      }
    }
    let elements = document.elementsFromPoint(
      this.x + bbox.left,
      this.y + bbox.top
    );
    this._result = objects.filter((obj) =>
      obj.node ? elements.includes(obj.node()) : elements.includes(obj)
    );
  }
}

Query.register("PointQuery", { constructor: PointQuery });

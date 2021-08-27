import Layer from "./index";
import * as d3 from "d3";

export default class D3Layer extends Layer {
  _root = d3.create("svg:g");
  _width;
  _height;
  _checked = false;

  constructor(name = "D3Layer", width, height, svg) {
    super(name);
    this._name = name;
    this._width = width;
    this._height = height;
    if (svg) {
      this._root = svg.append("g");
      this._container = svg;
      this._checked = true;
    }
    this._root
      .append("rect")
      .attr("class", "ig-layer-background")
      .attr("width", this._width)
      .attr("height", this._height)
      .attr("opacity", 0);
  }

  _toTemplate() {
    return {
      ...super._toTemplate(),
      extraParams: [this._width, this._height],
    };
  }

  checkContainer() {
    if (this._checked) return;
    this._container = d3(this._root.node().ownerSVGElement);
    this._checked = true;
  }

  getObjects() {
    return this._root.selectChildren(":not(.ig-layer-background)");
  }

  onObject(pointer) {
    const element = document.elementFromPoint(pointer.x, pointer.y);
    return (
      this._root.node().contains(element) &&
      !element.classList.contains("ig-layer-background")
    );
  }

  query(selector) {
    return this._root.node().querySelectorAll(selector);
  }

  pick(shape) {
    this.checkContainer();
    let result = [];
    const selfBBox = this._container.node().getBoundingClientRect();
    if (shape.type === "rect") {
      const svg = this._container.node();
      const rect = svg.createSVGRect();
      rect.x = shape.x;
      rect.y = shape.y;
      rect.width = shape.width;
      rect.height = shape.height;
      result = [...svg.getIntersectionList(rect, this._root.node())].filter(
        (ele) => !ele.classList.contains("ig-layer-background")
      );
    } else if (shape.type === "point") {
      const elements = document.elementsFromPoint(
        shape.x + selfBBox.left,
        shape.y + selfBBox.top
      );
      result = [...this.getObjects()]
        .filter((obj) => elements.includes(obj))
        .filter((ele) => !ele.classList.contains("ig-layer-background"));
    }
    return result;
  }

  find(dataFilter) {
    return this._root.selectAll("*").filter((d) => {
      try {
        return d.data && dataFilter(d.data);
      } catch {
        return false;
      }
    });
  }
}

Layer.D3Layer = D3Layer;
Layer.register("D3Layer", { constructor: D3Layer });

import Layer, { LayerConstructor, LayerInitOption } from "./layer";
import * as d3 from "d3";
import * as helpers from "../helpers";

const baseName = "D3Layer";
const backgroundClassName = "ig-layer-background";

type D3ExtraOption = {
  width: number,
  height: number
}

export default class D3Layer extends Layer<SVGElement> implements LayerConstructor{

  _root: d3.Selection<SVGElement, unknown, d3.BaseType, unknown> = d3.create("svg:g");
  _width: number;
  _height: number;
  _checked: boolean;


  constructor(baseName: string, options: LayerInitOption & D3ExtraOption) {
    super(baseName, options);
    this._width = options.width;
    this._height = options.height;
    if (options.container) {
      this._root = d3.select(options.container).append("g");
      this._checked = true;
    }
    this._graphic = this._root.node();
    this._root
      .append("rect")
      .attr("class", backgroundClassName)
      .attr("width", this._width)
      .attr("height", this._height)
      .attr("opacity", 0);
  }

  _toTemplate() {
    return {
      //...super._toTemplate(), !!!
      extraParams: [this._width, this._height],
    };
  }

  checkContainer() {
    if (this._checked) return;
    // this._container = d3(this._root.node().ownerSVGElement); !!!
    this._checked = true;
  }

  // getRootGraphic() {  !!! missing in Layer class
  //   return this._container.node();
  // }

  getObjects(): d3.Selection<d3.BaseType, unknown, SVGElement, unknown>{
    return this._root.selectChildren(`:not(.${backgroundClassName})`);
  }

  onObject(pointer: {x: number, y: number}): boolean {
    const element = document.elementFromPoint(pointer.x, pointer.y);
    return (
      this._root.node().contains(element) &&
      !element.classList.contains(backgroundClassName)
    );
  }

  query(options: helpers.ArbitraryQuery) {
    // !!! need to be implemented
    return [];
    //return this._root.node().querySelectorAll(selector);
  }
}

(Layer as any).D3Layer = D3Layer;
Layer.register(baseName, {constructor: D3Layer});

// !!! unregister?
import Layer, {LayerInitOption} from "./layer";
import * as d3 from "d3";
import * as helpers from "../helpers";

const baseName = "D3Layer";
const backgroundClassName = "ig-layer-background";

type D3RequiredOption = Required<{
  width: number,
  height: number
}>

type D3LayerInitOption = LayerInitOption & D3RequiredOption;

export default class D3Layer extends Layer<SVGElement> {

  _root: d3.Selection<SVGElement, unknown, d3.BaseType, unknown> = d3.create("svg:g");
  _width: number;
  _height: number;
  _checked: boolean;


  constructor(baseName: string, options: D3LayerInitOption) {
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

  _toTemplate() {  // it is better to store initOption in base class.
    return {
      //...super._toTemplate(), !!!
      extraParams: [this._width, this._height],
    };
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
    // !!! need to be implemented with externel services
    return [];
    //return this._root.node().querySelectorAll(selector);
  }
}

(Layer as any).D3Layer = D3Layer;
Layer.register(baseName, {constructor: (D3Layer as unknown as typeof Layer)});
Layer.register(baseName, {constructor: (D3Layer as unknown as typeof Layer)});
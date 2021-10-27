import Layer, { LayerInitOption } from "./layer";
import * as d3 from "d3";
import * as helpers from "../helpers";
import { } from "../helpers";

const baseName = "D3Layer";
const backgroundClassName = "ig-layer-background";

type D3RequiredOption = Required<{
  width: number,
  height: number
}>

type D3LayerInitOption = LayerInitOption & D3RequiredOption;

export default class D3Layer extends Layer<SVGElement> {

  //_root: d3.Selection<SVGElement, unknown, d3.BaseType, unknown> = d3.create("svg:g");
  _width: number;
  _height: number;
  _checked: boolean;


  constructor(baseName: string, options: D3LayerInitOption) {
    super(baseName, options);
    this._width = options.width;
    this._height = options.height;
    this._graphic = d3.select(options.container).append("g").node();
    d3.select(this._graphic)
      .append("rect")
      .attr("class", backgroundClassName)
      .attr("width", this._width)
      .attr("height", this._height)
      .attr("opacity", 0);
  }

  // _toTemplate() {  // it is better to store initOption in base class.
  //   return {
  //     //...super._toTemplate(), !!!
  //     extraParams: [this._width, this._height],
  //   };
  // }

  getVisualElements() { 
    const elems = [...this._graphic.querySelectorAll(`:root :not(.${backgroundClassName})`)];
    return elems as SVGElement[];
  }

  // onObject(pointer: { x: number, y: number }): boolean {
  //   const elements = document.elementsFromPoint(pointer.x, pointer.y);
  //   return (
  //     this._root.node().contains(element) &&
  //     !element.classList.contains(backgroundClassName)
  //   );
  // }

  select(selector: string): NodeListOf<Element> {
    return this._graphic.querySelectorAll(selector);
  }

  query(options: helpers.ArbitraryQuery) {
    if (options.baseOn === helpers.QueryType.Shape) {
      return this._shapeQuery(options);
    } else if (options.baseOn === helpers.QueryType.Data) {
      return this._dataQuery(options);
    } else if (options.baseOn === helpers.QueryType.Attr) {
      return this._attrQuery(options);
    }
    return [];
  }

  _inLayer(elem: Element){
    return this._graphic.contains(elem) // in layer
          && !elem.classList.contains(backgroundClassName);  // not background
  }

  _shapeQuery(options: helpers.ShapeBasedQuery): SVGElement[] {
    let result: SVGElement[] = [];
    const bbox = this._graphic.getBoundingClientRect();  // facilitate to get position relative to viewport
    
    if (options.type === helpers.ShapeQueryType.Point) {
      const x = options.x + bbox.left,
        y = options.x + bbox.top;
      result = document.elementsFromPoint(x, y).filter(this._inLayer) as SVGElement[];
    } else if (options.type === helpers.ShapeQueryType.Circle) {
      const x = options.x + bbox.left,
        y = options.y + bbox.top,
        r = options.r;
    } else if (options.type === helpers.ShapeQueryType.Rect) {
      const { x, y, width, height} = options;
      const x0 = Math.min(x, x + width) + bbox.left,
        y0 = Math.min(y, y + height) + bbox.top,
        x1 = Math.max(x, x + width) + bbox.left,
        y1 = Math.max(y, y + height) + bbox.top;
      // const rect = this._container.createSVGRect();
      // rect.x = shape.x;
      // rect.y = shape.y;
      // rect.width = shape.width;
      // rect.height = shape.height;
      // result = [...svg.getIntersectionList(rect, this._root.node())].filter(
      //   (ele) => !ele.classList.contains("ig-layer-background")
      // );
      //
    } else if (options.type === helpers.ShapeQueryType.Polygon) {
      //
    
    }

    // getElementsFromPoint cannot get the SVGGElement since it will never be touched directly.
    const resultWithSVGGElement = [];
    while(result.length > 0) {
      const elem = result.shift();
      resultWithSVGGElement.push(elem);
      if(elem.parentElement.tagName === "g") result.push(elem.parentElement as unknown as SVGElement);
    }
    return resultWithSVGGElement;
  }

  _dataQuery(options: helpers.DataBasedQuery): SVGElement[] {
    let result: SVGElement[] = [];

    const visualElements = d3.selectAll(this.getVisualElements());
    if (options.type === helpers.DataQueryType.Quantitative) {
      const { attrName, extent } = options
      result = visualElements
        .filter(d => extent[0] < d[attrName] && d[attrName] < extent[1]).nodes();
    } else if (options.type === helpers.DataQueryType.Nominal) {
      const { attrName, extent } = options
      result = visualElements
        .filter(d => extent.find(d[attrName])).nodes();
    } else if (options.type === helpers.DataQueryType.Temporal) {
      const { attrName, extent } = options; 
      const dateParser = options.dateParser || ((d: Date) => d);
      result = visualElements
        .filter(d => extent[0].getTime() < dateParser(d[attrName]).getTime() 
          && dateParser(d[attrName]).getTime() < extent[1].getTime()).nodes();
    }

    return result;
  }

  _attrQuery(options: helpers.AttributeBasedQuery): SVGElement[] {
    const { attrName, value } = options;
    const result = d3.select(this._graphic).filter(d => d[attrName] === value).nodes();
    return result;
  }

}

(Layer as any).D3Layer = D3Layer;
Layer.register(baseName, { constructor: (D3Layer as unknown as typeof Layer) });
Layer.register(baseName, { constructor: (D3Layer as unknown as typeof Layer) });
import Layer, { LayerInitOption } from "./layer";
import * as d3 from "d3";
import * as helpers from "../helpers";
import {} from "../helpers";

const baseName = "D3Layer";
const backgroundClassName = "ig-layer-background";

type D3RequiredOption = Required<{
  width: number;
  height: number;
}>;

type D3LayerInitOption = LayerInitOption & D3RequiredOption;

export default class D3Layer extends Layer<SVGElement> {
  //_root: d3.Selection<SVGElement, unknown, d3.BaseType, unknown> = d3.create("svg:g");
  _width: number;
  _height: number;
  _offset: {
    x: number;
    y: number;
  };
  _name: string;
  //_checked: boolean;
  _svg: SVGSVGElement;

  constructor(baseName: string, options: D3LayerInitOption) {
    super(baseName, options);
    this._width = options.width;
    this._height = options.height;
    this._offset = options.offset;
    this._name = options.name;
    this._graphic = d3
      .select(options.container)
      .append("g")
      .call((g) => {
        if (this._name) g.attr("className", this._name);
      })
      .call((g) => {
        if (this._offset)
          g.attr(
            "transform",
            `translate(${this._offset.x || 0}, ${this._offset.y || 0})`
          );
      })
      .node();
    d3.select(this._graphic)
      .append("rect")
      .attr("class", backgroundClassName)
      .attr("width", this._width)
      .attr("height", this._height)
      .attr("opacity", 0);
    let tempElem = this._container;
    while (tempElem && tempElem.tagName !== "svg")
      tempElem = tempElem.parentElement;
    if (tempElem.tagName !== "svg")
      throw Error("Container must be wrapped in SVGSVGElement");
    this._svg = tempElem as Element as SVGSVGElement;
    // this.redraw();
    this._postInitialize && this._postInitialize.call(this, this);
  }

  // _toTemplate() {  // it is better to store initOption in base class.
  //   return {
  //     //...super._toTemplate(), !!!
  //     extraParams: [this._width, this._height],
  //   };
  // }

  getDatum(elem: Element) {
    return d3.select(elem).datum();
  }

  getVisualElements() {
    const elems = [
      ...this._graphic.querySelectorAll(`:root :not(.${backgroundClassName})`),
    ];
    return elems as SVGElement[];
  }

  cloneVisualElements(element: Element, deep: boolean = false) {
    const copiedElement = d3.select(element).clone(deep).node();
    const frag = document.createDocumentFragment();
    frag.append(copiedElement);
    (copiedElement as any).__libra__screenElement = element;
    return copiedElement;
  }

  // onObject(pointer: { x: number, y: number }): boolean {
  //   const elements = document.elementsFromPoint(pointer.x, pointer.y);
  //   return (
  //     this._root.node().contains(element) &&
  //     !element.classList.contains(backgroundClassName)
  //   );
  // }
  // join(rightTable: any[], joinKey: string): any[] {
  //   const leftTable = d3.select(this._graphic).selectChildren("*").data();
  //   const joinTable = leftTable.flatMap((obj) => {
  //     if (typeof obj !== "object" || obj === undefined || obj === null)
  //       return [];
  //     return rightTable
  //       .filter(
  //         (rObj) =>
  //           typeof obj === "object" &&
  //           obj !== undefined &&
  //           obj !== null &&
  //           rObj[joinKey] === obj[joinKey]
  //       )
  //       .map((rObj) => ({ ...obj, ...rObj }));
  //   });
  //   return joinTable;
  // }

  select(selector: string): NodeListOf<Element> {
    return this._graphic.querySelectorAll(selector);
  }

  picking(options: helpers.ArbitraryQuery) {
    if (options.baseOn === helpers.QueryType.Shape) {
      return this._shapeQuery(options);
    } else if (options.baseOn === helpers.QueryType.Data) {
      return this._dataQuery(options);
    } else if (options.baseOn === helpers.QueryType.Attr) {
      return this._attrQuery(options);
    }
    return [];
  }

  _isElementInLayer(elem: Element): SVGElement[] {
    return (
      this._graphic.contains(elem) && // in layer
      (!elem.classList.contains(backgroundClassName) as unknown as SVGElement[])
    ); // not background
  }

  // the x y position is relative to the viewport (clientX, clientY)
  _shapeQuery(options: helpers.ShapeBasedQuery): SVGElement[] {
    let result: SVGElement[] = [];
    const svgBCR = this._svg.getBoundingClientRect();
    const layerBCR = this._graphic.getBoundingClientRect();

    if (options.type === helpers.ShapeQueryType.SurfacePoint) {
      const { x, y } = options;
      if (!isFinite(x) || !isFinite(y)) {
        return [];
      }
      result = [...document.elementsFromPoint(x, y)].filter(
        this._isElementInLayer.bind(this)
      ) as SVGElement[];
      if (result.length >= 1) {
        result = [result[0]];
      }
    } else if (options.type === helpers.ShapeQueryType.Point) {
      const { x, y } = options;
      if (!isFinite(x) || !isFinite(y)) {
        return [];
      }
      result = document
        .elementsFromPoint(x, y)
        .filter(this._isElementInLayer.bind(this)) as SVGElement[];
    } else if (options.type === helpers.ShapeQueryType.Circle) {
      const x = options.x - svgBCR.left,
        y = options.y - svgBCR.top,
        r = options.r;
      // Derive a special rect from a circle: the biggest square which the circle fully contains
      const innerRectWidth = Math.floor(r * Math.sin(Math.PI / 4)) << 1;
      const innerRectX = x - (innerRectWidth >>> 1);
      const innerRectY = y - (innerRectWidth >>> 1);

      const elemSet = new Set<Element>();

      // get the elements intersect with the innerRect
      const innerRect = this._svg.createSVGRect();
      innerRect.x = innerRectX;
      innerRect.y = innerRectY;
      innerRect.width = innerRectWidth;
      innerRect.height = innerRectWidth;
      this._svg
        .getIntersectionList(innerRect, this._graphic)
        .forEach((elem) => elemSet.add(elem));

      const outerRectWidth = r;
      const outerRectX = x - r;
      const outerRectY = y - r;

      const outerElemSet = new Set<Element>();

      // get the elements intersect with the outerRect
      const outerRect = this._svg.createSVGRect();
      outerRect.x = outerRectX;
      outerRect.y = outerRectY;
      outerRect.width = outerRectWidth * 2;
      outerRect.height = outerRectWidth * 2;
      this._svg
        .getIntersectionList(outerRect, this._graphic)
        .forEach((elem) => outerElemSet.add(elem));

      let outer = 1;
      while (true) {
        for (let elem of outerElemSet) {
          if (elemSet.has(elem)) outerElemSet.delete(elem);
        }
        if (!outerElemSet.size) break;
        if (outer * 2 + innerRectWidth >= r * 2) break;
        const w = Math.sqrt(r * r - Math.pow(innerRectWidth / 2 + outer, 2));
        const topRect = this._svg.createSVGRect();
        topRect.x = x - w;
        topRect.y = innerRectY - outer;
        topRect.width = w * 2;
        topRect.height = 1;
        const bottomRect = this._svg.createSVGRect();
        bottomRect.x = x - w;
        bottomRect.y = innerRectY + innerRectWidth + outer - 1;
        bottomRect.width = w * 2;
        bottomRect.height = 1;
        const leftRect = this._svg.createSVGRect();
        leftRect.x = innerRectX - outer;
        leftRect.y = y - w;
        leftRect.width = 1;
        leftRect.height = w * 2;
        const rightRect = this._svg.createSVGRect();
        rightRect.x = innerRectX + innerRectWidth + outer - 1;
        rightRect.y = y - w;
        rightRect.width = 1;
        rightRect.height = w * 2;
        [topRect, bottomRect, leftRect, rightRect].forEach((rect) => {
          this._svg
            .getIntersectionList(rect, this._graphic)
            .forEach((elem) => elemSet.add(elem));
        });
        outer++;
      }
      // // get the elements between circle and innerRect;
      // for (let i = x - r; i <= x + r; i++) {
      //   for (let j = y - r; j <= y + r; j++) {
      //     if (
      //       innerRect.x < i &&
      //       i < innerRect.x + innerRect.width &&
      //       innerRect.y < j &&
      //       j < innerRect.y + innerRect.height
      //     )
      //       continue;
      //     document
      //       .elementsFromPoint(i + svgBCR.left, j + svgBCR.top)
      //       .forEach((elem) => elemSet.add(elem));
      //   }
      // }

      result = [...elemSet].filter(
        this._isElementInLayer.bind(this)
      ) as SVGElement[];
    } else if (options.type === helpers.ShapeQueryType.Rect) {
      const { x, y, width, height } = options;
      const x0 = Math.min(x, x + width) - svgBCR.left,
        y0 = Math.min(y, y + height) - svgBCR.top,
        absWidth = Math.abs(width),
        absHeight = Math.abs(height);
      const rect = this._svg.createSVGRect();
      rect.x = x0;
      rect.y = y0;
      rect.width = absWidth;
      rect.height = absHeight;
      result = [...this._svg.getIntersectionList(rect, this._graphic)]
        .filter(this._isElementInLayer.bind(this))
        .filter((elem) => !elem.classList.contains(backgroundClassName));
    } else if (options.type === helpers.ShapeQueryType.Polygon) {
      // algorithms to determine if a point in a given polygon https://www.cnblogs.com/coderkian/p/3535977.html
    }

    // getElementsFromPoint cannot get the SVGGElement since it will never be touched directly.
    const resultWithSVGGElement = [];
    while (result.length > 0) {
      const elem = result.shift();
      resultWithSVGGElement.push(elem);
      if (
        elem.parentElement.tagName === "g" &&
        this._graphic.contains(elem.parentElement) &&
        this._graphic !== (elem.parentElement as unknown as SVGElement)
      )
        result.push(elem.parentElement as unknown as SVGElement);
    }
    return resultWithSVGGElement;
  }

  _dataQuery(options: helpers.DataBasedQuery): SVGElement[] {
    let result: SVGElement[] = [];

    const visualElements = d3.selectAll(this.getVisualElements());
    if (options.type === helpers.DataQueryType.Quantitative) {
      const { attrName, extent } = options;
      if (attrName instanceof Array) {
        let intermediateResult = visualElements;
        attrName.forEach((attrName, i) => {
          const ext = extent[i] as [number, number];
          intermediateResult = intermediateResult.filter(
            (d) =>
              d &&
              d[attrName] !== undefined &&
              ext[0] < d[attrName] &&
              d[attrName] < ext[1]
          );
        });
        result = intermediateResult.nodes();
      } else {
        result = visualElements
          .filter(
            (d) =>
              d &&
              d[attrName] !== undefined &&
              extent[0] < d[attrName] &&
              d[attrName] < extent[1]
          )
          .nodes();
      }
    } else if (options.type === helpers.DataQueryType.Nominal) {
      const { attrName, extent } = options;
      if (attrName instanceof Array) {
        let intermediateResult = visualElements;
        attrName.forEach((attrName, i) => {
          const ext = extent[i] as unknown[];
          intermediateResult = intermediateResult.filter(
            (d) =>
              d && d[attrName] !== undefined && ext.findIndex(d[attrName]) >= 0
          );
        });
        result = intermediateResult.nodes();
      } else {
        result = visualElements
          .filter(
            (d) =>
              d &&
              d[attrName] !== undefined &&
              extent.findIndex(d[attrName]) >= 0
          )
          .nodes();
      }
    } else if (options.type === helpers.DataQueryType.Temporal) {
      const { attrName, extent } = options;
      if (attrName instanceof Array) {
        let intermediateResult = visualElements;
        attrName.forEach((attrName, i) => {
          const ext = extent[i] as [Date, Date];
          const dateParser = options.dateParser?.[i] ?? ((d: Date) => d);
          intermediateResult = intermediateResult.filter(
            (d) =>
              d &&
              d[attrName] !== undefined &&
              ext[0].getTime() < dateParser(d[attrName]).getTime() &&
              dateParser(d[attrName]).getTime() < ext[1].getTime()
          );
        });
        result = intermediateResult.nodes();
      } else {
        const dateParser =
          (options.dateParser as (d: unknown) => Date) || ((d: Date) => d);
        result = visualElements
          .filter(
            (d) =>
              d &&
              d[attrName] !== undefined &&
              (extent as [Date, Date])[0].getTime() <
                dateParser(d[attrName]).getTime() &&
              dateParser(d[attrName]).getTime() <
                (extent as [Date, Date])[1].getTime()
          )
          .nodes();
      }
    }

    return result;
  }

  _attrQuery(options: helpers.AttributeBasedQuery): SVGElement[] {
    const { attrName, value } = options;
    const result = d3
      .select(this._graphic)
      .filter((d) => d[attrName] === value)
      .nodes();
    return result;
  }
}

(Layer as any).D3Layer = D3Layer;
Layer.register(baseName, { constructor: D3Layer as unknown as typeof Layer });
Layer.register(baseName, { constructor: D3Layer as unknown as typeof Layer });

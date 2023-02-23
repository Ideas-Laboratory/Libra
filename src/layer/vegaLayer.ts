import Layer, { LayerInitOption } from "./layer";
import vega from "vega-embed";
import * as d3 from "d3";
import * as helpers from "../helpers";
import {} from "../helpers";
import {
  fromTransformAttribute,
  fromDefinition,
  compose,
} from "transformation-matrix";

const baseName = "VegaLayer";
const backgroundClassName = "background";

type VegaRequiredOption = Required<{
  group: string;
}>;

type VegaLayerInitOption = LayerInitOption & VegaRequiredOption;

export default class VegaLayer extends Layer<SVGElement> {
  _name: string;
  //_checked: boolean;
  _svg: SVGSVGElement;

  constructor(baseName: string, options: VegaLayerInitOption) {
    super(baseName, options);
    this._name = options.name;
    this._container = options.container;
    if (options.group) {
      this._graphic = this._container.querySelector(`.${options.group}`);

      // const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      // bg.setAttribute("class", backgroundClassName);
      // bg.setAttribute("x", "0");
      // bg.setAttribute("y", "0");
      // bg.setAttribute("width", "100%");
      // bg.setAttribute("height", "100%");
      // bg.setAttribute("fill", "transparent");
      // bg.setAttribute("pointer-events", "none");

      // this._graphic.prepend(bg);
    } else {
      this._graphic = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g"
      );
      // this._graphic.setAttribute(
      //   "transform",
      //   options.container.querySelector("g")?.getAttribute("transform") ?? ""
      // ); // Make the offset same as the Vega output
      options.container.appendChild(this._graphic);
    }
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

  get _offset() {
    let matrixStr = "translate(0, 0)";
    if (
      [...this._container.children].includes(
        this._graphic as unknown as HTMLElement
      )
    ) {
      matrixStr =
        this._container.querySelector("g")?.getAttribute("transform") ??
        "translate(0,0)";
    } else {
      let currDom = this._graphic as unknown as HTMLElement;
      while (currDom != this._container) {
        if (currDom.getAttribute("transform")) {
          matrixStr += ` ${currDom.getAttribute("transform")}`;
        }
        currDom = currDom.parentElement;
      }
    }

    const matrix = compose(
      fromDefinition(fromTransformAttribute(matrixStr ?? "translate(0,0)"))
    );

    return { x: matrix.e, y: matrix.f };
  }

  getVisualElements() {
    const elems = [
      ...this._graphic.querySelectorAll(`:root :not(.${backgroundClassName})`),
    ];
    return elems as SVGElement[];
  }

  getGraphic(real = false) {
    if (this._userOptions.group) {
      if (real) {
        return [...this._container.children].find((el) =>
          el.contains(this._graphic)
        ) as unknown as SVGElement;
      }
      return this._container as unknown as SVGElement;
    }
    return this._graphic;
  }

  cloneVisualElements(element: Element, deep: boolean = false) {
    const copiedElement = d3.select(element).clone(deep).node();
    let currentElement = copiedElement.parentElement;
    let transform = copiedElement.getAttribute("transform");
    while (currentElement && currentElement != this._container) {
      if (currentElement.getAttribute("transform")) {
        transform += ` ${currentElement.getAttribute("transform")}`;
      }
      currentElement = currentElement.parentElement;
    }
    copiedElement.setAttribute("transform", transform);
    const frag = document.createDocumentFragment();
    frag.append(copiedElement);
    return copiedElement;
  }

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
      result = [...document.elementsFromPoint(x, y)].filter((elem) => {
        if (!this._isElementInLayer(elem)) return false;
        // fix chrome bug for stroke-width
        const rect = elem.getBoundingClientRect();
        return (
          rect.right >= x && rect.left <= x && rect.bottom >= y && rect.top <= y
        );
      }) as SVGElement[];
      if (result.length >= 1) {
        result = [result[0]];
      }
    } else if (options.type === helpers.ShapeQueryType.Point) {
      const { x, y } = options;
      if (!isFinite(x) || !isFinite(y)) {
        return [];
      }
      result = document.elementsFromPoint(x, y).filter((elem) => {
        if (!this._isElementInLayer(elem)) return false;
        // fix chrome bug for stroke-width
        const rect = elem.getBoundingClientRect();
        return (
          rect.right >= x && rect.left <= x && rect.bottom >= y && rect.top <= y
        );
      }) as SVGElement[];
    } else if (options.type === helpers.ShapeQueryType.Circle) {
      const rawX = options.x,
        rawY = options.y;
      const x = options.x - svgBCR.left,
        y = options.y - svgBCR.top,
        r = options.r;
      // Derive a special rect from a circle: the biggest square which the circle fully contains
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

      result = [...outerElemSet].filter((elem) => {
        if (!this._isElementInLayer(elem)) return false;
        // fix chrome bug for stroke-width
        const rect = elem.getBoundingClientRect();
        const circleDistanceX = Math.abs(rawX - rect.left);
        const circleDistanceY = Math.abs(rawY - rect.top);

        if (circleDistanceX > rect.width / 2 + r) {
          return false;
        }
        if (circleDistanceY > rect.height / 2 + r) {
          return false;
        }

        if (circleDistanceX <= rect.width / 2) {
          return true;
        }
        if (circleDistanceY <= rect.height / 2) {
          return true;
        }

        const cornerDistance =
          Math.pow(circleDistanceX - rect.width / 2, 2) +
          Math.pow(circleDistanceY - rect.height / 2, 2);

        return cornerDistance <= r * r;
      }) as SVGElement[];
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
      result = [...this._svg.getIntersectionList(rect, this._graphic)].filter(
        (elem) => {
          if (!this._isElementInLayer(elem)) return false;
          // fix chrome bug for stroke-width
          const rect = elem.getBoundingClientRect();
          return !(
            rect.right < x0 + svgBCR.left ||
            rect.left > x0 + absWidth + svgBCR.left ||
            rect.bottom < y0 + svgBCR.top ||
            rect.top > y0 + absHeight + svgBCR.top
          );
        }
      );
    } else if (options.type === helpers.ShapeQueryType.Polygon) {
      // algorithms to determine if a point in a given polygon https://www.cnblogs.com/coderkian/p/3535977.html
      const { points } = options;
      const x0 = Math.min(...points.map((p) => p.x)) - svgBCR.left,
        y0 = Math.min(...points.map((p) => p.y)) - svgBCR.top,
        x1 = Math.max(...points.map((p) => p.x)) - svgBCR.left,
        y1 = Math.max(...points.map((p) => p.y)) - svgBCR.top;

      const rect = this._svg.createSVGRect();
      rect.x = x0;
      rect.y = y0;
      rect.width = x1 - x0;
      rect.height = y1 - y0;
      result = [...this._svg.getIntersectionList(rect, this._graphic)].filter(
        (elem) => {
          if (!this._isElementInLayer(elem)) return false;
          // fix chrome bug for stroke-width
          const rect = elem.getBoundingClientRect();
          return !(
            rect.right < x0 + svgBCR.left ||
            rect.left > x1 + svgBCR.left ||
            rect.bottom < y0 + svgBCR.top ||
            rect.top > y1 + svgBCR.top
          );
        }
      );
    }

    // getElementsFromPoint cannot get the SVGGElement since it will never be touched directly.
    const resultWithSVGGElement = [];
    while (result.length > 0) {
      const elem = result.shift();
      if (elem.classList.contains(backgroundClassName)) continue;
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

    // const visualElements = vega.selectAll(this.getVisualElements());
    // if (options.type === helpers.DataQueryType.Quantitative) {
    //   const { attrName, extent } = options;
    //   if (attrName instanceof Array) {
    //     let intermediateResult = visualElements;
    //     attrName.forEach((attrName, i) => {
    //       const ext = extent[i] as [number, number];
    //       intermediateResult = intermediateResult.filter(
    //         (d) =>
    //           d &&
    //           d[attrName] !== undefined &&
    //           ext[0] < d[attrName] &&
    //           d[attrName] < ext[1]
    //       );
    //     });
    //     result = intermediateResult.nodes();
    //   } else {
    //     result = visualElements
    //       .filter(
    //         (d) =>
    //           d &&
    //           d[attrName] !== undefined &&
    //           extent[0] < d[attrName] &&
    //           d[attrName] < extent[1]
    //       )
    //       .nodes();
    //   }
    // } else if (options.type === helpers.DataQueryType.Nominal) {
    //   const { attrName, extent } = options;
    //   if (attrName instanceof Array) {
    //     let intermediateResult = visualElements;
    //     attrName.forEach((attrName, i) => {
    //       const ext = extent[i] as unknown[];
    //       intermediateResult = intermediateResult.filter(
    //         (d) =>
    //           d && d[attrName] !== undefined && ext.findIndex(d[attrName]) >= 0
    //       );
    //     });
    //     result = intermediateResult.nodes();
    //   } else {
    //     result = visualElements
    //       .filter(
    //         (d) =>
    //           d &&
    //           d[attrName] !== undefined &&
    //           extent.findIndex(d[attrName]) >= 0
    //       )
    //       .nodes();
    //   }
    // } else if (options.type === helpers.DataQueryType.Temporal) {
    //   const { attrName, extent } = options;
    //   if (attrName instanceof Array) {
    //     let intermediateResult = visualElements;
    //     attrName.forEach((attrName, i) => {
    //       const ext = extent[i] as [Date, Date];
    //       const dateParser = options.dateParser?.[i] ?? ((d: Date) => d);
    //       intermediateResult = intermediateResult.filter(
    //         (d) =>
    //           d &&
    //           d[attrName] !== undefined &&
    //           ext[0].getTime() < dateParser(d[attrName]).getTime() &&
    //           dateParser(d[attrName]).getTime() < ext[1].getTime()
    //       );
    //     });
    //     result = intermediateResult.nodes();
    //   } else {
    //     const dateParser =
    //       (options.dateParser as (d: unknown) => Date) || ((d: Date) => d);
    //     result = visualElements
    //       .filter(
    //         (d) =>
    //           d &&
    //           d[attrName] !== undefined &&
    //           (extent as [Date, Date])[0].getTime() <
    //             dateParser(d[attrName]).getTime() &&
    //           dateParser(d[attrName]).getTime() <
    //             (extent as [Date, Date])[1].getTime()
    //       )
    //       .nodes();
    //   }
    // }

    return result;
  }

  _attrQuery(options: helpers.AttributeBasedQuery): SVGElement[] {
    const { attrName, value } = options;
    // const result = vega
    //   .select(this._graphic)
    //   .filter((d) => d[attrName] === value)
    //   .nodes();
    // return result;
    return [];
  }
}

(Layer as any).VegaLayer = VegaLayer;
Layer.register(baseName, { constructor: VegaLayer as unknown as typeof Layer });
Layer.register(baseName, { constructor: VegaLayer as unknown as typeof Layer });

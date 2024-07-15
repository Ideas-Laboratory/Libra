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

  getDatum(elem: Element | Element[]) {
    if (!elem || (elem instanceof Array && elem.length == 0)) return null;
    if (elem instanceof Array) {
      return (d3.selectAll(elem).datum() as any)?.datum;
    }
    return (d3.select(elem).datum() as any)?.datum;
  }

  cloneVisualElements(element: Element, deep: boolean = false) {
    const copiedElement = d3.select(element).clone(deep).node();
    let currentElement = copiedElement.parentElement;
    let transform = copiedElement.getAttribute("transform") || "";
    while (currentElement && currentElement != this._container) {
      if (currentElement.getAttribute("transform")) {
        transform += ` ${currentElement.getAttribute("transform")}`;
      }
      currentElement = currentElement.parentElement;
    }
    copiedElement.setAttribute("transform", transform);
    const frag = document.createDocumentFragment();
    frag.append(copiedElement);
    (copiedElement as any).__libra__screenElement = element;
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
      
      // Get intersecting elements using the built-in method
      result = [...this._svg.getIntersectionList(rect, this._graphic)]
        .filter(this._isElementInLayer.bind(this))
        .filter((elem) => !elem.classList.contains(backgroundClassName));

      // Custom check for paths with no fill and zero stroke-width
      const zeroStrokeWidthPaths = [
        ...this._graphic.querySelectorAll("path"),
      ].filter((path) => {
        const computedStyle = window.getComputedStyle(path);
        return computedStyle.fill === "none";
      });

      if (zeroStrokeWidthPaths.length > 0) {
        const customIntersectingPaths = zeroStrokeWidthPaths.filter((path) => {
          const transformedRect = this.transformRect(
            rect,
            this._graphic as SVGGraphicsElement
          );
          return this.pathIntersectsRect(path, transformedRect);
        });
        result = [...new Set([...result, ...customIntersectingPaths])];
      }
    } else if (options.type === helpers.ShapeQueryType.Polygon) {
      const { points } = options;
      const svgBCR = this._svg.getBoundingClientRect();

      // Adjust points to SVG coordinate system
      const adjustedPoints = points.map((p) => ({
        x: p.x - svgBCR.left,
        y: p.y - svgBCR.top,
      }));

      const elemSet = new Set<SVGElement>();
      this.queryLargestRectangles(adjustedPoints, elemSet);

      result = Array.from(elemSet);
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

  private transformRect(
    rect: SVGRect,
    referenceElement: SVGGraphicsElement
  ): SVGRect {
    if (!this._offset) return rect;
    const transformedRect = this._svg.createSVGRect();
    transformedRect.x = rect.x - this._offset.x;
    transformedRect.y = rect.y - this._offset.y;
    transformedRect.width = rect.width;
    transformedRect.height = rect.height;

    return transformedRect;
  }

  private queryLargestRectangles(
    points: { x: number; y: number }[],
    elemSet: Set<SVGElement>
  ) {
    const boundingBox = this.getBoundingBox(points);

    // Base case: if the area is too small, query the whole polygon as is
    if (
      (boundingBox.maxX - boundingBox.minX) *
        (boundingBox.maxY - boundingBox.minY) <
      100
    ) {
      // Adjust this threshold as needed
      this.queryPolygon(points, elemSet);
      return;
    }

    const largestRect = this.findLargestRectangle(points, boundingBox);

    // Query the largest rectangle
    const rect = this._svg.createSVGRect();
    rect.x = largestRect.x;
    rect.y = largestRect.y;
    rect.width = largestRect.width;
    rect.height = largestRect.height;

    const intersectingElements = [
      ...this._svg.getIntersectionList(rect, this._graphic),
    ]
      .filter(this._isElementInLayer.bind(this))
      .filter((elem) => !elem.classList.contains(backgroundClassName));

    intersectingElements.forEach((elem) => elemSet.add(elem as SVGElement));

    // Custom check for paths with no fill
    const zeroFillPaths = [...this._graphic.querySelectorAll("path")].filter(
      (path) => {
        const computedStyle = window.getComputedStyle(path);
        return computedStyle.fill === "none";
      }
    );

    if (zeroFillPaths.length > 0) {
      const customIntersectingPaths = zeroFillPaths.filter((path) => {
        const transformedRect = this.transformRect(
          rect,
          this._graphic as SVGGraphicsElement
        );
        return this.pathIntersectsRect(path, transformedRect);
      });
      customIntersectingPaths.forEach((elem) =>
        elemSet.add(elem as SVGElement)
      );
    }

    // Recursively handle the remaining areas
    const remainingPolygons = this.subtractRectFromPolygon(points, largestRect);
    remainingPolygons.forEach((polygon) =>
      this.queryLargestRectangles(polygon, elemSet)
    );
  }

  private getBoundingBox(points: { x: number; y: number }[]) {
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    for (const point of points) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }
    return { minX, minY, maxX, maxY };
  }

  private findLargestRectangle(
    points: { x: number; y: number }[],
    boundingBox: { minX: number; minY: number; maxX: number; maxY: number }
  ) {
    // Implement an algorithm to find the largest rectangle in the polygon
    // This is a complex problem. For simplicity, we'll use a basic approach here.
    // You might want to implement a more sophisticated algorithm for better results.

    const width = boundingBox.maxX - boundingBox.minX;
    const height = boundingBox.maxY - boundingBox.minY;

    let largestArea = 0;
    let largestRect = { x: 0, y: 0, width: 0, height: 0 };

    for (let x = boundingBox.minX; x < boundingBox.maxX; x += width / 10) {
      for (let y = boundingBox.minY; y < boundingBox.maxY; y += height / 10) {
        for (let w = width / 10; x + w <= boundingBox.maxX; w += width / 10) {
          for (
            let h = height / 10;
            y + h <= boundingBox.maxY;
            h += height / 10
          ) {
            if (
              this.isRectangleInPolygon({ x, y, width: w, height: h }, points)
            ) {
              const area = w * h;
              if (area > largestArea) {
                largestArea = area;
                largestRect = { x, y, width: w, height: h };
              }
            }
          }
        }
      }
    }

    return largestRect;
  }

  private isRectangleInPolygon(
    rect: { x: number; y: number; width: number; height: number },
    polygon: { x: number; y: number }[]
  ) {
    const corners = [
      { x: rect.x, y: rect.y },
      { x: rect.x + rect.width, y: rect.y },
      { x: rect.x + rect.width, y: rect.y + rect.height },
      { x: rect.x, y: rect.y + rect.height },
    ];

    return corners.every((corner) => this.isPointInPolygon(corner, polygon));
  }

  private subtractRectFromPolygon(
    polygon: { x: number; y: number }[],
    rect: { x: number; y: number; width: number; height: number }
  ) {
    // Implement polygon clipping to subtract the rectangle from the polygon
    // This is a complex operation. For simplicity, we'll return the original polygon minus the rectangle corners.
    // You might want to implement a proper polygon clipping algorithm for better results.

    const remainingPoints = polygon.filter(
      (point) =>
        !(
          point.x >= rect.x &&
          point.x <= rect.x + rect.width &&
          point.y >= rect.y &&
          point.y <= rect.y + rect.height
        )
    );

    // Add rectangle corners to ensure the remaining shape is properly defined
    const rectCorners = [
      { x: rect.x, y: rect.y },
      { x: rect.x + rect.width, y: rect.y },
      { x: rect.x + rect.width, y: rect.y + rect.height },
      { x: rect.x, y: rect.y + rect.height },
    ];

    return [remainingPoints.concat(rectCorners)];
  }

  private queryPolygon(
    points: { x: number; y: number }[],
    elemSet: Set<SVGElement>
  ) {
    const boundingBox = this.getBoundingBox(points);
    const rect = this._svg.createSVGRect();
    rect.x = boundingBox.minX;
    rect.y = boundingBox.minY;
    rect.width = boundingBox.maxX - boundingBox.minX;
    rect.height = boundingBox.maxY - boundingBox.minY;

    const potentialElements = [
      ...this._svg.getIntersectionList(rect, this._graphic),
    ]
      .filter(this._isElementInLayer.bind(this))
      .filter((elem) => !elem.classList.contains(backgroundClassName));

    potentialElements.forEach((elem) => {
      const bbox = (elem as SVGGraphicsElement).getBBox();
      const elemPoints = [
        { x: bbox.x, y: bbox.y },
        { x: bbox.x + bbox.width, y: bbox.y },
        { x: bbox.x + bbox.width, y: bbox.y + bbox.height },
        { x: bbox.x, y: bbox.y + bbox.height },
      ];

      if (elemPoints.some((point) => this.isPointInPolygon(point, points))) {
        elemSet.add(elem as SVGElement);
      }
    });

    // Custom check for paths with no fill
    const zeroFillPaths = [...this._graphic.querySelectorAll("path")].filter(
      (path) => {
        const computedStyle = window.getComputedStyle(path);
        return computedStyle.fill === "none";
      }
    );

    if (zeroFillPaths.length > 0) {
      const customIntersectingPaths = zeroFillPaths.filter((path) => {
        const transformedRect = this.transformRect(
          rect,
          this._graphic as SVGGraphicsElement
        );
        return this.pathIntersectsRect(path, transformedRect);
      });
      customIntersectingPaths.forEach((elem) =>
        elemSet.add(elem as SVGElement)
      );
    }
  }

  private pathIntersectsPolygon(
    path: SVGPathElement,
    polygon: { x: number; y: number }[]
  ): boolean {
    const pathLength = path.getTotalLength();
    const step = pathLength / 100; // Check 100 points along the path
    for (let i = 0; i <= pathLength; i += step) {
      const point = path.getPointAtLength(i);
      if (this.isPointInPolygon(point, polygon)) {
        return true;
      }
    }
    return false;
  }
}

(Layer as any).VegaLayer = VegaLayer;
Layer.register(baseName, { constructor: VegaLayer as unknown as typeof Layer });
Layer.register(baseName, { constructor: VegaLayer as unknown as typeof Layer });

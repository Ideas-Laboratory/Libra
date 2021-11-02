import Layer from "./layer";
import * as d3 from "d3";
import * as helpers from "../helpers";
const baseName = "D3Layer";
const backgroundClassName = "ig-layer-background";
export default class D3Layer extends Layer {
    constructor(baseName, options) {
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
        let tempElem = this._container;
        while (tempElem && tempElem.tagName !== "svg")
            tempElem = tempElem.parentElement;
        if (tempElem.tagName !== "svg")
            throw Error("Container must be wrapped in SVGSVGElement");
        this._svg = tempElem;
    }
    // _toTemplate() {  // it is better to store initOption in base class.
    //   return {
    //     //...super._toTemplate(), !!!
    //     extraParams: [this._width, this._height],
    //   };
    // }
    getVisualElements() {
        const elems = [
            ...this._graphic.querySelectorAll(`:root :not(.${backgroundClassName})`),
        ];
        return elems;
    }
    // onObject(pointer: { x: number, y: number }): boolean {
    //   const elements = document.elementsFromPoint(pointer.x, pointer.y);
    //   return (
    //     this._root.node().contains(element) &&
    //     !element.classList.contains(backgroundClassName)
    //   );
    // }
    select(selector) {
        return this._graphic.querySelectorAll(selector);
    }
    query(options) {
        if (options.baseOn === helpers.QueryType.Shape) {
            return this._shapeQuery(options);
        }
        else if (options.baseOn === helpers.QueryType.Data) {
            return this._dataQuery(options);
        }
        else if (options.baseOn === helpers.QueryType.Attr) {
            return this._attrQuery(options);
        }
        return [];
    }
    _isElementInLayer(elem) {
        return (this._graphic.contains(elem) && // in layer
            !elem.classList.contains(backgroundClassName)); // not background
    }
    // the x y position is relative to the viewport (clientX, clientY)
    _shapeQuery(options) {
        let result = [];
        const svgBCR = this._svg.getBoundingClientRect();
        const layerBCR = this._graphic.getBoundingClientRect();
        if (options.type === helpers.ShapeQueryType.SurfacePoint) {
            const { x, y } = options;
            if (!isFinite(x) || !isFinite(y)) {
                return [];
            }
            result = [document.elementFromPoint(x, y)];
            if (!this._isElementInLayer(result[0])) {
                result = [];
            }
        }
        else if (options.type === helpers.ShapeQueryType.Point) {
            const { x, y } = options;
            if (!isFinite(x) || !isFinite(y)) {
                return [];
            }
            result = document
                .elementsFromPoint(x, y)
                .filter(this._isElementInLayer.bind(this));
        }
        else if (options.type === helpers.ShapeQueryType.Circle) {
            const x = options.x - svgBCR.left, y = options.y - svgBCR.top, r = options.r;
            // Derive a special rect from a circle: the biggest square which the circle fully contains
            const innerRectWidth = Math.floor(r * Math.sin(Math.PI / 4)) << 1;
            const innerRectX = x - (innerRectWidth >>> 1);
            const innerRectY = y - (innerRectWidth >>> 1);
            const elemSet = new Set();
            // get the elements intersect with the innerRect
            const innerRect = this._svg.createSVGRect();
            innerRect.x = innerRectX;
            innerRect.y = innerRectY;
            innerRect.width = innerRectWidth;
            innerRect.height = innerRectWidth;
            this._svg
                .getIntersectionList(innerRect, this._graphic)
                .forEach((elem) => elemSet.add(elem));
            // get the elements between circle and innerRect;
            for (let i = x - r; i <= x + r; i++) {
                for (let j = y - r; j <= y + r; j++) {
                    if (innerRect.x < i &&
                        i < innerRect.x + innerRect.width &&
                        innerRect.y < j &&
                        j < innerRect.y + innerRect.y + innerRect.height)
                        continue;
                    document
                        .elementsFromPoint(i + svgBCR.left, j + svgBCR.top)
                        .forEach((elem) => elemSet.add(elem));
                }
            }
            result = [...elemSet].filter(this._isElementInLayer);
        }
        else if (options.type === helpers.ShapeQueryType.Rect) {
            const { x, y, width, height } = options;
            const x0 = Math.min(x, x + width) - svgBCR.left, y0 = Math.min(y, y + height) - svgBCR.top, absWidth = Math.abs(width), absHeight = Math.abs(height);
            const rect = this._svg.createSVGRect();
            rect.x = x0;
            rect.y = y0;
            rect.width = absWidth;
            rect.height = absHeight;
            result = [...this._svg.getIntersectionList(rect, this._graphic)].filter((elem) => !elem.classList.contains(backgroundClassName));
        }
        else if (options.type === helpers.ShapeQueryType.Polygon) {
            // algorithms to determine if a point in a given polygon https://www.cnblogs.com/coderkian/p/3535977.html
        }
        // getElementsFromPoint cannot get the SVGGElement since it will never be touched directly.
        const resultWithSVGGElement = [];
        while (result.length > 0) {
            const elem = result.shift();
            resultWithSVGGElement.push(elem);
            if (elem.parentElement.tagName === "g")
                result.push(elem.parentElement);
        }
        return resultWithSVGGElement;
    }
    _dataQuery(options) {
        let result = [];
        const visualElements = d3.selectAll(this.getVisualElements());
        if (options.type === helpers.DataQueryType.Quantitative) {
            const { attrName, extent } = options;
            result = visualElements
                .filter((d) => extent[0] < d[attrName] && d[attrName] < extent[1])
                .nodes();
        }
        else if (options.type === helpers.DataQueryType.Nominal) {
            const { attrName, extent } = options;
            result = visualElements.filter((d) => extent.find(d[attrName])).nodes();
        }
        else if (options.type === helpers.DataQueryType.Temporal) {
            const { attrName, extent } = options;
            const dateParser = options.dateParser || ((d) => d);
            result = visualElements
                .filter((d) => extent[0].getTime() < dateParser(d[attrName]).getTime() &&
                dateParser(d[attrName]).getTime() < extent[1].getTime())
                .nodes();
        }
        return result;
    }
    _attrQuery(options) {
        const { attrName, value } = options;
        const result = d3
            .select(this._graphic)
            .filter((d) => d[attrName] === value)
            .nodes();
        return result;
    }
}
Layer.D3Layer = D3Layer;
Layer.register(baseName, { constructor: D3Layer });
Layer.register(baseName, { constructor: D3Layer });

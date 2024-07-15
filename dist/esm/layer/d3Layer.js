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
        this._offset = options.offset;
        this._name = options.name;
        this._graphic = d3
            .select(options.container)
            .append("g")
            .call((g) => {
            if (this._name)
                g.attr("className", this._name);
        })
            .call((g) => {
            if (this._offset)
                g.attr("transform", `translate(${this._offset.x || 0}, ${this._offset.y || 0})`);
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
        this._svg = tempElem;
        // this.redraw();
        this._postInitialize && this._postInitialize.call(this, this);
    }
    // _toTemplate() {  // it is better to store initOption in base class.
    //   return {
    //     //...super._toTemplate(), !!!
    //     extraParams: [this._width, this._height],
    //   };
    // }
    getDatum(elem) {
        if (!elem || (elem instanceof Array && elem.length == 0))
            return null;
        if (elem instanceof Array) {
            return d3.selectAll(elem).datum();
        }
        return d3.select(elem).datum();
    }
    getVisualElements() {
        const elems = [
            ...this._graphic.querySelectorAll(`:root :not(.${backgroundClassName})`),
        ];
        return elems;
    }
    cloneVisualElements(element, deep = false) {
        const copiedElement = d3.select(element).clone(deep).node();
        const frag = document.createDocumentFragment();
        frag.append(copiedElement);
        copiedElement.__libra__screenElement = element;
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
    select(selector) {
        return this._graphic.querySelectorAll(selector);
    }
    picking(options) {
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
            result = [...document.elementsFromPoint(x, y)].filter(this._isElementInLayer.bind(this));
            if (result.length >= 1) {
                result = [result[0]];
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
            // Custom check for paths with no fill and zero stroke-width
            const zeroStrokeWidthPaths = [
                ...this._graphic.querySelectorAll("path"),
            ].filter((path) => {
                const computedStyle = window.getComputedStyle(path);
                return computedStyle.fill === "none";
            });
            if (zeroStrokeWidthPaths.length > 0) {
                const customIntersectingPaths = zeroStrokeWidthPaths.filter((path) => {
                    const transformedRect = this.transformRect(innerRect, this._graphic);
                    return this.pathIntersectsRect(path, transformedRect);
                });
                customIntersectingPaths.forEach((elem) => elemSet.add(elem));
            }
            const outerRectWidth = r;
            const outerRectX = x - r;
            const outerRectY = y - r;
            const outerElemSet = new Set();
            // get the elements intersect with the outerRect
            const outerRect = this._svg.createSVGRect();
            outerRect.x = outerRectX;
            outerRect.y = outerRectY;
            outerRect.width = outerRectWidth * 2;
            outerRect.height = outerRectWidth * 2;
            this._svg
                .getIntersectionList(outerRect, this._graphic)
                .forEach((elem) => outerElemSet.add(elem));
            if (zeroStrokeWidthPaths.length > 0) {
                const customIntersectingPaths = zeroStrokeWidthPaths.filter((path) => {
                    const transformedRect = this.transformRect(outerRect, this._graphic);
                    return this.pathIntersectsRect(path, transformedRect);
                });
                customIntersectingPaths.forEach((elem) => outerElemSet.add(elem));
            }
            let outer = 1;
            while (true) {
                for (let elem of outerElemSet) {
                    if (elemSet.has(elem))
                        outerElemSet.delete(elem);
                }
                if (!outerElemSet.size)
                    break;
                if (outer * 2 + innerRectWidth >= r * 2)
                    break;
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
                    // Custom check for paths with no fill and zero stroke-width
                    const zeroStrokeWidthPaths = [
                        ...this._graphic.querySelectorAll("path"),
                    ].filter((path) => {
                        const computedStyle = window.getComputedStyle(path);
                        return computedStyle.fill === "none";
                    });
                    if (zeroStrokeWidthPaths.length > 0) {
                        const customIntersectingPaths = zeroStrokeWidthPaths.filter((path) => {
                            const transformedRect = this.transformRect(rect, this._graphic);
                            return this.pathIntersectsRect(path, transformedRect);
                        });
                        customIntersectingPaths.forEach((elem) => elemSet.add(elem));
                    }
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
            result = [...elemSet].filter(this._isElementInLayer.bind(this));
        }
        else if (options.type === helpers.ShapeQueryType.Rect) {
            const { x, y, width, height } = options;
            const x0 = Math.min(x, x + width) - svgBCR.left, y0 = Math.min(y, y + height) - svgBCR.top, absWidth = Math.abs(width), absHeight = Math.abs(height);
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
                    const transformedRect = this.transformRect(rect, this._graphic);
                    return this.pathIntersectsRect(path, transformedRect);
                });
                result = [...new Set([...result, ...customIntersectingPaths])];
            }
        }
        else if (options.type === helpers.ShapeQueryType.Polygon) {
            const { points } = options;
            const svgBCR = this._svg.getBoundingClientRect();
            // Adjust points to SVG coordinate system
            const adjustedPoints = points.map((p) => ({
                x: p.x - svgBCR.left,
                y: p.y - svgBCR.top,
            }));
            const elemSet = new Set();
            this.queryLargestRectangles(adjustedPoints, elemSet);
            result = Array.from(elemSet);
        }
        // getElementsFromPoint cannot get the SVGGElement since it will never be touched directly.
        const resultWithSVGGElement = [];
        while (result.length > 0) {
            const elem = result.shift();
            resultWithSVGGElement.push(elem);
            if (elem.parentElement.tagName === "g" &&
                this._graphic.contains(elem.parentElement) &&
                this._graphic !== elem.parentElement)
                result.push(elem.parentElement);
        }
        return resultWithSVGGElement;
    }
    _dataQuery(options) {
        let result = [];
        const visualElements = d3.selectAll(this.getVisualElements());
        if (options.type === helpers.DataQueryType.Quantitative) {
            const { attrName, extent } = options;
            if (attrName instanceof Array) {
                let intermediateResult = visualElements;
                attrName.forEach((attrName, i) => {
                    const ext = extent[i];
                    intermediateResult = intermediateResult.filter((d) => d &&
                        d[attrName] !== undefined &&
                        ext[0] < d[attrName] &&
                        d[attrName] < ext[1]);
                });
                result = intermediateResult.nodes();
            }
            else {
                result = visualElements
                    .filter((d) => d &&
                    d[attrName] !== undefined &&
                    extent[0] < d[attrName] &&
                    d[attrName] < extent[1])
                    .nodes();
            }
        }
        else if (options.type === helpers.DataQueryType.Nominal) {
            const { attrName, extent } = options;
            if (attrName instanceof Array) {
                let intermediateResult = visualElements;
                attrName.forEach((attrName, i) => {
                    const ext = extent[i];
                    intermediateResult = intermediateResult.filter((d) => d && d[attrName] !== undefined && ext.findIndex(d[attrName]) >= 0);
                });
                result = intermediateResult.nodes();
            }
            else {
                result = visualElements
                    .filter((d) => d &&
                    d[attrName] !== undefined &&
                    extent.findIndex(d[attrName]) >= 0)
                    .nodes();
            }
        }
        else if (options.type === helpers.DataQueryType.Temporal) {
            const { attrName, extent } = options;
            if (attrName instanceof Array) {
                let intermediateResult = visualElements;
                attrName.forEach((attrName, i) => {
                    const ext = extent[i];
                    const dateParser = options.dateParser?.[i] ?? ((d) => d);
                    intermediateResult = intermediateResult.filter((d) => d &&
                        d[attrName] !== undefined &&
                        ext[0].getTime() < dateParser(d[attrName]).getTime() &&
                        dateParser(d[attrName]).getTime() < ext[1].getTime());
                });
                result = intermediateResult.nodes();
            }
            else {
                const dateParser = options.dateParser || ((d) => d);
                result = visualElements
                    .filter((d) => d &&
                    d[attrName] !== undefined &&
                    extent[0].getTime() <
                        dateParser(d[attrName]).getTime() &&
                    dateParser(d[attrName]).getTime() <
                        extent[1].getTime())
                    .nodes();
            }
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
    transformRect(rect, referenceElement) {
        if (!this._offset)
            return rect;
        const transformedRect = this._svg.createSVGRect();
        transformedRect.x = rect.x - this._offset.x;
        transformedRect.y = rect.y - this._offset.y;
        transformedRect.width = rect.width;
        transformedRect.height = rect.height;
        return transformedRect;
    }
    queryLargestRectangles(points, elemSet) {
        const boundingBox = this.getBoundingBox(points);
        // Base case: if the area is too small, query the whole polygon as is
        if ((boundingBox.maxX - boundingBox.minX) *
            (boundingBox.maxY - boundingBox.minY) <
            100) {
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
        intersectingElements.forEach((elem) => elemSet.add(elem));
        // Custom check for paths with no fill
        const zeroFillPaths = [...this._graphic.querySelectorAll("path")].filter((path) => {
            const computedStyle = window.getComputedStyle(path);
            return computedStyle.fill === "none";
        });
        if (zeroFillPaths.length > 0) {
            const customIntersectingPaths = zeroFillPaths.filter((path) => {
                const transformedRect = this.transformRect(rect, this._graphic);
                return this.pathIntersectsRect(path, transformedRect);
            });
            customIntersectingPaths.forEach((elem) => elemSet.add(elem));
        }
        // Recursively handle the remaining areas
        const remainingPolygons = this.subtractRectFromPolygon(points, largestRect);
        remainingPolygons.forEach((polygon) => this.queryLargestRectangles(polygon, elemSet));
    }
    getBoundingBox(points) {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (const point of points) {
            minX = Math.min(minX, point.x);
            minY = Math.min(minY, point.y);
            maxX = Math.max(maxX, point.x);
            maxY = Math.max(maxY, point.y);
        }
        return { minX, minY, maxX, maxY };
    }
    findLargestRectangle(points, boundingBox) {
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
                    for (let h = height / 10; y + h <= boundingBox.maxY; h += height / 10) {
                        if (this.isRectangleInPolygon({ x, y, width: w, height: h }, points)) {
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
    isRectangleInPolygon(rect, polygon) {
        const corners = [
            { x: rect.x, y: rect.y },
            { x: rect.x + rect.width, y: rect.y },
            { x: rect.x + rect.width, y: rect.y + rect.height },
            { x: rect.x, y: rect.y + rect.height },
        ];
        return corners.every((corner) => this.isPointInPolygon(corner, polygon));
    }
    subtractRectFromPolygon(polygon, rect) {
        // Implement polygon clipping to subtract the rectangle from the polygon
        // This is a complex operation. For simplicity, we'll return the original polygon minus the rectangle corners.
        // You might want to implement a proper polygon clipping algorithm for better results.
        const remainingPoints = polygon.filter((point) => !(point.x >= rect.x &&
            point.x <= rect.x + rect.width &&
            point.y >= rect.y &&
            point.y <= rect.y + rect.height));
        // Add rectangle corners to ensure the remaining shape is properly defined
        const rectCorners = [
            { x: rect.x, y: rect.y },
            { x: rect.x + rect.width, y: rect.y },
            { x: rect.x + rect.width, y: rect.y + rect.height },
            { x: rect.x, y: rect.y + rect.height },
        ];
        return [remainingPoints.concat(rectCorners)];
    }
    queryPolygon(points, elemSet) {
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
            const bbox = elem.getBBox();
            const elemPoints = [
                { x: bbox.x, y: bbox.y },
                { x: bbox.x + bbox.width, y: bbox.y },
                { x: bbox.x + bbox.width, y: bbox.y + bbox.height },
                { x: bbox.x, y: bbox.y + bbox.height },
            ];
            if (elemPoints.some((point) => this.isPointInPolygon(point, points))) {
                elemSet.add(elem);
            }
        });
        // Custom check for paths with no fill
        const zeroFillPaths = [...this._graphic.querySelectorAll("path")].filter((path) => {
            const computedStyle = window.getComputedStyle(path);
            return computedStyle.fill === "none";
        });
        if (zeroFillPaths.length > 0) {
            const customIntersectingPaths = zeroFillPaths.filter((path) => {
                const transformedRect = this.transformRect(rect, this._graphic);
                return this.pathIntersectsRect(path, transformedRect);
            });
            customIntersectingPaths.forEach((elem) => elemSet.add(elem));
        }
    }
    pathIntersectsPolygon(path, polygon) {
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
Layer.D3Layer = D3Layer;
Layer.register(baseName, { constructor: D3Layer });
Layer.register(baseName, { constructor: D3Layer });

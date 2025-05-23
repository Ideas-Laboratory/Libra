import Layer, { LayerInitOption } from "./layer";
import * as helpers from "../helpers";
type VegaRequiredOption = Required<{
    group: string;
}>;
type VegaLayerInitOption = LayerInitOption & VegaRequiredOption;
export default class VegaLayer extends Layer<SVGElement> {
    _name: string;
    _svg: SVGSVGElement;
    constructor(baseName: string, options: VegaLayerInitOption);
    get _offset(): {
        x: number;
        y: number;
    };
    getVisualElements(): SVGElement[];
    getGraphic(real?: boolean): SVGElement;
    getDatum(elem: Element | Element[]): any;
    cloneVisualElements(element: Element, deep?: boolean): Element;
    select(selector: string): NodeListOf<Element>;
    picking(options: helpers.ArbitraryQuery): SVGElement[];
    _isElementInLayer(elem: Element): SVGElement[];
    _shapeQuery(options: helpers.ShapeBasedQuery): SVGElement[];
    _dataQuery(options: helpers.DataBasedQuery): SVGElement[];
    _attrQuery(options: helpers.AttributeBasedQuery): SVGElement[];
    private transformRect;
    private queryLargestRectangles;
    private getBoundingBox;
    private findLargestRectangle;
    private isRectangleInPolygon;
    private subtractRectFromPolygon;
    private queryPolygon;
    private pathIntersectsPolygon;
}
export {};

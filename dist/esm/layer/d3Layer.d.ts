import Layer, { LayerInitOption } from "./layer";
import * as helpers from "../helpers";
type D3RequiredOption = Required<{
    width: number;
    height: number;
}>;
type D3LayerInitOption = LayerInitOption & D3RequiredOption;
export default class D3Layer extends Layer<SVGElement> {
    _width: number;
    _height: number;
    _offset: {
        x: number;
        y: number;
    };
    _name: string;
    _svg: SVGSVGElement;
    constructor(baseName: string, options: D3LayerInitOption);
    getDatum(elem: Element | Element[]): unknown;
    getVisualElements(): SVGElement[];
    cloneVisualElements(element: Element, deep?: boolean): Element;
    select(selector: string): NodeListOf<Element>;
    picking(options: helpers.ArbitraryQuery): SVGElement[];
    _isElementInLayer(elem: Element): SVGElement[];
    _shapeQuery(options: helpers.ShapeBasedQuery): SVGElement[];
    _dataQuery(options: helpers.DataBasedQuery): SVGElement[];
    _attrQuery(options: helpers.AttributeBasedQuery): SVGElement[];
}
export {};

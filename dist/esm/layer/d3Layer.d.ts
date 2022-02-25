import Layer, { LayerInitOption } from "./layer";
import * as helpers from "../helpers";
declare type D3RequiredOption = Required<{
    width: number;
    height: number;
}>;
declare type D3LayerInitOption = LayerInitOption & D3RequiredOption;
export default class D3Layer extends Layer<SVGElement> {
    _width: number;
    _height: number;
    _svg: SVGSVGElement;
    constructor(baseName: string, options: D3LayerInitOption);
    getVisualElements(): SVGElement[];
    cloneVisualElements(element: Element, deep?: boolean): Element;
    select(selector: string): NodeListOf<Element>;
    query(options: helpers.ArbitraryQuery): SVGElement[];
    _isElementInLayer(elem: Element): SVGElement[];
    _shapeQuery(options: helpers.ShapeBasedQuery): SVGElement[];
    _dataQuery(options: helpers.DataBasedQuery): SVGElement[];
    _attrQuery(options: helpers.AttributeBasedQuery): SVGElement[];
}
export {};

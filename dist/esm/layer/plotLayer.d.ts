import Layer, { LayerInitOption } from "./layer";
import * as helpers from "../helpers";
type PlotRequiredOption = Required<{
    group: string;
}>;
type PlotLayerInitOption = LayerInitOption & PlotRequiredOption;
export default class PlotLayer extends Layer<SVGElement> {
    _name: string;
    _svg: SVGSVGElement;
    constructor(baseName: string, options: PlotLayerInitOption);
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
}
export {};

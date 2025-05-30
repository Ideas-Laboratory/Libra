import { Layer } from "../layer";
import * as helpers from "../helpers";
type TransformerInitOption = {
    name?: string;
    layer?: Layer<any>;
    sharedVar?: {
        [varName: string]: any;
    };
    redraw?: (option: {
        [name: string]: any;
    }) => void;
    transient?: boolean;
    [param: string]: any;
};
type TransformerInitTemplate = TransformerInitOption & {
    [param: string]: any;
    constructor?: typeof GraphicalTransformer;
};
export declare const instanceTransformers: GraphicalTransformer[];
export default class GraphicalTransformer {
    _baseName: string;
    _name: string;
    _userOptions: TransformerInitOption;
    _sharedVar: {
        [varName: string]: any;
    };
    _redraw: (option: any) => void;
    _layer: Layer<any>;
    _transient: boolean;
    [helpers.LibraSymbol]: boolean;
    constructor(baseName: string, options: TransformerInitOption);
    getSharedVar(name: string): any;
    setSharedVar(name: string, value: any): void;
    setSharedVars(obj: {
        [key: string]: any;
    }): void;
    redraw(transient?: boolean): void;
    isInstanceOf(name: string): boolean;
    static register(baseName: string, options: TransformerInitTemplate): void;
    static unregister(baseName: string): boolean;
    static initialize(baseName: string, options?: TransformerInitOption): GraphicalTransformer;
    static findTransformer(baseNameOrRealName: string): GraphicalTransformer[];
    static findTransformerByLayer(layer: Layer<any>): GraphicalTransformer[];
}
export declare const register: typeof GraphicalTransformer.register;
export declare const unregister: typeof GraphicalTransformer.unregister;
export declare const initialize: typeof GraphicalTransformer.initialize;
export declare const findTransformer: typeof GraphicalTransformer.findTransformer;
export {};

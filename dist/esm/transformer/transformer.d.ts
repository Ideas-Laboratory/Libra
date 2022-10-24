import { Layer } from "../layer";
declare type TransformerInitOption = {
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
declare type TransformerInitTemplate = TransformerInitOption & {
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
}
export declare const register: typeof GraphicalTransformer.register;
export declare const unregister: typeof GraphicalTransformer.unregister;
export declare const initialize: typeof GraphicalTransformer.initialize;
export declare const findTransformer: typeof GraphicalTransformer.findTransformer;
export {};

import { InteractionService } from "../service";
import * as helpers from "../helpers";
declare type LayerInitRequiredOption = Required<{
    container: HTMLElement;
}>;
declare type LayerRegisterRequiredOption = Required<{
    constructor: typeof Layer;
}>;
declare type LayerPartialOption = Partial<{
    name: string;
    transformation: {
        [scaleName: string]: helpers.Transformation;
    };
    services: (string | InteractionService | {
        service: string | InteractionService;
        options: any;
    })[];
    sharedVar: {
        [varName: string]: any;
    };
    redraw: (sharedVars: {
        [name: string]: any;
    }, scales: {
        [name: string]: helpers.Transformation;
    }, services: InteractionService[]) => void;
    preInitialize: <T>(layer: Layer<T>) => void;
    postInitialize: <T>(layer: Layer<T>) => void;
    preUpdate: <T>(layer: Layer<T>) => void;
    postUpdate: <T>(layer: Layer<T>) => void;
    [param: string]: any;
}>;
export declare type LayerInitOption = LayerInitRequiredOption & LayerPartialOption;
export declare type LayerRegisterOption = LayerRegisterRequiredOption & LayerPartialOption;
export default class Layer<T> {
    static register: (baseName: string, options: LayerRegisterOption) => void;
    static initialize: <T>(baseName: string, options: LayerInitOption) => Layer<T>;
    static findLayer: (baseNameOrRealName: string) => Layer<any>[];
    _baseName: string;
    _name: string;
    _userOptions: LayerInitOption;
    _transformation: {
        [scaleName: string]: helpers.Transformation;
    };
    _services: (string | InteractionService | {
        service: string | InteractionService;
        options: any;
    })[];
    _serviceInstances: InteractionService[];
    _graphic: T;
    _container: HTMLElement;
    _sharedVar: {
        [varName: string]: any;
    };
    _order: number;
    _redraw?: (sharedVars: {
        [name: string]: any;
    }, scales: {
        [name: string]: helpers.Transformation;
    }, services: InteractionService[]) => void;
    _preInitialize?: <T>(layer: Layer<T>) => void;
    _postInitialize?: <T>(layer: Layer<T>) => void;
    _preUpdate?: <T>(layer: Layer<T>) => void;
    _postUpdate?: <T>(layer: Layer<T>) => void;
    constructor(baseName: string, options: LayerInitOption);
    getGraphic(): T;
    getContainerGraphic(): HTMLElement;
    getVisualElements(): T[];
    cloneVisualElements(element: Element, deep?: boolean): Node;
    getSharedVar(sharedName: string, defaultValue?: any): any;
    setSharedVar(sharedName: string, value: any): void;
    getTransformation(scaleName: string, defaultValue?: helpers.Transformation): helpers.Transformation;
    setTransformation(scaleName: string, transformation: helpers.Transformation): void;
    redraw(): void;
    preUpdate(): void;
    postUpdate(): void;
    query(options: helpers.ArbitraryQuery): T[];
    _use(service: InteractionService, options?: any): void;
    use(service: string | InteractionService, options?: any): void;
    getSiblingLayer(siblingLayerName: string): Layer<T>;
    setLayersOrder(layerNameOrderKVPairs: {
        [key: string]: number;
    }): void;
    isInstanceOf(name: string): boolean;
    get services(): any;
}
export declare function register(baseName: string, options: LayerRegisterOption): void;
export declare function unregister(baseName: string): boolean;
export declare function initialize<T>(baseName: string, options?: LayerInitOption): Layer<T>;
export declare function findLayer(baseNameOrRealName: string): Layer<any>[];
export {};

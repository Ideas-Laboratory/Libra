import { Interactor } from "../interactor";
import * as helpers from "../helpers";
import { Command } from "../command";
import { Layer } from "../layer";
import { Service } from "../service";
import { GraphicalTransformer } from "../transformer";
type InstrumentInitOption = {
    name?: string;
    on?: {
        [action: string]: ((<T>(options: helpers.CommonHandlerInput<T>) => Promise<void> | void) | Command)[];
    };
    interactors?: (string | Interactor | {
        interactor: string | Interactor;
        options: any;
    })[];
    services?: (string | Service | {
        service: string | Service;
        options: any;
    })[];
    transformers?: GraphicalTransformer[];
    layers?: (Layer<any> | {
        layer: Layer<any>;
        options: any;
    })[];
    sharedVar?: {
        [varName: string]: any;
    };
    preInitialize?: (instrument: Instrument) => void;
    postInitialize?: (instrument: Instrument) => void;
    preAttach?: (instrument: Instrument, layer: Layer<any>) => void;
    postUse?: (instrument: Instrument, layer: Layer<any>) => void;
    [param: string]: any;
};
type InstrumentInitTemplate = InstrumentInitOption & {
    [param: string]: any;
    constructor?: typeof Instrument;
};
export declare const instanceInstruments: Instrument[];
export default class Instrument {
    _baseName: string;
    _name: string;
    _userOptions: InstrumentInitOption;
    _on: {
        [action: string]: ((<T>(options: helpers.CommonHandlerInput<T>) => Promise<void> | void) | Command)[];
    };
    _services: (string | Service | {
        service: string | Service;
        options: any;
    })[];
    _serviceInstances: Service[];
    _interactors: (Interactor | {
        interactor: Interactor;
        options: any;
    })[];
    _layers: (Layer<any> | {
        layer: Layer<any>;
        options: any;
    })[];
    _layerInteractors: Map<Layer<any>, Interactor[]>;
    _sharedVar: {
        [varName: string]: any;
    };
    _transformers: GraphicalTransformer[];
    _linkCache: {
        [linkProp: string]: any;
    };
    _preInitialize?: (instrument: Instrument) => void;
    _postInitialize?: (instrument: Instrument) => void;
    _preAttach?: (instrument: Instrument, layer: Layer<any>) => void;
    _postUse?: (instrument: Instrument, layer: Layer<any>) => void;
    [helpers.LibraSymbol]: boolean;
    constructor(baseName: string, options: InstrumentInitOption);
    emit(action: string, options?: helpers.CommonHandlerInput<this>): void;
    on(action: string | string[], feedforwardOrCommand: (<T>(options: helpers.CommonHandlerInput<T>) => Promise<void>) | Command): this;
    off(action: string, feedforwardOrCommand: (<T>(options: helpers.CommonHandlerInput<T>) => Promise<void>) | Command): this;
    _use(service: Service, options?: any): void;
    useService(service: string | Service, options?: any): void;
    useInteractor(interactor: Interactor, options?: any): void;
    attach(layer: Layer<any>, options?: any): void;
    getSharedVar(sharedName: string, options?: any): any;
    setSharedVar(sharedName: string, value: any, options?: any): void;
    watchSharedVar(sharedName: string, handler: Command): void;
    preAttach(layer: Layer<any>, options: any): void;
    _dispatch(layer: Layer<any>, event: string, e: Event): Promise<void>;
    postUse(layer: Layer<any>): void;
    isInstanceOf(name: string): boolean;
    get services(): any;
    get transformers(): any;
    static register(baseName: string, options: InstrumentInitTemplate): void;
    static unregister(baseName: string): boolean;
    static initialize(baseName: string, options?: InstrumentInitOption): Instrument;
    static findInstrument(baseNameOrRealName: string): Instrument[];
}
export declare const register: typeof Instrument.register;
export declare const unregister: typeof Instrument.unregister;
export declare const initialize: typeof Instrument.initialize;
export declare const findInstrument: typeof Instrument.findInstrument;
export {};

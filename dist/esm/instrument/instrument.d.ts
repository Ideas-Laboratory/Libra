import { Interactor } from "../interactor";
import * as helpers from "../helpers";
import { Command } from "../command";
import { Layer } from "../layer";
declare type InstrumentInitOption = {
    name?: string;
    on?: {
        [action: string]: (<T>(options: helpers.CommonHandlerInput<T>) => void) | Command;
    };
    interactors?: (Interactor | {
        interactor: Interactor;
        options: any;
    })[];
    layers?: (Layer<any> | {
        layer: Layer<any>;
        options: any;
    })[];
    sharedVar?: {
        [varName: string]: any;
    };
    preInitialize?: (instrument: Instrument) => void;
    postInitialize?: (instrument: Instrument) => void;
    preUse?: (instrument: Instrument, layer: Layer<any>) => void;
    postUse?: (instrument: Instrument, layer: Layer<any>) => void;
    [param: string]: any;
};
interface InstrumentConstructor {
    new (baseName: string, options: InstrumentInitOption): Instrument;
    register(baseName: string, options: InstrumentInitTemplate): void;
    unregister(baseName: string): boolean;
    initialize(baseName: string, options: InstrumentInitOption): Instrument;
    findService(baseNameOrRealName: string): Instrument[];
}
declare type InstrumentInitTemplate = InstrumentInitOption & {
    constructor?: InstrumentConstructor;
};
export default class Instrument {
    _baseName: string;
    _name: string;
    _userOptions: InstrumentInitOption;
    _on: {
        [action: string]: (<T>(options: helpers.CommonHandlerInput<T>) => void) | Command;
    };
    _interactors: (Interactor | {
        interactor: Interactor;
        options: any;
    })[];
    _layers: (Layer<any> | {
        layer: Layer<any>;
        options: any;
    })[];
    _sharedVar: {
        [varName: string]: any;
    };
    _preInitialize?: (instrument: Instrument) => void;
    _postInitialize?: (instrument: Instrument) => void;
    _preUse?: (instrument: Instrument, layer: Layer<any>) => void;
    _postUse?: (instrument: Instrument, layer: Layer<any>) => void;
    constructor(baseName: string, options: InstrumentInitOption);
    on(action: string, feedforwardOrCommand: (<T>(options: helpers.CommonHandlerInput<T>) => void) | Command): void;
    use(interactor: Interactor, options: any): void;
    attach(layer: Layer<any>, options: any): void;
    getSharedVar(sharedName: string, options: any): any;
    setSharedVar(sharedName: string, value: any, options: any): void;
    watchSharedVar(sharedName: string, handler: Command): void;
    preUse(layer: Layer<any>): void;
    postUse(layer: Layer<any>): void;
    isInstanceOf(name: string): boolean;
}
export declare function register(baseName: string, options: InstrumentInitTemplate): void;
export declare function unregister(baseName: string): boolean;
export declare function initialize(baseName: string, options: InstrumentInitOption): Instrument;
export declare function findInstrument(baseNameOrRealName: string): Instrument[];
export {};

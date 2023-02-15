import { Command } from "../command";
import { Instrument } from "../instrument";
import { Layer } from "../layer";
import * as helpers from "../helpers";
import { GraphicalTransformer } from "../transformer";
type ServiceInitOption = {
    name?: string;
    on?: {
        [action: string]: ((<T>(options: helpers.CommonHandlerInput<T>) => Promise<void> | void) | Command)[];
    };
    layer?: Layer<any>;
    sharedVar?: {
        [key: string]: any;
    };
    transformers?: GraphicalTransformer[];
    joinTransformers?: GraphicalTransformer[];
    services?: Service[];
    joinServices?: Service[];
    resultAlias?: string;
    preInitialize?: (service: Service) => void;
    postInitialize?: (service: Service) => void;
    preUpdate?: (service: Service) => void;
    postUpdate?: (service: Service) => void;
    preAttach?: (service: Service, instrument: Instrument) => void;
    postUse?: (service: Service, instrument: Instrument) => void;
    [param: string]: any;
};
type ServiceInitTemplate = ServiceInitOption & {
    [param: string]: any;
    constructor?: typeof Service;
};
export declare const instanceServices: Service[];
export default class Service {
    _baseName: string;
    _name: string;
    _userOptions: ServiceInitOption;
    _sharedVar: {
        [key: string]: any;
    };
    _linkCache: {
        [linkProp: string]: any;
    };
    _preInitialize?: (service: Service) => void;
    _postInitialize?: (service: Service) => void;
    _preUpdate?: (service: Service) => void;
    _postUpdate?: (service: Service) => void;
    _preAttach?: (service: Service, instrument: Instrument) => void;
    _postUse?: (service: Service, instrument: Instrument) => void;
    _layerInstances: Layer<any>[];
    _transformers: GraphicalTransformer[];
    _joinTransformers: GraphicalTransformer[];
    _services: Service[];
    _joinServices: Service[];
    _resultAlias: string;
    _initializing: Promise<void>;
    _nextTick: number;
    _computing: Promise<any>;
    _result: any;
    _oldResult: any;
    [helpers.LibraSymbol]: boolean;
    constructor(baseName: string, options: ServiceInitOption);
    getSharedVar(sharedName: string, options?: any): any;
    setSharedVar(sharedName: string, value: any, options?: any): Promise<void>;
    setSharedVars(obj: any, options: any): Promise<void>;
    join(): Promise<void>;
    preUpdate(): void;
    postUpdate(): void;
    preAttach(instrument: Instrument): void;
    postUse(instrument: Instrument): void;
    isInstanceOf(name: string): boolean;
    get transformers(): any;
    get services(): any;
    get _internalResults(): any;
    get results(): any;
    get oldResults(): any;
    static register(baseName: string, options: ServiceInitTemplate): void;
    static unregister(baseName: string): boolean;
    static initialize(baseName: string, options?: ServiceInitOption): Service;
    static findService(baseNameOrRealName: string): Service[];
}
export declare const register: typeof Service.register;
export declare const unregister: typeof Service.unregister;
export declare const initialize: typeof Service.initialize;
export declare const findService: typeof Service.findService;
export {};

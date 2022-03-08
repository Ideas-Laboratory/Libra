import { Command } from "../command";
import { Instrument } from "../instrument";
import { Layer } from "../layer";
import * as helpers from "../helpers";
import { GraphicalTransformer } from "../transformer";
declare type ServiceInitOption = {
    name?: string;
    on?: {
        [action: string]: ((<T>(options: helpers.CommonHandlerInput<T>) => Promise<void> | void) | Command)[];
    };
    layer?: Layer<any>;
    sharedVar?: {
        [key: string]: any;
    };
    preInitialize?: (service: InteractionService) => void;
    postInitialize?: (service: InteractionService) => void;
    preUpdate?: (service: InteractionService) => void;
    postUpdate?: (service: InteractionService) => void;
    preAttach?: (service: InteractionService, instrument: Instrument) => void;
    postUse?: (service: InteractionService, instrument: Instrument) => void;
    [param: string]: any;
};
declare type ServiceInitTemplate = ServiceInitOption & {
    [param: string]: any;
    constructor?: typeof InteractionService;
};
export declare const instanceServices: InteractionService[];
export default class InteractionService {
    _baseName: string;
    _name: string;
    _userOptions: ServiceInitOption;
    _sharedVar: {
        [key: string]: any;
    };
    _preInitialize?: (service: InteractionService) => void;
    _postInitialize?: (service: InteractionService) => void;
    _preUpdate?: (service: InteractionService) => void;
    _postUpdate?: (service: InteractionService) => void;
    _preAttach?: (service: InteractionService, instrument: Instrument) => void;
    _postUse?: (service: InteractionService, instrument: Instrument) => void;
    _layerInstances: Layer<any>[];
    _transformers: GraphicalTransformer[];
    constructor(baseName: string, options: ServiceInitOption);
    getSharedVar(sharedName: string, options?: any): any;
    setSharedVar(sharedName: string, value: any, options?: any): Promise<void>;
    preUpdate(): void;
    postUpdate(): void;
    preAttach(instrument: Instrument): void;
    postUse(instrument: Instrument): void;
    isInstanceOf(name: string): boolean;
    get transformers(): any;
    static register(baseName: string, options: ServiceInitTemplate): void;
    static unregister(baseName: string): boolean;
    static initialize(baseName: string, options?: ServiceInitOption): InteractionService;
    static findService(baseNameOrRealName: string): InteractionService[];
}
export declare const register: typeof InteractionService.register;
export declare const unregister: typeof InteractionService.unregister;
export declare const initialize: typeof InteractionService.initialize;
export declare const findService: typeof InteractionService.findService;
export {};

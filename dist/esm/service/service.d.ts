import { Command } from "../command";
import { Layer } from "../layer";
declare type ServiceInitOption = {
    name?: string;
    on?: {
        [action: string]: Command[];
    };
    sharedVar?: {
        [key: string]: any;
    };
    preInitialize?: (service: InteractionService) => void;
    postInitialize?: (service: InteractionService) => void;
    preUpdate?: (service: InteractionService) => void;
    postUpdate?: (service: InteractionService) => void;
    preAttach?: (service: InteractionService, layer: Layer<any>) => void;
    postUse?: (service: InteractionService, layer: Layer<any>) => void;
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
    _on: {
        [action: string]: Command[];
    };
    _sharedVar: {
        [key: string]: any;
    };
    _preInitialize?: (service: InteractionService) => void;
    _postInitialize?: (service: InteractionService) => void;
    _preUpdate?: (service: InteractionService) => void;
    _postUpdate?: (service: InteractionService) => void;
    _preAttach?: (service: InteractionService, layer: Layer<any>) => void;
    _postUse?: (service: InteractionService, layer: Layer<any>) => void;
    _layerInstances: Layer<any>[];
    constructor(baseName: string, options: ServiceInitOption);
    on(action: string, command: Command): void;
    getSharedVar(sharedName: string, options?: any): any;
    setSharedVar(sharedName: string, value: any, options?: any): Promise<void>;
    watchSharedVar(sharedName: string, handler: Command): void;
    preUpdate(): void;
    postUpdate(): void;
    preAttach(layer: Layer<any>): void;
    postUse(layer: Layer<any>): void;
    isInstanceOf(name: string): boolean;
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

import { Command } from "../command";
import { Layer } from "../layer";
declare type ServiceInitOption = {
    name?: string;
    on?: {
        [action: string]: Command;
    };
    sharedVar?: {
        [key: string]: any;
    };
    preInitialize?: (service: InteractionService) => void;
    postInitialize?: (service: InteractionService) => void;
    preUpdate?: (service: InteractionService) => void;
    postUpdate?: (service: InteractionService) => void;
    preUse?: (service: InteractionService, layer: Layer<any>) => void;
    postUse?: (service: InteractionService, layer: Layer<any>) => void;
    [param: string]: any;
};
interface ServiceConstructor {
    new (baseName: string, options: ServiceInitOption): InteractionService;
    register(baseName: string, options: ServiceInitTemplate): void;
    unregister(baseName: string): boolean;
    initialize(baseName: string, options: ServiceInitOption): InteractionService;
    findService(baseNameOrRealName: string): InteractionService[];
}
declare type ServiceInitTemplate = ServiceInitOption & {
    constructor?: ServiceConstructor;
};
export default class InteractionService {
    _baseName: string;
    _name: string;
    _userOptions: ServiceInitOption;
    _on: {
        [action: string]: Command;
    };
    _sharedVar: {
        [key: string]: any;
    };
    _preInitialize?: (service: InteractionService) => void;
    _postInitialize?: (service: InteractionService) => void;
    _preUpdate?: (service: InteractionService) => void;
    _postUpdate?: (service: InteractionService) => void;
    _preUse?: (service: InteractionService, layer: Layer<any>) => void;
    _postUse?: (service: InteractionService, layer: Layer<any>) => void;
    _layerInstances: Layer<any>[];
    constructor(baseName: string, options: ServiceInitOption);
    on(action: string, command: Command): void;
    getSharedVar(sharedName: string, options: any): any;
    setSharedVar(sharedName: string, value: any, options: any): void;
    watchSharedVar(sharedName: string, handler: Command): void;
    preUpdate(): void;
    postUpdate(): void;
    preUse(layer: Layer<any>): void;
    postUse(layer: Layer<any>): void;
    isInstanceOf(name: string): boolean;
}
export declare function register(baseName: string, options: ServiceInitTemplate): void;
export declare function unregister(baseName: string): boolean;
export declare function initialize(baseName: string, options: ServiceInitOption): InteractionService;
export declare function findService(baseNameOrRealName: string): InteractionService[];
export {};

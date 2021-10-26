import { Instrument } from "../instrument";
import * as helpers from "../helpers";
declare type SideEffect = (options: helpers.CommonHandlerInput<any>) => void;
declare type InteractorInnerAction = {
    action: string;
    events: string[];
    transition?: [string, string][];
    sideEffect?: SideEffect;
};
declare type InteractorInitOption = {
    name?: string;
    state: string;
    actions?: InteractorInnerAction[];
    preInitialize?: (interactor: Interactor) => void;
    postInitialize?: (interactor: Interactor) => void;
    preUse?: (interactor: Interactor, instrument: Instrument) => void;
    postUse?: (interactor: Interactor, instrument: Instrument) => void;
    [param: string]: any;
};
interface InteractorConstructor {
    new (baseName: string, options: InteractorInitOption): Interactor;
    register(baseName: string, options: InteractorInitTemplate): void;
    unregister(baseName: string): boolean;
    initialize(baseName: string, options: InteractorInitOption): Interactor;
    findService(baseNameOrRealName: string): Interactor[];
}
declare type InteractorInitTemplate = InteractorInitOption & {
    constructor?: InteractorConstructor;
};
export default class Interactor {
    _baseName: string;
    _name: string;
    _userOptions: InteractorInitOption;
    _state: string;
    _actions: InteractorInnerAction[];
    _preInitialize?: (interactor: Interactor) => void;
    _postInitialize?: (interactor: Interactor) => void;
    _preUse?: (interactor: Interactor, instrument: Instrument) => void;
    _postUse?: (interactor: Interactor, instrument: Instrument) => void;
    constructor(baseName: string, options: InteractorInitOption);
    getActions(): InteractorInnerAction[];
    setActions(actions: InteractorInnerAction[]): void;
    _parseEvent(event: string): any[];
    getAcceptEvents(): string[];
    dispatch(event: string): void;
    preUse(instrument: Instrument): void;
    postUse(instrument: Instrument): void;
    isInstanceOf(name: string): boolean;
}
export declare function register(baseName: string, options: InteractorInitTemplate): void;
export declare function unregister(baseName: string): boolean;
export declare function initialize(baseName: string, options: InteractorInitOption): Interactor;
export declare function findInteractor(baseNameOrRealName: string): Interactor[];
export {};

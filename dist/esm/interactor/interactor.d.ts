import { Instrument } from "../instrument";
import * as helpers from "../helpers";
import { Layer } from "../layer";
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
declare type InteractorInitTemplate = InteractorInitOption & {
    [param: string]: any;
    constructor?: typeof Interactor;
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
    dispatch(event: string | Event, layer?: Layer<any>): void;
    preUse(instrument: Instrument): void;
    postUse(instrument: Instrument): void;
    isInstanceOf(name: string): boolean;
    static register(baseName: string, options: InteractorInitTemplate): void;
    static unregister(baseName: string): boolean;
    static initialize(baseName: string, options?: InteractorInitOption): Interactor;
    static findInteractor(baseNameOrRealName: string): Interactor[];
}
export declare const register: typeof Interactor.register;
export declare const unregister: typeof Interactor.unregister;
export declare const initialize: typeof Interactor.initialize;
export declare const findInteractor: typeof Interactor.findInteractor;
export {};

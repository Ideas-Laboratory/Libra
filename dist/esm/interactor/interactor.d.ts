import { Instrument } from "../instrument";
import * as helpers from "../helpers";
import { Layer } from "../layer";
type SideEffect = (options: helpers.CommonHandlerInput<any>) => Promise<void>;
type OriginInteractorInnerAction = {
    action: string;
    events: string[];
    transition?: [string, string][];
    sideEffect?: SideEffect;
};
type EventFilterFunc = (event: Event) => boolean;
type LibraEventStream = helpers.EventStream & {
    filterFuncs?: EventFilterFunc[];
};
type InteractorInnerAction = OriginInteractorInnerAction & {
    eventStreams: LibraEventStream[];
};
type InteractorInitOption = {
    name?: string;
    state: string;
    actions?: OriginInteractorInnerAction[];
    preInitialize?: (interactor: Interactor) => void;
    postInitialize?: (interactor: Interactor) => void;
    preUse?: (interactor: Interactor, instrument: Instrument) => void;
    postUse?: (interactor: Interactor, instrument: Instrument) => void;
    [param: string]: any;
};
type InteractorInitTemplate = InteractorInitOption & {
    [param: string]: any;
    constructor?: typeof Interactor;
};
export declare const instanceInteractors: Interactor[];
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
    _modalities: {
        [key: string]: any;
    };
    [helpers.LibraSymbol]: boolean;
    constructor(baseName: string, options: InteractorInitOption);
    enableModality(modal: "speech"): void;
    disableModality(modal: "speech"): void;
    getActions(): InteractorInnerAction[];
    setActions(actions: InteractorInnerAction[]): void;
    _parseEvent(event: string): any[];
    getAcceptEvents(): string[];
    dispatch(event: string | Event, layer?: Layer<any>): Promise<boolean>;
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

import * as InstrumentConstructor from "./interactor";
import InteractorClass from "./interactor";
import "./builtin";
export default InteractorClass;
export declare const register: typeof InstrumentConstructor.default.register;
export declare const initialize: typeof InstrumentConstructor.default.initialize;
export declare const findInteractor: typeof InstrumentConstructor.default.findInteractor;
export declare const instanceInteractors: InstrumentConstructor.default[];
export declare const Interactor: typeof InstrumentConstructor.default;
export type Interactor = InteractorClass;

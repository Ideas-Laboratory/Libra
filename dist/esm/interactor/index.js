import * as InstrumentConstructor from "./interactor";
import InteractorClass from "./interactor";
import "./builtin";
export default InteractorClass;
export const register = InteractorClass.register;
export const initialize = InteractorClass.initialize;
export const findInteractor = InteractorClass.findInteractor;
export const instanceInteractors = InstrumentConstructor.instanceInteractors;
export const Interactor = InteractorClass;

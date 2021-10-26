import * as InteractorConstructor from "./interactor";
import InteractorClass from "./interactor";

export default InteractorClass;
export const register = InteractorConstructor.register;
export const initialize = InteractorConstructor.initialize;
export const findInteractor = InteractorConstructor.findInteractor;
export const Interactor = InteractorClass;
export type Interactor = InteractorClass;

import * as ServiceConstructor from "./service";
import ServiceClass from "./service";
import "./selectionManager";
import "./crossSelectionManager";
import "./algorithmManager";

export default ServiceClass;
export const register = ServiceConstructor.register;
export const initialize = ServiceConstructor.initialize;
export const findService = ServiceConstructor.findService;
export const instanceServices = ServiceConstructor.instanceServices;
export type InteractionService = ServiceClass;
export const InteractionService = ServiceClass;

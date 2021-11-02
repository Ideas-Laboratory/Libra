import * as ServiceConstructor from "./service";
import ServiceClass from "./service";
import "./selectionManager";
export default ServiceClass;
export const register = ServiceConstructor.register;
export const initialize = ServiceConstructor.initialize;
export const findService = ServiceConstructor.findService;
export const InteractionService = ServiceClass;

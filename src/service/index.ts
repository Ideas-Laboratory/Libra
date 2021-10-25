import * as ServiceConstructor from "./service";
import ServiceClass from "./service";

export default ServiceClass;
export const register = ServiceConstructor.register;
export const initialize = ServiceConstructor.initialize;
export const findService = ServiceConstructor.findService;
export type InteractionService = ServiceClass;
export const InteractionService = ServiceClass;

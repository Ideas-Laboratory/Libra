import * as ServiceConstructor from "./service";
import ServiceClass from "./service";

export default ServiceClass;
export const register = ServiceConstructor.register;
export const initialize = ServiceConstructor.initialize;
export const findService = ServiceConstructor.findService;
export type ExternalService = ServiceClass;
export const ExternalService = ServiceClass;

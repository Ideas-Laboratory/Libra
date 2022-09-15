import * as ServiceConstructor from "./service";
import ServiceClass from "./service";
import "./selectionService";
import "./crossSelectionService";
import "./layoutService";
import "./algorithmService";

export default ServiceClass;
export const register = ServiceConstructor.register;
export const initialize = ServiceConstructor.initialize;
export const findService = ServiceConstructor.findService;
export const instanceServices = ServiceConstructor.instanceServices;
export type Service = ServiceClass;
export const Service = ServiceClass;

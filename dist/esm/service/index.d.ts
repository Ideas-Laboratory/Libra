import * as ServiceConstructor from "./service";
import ServiceClass from "./service";
export default ServiceClass;
export declare const register: typeof ServiceConstructor.default.register;
export declare const initialize: typeof ServiceConstructor.default.initialize;
export declare const findService: typeof ServiceConstructor.default.findService;
export declare type InteractionService = ServiceClass;
export declare const InteractionService: typeof ServiceConstructor.default;

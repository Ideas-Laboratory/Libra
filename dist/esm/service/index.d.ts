import * as ServiceConstructor from "./service";
import ServiceClass from "./service";
import "./selectionManager";
import "./crossSelectionManager";
import "./algorithmManager";
export default ServiceClass;
export declare const register: typeof ServiceConstructor.default.register;
export declare const initialize: typeof ServiceConstructor.default.initialize;
export declare const findService: typeof ServiceConstructor.default.findService;
export declare const instanceServices: ServiceConstructor.default[];
export declare type InteractionService = ServiceClass;
export declare const InteractionService: typeof ServiceConstructor.default;

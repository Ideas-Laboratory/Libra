import * as LayerConstructor from "./layer";
import LayerClass from "./layer";
export default LayerClass;
export declare const register: typeof LayerConstructor.register;
export declare const initialize: typeof LayerConstructor.initialize;
export declare const findLayer: typeof LayerConstructor.findLayer;
export declare type Layer<T> = LayerClass<T>;
export declare const Layer: typeof LayerConstructor.default;

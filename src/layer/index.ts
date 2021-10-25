import * as LayerConstructor from "./layer";
import LayerClass from "./layer";

export default LayerClass;
export const register = LayerConstructor.register;
export const initialize = LayerConstructor.initialize;
export const findLayer = LayerConstructor.findLayer;
export type Layer<T> = LayerClass<T>;
export const Layer = LayerClass;

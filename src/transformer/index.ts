import * as TransformerConstructor from "./transformer";
import TransformerClass from "./transformer";
import "./builtin";

export default TransformerClass;
export const register = TransformerConstructor.register;
export const initialize = TransformerConstructor.initialize;
export const findTransformer = TransformerConstructor.findTransformer;
export const instanceTransformers = TransformerConstructor.instanceTransformers;
export type GraphicalTransformer = TransformerClass;
export const GraphicalTransformer = TransformerClass;

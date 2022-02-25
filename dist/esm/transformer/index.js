import * as TransformerConstructor from "./transformer";
import TransformerClass from "./transformer";
export default TransformerClass;
export const register = TransformerConstructor.register;
export const initialize = TransformerConstructor.initialize;
export const findTransformer = TransformerConstructor.findTransformer;
export const GraphicalTransformer = TransformerClass;

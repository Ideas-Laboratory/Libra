import * as TransformerConstructor from "./transformer";
import TransformerClass from "./transformer";
import "./builtin";
export default TransformerClass;
export declare const register: typeof TransformerConstructor.default.register;
export declare const initialize: typeof TransformerConstructor.default.initialize;
export declare const findTransformer: typeof TransformerConstructor.default.findTransformer;
export declare type GraphicalTransformer = TransformerClass;
export declare const GraphicalTransformer: typeof TransformerConstructor.default;

import * as InstrumentConstructor from "./instrument";
import InstrumentClass from "./instrument";
import "./builtin";
export default InstrumentClass;
export declare const register: typeof InstrumentConstructor.default.register;
export declare const initialize: typeof InstrumentConstructor.default.initialize;
export declare const findInstrument: typeof InstrumentConstructor.default.findInstrument;
export declare const Instrument: typeof InstrumentConstructor.default;
export declare type Instrument = InstrumentClass;

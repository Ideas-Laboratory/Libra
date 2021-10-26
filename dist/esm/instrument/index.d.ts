import * as InstrumentConstructor from "./instrument";
import InstrumentClass from "./instrument";
export default InstrumentClass;
export declare const register: typeof InstrumentConstructor.register;
export declare const initialize: typeof InstrumentConstructor.initialize;
export declare const findInstrument: typeof InstrumentConstructor.findInstrument;
export declare const Instrument: typeof InstrumentConstructor.default;
export declare type Instrument = InstrumentClass;

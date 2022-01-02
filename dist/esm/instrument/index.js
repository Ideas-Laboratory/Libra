import * as InstrumentConstructor from "./instrument";
import InstrumentClass from "./instrument";
import "./builtin";
export default InstrumentClass;
export const register = InstrumentConstructor.register;
export const initialize = InstrumentConstructor.initialize;
export const findInstrument = InstrumentConstructor.findInstrument;
export const Instrument = InstrumentClass;

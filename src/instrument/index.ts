import * as InstrumentConstructor from "./instrument";
import InstrumentClass from "./instrument";

export default InstrumentClass;
export const register = InstrumentConstructor.register;
export const initialize = InstrumentConstructor.initialize;
export const findInstrument = InstrumentConstructor.findInstrument;
export const Instrument = InstrumentClass;
export type Instrument = InstrumentClass;

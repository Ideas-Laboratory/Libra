import SelectionManager from "./query";
import Interactor from "./interactor";
import Instrument from "./instrument";
import Layer from "./layer";

export default {
  Layer,
  Instrument,
  SelectionManager,
  Interactor,
};

export { default as Layer } from "./layer";
export { default as Instrument } from "./instrument";
export { default as SelectionManager } from "./query";
export { default as Interactor } from "./interactor";

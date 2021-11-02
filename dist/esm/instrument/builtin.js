import Interactor from "../interactor";
import Instrument from "./instrument";
const mousePositionInteractor = Interactor.initialize("MousePositionInteractor");
Instrument.register("HoverInstrument", {
    constructor: Instrument,
    interactors: [mousePositionInteractor],
});

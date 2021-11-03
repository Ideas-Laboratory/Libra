import Interactor from "../interactor";
import Instrument from "./instrument";

const mousePositionInteractor = Interactor.initialize(
  "MousePositionInteractor"
);

Instrument.register("HoverInstrument", {
  constructor: Instrument,
  interactors: [mousePositionInteractor],
  on: {
    hover: [
      ({ event, layer }) => {
        layer.services.find("SelectionManager").forEach((service) => {
          service.setSharedVar("x", event.clientX);
          service.setSharedVar("y", event.clientY);
        });
      },
    ],
  },
  preUse: (instrument, layer) => {
    // Create default SM on layer
    layer.services.find("SelectionManager", "SurfacePointSelectionManager");
  },
});

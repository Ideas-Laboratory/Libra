import Interactor from "../interactor";
import Instrument from "./instrument";

const mousePositionInteractor = Interactor.initialize(
  "MousePositionInteractor"
);
const mouseTraceInteractor = Interactor.initialize("MouseTraceInteractor");

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

Instrument.register("BrushInstrument", {
  constructor: Instrument,
  interactors: [mouseTraceInteractor],
  on: {
    dragstart: [
      ({ event, layer }) => {
        layer.services.find("SelectionManager").forEach((service) => {
          service.setSharedVar("x", event.clientX);
          service.setSharedVar("y", event.clientY);
          service.setSharedVar("width", 1);
          service.setSharedVar("height", 1);
          service.setSharedVar("startx", event.clientX);
          service.setSharedVar("starty", event.clientY);
          service.setSharedVar("currentx", event.clientX);
          service.setSharedVar("currenty", event.clientY);
          const transientLayer = layer.getSiblingLayer("transientLayer");
          transientLayer.getGraphic().innerHTML = "";
        });
      },
    ],
    drag: [
      ({ event, layer }) => {
        layer.services.find("SelectionManager").forEach((service) => {
          const startx = service.getSharedVar("startx");
          const starty = service.getSharedVar("starty");
          service.setSharedVar("x", Math.min(event.clientX, startx));
          service.setSharedVar("y", Math.min(event.clientY, starty));
          service.setSharedVar("width", Math.abs(event.clientX - startx));
          service.setSharedVar("height", Math.abs(event.clientY - starty));
          service.setSharedVar("currentx", event.clientX);
          service.setSharedVar("currenty", event.clientY);
          const baseBBox = layer.getContainerGraphic().getBoundingClientRect();
          const transientLayer = layer.getSiblingLayer("transientLayer");
          transientLayer.getGraphic().innerHTML = `<rect x=${
            Math.min(event.clientX, startx) - baseBBox.x
          } y=${Math.min(event.clientY, starty) - baseBBox.y} width=${Math.abs(
            event.clientX - startx
          )} height=${Math.abs(
            event.clientY - starty
          )} class="transientRect" fill="#000" opacity="0.3" />`;
        });
      },
    ],
    dragend: [
      ({ event, layer }) => {
        layer.services.find("SelectionManager").forEach((service) => {
          // service.setSharedVar("x", 0);
          // service.setSharedVar("y", 0);
          // service.setSharedVar("width", 0);
          // service.setSharedVar("height", 0);
          service.setSharedVar("currentx", event.clientX);
          service.setSharedVar("currenty", event.clientY);
          service.setSharedVar("endx", event.clientX);
          service.setSharedVar("endy", event.clientY);
          const transientLayer = layer.getSiblingLayer("transientLayer");
          transientLayer.getGraphic().innerHTML = "";
        });
      },
    ],
    dragabort: [
      ({ event, layer }) => {
        layer.services.find("SelectionManager").forEach((service) => {
          service.setSharedVar("x", 0);
          service.setSharedVar("y", 0);
          service.setSharedVar("width", 0);
          service.setSharedVar("height", 0);
          service.setSharedVar("currentx", event.clientX);
          service.setSharedVar("currenty", event.clientY);
          service.setSharedVar("endx", event.clientX);
          service.setSharedVar("endy", event.clientY);
          const transientLayer = layer.getSiblingLayer("transientLayer");
          transientLayer.getGraphic().innerHTML = "";
        });
      },
    ],
  },
  preUse: (instrument, layer) => {
    // Create default SM on layer
    layer.services.find("SelectionManager", "RectSelectionManager");
  },
});

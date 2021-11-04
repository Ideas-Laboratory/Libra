import Interactor from "../interactor";
import Instrument from "./instrument";

Instrument.register("HoverInstrument", {
  constructor: Instrument,
  interactors: ["MousePositionInteractor"],
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
  interactors: ["MouseTraceInteractor"],
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
          const baseBBox = layer.getGraphic().getBoundingClientRect();
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

Instrument.register("BrushXInstrument", {
  constructor: Instrument,
  interactors: ["MouseTraceInteractor"],
  on: {
    dragstart: [
      ({ event, layer }) => {
        layer.services.find("SelectionManager").forEach((service) => {
          const baseBBox = layer.getGraphic().getBoundingClientRect();
          service.setSharedVar("x", event.clientX);
          service.setSharedVar("y", baseBBox.y);
          service.setSharedVar("width", 1);
          service.setSharedVar("height", baseBBox.height);
          service.setSharedVar("startx", event.clientX);
          service.setSharedVar("currentx", event.clientX);
          const transientLayer = layer.getSiblingLayer("transientLayer");
          transientLayer.getGraphic().innerHTML = "";
        });
      },
    ],
    drag: [
      ({ event, layer }) => {
        layer.services.find("SelectionManager").forEach((service) => {
          const startx = service.getSharedVar("startx");
          service.setSharedVar("x", Math.min(event.clientX, startx));
          service.setSharedVar("width", Math.abs(event.clientX - startx));
          service.setSharedVar("currentx", event.clientX);
          const baseBBox = layer.getGraphic().getBoundingClientRect();
          const transientLayer = layer.getSiblingLayer("transientLayer");
          // const matrix = matrixParse.fromElement(layer.getGraphic());
          transientLayer.getGraphic().innerHTML = `<rect x="${
            Math.min(event.clientX, startx) - baseBBox.x
          }" y="0" width="${Math.abs(event.clientX - startx)}" height="${
            baseBBox.height
          }" class="transientRect" fill="#000" opacity="0.3" />`;
        });
      },
    ],
    dragend: [
      ({ event, layer }) => {
        layer.services.find("SelectionManager").forEach((service) => {
          service.setSharedVar("currentx", event.clientX);
          service.setSharedVar("endx", event.clientX);
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
          service.setSharedVar("endx", event.clientX);
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

Instrument.register("HelperBarInstrument", {
  constructor: Instrument,
  interactors: ["MousePositionInteractor"],
  on: {
    hover: [
      ({ event, layer, instrument }) => {
        console.log("hover");
        const height = layer.getSharedVar("height", 100);
        const transientLayer = layer.getSiblingLayer("transientLayer");
        const helperBar = transientLayer.getGraphic().querySelector("line");
        helperBar.setAttribute("x1", event.offsetX-50);
        helperBar.setAttribute("x2", event.offsetX-50);
        instrument.setSharedVar("barX", event.offsetX-50, {});
      },
    ],
  },
  preUse: function (instrument, layer) {
    console.log("preuse");
    const height = layer.getSharedVar("height", 100);
    const transientLayer = layer.getSiblingLayer("transientLayer");
    const helperBar = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line"
    );
    helperBar.setAttribute("x1", "0");
    helperBar.setAttribute("y1", "0");
    helperBar.setAttribute("x2", "0");
    helperBar.setAttribute("y2", `${height}`);
    helperBar.setAttribute("stroke", `black`);
    helperBar.setAttribute("stroke-width", `1px`);
    (transientLayer.getGraphic() as SVGGElement).append(helperBar);
  },
});

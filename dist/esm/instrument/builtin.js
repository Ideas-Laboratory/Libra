import Instrument from "./instrument";
import { getTransform } from "../helpers";
Instrument.register("HoverInstrument", {
    constructor: Instrument,
    interactors: ["MousePositionInteractor", "TouchPositionInteractor"],
    on: {
        hover: [
            ({ event, layer }) => {
                if (event.changedTouches)
                    event = event.changedTouches[0];
                layer.services.find("SelectionService").forEach((service) => {
                    service.setSharedVar("x", event.clientX, { layer });
                    service.setSharedVar("y", event.clientY, { layer });
                });
            },
        ],
    },
    preAttach: (instrument, layer) => {
        // Create default SM on layer
        layer.services.find("SelectionService", "SurfacePointSelectionService");
    },
});
Instrument.register("BrushInstrument", {
    constructor: Instrument,
    interactors: ["MouseTraceInteractor", "TouchTraceInteractor"],
    on: {
        dragstart: [
            ({ event, layer, instrument }) => {
                if (event.changedTouches)
                    event = event.changedTouches[0];
                layer.services.find("SelectionService").forEach((service) => {
                    service.setSharedVar("x", event.clientX, { layer });
                    service.setSharedVar("y", event.clientY, { layer });
                    service.setSharedVar("width", 1, { layer });
                    service.setSharedVar("height", 1, { layer });
                    service.setSharedVar("startx", event.clientX, { layer });
                    service.setSharedVar("starty", event.clientY, { layer });
                    service.setSharedVar("currentx", event.clientX, { layer });
                    service.setSharedVar("currenty", event.clientY, { layer });
                    const transientLayer = layer.getSiblingLayer("transientLayer");
                    transientLayer.getGraphic().innerHTML = "";
                });
                instrument.setSharedVar("startx", event.clientX);
                instrument.setSharedVar("starty", event.clientY);
            },
        ],
        drag: [
            ({ event, layer, instrument }) => {
                if (event.changedTouches)
                    event = event.changedTouches[0];
                layer.services.find("SelectionService").forEach((service) => {
                    const startx = service.getSharedVar("startx", { layer });
                    const starty = service.getSharedVar("starty", { layer });
                    service.setSharedVar("x", Math.min(event.clientX, startx), { layer });
                    service.setSharedVar("y", Math.min(event.clientY, starty), { layer });
                    service.setSharedVar("width", Math.abs(event.clientX - startx), {
                        layer,
                    });
                    service.setSharedVar("height", Math.abs(event.clientY - starty), {
                        layer,
                    });
                    service.setSharedVar("currentx", event.clientX, { layer });
                    service.setSharedVar("currenty", event.clientY, { layer });
                });
                const startx = instrument.getSharedVar("startx");
                const starty = instrument.getSharedVar("starty");
                const baseBBox = (layer.getGraphic().querySelector(".ig-layer-background") ||
                    layer.getGraphic()).getBoundingClientRect();
                const transientLayer = layer.getSiblingLayer("transientLayer");
                transientLayer.getGraphic().innerHTML = `<rect x=${Math.min(event.clientX, startx) - baseBBox.x} y=${Math.min(event.clientY, starty) - baseBBox.y} width=${Math.abs(event.clientX - startx)} height=${Math.abs(event.clientY - starty)} class="transientRect" fill="#000" opacity="0.3" />`;
            },
        ],
        dragend: [
            ({ event, layer, instrument }) => {
                if (event.changedTouches)
                    event = event.changedTouches[0];
                layer.services.find("SelectionService").forEach((service) => {
                    service.setSharedVar("currentx", event.clientX, { layer });
                    service.setSharedVar("currenty", event.clientY, { layer });
                    service.setSharedVar("endx", event.clientX, { layer });
                    service.setSharedVar("endy", event.clientY, { layer });
                });
                if (!instrument.getSharedVar("persistant")) {
                    const transientLayer = layer.getSiblingLayer("transientLayer");
                    transientLayer.getGraphic().innerHTML = "";
                }
            },
        ],
        dragabort: [
            ({ event, layer }) => {
                if (event.changedTouches)
                    event = event.changedTouches[0];
                layer.services.find("SelectionService").forEach((service) => {
                    service.setSharedVar("x", 0, { layer });
                    service.setSharedVar("y", 0, { layer });
                    service.setSharedVar("width", 0, { layer });
                    service.setSharedVar("height", 0, { layer });
                    service.setSharedVar("currentx", event.clientX, { layer });
                    service.setSharedVar("currenty", event.clientY, { layer });
                    service.setSharedVar("endx", event.clientX, { layer });
                    service.setSharedVar("endy", event.clientY, { layer });
                });
                const transientLayer = layer.getSiblingLayer("transientLayer");
                transientLayer.getGraphic().innerHTML = "";
            },
        ],
    },
    preAttach: (instrument, layer) => {
        // Create default SM on layer
        layer.services.find("SelectionService", "RectSelectionService");
    },
});
Instrument.register("BrushXInstrument", {
    constructor: Instrument,
    interactors: ["MouseTraceInteractor", "TouchTraceInteractor"],
    on: {
        dragstart: [
            ({ event, layer }) => {
                if (event.changedTouches)
                    event = event.changedTouches[0];
                layer.services.find("SelectionService").forEach((service) => {
                    const baseBBox = (layer.getGraphic().querySelector(".ig-layer-background") ||
                        layer.getGraphic()).getBoundingClientRect();
                    service.setSharedVar("x", event.clientX, { layer });
                    service.setSharedVar("y", baseBBox.y, { layer });
                    service.setSharedVar("width", 1, { layer });
                    service.setSharedVar("height", baseBBox.height, { layer });
                    service.setSharedVar("startx", event.clientX, { layer });
                    service.setSharedVar("currentx", event.clientX, { layer });
                    const transientLayer = layer.getSiblingLayer("transientLayer");
                    transientLayer.getGraphic().innerHTML = "";
                });
            },
        ],
        drag: [
            ({ event, layer }) => {
                if (event.changedTouches)
                    event = event.changedTouches[0];
                layer.services.find("SelectionService").forEach((service) => {
                    const startx = service.getSharedVar("startx", { layer });
                    service.setSharedVar("x", Math.min(event.clientX, startx), { layer });
                    service.setSharedVar("width", Math.abs(event.clientX - startx), {
                        layer,
                    });
                    service.setSharedVar("currentx", event.clientX, { layer });
                    const baseBBox = (layer.getGraphic().querySelector(".ig-layer-background") ||
                        layer.getGraphic()).getBoundingClientRect();
                    const transientLayer = layer.getSiblingLayer("transientLayer");
                    // const matrix = matrixParse.fromElement(layer.getGraphic());
                    transientLayer.getGraphic().innerHTML = `<rect x="${Math.min(event.clientX, startx) - baseBBox.x}" y="0" width="${Math.abs(event.clientX - startx)}" height="${baseBBox.height}" class="transientRect" fill="#000" opacity="0.3" />`;
                });
            },
        ],
        dragend: [
            ({ event, layer, instrument }) => {
                if (event.changedTouches)
                    event = event.changedTouches[0];
                layer.services.find("SelectionService").forEach((service) => {
                    service.setSharedVar("currentx", event.clientX, { layer });
                    service.setSharedVar("endx", event.clientX, { layer });
                    if (!instrument.getSharedVar("persistant")) {
                        const transientLayer = layer.getSiblingLayer("transientLayer");
                        transientLayer.getGraphic().innerHTML = "";
                    }
                });
            },
        ],
        dragabort: [
            ({ event, layer }) => {
                if (event.changedTouches)
                    event = event.changedTouches[0];
                layer.services.find("SelectionService").forEach((service) => {
                    service.setSharedVar("x", 0, { layer });
                    service.setSharedVar("y", 0, { layer });
                    service.setSharedVar("width", 0, { layer });
                    service.setSharedVar("height", 0, { layer });
                    service.setSharedVar("currentx", event.clientX, { layer });
                    service.setSharedVar("endx", event.clientX, { layer });
                    const transientLayer = layer.getSiblingLayer("transientLayer");
                    transientLayer.getGraphic().innerHTML = "";
                });
            },
        ],
    },
    preAttach: (instrument, layer) => {
        // Create default SM on layer
        layer.services.find("SelectionService", "RectSelectionService");
    },
});
Instrument.register("BrushYInstrument", {
    constructor: Instrument,
    interactors: ["MouseTraceInteractor", "TouchTraceInteractor"],
    on: {
        dragstart: [
            ({ event, layer }) => {
                if (event.changedTouches)
                    event = event.changedTouches[0];
                layer.services.find("SelectionService").forEach((service) => {
                    const baseBBox = (layer.getGraphic().querySelector(".ig-layer-background") ||
                        layer.getGraphic()).getBoundingClientRect();
                    service.setSharedVar("x", baseBBox.x, { layer });
                    service.setSharedVar("y", event.clientY, { layer });
                    service.setSharedVar("width", baseBBox.width, { layer });
                    service.setSharedVar("height", 1, { layer });
                    service.setSharedVar("starty", event.clientY, { layer });
                    service.setSharedVar("currenty", event.clientY, { layer });
                    const transientLayer = layer.getSiblingLayer("transientLayer");
                    transientLayer.getGraphic().innerHTML = "";
                });
            },
        ],
        drag: [
            ({ event, layer }) => {
                if (event.changedTouches)
                    event = event.changedTouches[0];
                layer.services.find("SelectionService").forEach((service) => {
                    const startx = service.getSharedVar("startx", { layer });
                    const starty = service.getSharedVar("starty", { layer });
                    service.setSharedVar("y", Math.min(event.clientY, starty), { layer });
                    service.setSharedVar("height", Math.abs(event.clientY - starty), {
                        layer,
                    });
                    service.setSharedVar("currenty", event.clientY, { layer });
                    const baseBBox = (layer.getGraphic().querySelector(".ig-layer-background") ||
                        layer.getGraphic()).getBoundingClientRect();
                    const transientLayer = layer.getSiblingLayer("transientLayer");
                    transientLayer.getGraphic().innerHTML = `<rect x=0 y=${Math.min(event.clientY, starty) - baseBBox.y} width=${baseBBox.width} height=${Math.abs(event.clientY - starty)} class="transientRect" fill="#000" opacity="0.3" />`;
                });
            },
        ],
        dragend: [
            ({ event, layer, instrument }) => {
                if (event.changedTouches)
                    event = event.changedTouches[0];
                layer.services.find("SelectionService").forEach((service) => {
                    service.setSharedVar("currenty", event.clientY, { layer });
                    service.setSharedVar("endy", event.clientY, { layer });
                    if (!instrument.getSharedVar("persistant")) {
                        const transientLayer = layer.getSiblingLayer("transientLayer");
                        transientLayer.getGraphic().innerHTML = "";
                    }
                });
            },
        ],
        dragabort: [
            ({ event, layer }) => {
                if (event.changedTouches)
                    event = event.changedTouches[0];
                layer.services.find("SelectionService").forEach((service) => {
                    service.setSharedVar("x", 0, { layer });
                    service.setSharedVar("y", 0, { layer });
                    service.setSharedVar("width", 0, { layer });
                    service.setSharedVar("height", 0, { layer });
                    service.setSharedVar("currentx", event.clientX, { layer });
                    service.setSharedVar("currenty", event.clientY, { layer });
                    service.setSharedVar("endx", event.clientX, { layer });
                    service.setSharedVar("endy", event.clientY, { layer });
                    const transientLayer = layer.getSiblingLayer("transientLayer");
                    transientLayer.getGraphic().innerHTML = "";
                });
            },
        ],
    },
    preAttach: (instrument, layer) => {
        // Create default SM on layer
        layer.services.find("SelectionService", "RectSelectionService");
    },
});
Instrument.register("HelperBarInstrument", {
    constructor: Instrument,
    interactors: ["MousePositionInteractor", "TouchPositionInteractor"],
    on: {
        hover: [
            ({ event, layer, instrument }) => {
                if (event.changedTouches)
                    event = event.changedTouches[0];
                const transientLayer = layer.getSiblingLayer("transientLayer");
                const helperBar = transientLayer.getGraphic().querySelector("line");
                helperBar.setAttribute("transform", `translate(${event.offsetX - 50}, 0)`);
                instrument.setSharedVar("barX", event.offsetX - 50, {});
            },
        ],
    },
    preAttach: function (instrument, layer) {
        const height = layer.getSharedVar("height", 100);
        const transientLayer = layer.getSiblingLayer("transientLayer");
        const helperBar = document.createElementNS("http://www.w3.org/2000/svg", "line");
        helperBar.setAttribute("x1", "0");
        helperBar.setAttribute("y1", "0");
        helperBar.setAttribute("x2", "0");
        helperBar.setAttribute("y2", `${height}`);
        helperBar.setAttribute("stroke", `black`);
        helperBar.setAttribute("stroke-width", `1px`);
        transientLayer.getGraphic().append(helperBar);
    },
});
Instrument.register("DataBrushInstrument", {
    constructor: Instrument,
    interactors: ["MouseTraceInteractor", "TouchTraceInteractor"],
    on: {
        dragstart: [
            ({ event, layer }) => {
                if (event.changedTouches)
                    event = event.changedTouches[0];
                layer.services.find("SelectionService").forEach((service) => {
                    service.setSharedVar("x", event.clientX, { layer });
                    service.setSharedVar("y", event.clientY, { layer });
                    service.setSharedVar("width", 1, { layer });
                    service.setSharedVar("height", 1, { layer });
                    service.setSharedVar("startx", event.clientX, { layer });
                    service.setSharedVar("starty", event.clientY, { layer });
                    service.setSharedVar("currentx", event.clientX, { layer });
                    service.setSharedVar("currenty", event.clientY, { layer });
                    service.setSharedVar("attrNameX", layer.getSharedVar("fieldX", service.getSharedVar("attrNameX", { layer })), { layer });
                    service.setSharedVar("attrNameY", layer.getSharedVar("fieldY", service.getSharedVar("attrNameY", { layer })), { layer });
                    service.setSharedVar("extentX", [0, 0], { layer });
                    service.setSharedVar("extentY", [0, 0], { layer });
                });
                const transientLayer = layer.getSiblingLayer("transientLayer");
                transientLayer.getGraphic().innerHTML = "";
            },
        ],
        drag: [
            ({ event, layer }) => {
                if (event.changedTouches)
                    event = event.changedTouches[0];
                layer.services.find("SelectionService").forEach((service) => {
                    const baseBBox = (layer.getGraphic().querySelector(".ig-layer-background") ||
                        layer.getGraphic()).getBoundingClientRect();
                    const startx = service.getSharedVar("startx", { layer });
                    const starty = service.getSharedVar("starty", { layer });
                    service.setSharedVar("x", Math.min(event.clientX, startx), { layer });
                    service.setSharedVar("y", Math.min(event.clientY, starty), { layer });
                    service.setSharedVar("width", Math.abs(event.clientX - startx), {
                        layer,
                    });
                    service.setSharedVar("height", Math.abs(event.clientY - starty), {
                        layer,
                    });
                    service.setSharedVar("extentX", [event.clientX, startx]
                        .map((x) => layer.getSharedVar("scaleX").invert(x - baseBBox.x))
                        .sort((a, b) => a - b), { layer });
                    service.setSharedVar("extentY", [event.clientY, starty]
                        .map((y) => layer.getSharedVar("scaleY").invert(y - baseBBox.y))
                        .sort((a, b) => a - b), { layer });
                    service.setSharedVar("currentx", event.clientX, { layer });
                    service.setSharedVar("currenty", event.clientY, { layer });
                    const transientLayer = layer.getSiblingLayer("transientLayer");
                    transientLayer.getGraphic().innerHTML = `<rect x=${Math.min(event.clientX, startx) - baseBBox.x} y=${Math.min(event.clientY, starty) - baseBBox.y} width=${Math.abs(event.clientX - startx)} height=${Math.abs(event.clientY - starty)} class="transientRect" fill="#000" opacity="0.3" />`;
                });
            },
        ],
        dragend: [
            ({ event, layer, instrument }) => {
                if (event.changedTouches)
                    event = event.changedTouches[0];
                layer.services.find("SelectionService").forEach((service) => {
                    // service.setSharedVar("x", 0, {layer});
                    // service.setSharedVar("y", 0, {layer});
                    // service.setSharedVar("width", 0, {layer});
                    // service.setSharedVar("height", 0, {layer});
                    service.setSharedVar("currentx", event.clientX, { layer });
                    service.setSharedVar("currenty", event.clientY, { layer });
                    service.setSharedVar("endx", event.clientX, { layer });
                    service.setSharedVar("endy", event.clientY, { layer });
                });
                if (!instrument.getSharedVar("persistant")) {
                    const transientLayer = layer.getSiblingLayer("transientLayer");
                    transientLayer.getGraphic().innerHTML = "";
                }
            },
        ],
        dragabort: [
            ({ event, layer }) => {
                if (event.changedTouches)
                    event = event.changedTouches[0];
                layer.services.find("SelectionService").forEach((service) => {
                    service.setSharedVar("x", 0, { layer });
                    service.setSharedVar("y", 0, { layer });
                    service.setSharedVar("width", 0, { layer });
                    service.setSharedVar("height", 0, { layer });
                    service.setSharedVar("currentx", event.clientX, { layer });
                    service.setSharedVar("currenty", event.clientY, { layer });
                    service.setSharedVar("endx", event.clientX, { layer });
                    service.setSharedVar("endy", event.clientY, { layer });
                    service.setSharedVar("extentX", undefined, { layer });
                    service.setSharedVar("extentY", undefined, { layer });
                });
                const transientLayer = layer.getSiblingLayer("transientLayer");
                transientLayer.getGraphic().innerHTML = "";
            },
        ],
    },
    preAttach: (instrument, layer) => {
        // Create default SM on layer
        layer.services.find("SelectionService", "RectSelectionService");
    },
});
Instrument.register("DataBrushXInstrument", {
    constructor: Instrument,
    interactors: ["MouseTraceInteractor"],
    on: {
        dragstart: [
            ({ event, layer }) => {
                if (event.changedTouches)
                    event = event.changedTouches[0];
                layer.services.find("SelectionService").forEach((service) => {
                    const baseBBox = (layer.getGraphic().querySelector(".ig-layer-background") ||
                        layer.getGraphic()).getBoundingClientRect();
                    service.setSharedVar("x", event.clientX, { layer });
                    service.setSharedVar("y", baseBBox.y, { layer });
                    service.setSharedVar("width", 1, { layer });
                    service.setSharedVar("height", baseBBox.height, { layer });
                    service.setSharedVar("startx", event.clientX, { layer });
                    service.setSharedVar("currentx", event.clientX, { layer });
                    service.setSharedVar("attrNameX", layer.getSharedVar("fieldX", service.getSharedVar("attrNameX", { layer })), { layer });
                    service.setSharedVar("extent", [0, 0], { layer });
                    const transientLayer = layer.getSiblingLayer("transientLayer");
                    transientLayer.getGraphic().innerHTML = "";
                });
            },
        ],
        drag: [
            ({ event, layer }) => {
                if (event.changedTouches)
                    event = event.changedTouches[0];
                layer.services.find("SelectionService").forEach((service) => {
                    const startx = service.getSharedVar("startx", { layer });
                    const baseBBox = (layer.getGraphic().querySelector(".ig-layer-background") ||
                        layer.getGraphic()).getBoundingClientRect();
                    service.setSharedVar("x", Math.min(event.clientX, startx), { layer });
                    service.setSharedVar("width", Math.abs(event.clientX - startx), {
                        layer,
                    });
                    service.setSharedVar("extent", [event.clientX, startx]
                        .map((x) => layer.getSharedVar("scaleX").invert(x - baseBBox.x))
                        .sort((a, b) => a - b), { layer });
                    service.setSharedVar("currentx", event.clientX, { layer });
                    const transientLayer = layer.getSiblingLayer("transientLayer");
                    // const matrix = matrixParse.fromElement(layer.getGraphic());
                    transientLayer.getGraphic().innerHTML = `<rect x="${Math.min(event.clientX, startx) - baseBBox.x}" y="0" width="${Math.abs(event.clientX - startx)}" height="${baseBBox.height}" class="transientRect" fill="#000" opacity="0.3" />`;
                });
            },
        ],
        dragend: [
            ({ event, layer, instrument }) => {
                if (event.changedTouches)
                    event = event.changedTouches[0];
                layer.services.find("SelectionService").forEach((service) => {
                    service.setSharedVar("currentx", event.clientX, { layer });
                    service.setSharedVar("endx", event.clientX, { layer });
                    if (!instrument.getSharedVar("persistant")) {
                        const transientLayer = layer.getSiblingLayer("transientLayer");
                        transientLayer.getGraphic().innerHTML = "";
                    }
                });
            },
        ],
        dragabort: [
            ({ event, layer }) => {
                if (event.changedTouches)
                    event = event.changedTouches[0];
                layer.services.find("SelectionService").forEach((service) => {
                    service.setSharedVar("x", 0, { layer });
                    service.setSharedVar("y", 0, { layer });
                    service.setSharedVar("width", 0, { layer });
                    service.setSharedVar("height", 0, { layer });
                    service.setSharedVar("currentx", event.clientX, { layer });
                    service.setSharedVar("extent", undefined, { layer });
                    service.setSharedVar("endx", event.clientX, { layer });
                    const transientLayer = layer.getSiblingLayer("transientLayer");
                    transientLayer.getGraphic().innerHTML = "";
                });
            },
        ],
    },
    preAttach: (instrument, layer) => {
        // Create default SM on layer
        layer.services.find("SelectionService", "RectSelectionService");
    },
});
Instrument.register("ClickInstrument", {
    constructor: Instrument,
    interactors: ["MouseTraceInteractor", "TouchTraceInteractor"],
    on: {
        dragend: [
            (options) => {
                if (options.event.changedTouches)
                    options.event = options.event.changedTouches[0];
                options.layer.services.find("SelectionService").forEach((service) => {
                    service.setSharedVar("x", options.event.clientX, {
                        layer: options.layer,
                    });
                    service.setSharedVar("y", options.event.clientY, {
                        layer: options.layer,
                    });
                });
                options.instrument.emit("click", {
                    ...options,
                    self: options.instrument,
                });
            },
        ],
        dragabort: [
            (options) => {
                if (options.event.changedTouches)
                    options.event = options.event.changedTouches[0];
                options.layer.services.find("SelectionService").forEach((service) => {
                    service.setSharedVar("x", 0, { layer: options.layer });
                    service.setSharedVar("y", 0, { layer: options.layer });
                });
                options.instrument.emit("clickabort", {
                    ...options,
                    self: options.instrument,
                });
            },
        ],
    },
    preAttach: (instrument, layer) => {
        // Create default SM on layer
        layer.services.find("SelectionService", "SurfacePointSelectionService");
    },
});
Instrument.register("DragInstrument", {
    constructor: Instrument,
    interactors: ["MouseTraceInteractor", "TouchTraceInteractor"],
    on: {
        dragstart: [
            ({ layer, event }) => {
                if (event.changedTouches)
                    event = event.changedTouches[0];
                layer.services.find("SelectionService").forEach((service) => {
                    service.setSharedVar("x", event.clientX, { layer });
                    service.setSharedVar("y", event.clientY, { layer });
                });
                const transientLayer = layer.getSiblingLayer("transientLayer");
                transientLayer.getGraphic().innerHTML = "";
            },
        ],
        drag: [
            ({ layer, event }) => {
                if (event.changedTouches)
                    event = event.changedTouches[0];
                layer.services.find("SelectionService").forEach((service) => {
                    let offsetX = event.clientX - service.getSharedVar("x", { layer });
                    let offsetY = event.clientY - service.getSharedVar("y", { layer });
                    service.setSharedVar("currentx", event.clientX, { layer });
                    service.setSharedVar("currenty", event.clientY, { layer });
                    service.setSharedVar("offsetx", offsetX, { layer });
                    service.setSharedVar("offsety", offsetY, { layer });
                    const selectionLayer = layer.getSiblingLayer("selectionLayer");
                    const transientLayer = layer.getSiblingLayer("transientLayer");
                    transientLayer.getGraphic().innerHTML = `<g transform="translate(${offsetX}, ${offsetY})" opacity="0.5">${selectionLayer.getGraphic().innerHTML}</g>`;
                });
            },
        ],
        dragend: [
            ({ layer, event }) => {
                if (event.changedTouches)
                    event = event.changedTouches[0];
                layer.services.find("SelectionService").forEach((service) => {
                    let offsetX = event.clientX - service.getSharedVar("x", { layer });
                    let offsetY = event.clientY - service.getSharedVar("y", { layer });
                    service.setSharedVar("x", 0, { layer });
                    service.setSharedVar("y", 0, { layer });
                    service.setSharedVar("currentx", event.clientX, { layer });
                    service.setSharedVar("currenty", event.clientY, { layer });
                    service.setSharedVar("offsetx", offsetX, { layer });
                    service.setSharedVar("offsety", offsetY, { layer });
                });
                const transientLayer = layer.getSiblingLayer("transientLayer");
                transientLayer.getGraphic().innerHTML = "";
            },
        ],
        dragabort: [
            (options) => {
                let { layer, event, instrument } = options;
                if (event.changedTouches)
                    event = event.changedTouches[0];
                layer.services.find("SelectionService").forEach((service) => {
                    service.setSharedVar("x", 0, { layer });
                    service.setSharedVar("y", 0, { layer });
                    service.setSharedVar("currentx", event.clientX, { layer });
                    service.setSharedVar("currenty", event.clientY, { layer });
                    service.setSharedVar("offsetx", 0, { layer });
                    service.setSharedVar("offsety", 0, { layer });
                });
                const transientLayer = layer.getSiblingLayer("transientLayer");
                transientLayer.getGraphic().innerHTML = "";
                instrument.emit("dragconfirm", {
                    ...options,
                    self: options.instrument,
                });
            },
        ],
    },
    preAttach: (instrument, layer) => {
        // Create default SM on layer
        layer.services.find("SelectionService", "SurfacePointSelectionService");
    },
});
Instrument.register("SpeechInstrument", {
    constructor: Instrument,
    interactors: ["SpeechControlInteractor"],
});
Instrument.register("KeyboardHelperBarInstrument", {
    constructor: Instrument,
    interactors: ["KeyboardPositionInteractor"],
    on: {
        begin: [() => console.log("begin")],
        left: [
            ({ event, layer, instrument }) => {
                console.log("left");
                const speed = layer.getSharedVar("speed", 1);
                const transientLayer = layer.getSiblingLayer("transientLayer");
                const helperBar = transientLayer
                    .getGraphic()
                    .querySelector("line");
                const transform = getTransform(helperBar);
                const newX = transform[0] - speed;
                helperBar.setAttribute("transform", `translate(${newX}, 0)`);
                instrument.setSharedVar("barX", newX, {});
            },
        ],
        right: [
            ({ event, layer, instrument }) => {
                console.log("right");
                const speed = layer.getSharedVar("speed", 1);
                const transientLayer = layer.getSiblingLayer("transientLayer");
                const helperBar = transientLayer
                    .getGraphic()
                    .querySelector("line");
                const transform = getTransform(helperBar);
                const newX = transform[0] + speed;
                helperBar.setAttribute("transform", `translate(${newX}, 0)`);
                instrument.setSharedVar("barX", newX, {});
            },
        ],
    },
    preAttach: function (instrument, layer) {
        console.log("preAttach");
        console.log(layer.getContainerGraphic());
        layer.getGraphic().setAttribute("tabindex", 0);
        layer.getGraphic().focus();
        const height = layer.getSharedVar("height", 100);
        const startX = layer.getSharedVar("startX", 0);
        const transientLayer = layer.getSiblingLayer("transientLayer");
        const helperBar = document.createElementNS("http://www.w3.org/2000/svg", "line");
        helperBar.setAttribute("x1", `${startX}`);
        helperBar.setAttribute("y1", `${startX}`);
        helperBar.setAttribute("x2", `${startX}`);
        helperBar.setAttribute("y2", `${height}`);
        helperBar.setAttribute("stroke", `black`);
        helperBar.setAttribute("stroke-width", `1px`);
        transientLayer.getGraphic().append(helperBar);
    },
});
Instrument.register("PanInstrument", {
    constructor: Instrument,
    interactors: ["MouseTraceInteractor", "TouchTraceInteractor"],
    on: {
        dragstart: [
            ({ layer, event, instrument }) => {
                if (event.changedTouches)
                    event = event.changedTouches[0];
                const sx = layer.getTransformation("scaleX");
                const sy = layer.getTransformation("scaleY");
                layer.setTransformation("$scaleX", sx);
                layer.setTransformation("$scaleY", sy);
                layer.getTransformation("$$scaleX", sx);
                layer.getTransformation("$$scaleY", sy);
                instrument.setSharedVar("startx", event.clientX);
                instrument.setSharedVar("starty", event.clientY);
                instrument.setSharedVar("currentx", event.clientX);
                instrument.setSharedVar("currenty", event.clientY);
                layer.getSiblingLayer("selectionLayer").getGraphic().innerHTML = "";
                layer.getSiblingLayer("transientLayer").getGraphic().innerHTML = "";
            },
        ],
        drag: [
            ({ layer, event, instrument }) => {
                if (event.changedTouches)
                    event = event.changedTouches[0];
                let offsetX = event.clientX - instrument.getSharedVar("startx");
                let offsetY = event.clientY - instrument.getSharedVar("starty");
                instrument.setSharedVar("currentx", event.clientX);
                instrument.setSharedVar("currenty", event.clientY);
                const sx = layer.getTransformation("$scaleX");
                const sy = layer.getTransformation("$scaleY");
                const fixRange = instrument.getSharedVar("fixRange");
                if (fixRange) {
                    if (sx) {
                        const scaleX = sx
                            .copy()
                            .domain(sx.range().map((x) => x + offsetX))
                            .range(sx.domain());
                        if (scaleX.clamp)
                            scaleX.clamp(false);
                        scaleX.domain(sx.range().map((x) => scaleX(x))).range(sx.range());
                        layer.setTransformation("scaleX", scaleX);
                    }
                    if (sy) {
                        const scaleY = sy
                            .copy()
                            .domain(sy.range().map((y) => y + offsetY))
                            .range(sy.domain());
                        if (scaleY.clamp)
                            scaleY.clamp(false);
                        scaleY.domain(sy.range().map((y) => scaleY(y))).range(sy.range());
                        layer.setTransformation("scaleY", scaleY);
                    }
                }
                else {
                    if (sx) {
                        const proxyRaw = (raw) => new Proxy(raw, {
                            get(target, path) {
                                if (path in target)
                                    return target[path];
                                if (path === "range")
                                    return (...args) => target.$origin
                                        .range(...args)
                                        .map((x) => x + offsetX);
                                return target.$origin[path];
                            },
                            apply(target, thisArg, argArray) {
                                return target.apply(thisArg, argArray);
                            },
                            has(target, path) {
                                return path in target || path in target.$origin;
                            },
                        });
                        const scaleXRaw = (domain) => sx(domain) + offsetX;
                        scaleXRaw.invert = (range) => sx.invert(range - offsetX);
                        scaleXRaw.copy = () => {
                            const anotherScaleXRaw = (domain) => anotherScaleXRaw.$origin(domain) + offsetX;
                            Object.assign(anotherScaleXRaw, scaleXRaw);
                            anotherScaleXRaw.invert = (range) => anotherScaleXRaw.$origin.invert(range - offsetX);
                            anotherScaleXRaw.$origin = sx.copy();
                            return proxyRaw(anotherScaleXRaw);
                        };
                        scaleXRaw.$origin = sx;
                        const scaleX = proxyRaw(scaleXRaw);
                        layer.setTransformation("scaleX", scaleX);
                    }
                    if (sy) {
                        const proxyRaw = (raw) => new Proxy(raw, {
                            get(target, path) {
                                if (path in target)
                                    return target[path];
                                if (path === "range")
                                    return (...args) => target.$origin
                                        .range(...args)
                                        .map((y) => y + offsetY);
                                return target.$origin[path];
                            },
                            apply(target, thisArg, argArray) {
                                return target.apply(thisArg, argArray);
                            },
                            has(target, path) {
                                return path in target || path in target.$origin;
                            },
                        });
                        const scaleYRaw = (domain) => scaleYRaw.$origin(domain) + offsetY;
                        scaleYRaw.invert = (range) => scaleYRaw.$origin.invert(range - offsetY);
                        scaleYRaw.$origin = sy;
                        scaleYRaw.copy = () => {
                            const anotherScaleYRaw = (domain) => anotherScaleYRaw.$origin(domain) + offsetY;
                            Object.assign(anotherScaleYRaw, scaleYRaw);
                            anotherScaleYRaw.invert = (range) => anotherScaleYRaw.$origin.invert(range - offsetY);
                            anotherScaleYRaw.$origin = sy.copy();
                            return proxyRaw(anotherScaleYRaw);
                        };
                        const scaleY = proxyRaw(scaleYRaw);
                        layer.setTransformation("scaleY", scaleY);
                    }
                }
                layer.getSiblingLayer("selectionLayer").getGraphic().innerHTML = "";
                layer.getSiblingLayer("transientLayer").getGraphic().innerHTML = "";
            },
        ],
        dragabort: [
            ({ layer, event, instrument }) => {
                if (event.changedTouches)
                    event = event.changedTouches[0];
                const sx = layer.getTransformation("$$scaleX");
                const sy = layer.getTransformation("$$scaleY");
                instrument.setSharedVar("startx", event.clientX);
                instrument.setSharedVar("starty", event.clientY);
                instrument.setSharedVar("currentx", event.clientX);
                instrument.setSharedVar("currenty", event.clientY);
                if (sx) {
                    layer.setTransformation("scaleX", sx);
                    layer.setTransformation("$scaleX", sx);
                }
                if (sy) {
                    layer.setTransformation("scaleY", sy);
                    layer.setTransformation("$scaleY", sy);
                }
                layer.getSiblingLayer("selectionLayer").getGraphic().innerHTML = "";
                layer.getSiblingLayer("transientLayer").getGraphic().innerHTML = "";
            },
        ],
    },
});
Instrument.register("ZoomInstrument", {
    constructor: Instrument,
    interactors: ["MouseWheelInteractor"],
    on: {
        wheel: [
            ({ layer, event, instrument }) => {
                const DEFAULT_DELTA_LEVEL_RATIO = 200;
                let sx = layer.getTransformation("scaleX");
                let sy = layer.getTransformation("scaleY");
                layer.getTransformation("$$scaleX", sx);
                layer.getTransformation("$$scaleY", sy);
                instrument.setSharedVar("currentx", event.offsetX);
                instrument.setSharedVar("currenty", event.offsetY);
                let delta = event.deltaY;
                instrument.setSharedVar("delta", delta);
                let cumulativeDelta = instrument.getSharedVar("cumulativeDelta", {
                    defaultValue: 0,
                });
                cumulativeDelta += delta;
                instrument.setSharedVar("cumulativeDelta", cumulativeDelta);
                const deltaLevelRatio = instrument.getSharedVar("deltaLevelRatio", {
                    defaultValue: DEFAULT_DELTA_LEVEL_RATIO,
                });
                delta /= 1000;
                const offsetX = instrument.getSharedVar("centroidX") || event.offsetX;
                const offsetY = instrument.getSharedVar("centroidY") || event.offsetY;
                const fixRange = instrument.getSharedVar("fixRange");
                if (fixRange) {
                    if (sx) {
                        const scaleX = sx
                            .copy()
                            .domain(sx.range().map((x) => (x - offsetX) * Math.exp(delta) + offsetX))
                            .range(sx.domain());
                        if (scaleX.clamp)
                            scaleX.clamp(false);
                        scaleX.domain(sx.range().map((x) => scaleX(x))).range(sx.range());
                        layer.setTransformation("scaleX", scaleX);
                    }
                    if (sy) {
                        const scaleY = sy
                            .copy()
                            .domain(sy.range().map((y) => (y - offsetY) * Math.exp(delta) + offsetY))
                            .range(sy.domain());
                        if (scaleY.clamp)
                            scaleY.clamp(false);
                        scaleY.domain(sy.range().map((y) => scaleY(y))).range(sy.range());
                        layer.setTransformation("scaleY", scaleY);
                    }
                }
                else {
                    if (sx) {
                        const proxyRaw = (raw) => new Proxy(raw, {
                            get(target, path) {
                                if (path in target)
                                    return target[path];
                                if (path === "range")
                                    return (...args) => target.$origin
                                        .range(...args.map((x) => (x - offsetX) / Math.exp(delta) + offsetX))
                                        .map((x) => (x - offsetX) * Math.exp(delta) + offsetX);
                                if (path === "bandwidth" && "bandwidth" in target.$origin) {
                                    return () => target.$origin.bandwidth() * Math.exp(delta);
                                }
                                return target.$origin[path];
                            },
                            apply(target, thisArg, argArray) {
                                return target.apply(thisArg, argArray);
                            },
                            has(target, path) {
                                return path in target || path in target.$origin;
                            },
                        });
                        const scaleXRaw = (domain) => (scaleXRaw.$origin(domain) - offsetX) * Math.exp(delta) + offsetX;
                        scaleXRaw.invert = (range) => scaleXRaw.$origin.invert((range - offsetX) / Math.exp(delta) + offsetX);
                        scaleXRaw.$origin = sx;
                        scaleXRaw.copy = () => {
                            const anotherScaleXRaw = (domain) => (anotherScaleXRaw.$origin(domain) - offsetX) * Math.exp(delta) +
                                offsetX;
                            Object.assign(anotherScaleXRaw, scaleXRaw);
                            anotherScaleXRaw.$origin = sx.copy();
                            anotherScaleXRaw.invert = (range) => anotherScaleXRaw.$origin.invert((range - offsetX) / Math.exp(delta) + offsetX);
                            return proxyRaw(anotherScaleXRaw);
                        };
                        const scaleX = proxyRaw(scaleXRaw);
                        layer.setTransformation("scaleX", scaleX);
                    }
                    if (sy) {
                        const proxyRaw = (raw) => new Proxy(raw, {
                            get(target, path) {
                                if (path in target)
                                    return target[path];
                                if (path === "range")
                                    return (...args) => target.$origin
                                        .range(...args)
                                        .map((y) => (y - offsetY) * Math.exp(delta) + offsetY);
                                if (path === "bandwidth" && "bandwidth" in target.$origin) {
                                    return () => target.$origin.bandwidth() * Math.exp(delta);
                                }
                                return target.$origin[path];
                            },
                            apply(target, thisArg, argArray) {
                                return target.apply(thisArg, argArray);
                            },
                            has(target, path) {
                                return path in target || path in target.$origin;
                            },
                        });
                        const scaleYRaw = (domain) => (scaleYRaw.$origin(domain) - offsetY) * Math.exp(delta) + offsetY;
                        scaleYRaw.invert = (range) => scaleYRaw.$origin.invert((range - offsetY) / Math.exp(delta) + offsetY);
                        scaleYRaw.$origin = sy;
                        scaleYRaw.copy = () => {
                            const anotherScaleYRaw = (domain) => (anotherScaleYRaw.$origin(domain) - offsetY) * Math.exp(delta) +
                                offsetY;
                            Object.assign(anotherScaleYRaw, scaleYRaw);
                            anotherScaleYRaw.invert = (range) => anotherScaleYRaw.$origin.invert((range - offsetY) / Math.exp(delta) + offsetY);
                            anotherScaleYRaw.$origin = sy.copy();
                            return proxyRaw(anotherScaleYRaw);
                        };
                        const scaleY = proxyRaw(scaleYRaw);
                        layer.setTransformation("scaleY", scaleY);
                    }
                }
                layer.getSiblingLayer("selectionLayer").getGraphic().innerHTML = "";
                layer.getSiblingLayer("transientLayer").getGraphic().innerHTML = "";
            },
        ],
        abort: [
            ({ layer, event, instrument }) => {
                const sx = layer.getTransformation("$$scaleX");
                const sy = layer.getTransformation("$$scaleY");
                instrument.setSharedVar("delta", 0);
                instrument.setSharedVar("currentx", event.offsetX);
                instrument.setSharedVar("currenty", event.offsetY);
                if (sx) {
                    layer.setTransformation("scaleX", sx);
                }
                if (sy) {
                    layer.setTransformation("scaleY", sy);
                }
                layer.getSiblingLayer("selectionLayer").getGraphic().innerHTML = "";
                layer.getSiblingLayer("transientLayer").getGraphic().innerHTML = "";
            },
        ],
    },
});

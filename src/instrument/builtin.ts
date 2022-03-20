import Instrument from "./instrument";
import GraphicalTransformer from "../transformer";
import { getTransform, Transformation } from "../helpers";
import * as d3 from "d3";
import Command from "../command/command";
import Service from "../service";

Instrument.register("HoverInstrument", {
  constructor: Instrument,
  interactors: ["MousePositionInteractor", "TouchPositionInteractor"],
  on: {
    hover: [
      async ({ event, layer, instrument }) => {
        if (event.changedTouches) event = event.changedTouches[0];
        const services = instrument.services.find("SelectionService");
        services.setSharedVar("x", event.clientX, { layer });
        services.setSharedVar("y", event.clientY, { layer });
        await Promise.all(instrument.services.results);
        if (instrument.getSharedVar("highlightAttrValues")) {
          instrument.transformers.setSharedVar(
            "highlightAttrValues",
            instrument.getSharedVar("highlightAttrValues")
          );
        }
      },
    ],
  },
  preAttach: (instrument, layer) => {
    instrument.services.add("SurfacePointSelectionService", { layer });
    instrument.transformers.add("HighlightSelection", {
      transient: true,
      layer: layer.getLayerFromQueue("selectionLayer"),
      sharedVar: { highlightAttrValues: {} },
    });
  },
});

Instrument.register("ClickInstrument", {
  constructor: Instrument,
  interactors: ["MouseTraceInteractor", "TouchTraceInteractor"],
  on: {
    dragend: [
      async (options) => {
        let { event, layer, instrument } = options;
        if (event.changedTouches)
          event = event.changedTouches[0];
        const services = instrument.services.find("SelectionService");
        services.setSharedVar("x", event.clientX, { layer: layer });
        services.setSharedVar("y", event.clientY, { layer: layer });
        await Promise.all(instrument.services.results);

        if (instrument.getSharedVar("highlightAttrValues")) {
          instrument.transformers.setSharedVar(
            "highlightAttrValues",
            instrument.getSharedVar("highlightAttrValues")
          );
        }

        instrument.emit("click", {
          ...options,
          self: options.instrument,
        });
      },
    ],
    dragabort: [
      (options) => {
        if (options.event.changedTouches)
          options.event = options.event.changedTouches[0];
        const services = options.instrument.services.find("SelectionService")
        services.setSharedVar("x", 0, { layer: options.layer });
        services.setSharedVar("y", 0, { layer: options.layer });
        options.instrument.emit("clickabort", {
          ...options,
          self: options.instrument,
        });
      },
    ],
  },
  preAttach: (instrument, layer) => {
    instrument.services.add("SurfacePointSelectionService", { layer });
    instrument.transformers.add("HighlightSelection", {
      transient: true,
      layer: layer.getLayerFromQueue("selectionLayer"),
      sharedVar: { highlightAttrValues: {} },
    });
  },
});


Instrument.register("BrushInstrument", {
  constructor: Instrument,
  interactors: ["MouseTraceInteractor", "TouchTraceInteractor"],
  on: {
    dragstart: [
      async ({ event, layer, instrument }) => {
        if (event.changedTouches) event = event.changedTouches[0];
        const services = instrument.services.find("RectSelectionService");
        services.setSharedVar("x", event.clientX, { layer });
        services.setSharedVar("y", event.clientY, { layer });
        services.setSharedVar("width", 1, { layer });
        services.setSharedVar("height", 1, { layer });
        services.setSharedVar("startx", event.clientX, { layer });
        services.setSharedVar("starty", event.clientY, { layer });
        services.setSharedVar("currentx", event.clientX, { layer });
        services.setSharedVar("currenty", event.clientY, { layer });
        instrument.setSharedVar("startx", event.clientX);
        instrument.setSharedVar("starty", event.clientY);
        instrument.transformers
          .find("TransientRectangleTransformer")
          .setSharedVars({
            x: 0,
            y: 0,
            width: 1,
            height: 1,
          });
      },
    ],
    drag: [
      Command.initialize("drawBrushAndSelect", {
        continuous: true,
        execute: async ({ event, layer, instrument }) => {
          if (event.changedTouches) event = event.changedTouches[0];

          const startx = instrument.getSharedVar("startx");
          const starty = instrument.getSharedVar("starty");

          const x = Math.min(startx, event.clientX);
          const y = Math.min(starty, event.clientY);
          const width = Math.abs(event.clientX - startx);
          const height = Math.abs(event.clientY - starty);

          // selection, currently service use client coordinates, but coordinates relative to the layer maybe more appropriate.
          const services = instrument.services.find("SelectionService");
          services.setSharedVar("x", x, { layer });
          services.setSharedVar("y", y, { layer });
          services.setSharedVar("width", width, {
            layer,
          });
          services.setSharedVar("height", height, {
            layer,
          });
          services.setSharedVar("currentx", event.clientX, { layer });
          services.setSharedVar("currenty", event.clientY, { layer });
        },
        feedback: [
          // transient Layer
          async ({ event, layer, instrument }) => {
            const startx = instrument.getSharedVar("startx");
            const starty = instrument.getSharedVar("starty");

            const x = Math.min(startx, event.clientX);
            const y = Math.min(starty, event.clientY);
            const width = Math.abs(event.clientX - startx);
            const height = Math.abs(event.clientY - starty);

            // draw brush
            const baseBBox = (
              layer.getGraphic().querySelector(".ig-layer-background") ||
              layer.getGraphic()
            ).getBoundingClientRect();
            instrument.transformers
              .find("TransientRectangleTransformer")
              .setSharedVars({
                x: x - baseBBox.left,
                y: y - baseBBox.top,
                width: width,
                height: height,
              });
          },
          async ({ instrument }) => {
            instrument.transformers.find("HighlightSelection").setSharedVars({
              highlightAttrValues:
                instrument.getSharedVar("highlightAttrValues") || {},
            });
          },
        ],
      }),
    ],
    dragend: [
      Command.initialize("clearOrPersistant", {
        execute: async ({ event, layer, instrument }) => {
          // if (event.changedTouches) event = event.changedTouches[0];
          // if (!instrument.getSharedVar("persistant")) {
          //   const services = instrument.services.find("SelectionService");
          //   services.setSharedVar("width", -1, { layer });
          //   services.setSharedVar("height", -1, { layer });
          // }
        },
        feedback: [
          async ({ event, layer, instrument }) => {
            if (event.changedTouches) event = event.changedTouches[0];
            if (!instrument.getSharedVar("persistant")) {
              instrument.transformers
                .find("TransientRectangleTransformer")
                .setSharedVars({
                  x: 0,
                  y: 0,
                  width: 0,
                  height: 0,
                });
            }
          },
        ],
      }),
    ],
    dragabort: [
      async ({ event, layer, instrument }) => {
        if (event.changedTouches) event = event.changedTouches[0];
        const services = instrument.services.find("SelectionService");
        services.setSharedVar("x", 0, { layer });
        services.setSharedVar("y", 0, { layer });
        services.setSharedVar("width", 0, { layer });
        services.setSharedVar("height", 0, { layer });
        services.setSharedVar("currentx", event.clientX, { layer });
        services.setSharedVar("currenty", event.clientY, { layer });
        services.setSharedVar("endx", event.clientX, { layer });
        services.setSharedVar("endy", event.clientY, { layer });
        instrument.transformers
          .find("TransientRectangleTransformer")
          .setSharedVars({
            x: 0,
            y: 0,
            width: 0,
            height: 0,
          });
      },
    ],
  },
  preAttach: (instrument, layer) => {
    instrument.services.add("RectSelectionService", { layer });

    instrument.transformers
      .add("TransientRectangleTransformer", {
        transient: true,
        layer: layer.getLayerFromQueue("transientLayer"),
        sharedVar: {
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          fill: "#000",
          opacity: 0.3,
        },
      })
      .add("HighlightSelection", {
        transient: true,
        layer: layer.getLayerFromQueue("selectionLayer"),
        sharedVar: { highlightAttrValues: {} },
      });
  },
});

Instrument.register("BrushXInstrument", {
  constructor: Instrument,
  interactors: ["MouseTraceInteractor", "TouchTraceInteractor"],
  on: {
    dragstart: [
      async ({ event, layer, instrument }) => {
        if (event.changedTouches) event = event.changedTouches[0];
        const services = instrument.services.find("RectSelectionService");
        services.setSharedVar("x", event.clientX, { layer });
        services.setSharedVar("width", 1, { layer });
        services.setSharedVar("startx", event.clientX, { layer });
        services.setSharedVar("currentx", event.clientX, { layer });
        instrument.setSharedVar("startx", event.clientX);
        instrument.transformers
          .find("TransientRectangleTransformer")
          .setSharedVars({
            x: 0,
            width: 1,
          });
      },
    ],
    drag: [
      Command.initialize("drawBrushAndSelect", {
        continuous: true,
        execute: async ({ event, layer, instrument }) => {
          if (event.changedTouches) event = event.changedTouches[0];

          const startx = instrument.getSharedVar("startx");

          const x = Math.min(startx, event.clientX);
          const width = Math.abs(event.clientX - startx);

          // selection, currently service use client coordinates, but coordinates relative to the layer maybe more appropriate.
          const services = instrument.services.find("SelectionService");
          services.setSharedVar("x", x, { layer });
          services.setSharedVar("width", width, {
            layer,
          });
          services.setSharedVar("currentx", event.clientX, { layer });
          await Promise.all(instrument.services.results);
        },
        feedback: [
          async ({ event, layer, instrument }) => {
            const startx = instrument.getSharedVar("startx");

            const x = Math.min(startx, event.clientX);
            const width = Math.abs(event.clientX - startx);

            // draw brush
            const baseBBox = (
              layer.getGraphic().querySelector(".ig-layer-background") ||
              layer.getGraphic()
            ).getBoundingClientRect();
            instrument.transformers
              .find("TransientRectangleTransformer")
              .setSharedVars({
                x: x - baseBBox.left,
                width: width,
              });
          },
          async ({ instrument }) => {
            instrument.transformers.find("HighlightSelection").setSharedVars({
              highlightAttrValues:
                instrument.getSharedVar("highlightAttrValues") || {},
            });
          },
        ],
      }),
    ],
    dragend: [
      Command.initialize("clearOrPersistant", {
        execute: async ({ event, layer, instrument }) => {
          // if (event.changedTouches) event = event.changedTouches[0];
          // if (!instrument.getSharedVar("persistant")) {
          //   const services = instrument.services.find("SelectionService");
          //   services.setSharedVar("width", -1, { layer });
          // }
        },
        feedback: [
          async ({ event, layer, instrument }) => {
            if (event.changedTouches) event = event.changedTouches[0];
            if (!instrument.getSharedVar("persistant")) {
              instrument.transformers
                .find("TransientRectangleTransformer")
                .setSharedVars({
                  width: 0,
                });
            }
          },
        ],
      }),
    ],
    dragabort: [
      async ({ event, layer, instrument }) => {
        if (event.changedTouches) event = event.changedTouches[0];
        const services = instrument.services.find("SelectionService");
        services.setSharedVar("x", 0, { layer });
        services.setSharedVar("width", 0, { layer });
        services.setSharedVar("currentx", event.clientX, { layer });
        services.setSharedVar("endx", event.clientX, { layer });
        instrument.transformers
          .find("TransientRectangleTransformer")
          .setSharedVars({
            x: 0,
            width: 0,
          });
      },
    ],
  },
  preAttach: (instrument, layer) => {
    const y = instrument.getSharedVar("y") ?? 0;
    const height = instrument.getSharedVar("height") ?? (layer as any)._height;

    const services = instrument.services.add("RectSelectionService", { layer });
    const bbox = layer.getGraphic().getBoundingClientRect();
    services.setSharedVar("y", bbox.y + y);
    services.setSharedVar("height", height);

    instrument.transformers
      .add("TransientRectangleTransformer", {
        transient: true,
        layer: layer.getLayerFromQueue("transientLayer"),
        sharedVar: {
          x: 0,
          y: 0,
          width: 0,
          height: height,
          fill: "#000",
          opacity: 0.3,
        },
      })
      .add("HighlightSelection", {
        transient: true,
        layer: layer.getLayerFromQueue("selectionLayer"),
        sharedVar: { highlightAttrValues: {} },
      });
  },
});

Instrument.register("BrushYInstrument", {
  constructor: Instrument,
  interactors: ["MouseTraceInteractor", "TouchTraceInteractor"],
  on: {
    dragstart: [
      async ({ event, layer, instrument }) => {
        if (event.changedTouches) event = event.changedTouches[0];
        const services = instrument.services.find("RectSelectionService");
        services.setSharedVar("y", event.clientY, { layer });
        services.setSharedVar("height", 1, { layer });
        services.setSharedVar("starty", event.clientY, { layer });
        services.setSharedVar("currenty", event.clientY, { layer });
        instrument.setSharedVar("starty", event.clientY);
        instrument.transformers
          .find("TransientRectangleTransformer")
          .setSharedVars({
            y: 0,
            height: 1,
          });
      },
    ],
    drag: [
      Command.initialize("drawBrushAndSelect", {
        continuous: true,
        execute: async ({ event, layer, instrument }) => {
          if (event.changedTouches) event = event.changedTouches[0];

          const starty = instrument.getSharedVar("starty");

          const y = Math.min(starty, event.clientY);
          const height = Math.abs(event.clientY - starty);

          // selection, currently service use client coordinates, but coordinates relative to the layer maybe more appropriate.
          const services = instrument.services.find("SelectionService");
          services.setSharedVar("y", y, { layer });
          services.setSharedVar("height", height, {
            layer,
          });
          services.setSharedVar("currenty", event.clientY, { layer });
          await Promise.all(instrument.services.results);
        },
        feedback: [
          async ({ event, layer, instrument }) => {
            const starty = instrument.getSharedVar("starty");

            const y = Math.min(starty, event.clientY);
            const height = Math.abs(event.clientY - starty);

            // draw brush
            const baseBBox = (
              layer.getGraphic().querySelector(".ig-layer-background") ||
              layer.getGraphic()
            ).getBoundingClientRect();
            instrument.transformers
              .find("TransientRectangleTransformer")
              .setSharedVars({
                y: y - baseBBox.top,
                height: height,
              });
          },
          async ({ instrument }) => {
            instrument.transformers.find("HighlightSelection").setSharedVars({
              highlightAttrValues:
                instrument.getSharedVar("highlightAttrValues") || {},
            });
          },
        ],
      }),
    ],
    dragend: [
      Command.initialize("clearOrPersistant", {
        execute: async ({ event, layer, instrument }) => {
          if (event.changedTouches) event = event.changedTouches[0];
          if (!instrument.getSharedVar("persistant")) {
            const services = instrument.services.find("SelectionService");
            services.setSharedVar("height", -1, { layer });
          }
        },
        feedback: [
          async ({ event, layer, instrument }) => {
            if (event.changedTouches) event = event.changedTouches[0];
            if (!instrument.getSharedVar("persistant")) {
              instrument.transformers
                .find("TransientRectangleTransformer")
                .setSharedVars({
                  height: 0,
                });
            }
          },
        ],
      }),
    ],
    dragabort: [
      async ({ event, layer, instrument }) => {
        if (event.changedTouches) event = event.changedTouches[0];
        const services = instrument.services.find("SelectionService");
        services.setSharedVar("y", 0, { layer });
        services.setSharedVar("height", 0, { layer });
        services.setSharedVar("currenty", event.clientY, { layer });
        services.setSharedVar("endy", event.clientY, { layer });
        instrument.transformers
          .find("TransientRectangleTransformer")
          .setSharedVars({
            y: 0,
            height: 0,
          });
      },
    ],
  },
  preAttach: (instrument, layer) => {
    const x = instrument.getSharedVar("x") ?? 0;
    const width = instrument.getSharedVar("width") ?? (layer as any)._width;

    const services = instrument.services.add("RectSelectionService", { layer });
    const bbox = layer.getGraphic().getBoundingClientRect();
    services.setSharedVar("x", bbox.x + x);
    services.setSharedVar("width", width);

    instrument.transformers
      .add("TransientRectangleTransformer", {
        transient: true,
        layer: layer.getLayerFromQueue("transientLayer"),
        sharedVar: {
          x: 0,
          y: 0,
          width: width,
          height: 0,
          fill: "#000",
          opacity: 0.3,
        },
      })
      .add("HighlightSelection", {
        transient: true,
        layer: layer.getLayerFromQueue("selectionLayer"),
        sharedVar: { highlightAttrValues: {} },
      });
  },
});

Instrument.register("HelperBarInstrument", {
  constructor: Instrument,

  interactors: ["MousePositionInteractor", "TouchPositionInteractor"],
  on: {
    hover: [
      ({ event, layer, instrument }) => {
        if (event.changedTouches) event = event.changedTouches[0];
        const transientLayer = layer.getLayerFromQueue("transientLayer");
        const helperBar = transientLayer.getGraphic().querySelector("line");
        helperBar.setAttribute(
          "transform",
          `translate(${event.offsetX - 50}, 0)`
        );
        instrument.setSharedVar("barX", event.offsetX - 50, {});
      },
    ],
  },
  preAttach: function (instrument, layer) {
    // const height = layer.getSharedVar("height", 100);
    const transientLayer = layer.getLayerFromQueue("transientLayer");
    const helperBar = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line"
    );
    helperBar.setAttribute("x1", "0");
    helperBar.setAttribute("y1", "0");
    helperBar.setAttribute("x2", "0");
    // helperBar.setAttribute("y2", `${height}`);
    helperBar.setAttribute("stroke", `black`);
    helperBar.setAttribute("stroke-width", `1px`);
    (transientLayer.getGraphic() as SVGGElement).append(helperBar);
  },
});

Instrument.register("HelperBarYaxisInstrument", {
  constructor: Instrument,
  interactors: ["MousePositionInteractor", "TouchPositionInteractor"],
  on: {
    hover: [
      ({ event, layer, instrument }) => {
        if (event.changedTouches) event = event.changedTouches[0];
        const transientLayer = layer.getLayerFromQueue("transientLayer");
        const helperBarYaxis = transientLayer
          .getGraphic()
          .querySelector("line");
        const helperBarYaxis2 = transientLayer
          .getGraphic()
          .querySelector("line");
        helperBarYaxis.setAttribute(
          "transform",
          `translate(0, ${event.offsetY - 20})`
        );
        helperBarYaxis2.setAttribute(
          "transform",
          `translate(0, ${event.offsetY - 20})`
        );
        instrument.setSharedVar("barX", event.offsetX, {});
      },
    ],
  },
  preAttach: function (instrument, layer) {
    // const width = layer.getSharedVar("width", 600);
    const transientLayer = layer.getLayerFromQueue("transientLayer");
    const helperBarYaxis = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line"
    );
    helperBarYaxis.setAttribute("x1", "0");
    helperBarYaxis.setAttribute("y1", "0");
    // helperBarYaxis.setAttribute("x2", `${width}`);
    helperBarYaxis.setAttribute("y2", "0");
    helperBarYaxis.setAttribute("stroke", `blue`);
    helperBarYaxis.setAttribute("stroke-width", `1px`);
    transientLayer.getGraphic().append(helperBarYaxis);
    // const helperBarYaxis2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
    // helperBarYaxis2.setAttribute("x1", "0");
    // helperBarYaxis2.setAttribute("y1", "0");
    // helperBarYaxis2.setAttribute("x2", `${width}`);
    // helperBarYaxis2.setAttribute("y2", "0");
    // helperBarYaxis2.setAttribute("stroke", `green`);
    // helperBarYaxis2.setAttribute("stroke-width", `1px`);
    // transientLayer.getGraphic().append(helperBarYaxis2);
  },
});

Instrument.register("DataBrushInstrument", {
  constructor: Instrument,
  interactors: ["MouseTraceInteractor", "TouchTraceInteractor"],
  on: {
    dragstart: [
      async ({ event, layer, instrument }) => {
        if (event.changedTouches) event = event.changedTouches[0];
        const scaleX = instrument.getSharedVar("scaleX");
        const scaleY = instrument.getSharedVar("scaleY");
        const services = instrument.services.find("Quantitative2DSelectionService");
        // services.setSharedVar("x", event.clientX, { layer });
        // services.setSharedVar("width", 1, { layer });
        // const 
        // services.setSharedVar("startx", event.clientX, { layer });
        // services.setSharedVar("currentx", event.clientX, { layer });
        const layerPos = d3.pointer(event, layer.getGraphic());
        instrument.setSharedVar("layerOffsetX", event.clientX - layerPos[0]);
        instrument.setSharedVar("layerOffsetY", event.clientY - layerPos[1]);
        instrument.setSharedVar("startx", event.clientX);
        instrument.setSharedVar("starty", event.clientY);

        const newExtentX = [layerPos[0], layerPos[0] + 1].map(scaleX.invert);
        services.setSharedVar("extentX", newExtentX);
        const newExtentY = [layerPos[1], layerPos[1] + 1].map(scaleY.invert);
        services.setSharedVar("extentX", newExtentY);

        instrument.transformers
          .find("TransientRectangleTransformer")
          .setSharedVars({
            x: 0,
            y: 0,
            width: 1,
            height: 1,
          });
      },
    ],
    drag: [
      Command.initialize("drawBrushAndSelect", {
        continuous: true,
        execute: async ({ event, layer, instrument }) => {
          if (event.changedTouches) event = event.changedTouches[0];

          const startx = instrument.getSharedVar("startx");
          const starty = instrument.getSharedVar("starty");
          const layerOffsetX = instrument.getSharedVar("layerOffsetX");
          const layerOffsetY = instrument.getSharedVar("layerOffsetY");
          const scaleX = instrument.getSharedVar("scaleX");
          const scaleY = instrument.getSharedVar("scaleY");

          const x = Math.min(startx, event.clientX) - layerOffsetX;
          const y = Math.min(starty, event.clientY) - layerOffsetY;
          const width = Math.abs(event.clientX - startx);
          const height = Math.abs(event.clientY - starty);

          instrument.setSharedVar("x", x);
          instrument.setSharedVar("y", y);
          instrument.setSharedVar("width", width);
          instrument.setSharedVar("height", height);

          const newExtentDataX = [x, x + width].map(scaleX.invert);
          const newExtentDataY = [y + height, y].map(scaleY.invert);

          const services = instrument.services.find("SelectionService");
          services.setSharedVar("extentX", newExtentDataX);
          services.setSharedVar("extentY", newExtentDataY);
          console.log(services);

          await Promise.all(instrument.services.results);
        },
        feedback: [
          async ({ event, layer, instrument }) => {
            const x = instrument.getSharedVar("x");
            const y = instrument.getSharedVar("y");
            const width = instrument.getSharedVar("width");
            const height = instrument.getSharedVar("height");
            instrument.transformers
              .find("TransientRectangleTransformer")
              .setSharedVars({
                x: x,
                y: y,
                width: width,
                height: height,
              });
          },
          async ({ instrument }) => {
            instrument.transformers.find("HighlightSelection").setSharedVars({
              highlightAttrValues:
                instrument.getSharedVar("highlightAttrValues") || {},
            });
          },
        ],
      }),
    ],
    dragend: [
      Command.initialize("clearOrPersistant", {
        execute: async ({ event, layer, instrument }) => {
          if (event.changedTouches) event = event.changedTouches[0];
          if (!instrument.getSharedVar("persistant")) {
            const services = instrument.services.find("SelectionService");
            services.setSharedVar("width", -1, { layer });
          }
        },
        feedback: [
          async ({ event, layer, instrument }) => {
            if (event.changedTouches) event = event.changedTouches[0];
            if (!instrument.getSharedVar("persistant")) {
              instrument.transformers
                .find("TransientRectangleTransformer")
                .setSharedVars({
                  width: 0,
                  height: 0,
                });
            }
          },
        ],
      }),
    ],
    dragabort: [
      async ({ event, layer, instrument }) => {
        if (event.changedTouches) event = event.changedTouches[0];
        const services = instrument.services.find("SelectionService");
        services.setSharedVar("x", 0, { layer });
        services.setSharedVar("width", 0, { layer });
        services.setSharedVar("currentx", event.clientX, { layer });
        services.setSharedVar("endx", event.clientX, { layer });
        instrument.transformers
          .find("TransientRectangleTransformer")
          .setSharedVars({
            x: 0,
            width: 0,
          });
      },
    ],
  },
  preAttach: async (instrument, layer) => {
    const scaleX = instrument.getSharedVar("scaleX");
    const scaleY = instrument.getSharedVar("scaleY");

    const attrNameX = instrument.getSharedVar("attrNameX");
    const extentX = instrument.getSharedVar("extentX") ?? [0, 0];
    const extentXData = extentX.map(scaleX);
    const attrNameY = instrument.getSharedVar("attrNameY");
    const extentY = instrument.getSharedVar("extentY") ?? [0, 0];
    const extentYData = extentX.map(scaleY).reverse();

    const services = instrument.services.add("Quantitative2DSelectionService", { layer });
    services.setSharedVar("attrNameX", attrNameX);
    services.setSharedVar("extentX", extentX);
    services.setSharedVar("attrNameY", attrNameY);
    services.setSharedVar("extentY", extentY);

    instrument.transformers
      .add("TransientRectangleTransformer", {
        transient: true,
        layer: layer.getLayerFromQueue("transientLayer"),
        sharedVar: {
          x: extentXData[0],
          y: extentYData[0],
          width: extentXData[1] - extentXData[0],
          height: extentYData[1] - extentYData[0],
          fill: "#000",
          opacity: 0.3,
        },
      })
      .add("HighlightSelection", {
        transient: true,
        layer: layer.getLayerFromQueue("selectionLayer"),
        sharedVar: { highlightAttrValues: instrument.getSharedVar("highlightAttrValues") || {} },
      });

    await Promise.all(instrument.services.results);
  },
});


Instrument.register("DataBrushXInstrument", {
  constructor: Instrument,
  interactors: ["MouseTraceInteractor", "TouchTraceInteractor"],
  on: {
    dragstart: [
      async ({ event, layer, instrument }) => {
        if (event.changedTouches) event = event.changedTouches[0];
        const scaleX = instrument.getSharedVar("scaleX");
        const services = instrument.services.find("QuantitativeSelectionService");
        // services.setSharedVar("x", event.clientX, { layer });
        // services.setSharedVar("width", 1, { layer });
        // const 
        // services.setSharedVar("startx", event.clientX, { layer });
        // services.setSharedVar("currentx", event.clientX, { layer });
        const layerPosX = d3.pointer(event, layer.getGraphic())[0];
        instrument.setSharedVar("layerOffsetX", event.clientX - layerPosX);
        instrument.setSharedVar("startx", event.clientX);
        instrument.setSharedVar("startLayerPosX", layerPosX);
        const newExtent = [layerPosX, layerPosX + 1].map(scaleX.invert);
        services.setSharedVar("extent", newExtent);

        instrument.transformers
          .find("TransientRectangleTransformer")
          .setSharedVars({
            x: layerPosX,
            width: 1,
          });
      },
    ],
    drag: [
      Command.initialize("drawBrushAndSelect", {
        continuous: true,
        execute: async ({ event, layer, instrument }) => {
          if (event.changedTouches) event = event.changedTouches[0];

          const startx = instrument.getSharedVar("startx");
          const layerOffsetX = instrument.getSharedVar("layerOffsetX");
          const scaleX = instrument.getSharedVar("scaleX");

          const x = Math.min(startx, event.clientX);
          const width = Math.abs(event.clientX - startx);
          const newExtent = [x - layerOffsetX, x - layerOffsetX + width].map(scaleX.invert);

          // selection, currently service use client coordinates, but coordinates relative to the layer maybe more appropriate.
          const services = instrument.services.find("QuantitativeSelectionService");
          console.log(services);
          services.setSharedVar("extent", newExtent);

          // services.setSharedVar("x", x, { layer });
          // services.setSharedVar("width", width, {
          //   layer,
          // });
          // services.setSharedVar("currentx", event.clientX, { layer });
          await Promise.all(instrument.services.results);
        },
        feedback: [
          async ({ event, layer, instrument }) => {
            const startLayerPosX = instrument.getSharedVar("startLayerPosX");
            const layerPosX = d3.pointer(event, layer.getGraphic())[0];
            console.log(startLayerPosX, layerPosX);
            const x = Math.min(startLayerPosX, layerPosX);
            const width = Math.abs(layerPosX - startLayerPosX);

            // // draw brush
            // const baseBBox = (
            //   layer.getGraphic().querySelector(".ig-layer-background") ||
            //   layer.getGraphic()
            // ).getBoundingClientRect();
            instrument.transformers
              .find("TransientRectangleTransformer")
              .setSharedVars({
                x: x,
                width: width,
              });
          },
          async ({ instrument }) => {
            instrument.transformers.find("HighlightSelection").setSharedVars({
              highlightAttrValues:
                instrument.getSharedVar("highlightAttrValues") || {},
            });
          },
        ],
      }),
    ],
    dragend: [
      Command.initialize("clearOrPersistant", {
        execute: async ({ event, layer, instrument }) => {
          if (event.changedTouches) event = event.changedTouches[0];
          if (!instrument.getSharedVar("persistant")) {
            const services = instrument.services.find("SelectionService");
            services.setSharedVar("width", -1, { layer });
          }
        },
        feedback: [
          async ({ event, layer, instrument }) => {
            if (event.changedTouches) event = event.changedTouches[0];
            if (!instrument.getSharedVar("persistant")) {
              instrument.transformers
                .find("TransientRectangleTransformer")
                .setSharedVars({
                  width: 0,
                });
            }
          },
        ],
      }),
    ],
    dragabort: [
      async ({ event, layer, instrument }) => {
        if (event.changedTouches) event = event.changedTouches[0];
        const services = instrument.services.find("SelectionService");
        services.setSharedVar("x", 0, { layer });
        services.setSharedVar("width", 0, { layer });
        services.setSharedVar("currentx", event.clientX, { layer });
        services.setSharedVar("endx", event.clientX, { layer });
        instrument.transformers
          .find("TransientRectangleTransformer")
          .setSharedVars({
            x: 0,
            width: 0,
          });
      },
    ],
  },
  preAttach: (instrument, layer) => {
    //const y = instrument.getSharedVar("y") ?? 0;
    const scaleX = instrument.getSharedVar("scaleX");
    const height = instrument.getSharedVar("height") ?? (layer as any)._height;
    const y = instrument.getSharedVar("y") ?? 0;

    const attrName = instrument.getSharedVar("attrNameX");
    const extent = instrument.getSharedVar("extentX") ?? [0, 0];
    const extentData = extent.map(scaleX);
    // const attrNameY = instrument.getSharedVar("attrNameY");
    // const extentY = instrument.getSharedVar("extentY");

    const services = instrument.services.add("QuantitativeSelectionService", { layer });
    // const bbox = layer.getGraphic().getBoundingClientRect();
    services.setSharedVar("attrName", attrName);
    services.setSharedVar("extent", extent);

    instrument.transformers
      .add("TransientRectangleTransformer", {
        transient: true,
        layer: layer.getLayerFromQueue("transientLayer"),
        sharedVar: {
          x: extentData[0],
          y: y,
          width: extentData[1] - extentData[0],
          height: height,
          fill: "#000",
          opacity: 0.3,
        },
      })
      .add("HighlightSelection", {
        transient: true,
        layer: layer.getLayerFromQueue("selectionLayer"),
        sharedVar: { highlightAttrValues: instrument.getSharedVar("highlightAttrValues") || {} },
      });

  },
});

// Instrument.register("DataBrushInstrument", {
//   constructor: Instrument,
//   interactors: ["MouseTraceInteractor", "TouchTraceInteractor"],
//   on: {
//     dragstart: [
//       ({ event, layer, instrument }) => {
//         if (event.changedTouches) event = event.changedTouches[0];
//         instrument.services.find("SelectionService").forEach((service) => {
//           service.setSharedVar("x", event.clientX, { layer });
//           service.setSharedVar("y", event.clientY, { layer });
//           service.setSharedVar("width", 1, { layer });
//           service.setSharedVar("height", 1, { layer });
//           service.setSharedVar("startx", event.clientX, { layer });
//           service.setSharedVar("starty", event.clientY, { layer });
//           service.setSharedVar("currentx", event.clientX, { layer });
//           service.setSharedVar("currenty", event.clientY, { layer });
//           // service.setSharedVar(
//           //   "attrNameX",
//           //   layer.getSharedVar(
//           //     "fieldX",
//           //     service.getSharedVar("attrNameX", { layer })
//           //   ),
//           //   { layer }
//           // );
//           // service.setSharedVar(
//           //   "attrNameY",
//           //   layer.getSharedVar(
//           //     "fieldY",
//           //     service.getSharedVar("attrNameY", { layer })
//           //   ),
//           //   { layer }
//           // );
//           service.setSharedVar("extentX", [0, 0], { layer });
//           service.setSharedVar("extentY", [0, 0], { layer });
//         });
//         const transientLayer = layer.getLayerFromQueue("transientLayer");
//         transientLayer.getGraphic().innerHTML = "";
//       },
//     ],
//     drag: [
//       ({ event, layer, instrument }) => {
//         if (event.changedTouches) event = event.changedTouches[0];
//         instrument.services.find("SelectionService").forEach((service) => {
//           const baseBBox = (
//             layer.getGraphic().querySelector(".ig-layer-background") ||
//             layer.getGraphic()
//           ).getBoundingClientRect();
//           const startx = service.getSharedVar("startx", { layer });
//           const starty = service.getSharedVar("starty", { layer });
//           service.setSharedVar("x", Math.min(event.clientX, startx), { layer });
//           service.setSharedVar("y", Math.min(event.clientY, starty), { layer });
//           service.setSharedVar("width", Math.abs(event.clientX - startx), {
//             layer,
//           });
//           service.setSharedVar("height", Math.abs(event.clientY - starty), {
//             layer,
//           });
//           // service.setSharedVar(
//           //   "extentX",
//           //   [event.clientX, startx]
//           //     .map((x) => layer.getSharedVar("scaleX").invert(x - baseBBox.x))
//           //     .sort((a, b) => a - b),
//           //   { layer }
//           // );
//           // service.setSharedVar(
//           //   "extentY",
//           //   [event.clientY, starty]
//           //     .map((y) => layer.getSharedVar("scaleY").invert(y - baseBBox.y))
//           //     .sort((a, b) => a - b),
//           //   { layer }
//           // );
//           service.setSharedVar("currentx", event.clientX, { layer });
//           service.setSharedVar("currenty", event.clientY, { layer });
//           const transientLayer = layer.getLayerFromQueue("transientLayer");
//           transientLayer.getGraphic().innerHTML = `<rect x=${Math.min(event.clientX, startx) - baseBBox.x
//             } y=${Math.min(event.clientY, starty) - baseBBox.y} width=${Math.abs(
//               event.clientX - startx
//             )} height=${Math.abs(
//               event.clientY - starty
//             )} class="transientRect" fill="#000" opacity="0.3" />`;
//         });
//       },
//     ],
//     dragend: [
//       ({ event, layer, instrument }) => {
//         if (event.changedTouches) event = event.changedTouches[0];
//         instrument.services.find("SelectionService").forEach((service) => {
//           // service.setSharedVar("x", 0, {layer});
//           // service.setSharedVar("y", 0, {layer});
//           // service.setSharedVar("width", 0, {layer});
//           // service.setSharedVar("height", 0, {layer});
//           service.setSharedVar("currentx", event.clientX, { layer });
//           service.setSharedVar("currenty", event.clientY, { layer });
//           service.setSharedVar("endx", event.clientX, { layer });
//           service.setSharedVar("endy", event.clientY, { layer });
//         });
//         if (!instrument.getSharedVar("persistant")) {
//           const transientLayer = layer.getLayerFromQueue("transientLayer");
//           transientLayer.getGraphic().innerHTML = "";
//         }
//       },
//     ],
//     dragabort: [
//       ({ event, layer, instrument }) => {
//         if (event.changedTouches) event = event.changedTouches[0];
//         instrument.services.find("SelectionService").forEach((service) => {
//           service.setSharedVar("x", 0, { layer });
//           service.setSharedVar("y", 0, { layer });
//           service.setSharedVar("width", 0, { layer });
//           service.setSharedVar("height", 0, { layer });
//           service.setSharedVar("currentx", event.clientX, { layer });
//           service.setSharedVar("currenty", event.clientY, { layer });
//           service.setSharedVar("endx", event.clientX, { layer });
//           service.setSharedVar("endy", event.clientY, { layer });
//           service.setSharedVar("extentX", undefined, { layer });
//           service.setSharedVar("extentY", undefined, { layer });
//         });
//         const transientLayer = layer.getLayerFromQueue("transientLayer");
//         transientLayer.getGraphic().innerHTML = "";
//       },
//     ],
//   },
//   preAttach: (instrument, layer) => {
//     // Create default SM on layer
//     instrument.services.find("SelectionService", "RectSelectionService");
//   },
// });

// Instrument.register("DataBrushXInstrument", {
//   constructor: Instrument,
//   interactors: ["MouseTraceInteractor"],
//   on: {
//     dragstart: [
//       ({ event, layer, instrument }) => {
//         if (event.changedTouches) event = event.changedTouches[0];
//         instrument.services.find("SelectionService").forEach((service) => {
//           const baseBBox = (
//             layer.getGraphic().querySelector(".ig-layer-background") ||
//             layer.getGraphic()
//           ).getBoundingClientRect();
//           service.setSharedVar("x", event.clientX, { layer });
//           service.setSharedVar("y", baseBBox.y, { layer });
//           service.setSharedVar("width", 1, { layer });
//           service.setSharedVar("height", baseBBox.height, { layer });
//           service.setSharedVar("startx", event.clientX, { layer });
//           service.setSharedVar("currentx", event.clientX, { layer });
//           // service.setSharedVar(
//           //   "attrNameX",
//           //   layer.getSharedVar(
//           //     "fieldX",
//           //     service.getSharedVar("attrNameX", { layer })
//           //   ),
//           //   { layer }
//           // );
//           service.setSharedVar("extent", [0, 0], { layer });
//           const transientLayer = layer.getLayerFromQueue("transientLayer");
//           transientLayer.getGraphic().innerHTML = "";
//         });
//       },
//     ],
//     drag: [
//       ({ event, layer, instrument }) => {
//         if (event.changedTouches) event = event.changedTouches[0];
//         instrument.services.find("SelectionService").forEach((service) => {
//           const startx = service.getSharedVar("startx", { layer });
//           const baseBBox = (
//             layer.getGraphic().querySelector(".ig-layer-background") ||
//             layer.getGraphic()
//           ).getBoundingClientRect();
//           service.setSharedVar("x", Math.min(event.clientX, startx), { layer });
//           service.setSharedVar("width", Math.abs(event.clientX - startx), {
//             layer,
//           });
//           // service.setSharedVar(
//           //   "extent",
//           //   [event.clientX, startx]
//           //     .map((x) => layer.getSharedVar("scaleX").invert(x - baseBBox.x))
//           //     .sort((a, b) => a - b),
//           //   { layer }
//           // );
//           service.setSharedVar("currentx", event.clientX, { layer });
//           const transientLayer = layer.getLayerFromQueue("transientLayer");
//           // const matrix = matrixParse.fromElement(layer.getGraphic());
//           transientLayer.getGraphic().innerHTML = `<rect x="${Math.min(event.clientX, startx) - baseBBox.x
//             }" y="0" width="${Math.abs(event.clientX - startx)}" height="${baseBBox.height
//             }" class="transientRect" fill="#000" opacity="0.3" />`;
//         });
//       },
//     ],
//     dragend: [
//       ({ event, layer, instrument }) => {
//         if (event.changedTouches) event = event.changedTouches[0];
//         instrument.services.find("SelectionService").forEach((service) => {
//           service.setSharedVar("currentx", event.clientX, { layer });
//           service.setSharedVar("endx", event.clientX, { layer });
//           if (!instrument.getSharedVar("persistant")) {
//             const transientLayer = layer.getLayerFromQueue("transientLayer");
//             transientLayer.getGraphic().innerHTML = "";
//           }
//         });
//       },
//     ],
//     dragabort: [
//       ({ event, layer, instrument }) => {
//         if (event.changedTouches) event = event.changedTouches[0];
//         instrument.services.find("SelectionService").forEach((service) => {
//           service.setSharedVar("x", 0, { layer });
//           service.setSharedVar("y", 0, { layer });
//           service.setSharedVar("width", 0, { layer });
//           service.setSharedVar("height", 0, { layer });
//           service.setSharedVar("currentx", event.clientX, { layer });
//           service.setSharedVar("extent", undefined, { layer });
//           service.setSharedVar("endx", event.clientX, { layer });
//           const transientLayer = layer.getLayerFromQueue("transientLayer");
//           transientLayer.getGraphic().innerHTML = "";
//         });
//       },
//     ],
//   },
//   preAttach: (instrument, layer) => {
//     // Create default SM on layer
//     instrument.services.find("SelectionService", "RectSelectionService");
//   },
// });


Instrument.register("DragInstrument", {
  constructor: Instrument,
  interactors: ["MouseTraceInteractor", "TouchTraceInteractor"],
  on: {
    dragstart: [
      ({ layer, event, instrument }) => {
        if (event.changedTouches) event = event.changedTouches[0];
        instrument.services.find("SelectionService").forEach((service) => {
          service.setSharedVar("x", event.clientX, { layer });
          service.setSharedVar("y", event.clientY, { layer });
        });
        const transientLayer = layer.getLayerFromQueue("transientLayer");
        transientLayer.getGraphic().innerHTML = "";
      },
    ],
    drag: [
      ({ layer, event, instrument }) => {
        if (event.changedTouches) event = event.changedTouches[0];
        instrument.services.find("SelectionService").forEach((service) => {
          let offsetX = event.clientX - service.getSharedVar("x", { layer });
          let offsetY = event.clientY - service.getSharedVar("y", { layer });
          service.setSharedVar("currentx", event.clientX, { layer });
          service.setSharedVar("currenty", event.clientY, { layer });
          service.setSharedVar("offsetx", offsetX, { layer });
          service.setSharedVar("offsety", offsetY, { layer });
          const selectionLayer = layer.getLayerFromQueue("selectionLayer");
          const transientLayer = layer.getLayerFromQueue("transientLayer");
          transientLayer.getGraphic().innerHTML = `<g transform="translate(${offsetX}, ${offsetY})" opacity="0.5">${selectionLayer.getGraphic().innerHTML
            }</g>`;
        });
      },
    ],
    dragend: [
      ({ layer, event, instrument }) => {
        if (event.changedTouches) event = event.changedTouches[0];
        instrument.services.find("SelectionService").forEach((service) => {
          let offsetX = event.clientX - service.getSharedVar("x", { layer });
          let offsetY = event.clientY - service.getSharedVar("y", { layer });
          service.setSharedVar("x", 0, { layer });
          service.setSharedVar("y", 0, { layer });
          service.setSharedVar("currentx", event.clientX, { layer });
          service.setSharedVar("currenty", event.clientY, { layer });
          service.setSharedVar("offsetx", offsetX, { layer });
          service.setSharedVar("offsety", offsetY, { layer });
        });
        const transientLayer = layer.getLayerFromQueue("transientLayer");
        transientLayer.getGraphic().innerHTML = "";
      },
    ],
    dragabort: [
      (options) => {
        let { layer, event, instrument } = options;
        if (event.changedTouches) event = event.changedTouches[0];
        instrument.services.find("SelectionService").forEach((service) => {
          service.setSharedVar("x", 0, { layer });
          service.setSharedVar("y", 0, { layer });
          service.setSharedVar("currentx", event.clientX, { layer });
          service.setSharedVar("currenty", event.clientY, { layer });
          service.setSharedVar("offsetx", 0, { layer });
          service.setSharedVar("offsety", 0, { layer });
        });
        const transientLayer = layer.getLayerFromQueue("transientLayer");
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
    instrument.services.find(
      "SelectionService",
      "SurfacePointSelectionService"
    );
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
        // const speed = layer.getSharedVar("speed", 1) as number;
        const transientLayer = layer.getLayerFromQueue("transientLayer");
        const helperBar = transientLayer
          .getGraphic()
          .querySelector("line") as SVGElement;
        const transform = getTransform(helperBar);
        // const newX = transform[0] - speed;
        // helperBar.setAttribute("transform", `translate(${newX}, 0)`);
        // instrument.setSharedVar("barX", newX, {});
      },
    ],
    right: [
      ({ event, layer, instrument }) => {
        console.log("right");
        // const speed = layer.getSharedVar("speed", 1) as number;
        const transientLayer = layer.getLayerFromQueue("transientLayer");
        const helperBar = transientLayer
          .getGraphic()
          .querySelector("line") as SVGElement;
        const transform = getTransform(helperBar);
        // const newX = transform[0] + speed;
        // helperBar.setAttribute("transform", `translate(${newX}, 0)`);
        // instrument.setSharedVar("barX", newX, {});
      },
    ],
  },
  preAttach: function (instrument, layer) {
    console.log("preAttach");
    console.log(layer.getContainerGraphic());
    layer.getGraphic().setAttribute("tabindex", 0);
    layer.getGraphic().focus();
    // const height = layer.getSharedVar("height", 100);
    // const startX = layer.getSharedVar("startX", 0);
    const transientLayer = layer.getLayerFromQueue("transientLayer");
    const helperBar = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line"
    );

    // helperBar.setAttribute("x1", `${startX}`);
    // helperBar.setAttribute("y1", `${startX}`);
    // helperBar.setAttribute("x2", `${startX}`);
    // helperBar.setAttribute("y2", `${height}`);
    helperBar.setAttribute("stroke", `black`);
    helperBar.setAttribute("stroke-width", `1px`);
    (transientLayer.getGraphic() as SVGGElement).append(helperBar);
  },
});

/** only apply to linear scale. should record currentX as x in domain if fixRange is true */
Instrument.register("PanInstrument", {
  constructor: Instrument,
  interactors: ["MouseTraceInteractor", "TouchTraceInteractor"],
  on: {
    dragstart: [
      ({ layer, event, instrument }) => {
        if (event.changedTouches) event = event.changedTouches[0];
        instrument.setSharedVar("startx", event.clientX);
        instrument.setSharedVar("starty", event.clientY);
        const transformers = instrument.getSharedVar("transformers");
        transformers.forEach((transformer) => {
          const sx = transformer.getSharedVar("scaleX");
          const sy = transformer.getSharedVar("scaleY");
          if (sx) {
            transformer.setSharedVar("$$scaleX", sx.copy());
            // transformer.setSharedVar("startDomainX", sx.domain());
            // transformer.setSharedVar("startRangeX", sx.range());
          }
          if (sy) {
            transformer.setSharedVar("$$scaleY", sy.copy());
            // transformer.setSharedVar("startDomainY", sy.domain());
            // transformer.setSharedVar("startRangeY", sy.range());
          }
        })

        layer.getLayerFromQueue("selectionLayer").getGraphic().innerHTML = "";
        layer.getLayerFromQueue("transientLayer").getGraphic().innerHTML = "";
      },
    ],
    drag: [
      async ({ layer, event, instrument, transformer }) => {
        if (event.changedTouches) event = event.changedTouches[0];
        const transformers = instrument.getSharedVar("transformers");

        const startx = instrument.getSharedVar("startx");
        const starty = instrument.getSharedVar("starty");

        const fixRange = instrument.getSharedVar("fixRange") ?? false;

        transformers.forEach((transformer) => {
          const sx = transformer.getSharedVar("scaleX");
          const sy = transformer.getSharedVar("scaleY");
          if (fixRange) {
            if (sx) {
              const scaleXOrigin = transformer.getSharedVar("$$scaleX");
              const startRangeX = scaleXOrigin.range();
              const newRangeX = startRangeX.map((x, i) => x - event.clientX + startx);
              const newDomain = newRangeX.map(x => scaleXOrigin.invert(x));
              sx.domain(newDomain);
              transformer.setSharedVar("scaleX", sx);
            }
            if (sy) {
              const scaleYOrigin = transformer.getSharedVar("$$scaleY");
              const startRangeY = scaleYOrigin.range();
              const newRangeY = startRangeY.map((y, i) => y - event.clientY + starty);
              const newDomain = newRangeY.map(y => scaleYOrigin.invert(y));
              sy.domain(newDomain);
              transformer.setSharedVar("scaleY", sy);
            }
          } else {
            if (sx) {
              const startRangeX = transformer.getSharedVar("$$scaleX").range();
              const newRangeX = startRangeX.map((x, i) => x + event.clientX - startx);
              sx.range(newRangeX);
              transformer.setSharedVar("scaleX", sx);
            }
            if (sy) {
              // const newRangeY = sy.range().map((y) => y + offsetY);
              const startRangeY = transformer.getSharedVar("$$scaleY").range();
              const newRangeY = startRangeY.map((y, i) => y + event.clientY - starty);
              sy.range(newRangeY);
              transformer.setSharedVar("scaleY", sy);
            }
          }
        });

        layer.getLayerFromQueue("selectionLayer").getGraphic().innerHTML = "";
        layer.getLayerFromQueue("transientLayer").getGraphic().innerHTML = "";
      },
    ],
    dragabort: [
      ({ layer, event, instrument, transformer }) => {
        // if (event.changedTouches) event = event.changedTouches[0];
        // const sx = transformer.getTransformation("$$scaleX");
        // const sy = transformer.getTransformation("$$scaleY");
        // instrument.setSharedVar("startx", event.clientX);
        // instrument.setSharedVar("starty", event.clientY);
        // instrument.setSharedVar("currentx", event.clientX);
        // instrument.setSharedVar("currenty", event.clientY);
        // if (sx) {
        //   transformer.setTransformation("scaleX", sx);
        //   transformer.setTransformation("$scaleX", sx);
        // }
        // if (sy) {
        //   transformer.setTransformation("scaleY", sy);
        //   transformer.setTransformation("$scaleY", sy);
        // }
        // layer.getLayerFromQueue("selectionLayer").getGraphic().innerHTML = "";
        // layer.getLayerFromQueue("transientLayer").getGraphic().innerHTML = "";
      },
    ],
  },
});

Instrument.register("PanXInstrument", {
  constructor: Instrument,
  interactors: ["MouseTraceInteractor", "TouchTraceInteractor"],
  on: {
    dragstart: [
      ({ layer, event, instrument }) => {
        if (event.changedTouches) event = event.changedTouches[0];
        instrument.setSharedVar("startx", event.clientX);
        // instrument.setSharedVar("starty", event.clientY);
        const transformers = instrument.getSharedVar("transformers");
        transformers.forEach((transformer) => {
          const sx = transformer.getSharedVar("scaleX");
          // const sy = transformer.getSharedVar("scaleY");
          if (sx) {
            transformer.setSharedVar("$$scaleX", sx.copy());
            // transformer.setSharedVar("startDomainX", sx.domain());
            // transformer.setSharedVar("startRangeX", sx.range());
          }
          // if (sy) {
            // transformer.setSharedVar("$$scaleY", sy.copy());
            // transformer.setSharedVar("startDomainY", sy.domain());
            // transformer.setSharedVar("startRangeY", sy.range());
          // }
        })

        layer.getLayerFromQueue("selectionLayer").getGraphic().innerHTML = "";
        layer.getLayerFromQueue("transientLayer").getGraphic().innerHTML = "";
      },
    ],
    drag: [
      async ({ layer, event, instrument, transformer }) => {
        if (event.changedTouches) event = event.changedTouches[0];
        const transformers = instrument.getSharedVar("transformers");

        const startx = instrument.getSharedVar("startx");
        // const starty = instrument.getSharedVar("starty");

        const fixRange = instrument.getSharedVar("fixRange") ?? false;

        transformers.forEach((transformer) => {
          const sx = transformer.getSharedVar("scaleX");
          // const sy = transformer.getSharedVar("scaleY");
          if (fixRange) {
            if (sx) {
              const scaleXOrigin = transformer.getSharedVar("$$scaleX");
              const startRangeX = scaleXOrigin.range();
              const newRangeX = startRangeX.map((x, i) => x - event.clientX + startx);
              const newDomain = newRangeX.map(x => scaleXOrigin.invert(x));
              sx.domain(newDomain);
              transformer.setSharedVar("scaleX", sx);
            }
            // if (sy) {
            //   const scaleYOrigin = transformer.getSharedVar("$$scaleY");
            //   const startRangeY = scaleYOrigin.range();
            //   const newRangeY = startRangeY.map((y, i) => y - event.clientY + starty);
            //   const newDomain = newRangeY.map(y => scaleYOrigin.invert(y));
            //   sy.domain(newDomain);
            //   transformer.setSharedVar("scaleY", sy);
            // }
          } else {
            if (sx) {
              const startRangeX = transformer.getSharedVar("$$scaleX").range();
              const newRangeX = startRangeX.map((x, i) => x + event.clientX - startx);
              sx.range(newRangeX);
              transformer.setSharedVar("scaleX", sx);
            }
            // if (sy) {
            //   // const newRangeY = sy.range().map((y) => y + offsetY);
            //   const startRangeY = transformer.getSharedVar("$$scaleY").range();
            //   const newRangeY = startRangeY.map((y, i) => y + event.clientY - starty);
            //   sy.range(newRangeY);
            //   transformer.setSharedVar("scaleY", sy);
            // }
          }
        });

        layer.getLayerFromQueue("selectionLayer").getGraphic().innerHTML = "";
        layer.getLayerFromQueue("transientLayer").getGraphic().innerHTML = "";
      },
    ],
    dragabort: [
      ({ layer, event, instrument, transformer }) => {
        // if (event.changedTouches) event = event.changedTouches[0];
        // const sx = transformer.getTransformation("$$scaleX");
        // const sy = transformer.getTransformation("$$scaleY");
        // instrument.setSharedVar("startx", event.clientX);
        // instrument.setSharedVar("starty", event.clientY);
        // instrument.setSharedVar("currentx", event.clientX);
        // instrument.setSharedVar("currenty", event.clientY);
        // if (sx) {
        //   transformer.setTransformation("scaleX", sx);
        //   transformer.setTransformation("$scaleX", sx);
        // }
        // if (sy) {
        //   transformer.setTransformation("scaleY", sy);
        //   transformer.setTransformation("$scaleY", sy);
        // }
        // layer.getLayerFromQueue("selectionLayer").getGraphic().innerHTML = "";
        // layer.getLayerFromQueue("transientLayer").getGraphic().innerHTML = "";
      },
    ],
  },
});

Instrument.register("ZoomInstrument", {
  constructor: Instrument,
  interactors: ["MouseWheelInteractor"],
  on: {
    wheel: [
      ({ layer, instrument, event }) => {
        const layerGraphic = layer.getGraphic();
        const layerRoot = d3.select(layerGraphic);
        const transformers = instrument.getSharedVar("transformers");

        instrument.setSharedVar("currentx", event.offsetX);
        instrument.setSharedVar("currenty", event.offsetY);
        let delta = event.deltaY;
        instrument.setSharedVar("delta", delta);
        let cumulativeDelta = instrument.getSharedVar("cumulativeDelta", {
          defaultValue: 0,
        });
        cumulativeDelta += delta;
        instrument.setSharedVar("cumulativeDelta", cumulativeDelta);
        delta /= 1000;

        const [x, y] = d3.pointer(event, layerGraphic);
        const offsetX = instrument.getSharedVar("centroidX") || x;
        const offsetY = instrument.getSharedVar("centroidY") || y;

        const fixRange = instrument.getSharedVar("fixRange") ?? false;
        transformers.forEach((transformer) => {
          const sx = transformer.getSharedVar("scaleX");
          const sy = transformer.getSharedVar("scaleY");
          if (fixRange) {
            if (sx) {
              const offsetXDomain = sx.invert(offsetX);
              sx.domain(sx
                .domain()
                .map(d => d - offsetXDomain)
                .map(d => d * Math.exp(-delta))
                .map(d => d + offsetXDomain));
              transformers.forEach((transformer) => transformer.setSharedVar("scaleX", sx));
            }
            if (sy) {
              const offsetYDomain = sy.invert(offsetY);
              sy.domain(sy
                .domain()
                .map(d => d - offsetYDomain)
                .map(d => d * Math.exp(-delta))
                .map(d => d + offsetYDomain));
              transformers.forEach((transformer) => transformer.setSharedVar("scaleY", sy));
            }
          } else {
            if (sx) {
              const newRangeX = sx.range().map((x) => (x - offsetX) * Math.exp(delta) + offsetX);
              sx.range(newRangeX);
              transformer.setSharedVar("scaleX", sx);
            }
            if (sy) {
              const newRangeY = sy.range().map((y) => (y - offsetY) * Math.exp(delta) + offsetY);
              sy.range(newRangeY);
              transformer.setSharedVar("scaleY", sy);
            }
          }

        });

        // if (fixRange) {
        //   if (sx) {
        //     const scaleX = sx
        //       .copy()
        //       .domain(
        //         sx.range().map((x) => (x - offsetX) * Math.exp(delta) + offsetX)
        //       )
        //       .range(sx.domain());
        //     if (scaleX.clamp) scaleX.clamp(false);
        //     scaleX.domain(sx.range().map((x) => scaleX(x))).range(sx.range());
        //     transformers.forEach((transformer) => transformer.setSharedVar("scaleX", scaleX));
        //   }
        //   if (sy) {
        //     const scaleY = sy
        //       .copy()
        //       .domain(
        //         sy.range().map((y) => (y - offsetY) * Math.exp(delta) + offsetY)
        //       )
        //       .range(sy.domain());
        //     if (scaleY.clamp) scaleY.clamp(false);
        //     scaleY.domain(sy.range().map((y) => scaleY(y))).range(sy.range());
        //     transformers.forEach((transformer) => transformer.setSharedVar("scaleY", scaleY));
        //   }
        // } 
        // else {
        //   if (sx) {
        //     const proxyRaw = (
        //       raw: Transformation & { $origin: Transformation }
        //     ) =>
        //       new Proxy(raw, {
        //         get(target, path) {
        //           if (path in target) return target[path];
        //           if (path === "range")
        //             return (...args) =>
        //               (target.$origin as any)
        //                 .range(
        //                   ...args.map(
        //                     (x) => (x - offsetX) / Math.exp(delta) + offsetX
        //                   )
        //                 )
        //                 .map((x) => (x - offsetX) * Math.exp(delta) + offsetX);
        //           if (path === "bandwidth" && "bandwidth" in target.$origin) {
        //             return () =>
        //               (target.$origin as any).bandwidth() * Math.exp(delta);
        //           }
        //           return target.$origin[path];
        //         },
        //         apply(target, thisArg, argArray) {
        //           return target.apply(thisArg, argArray);
        //         },
        //         has(target, path) {
        //           return path in target || path in target.$origin;
        //         },
        //       });
        //     const scaleXRaw = (domain) =>
        //       (scaleXRaw.$origin(domain) - offsetX) * Math.exp(delta) + offsetX;
        //     scaleXRaw.invert = (range) =>
        //       scaleXRaw.$origin.invert(
        //         (range - offsetX) / Math.exp(delta) + offsetX
        //       );
        //     scaleXRaw.$origin = sx;
        //     scaleXRaw.copy = () => {
        //       const anotherScaleXRaw = (domain) =>
        //         (anotherScaleXRaw.$origin(domain) - offsetX) * Math.exp(delta) +
        //         offsetX;
        //       Object.assign(anotherScaleXRaw, scaleXRaw);
        //       anotherScaleXRaw.$origin = sx.copy();
        //       anotherScaleXRaw.invert = (range) =>
        //         anotherScaleXRaw.$origin.invert(
        //           (range - offsetX) / Math.exp(delta) + offsetX
        //         );
        //       return proxyRaw(anotherScaleXRaw as any);
        //     };
        //     const scaleX = proxyRaw(scaleXRaw);
        //     transformer.setTransformation("scaleX", scaleX);
        //   }
        //   if (sy) {
        //     const proxyRaw = (
        //       raw: Transformation & { $origin: Transformation }
        //     ) =>
        //       new Proxy(raw, {
        //         get(target, path) {
        //           if (path in target) return target[path];
        //           if (path === "range")
        //             return (...args) =>
        //               (target.$origin as any)
        //                 .range(...args)
        //                 .map((y) => (y - offsetY) * Math.exp(delta) + offsetY);
        //           if (path === "bandwidth" && "bandwidth" in target.$origin) {
        //             return () =>
        //               (target.$origin as any).bandwidth() * Math.exp(delta);
        //           }
        //           return target.$origin[path];
        //         },
        //         apply(target, thisArg, argArray) {
        //           return target.apply(thisArg, argArray);
        //         },
        //         has(target, path) {
        //           return path in target || path in target.$origin;
        //         },
        //       });
        //     const scaleYRaw = (domain) =>
        //       (scaleYRaw.$origin(domain) - offsetY) * Math.exp(delta) + offsetY;
        //     scaleYRaw.invert = (range) =>
        //       scaleYRaw.$origin.invert(
        //         (range - offsetY) / Math.exp(delta) + offsetY
        //       );
        //     scaleYRaw.$origin = sy;
        //     scaleYRaw.copy = () => {
        //       const anotherScaleYRaw = (domain) =>
        //         (anotherScaleYRaw.$origin(domain) - offsetY) * Math.exp(delta) +
        //         offsetY;
        //       Object.assign(anotherScaleYRaw, scaleYRaw);
        //       anotherScaleYRaw.invert = (range) =>
        //         anotherScaleYRaw.$origin.invert(
        //           (range - offsetY) / Math.exp(delta) + offsetY
        //         );
        //       anotherScaleYRaw.$origin = sy.copy();
        //       return proxyRaw(anotherScaleYRaw as any);
        //     };
        //     const scaleY = proxyRaw(scaleYRaw);
        //     transformer.setTransformation("scaleY", scaleY);
        //   }
        // }
        layer.getLayerFromQueue("selectionLayer").getGraphic().innerHTML = "";
        layer.getLayerFromQueue("transientLayer").getGraphic().innerHTML = "";
      },
    ],
    abort: [
      ({ layer, event, instrument, transformer }) => {
        // const sx = transformer.getTransformation("$$scaleX");
        // const sy = transformer.getTransformation("$$scaleY");
        // instrument.setSharedVar("delta", 0);
        // instrument.setSharedVar("currentx", event.offsetX);
        // instrument.setSharedVar("currenty", event.offsetY);
        // if (sx) {
        //   transformer.setTransformation("scaleX", sx);
        // }
        // if (sy) {
        //   transformer.setTransformation("scaleY", sy);
        // }
        // layer.getLayerFromQueue("selectionLayer").getGraphic().innerHTML = "";
        // layer.getLayerFromQueue("transientLayer").getGraphic().innerHTML = "";
      },
    ],
  },
});

Instrument.register("ZoomXInstrument", {
  constructor: Instrument,
  interactors: ["MouseWheelInteractor"],
  on: {
    wheel: [
      ({ layer, instrument, event }) => {
        const layerGraphic = layer.getGraphic();
        const layerRoot = d3.select(layerGraphic);
        const transformers = instrument.getSharedVar("transformers");

        instrument.setSharedVar("currentx", event.offsetX);
        // instrument.setSharedVar("currenty", event.offsetY);
        let delta = event.deltaY;
        instrument.setSharedVar("delta", delta);
        let cumulativeDelta = instrument.getSharedVar("cumulativeDelta", {
          defaultValue: 0,
        });
        cumulativeDelta += delta;
        instrument.setSharedVar("cumulativeDelta", cumulativeDelta);
        delta /= 1000;

        const [x, y] = d3.pointer(event, layerGraphic);
        const offsetX = instrument.getSharedVar("centroidX") || x;
        // const offsetY = instrument.getSharedVar("centroidY") || y;

        const fixRange = instrument.getSharedVar("fixRange") ?? false;
        transformers.forEach((transformer) => {
          const sx = transformer.getSharedVar("scaleX");
          // const sy = transformer.getSharedVar("scaleY");
          if (fixRange) {
            if (sx) {
              const offsetXDomain = sx.invert(offsetX);
              sx.domain(sx
                .domain()
                .map(d => d - offsetXDomain)
                .map(d => d * Math.exp(-delta))
                .map(d => d + offsetXDomain));
              transformers.forEach((transformer) => transformer.setSharedVar("scaleX", sx));
            }
            // if (sy) {
            //   const offsetYDomain = sy.invert(offsetY);
            //   sy.domain(sy
            //     .domain()
            //     .map(d => d - offsetYDomain)
            //     .map(d => d * Math.exp(-delta))
            //     .map(d => d + offsetYDomain));
            //   transformers.forEach((transformer) => transformer.setSharedVar("scaleY", sy));
            // }
          } else {
            if (sx) {
              const newRangeX = sx.range().map((x) => (x - offsetX) * Math.exp(delta) + offsetX);
              sx.range(newRangeX);
              transformer.setSharedVar("scaleX", sx);
            }
            // if (sy) {
            //   const newRangeY = sy.range().map((y) => (y - offsetY) * Math.exp(delta) + offsetY);
            //   sy.range(newRangeY);
            //   transformer.setSharedVar("scaleY", sy);
            // }
          }

        });
        layer.getLayerFromQueue("selectionLayer").getGraphic().innerHTML = "";
        layer.getLayerFromQueue("transientLayer").getGraphic().innerHTML = "";
      },
    ],
    abort: [
      ({ layer, event, instrument, transformer }) => {
        // const sx = transformer.getTransformation("$$scaleX");
        // const sy = transformer.getTransformation("$$scaleY");
        // instrument.setSharedVar("delta", 0);
        // instrument.setSharedVar("currentx", event.offsetX);
        // instrument.setSharedVar("currenty", event.offsetY);
        // if (sx) {
        //   transformer.setTransformation("scaleX", sx);
        // }
        // if (sy) {
        //   transformer.setTransformation("scaleY", sy);
        // }
        // layer.getLayerFromQueue("selectionLayer").getGraphic().innerHTML = "";
        // layer.getLayerFromQueue("transientLayer").getGraphic().innerHTML = "";
      },
    ],
  },
});


// function getTransformMatrix(transform: string){
//   const regex = /.*matrix\t*(\t*\t*).*/;
//   return tran
// }
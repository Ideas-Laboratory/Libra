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
      },
    ],
  },
  preAttach: (instrument, layer) => {
    instrument.services.add("SurfacePointSelectionService", {
      layer,
      sharedVar: {
        deepClone: instrument.getSharedVar("deepClone"),
        highlightColor: instrument.getSharedVar("highlightColor"),
        highlightAttrValues: instrument.getSharedVar("highlightAttrValues"),
      },
    });
  },
});

Instrument.register("ClickInstrument", {
  constructor: Instrument,
  interactors: ["MouseTraceInteractor", "TouchTraceInteractor"],
  on: {
    dragstart: [
      async (options) => {
        let { event, layer, instrument } = options;
        if (event.changedTouches) event = event.changedTouches[0];
        instrument.setSharedVar("x", event.clientX);
        instrument.setSharedVar("y", event.clientY);
        const services = instrument.services.find("SelectionService");
        services.setSharedVar("x", event.clientX, { layer: layer });
        services.setSharedVar("y", event.clientY, { layer: layer });

        instrument.emit("clickstart", {
          ...options,
          self: options.instrument,
        });
      },
    ],
    dragend: [
      async (options) => {
        let { event, layer, instrument } = options;
        if (event.changedTouches) event = event.changedTouches[0];
        const services = instrument.services.find("SelectionService");
        services.setSharedVar("x", 0, { layer: layer });
        services.setSharedVar("y", 0, { layer: layer });

        if (
          event.clientX === instrument.getSharedVar("x") &&
          event.clientY === instrument.getSharedVar("y")
        ) {
          instrument.setSharedVar("x", 0);
          instrument.setSharedVar("y", 0);
          instrument.emit("click", {
            ...options,
            self: options.instrument,
          });
        } else {
          instrument.setSharedVar("x", 0);
          instrument.setSharedVar("y", 0);
          instrument.emit("clickabort", {
            ...options,
            self: options.instrument,
          });
        }
      },
    ],
    dragabort: [
      (options) => {
        if (options.event.changedTouches)
          options.event = options.event.changedTouches[0];
        const services = options.instrument.services.find("SelectionService");
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
    instrument.services.add("SurfacePointSelectionService", {
      layer,
      sharedVar: {
        deepClone: instrument.getSharedVar("deepClone"),
        highlightColor: instrument.getSharedVar("highlightColor"),
        highlightAttrValues: instrument.getSharedVar("highlightAttrValues"),
      },
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
      async ({ event, layer, instrument }) => {
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

        instrument.transformers.setSharedVars({
          x: x - layer.getGraphic().getBoundingClientRect().left,
          y: y - layer.getGraphic().getBoundingClientRect().top,
          width,
          height,
        });
      },
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
        instrument.transformers.setSharedVars({
          x: 0,
          y: 0,
          width: 0,
          height: 0,
        });
      },
    ],
  },
  preAttach: (instrument, layer) => {
    // create selectionLayer first
    layer.getLayerFromQueue("selectionLayer");

    instrument.services.add("RectSelectionService", {
      layer,
      sharedVar: {
        deepClone: instrument.getSharedVar("deepClone"),
        highlightColor: instrument.getSharedVar("highlightColor"),
        highlightAttrValues: instrument.getSharedVar("highlightAttrValues"),
      },
    });

    instrument.transformers.add("TransientRectangleTransformer", {
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
        const services = instrument.services;
        services.setSharedVar("x", event.clientX, { layer });
        services.setSharedVar("width", 1, { layer });
        services.setSharedVar("startx", event.clientX, { layer });
        services.setSharedVar("currentx", event.clientX, { layer });
        instrument.setSharedVar("startx", event.offsetX);
        instrument.transformers
          .find("TransientRectangleTransformer")
          .setSharedVars({
            x: 0,
            width: 1,
          });
      },
    ],
    drag: [
      async ({ event, layer, instrument }) => {
        if (event.changedTouches) event = event.changedTouches[0];

        const startx = instrument.getSharedVar("startx");

        const x = Math.min(startx, event.offsetX);
        const width = Math.abs(event.offsetX - startx);
        const layerOffsetX = layer.getGraphic().getBoundingClientRect().left;

        // selection, currently service use client coordinates, but coordinates relative to the layer maybe more appropriate.
        const services = instrument.services;

        const scaleX = instrument.getSharedVar("scaleX");
        if (scaleX && scaleX.invert) {
          const newExtent = [x - layerOffsetX, x - layerOffsetX + width].map(
            scaleX.invert
          );

          instrument.setSharedVar("extent", newExtent);
        }

        services.setSharedVar("x", x, { layer });
        services.setSharedVar("width", width, {
          layer,
        });
        services.setSharedVar("currentx", event.clientX, { layer });

        instrument.setSharedVar("currentx", event.offsetX);

        instrument.transformers.setSharedVars({
          x: x - (layer as any)._offset?.x,
          width,
        });
      },
    ],
    dragabort: [
      async ({ event, layer, instrument }) => {
        if (event.changedTouches) event = event.changedTouches[0];
        const services = instrument.services;
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

Instrument.register("HelperLineInstrument", {
  constructor: Instrument,
  sharedVar: { orientation: ["horizontal"] },
  interactors: ["MousePositionInteractor", "TouchPositionInteractor"],
  on: {
    hover: [
      ({ event, layer, instrument }) => {
        if (event.changedTouches) event = event.changedTouches[0];
        instrument.transformers.setSharedVars({
          x: event.offsetX,
          y: event.offsetY,
        });
        instrument.setSharedVar("x", event.offsetX, {});
        instrument.setSharedVar("y", event.offsetY, {});
      },
    ],
  },
  preAttach: function (instrument, layer) {
    instrument.transformers.add("HelperLineTransformer", {
      layer: layer.getLayerFromQueue("transientLayer"),
      sharedVar: {
        orientation: instrument.getSharedVar("orientation"),
        style: instrument.getSharedVar("style") || {},
        tooltip: instrument.getSharedVar("tooltip"),
        scaleX: instrument.getSharedVar("scaleX"),
        scaleY: instrument.getSharedVar("scaleY"),
      },
    });
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
        const services = instrument.services.find(
          "Quantitative2DSelectionService"
        );
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

    const services = instrument.services.add("Quantitative2DSelectionService", {
      layer,
    });
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
        sharedVar: {
          highlightAttrValues:
            instrument.getSharedVar("highlightAttrValues") || {},
        },
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
        const services = instrument.services.find(
          "QuantitativeSelectionService"
        );
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
          const newExtent = [x - layerOffsetX, x - layerOffsetX + width].map(
            scaleX.invert
          );

          // selection, currently service use client coordinates, but coordinates relative to the layer maybe more appropriate.
          const services = instrument.services.find(
            "QuantitativeSelectionService"
          );
          instrument.setSharedVar("extent", newExtent);
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

    const services = instrument.services.add("QuantitativeSelectionService", {
      layer,
    });
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
        sharedVar: {
          highlightAttrValues:
            instrument.getSharedVar("highlightAttrValues") || {},
        },
      });
  },
});

Instrument.register("DragInstrument", {
  constructor: Instrument,
  interactors: ["MouseTraceInteractor", "TouchTraceInteractor"],
  on: {
    dragstart: [
      ({ layer, event, instrument }) => {
        if (event.changedTouches) event = event.changedTouches[0];
        instrument.services.setSharedVar("x", event.clientX, { layer });
        instrument.services.setSharedVar("y", event.clientY, { layer });
      },
    ],
    drag: [
      ({ layer, event, instrument }) => {
        if (event.changedTouches) event = event.changedTouches[0];
        const offsetX =
          event.clientX - instrument.services.getSharedVar("x", { layer })[0];
        const offsetY =
          event.clientY - instrument.services.getSharedVar("y", { layer })[0];
        instrument.setSharedVar("offsetx", offsetX, { layer });
        instrument.setSharedVar("offsety", offsetY, { layer });
      },
    ],
    dragend: [
      ({ layer, event, instrument }) => {
        if (event.changedTouches) event = event.changedTouches[0];
        const offsetX =
          event.clientX - instrument.services.getSharedVar("x", { layer })[0];
        const offsetY =
          event.clientY - instrument.services.getSharedVar("y", { layer })[0];
        instrument.services.setSharedVar("x", 0, { layer });
        instrument.services.setSharedVar("y", 0, { layer });
        instrument.setSharedVar("offsetx", offsetX, { layer });
        instrument.setSharedVar("offsety", offsetY, { layer });
      },
    ],
    dragabort: [
      (options) => {
        let { layer, event, instrument } = options;
        if (event.changedTouches) event = event.changedTouches[0];
        instrument.services.setSharedVar("x", 0, { layer });
        instrument.services.setSharedVar("y", 0, { layer });
        instrument.services.setSharedVar("currentx", event.clientX, { layer });
        instrument.services.setSharedVar("currenty", event.clientY, { layer });
        instrument.services.setSharedVar("offsetx", 0, { layer });
        instrument.services.setSharedVar("offsety", 0, { layer });
        instrument.emit("dragconfirm", {
          ...options,
          self: options.instrument,
        });
      },
    ],
  },
  preAttach: (instrument, layer) => {
    // Create default SM on layer
    instrument.services.add("SurfacePointSelectionService", {
      layer,
      sharedVar: { deepClone: instrument.getSharedVar("deepClone") },
    });
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
        const speed = instrument.getSharedVar("speed") || (1 as number);
        const transientLayer = layer.getLayerFromQueue("transientLayer");
        const helperBar = transientLayer
          .getGraphic()
          .querySelector("line") as SVGElement;
        const transform = getTransform(helperBar);
        const newX = transform[0] - speed;
        helperBar.setAttribute("transform", `translate(${newX}, 0)`);
        instrument.setSharedVar("barX", newX, {});
      },
    ],
    right: [
      ({ event, layer, instrument }) => {
        const speed = instrument.getSharedVar("speed") || (1 as number);
        const transientLayer = layer.getLayerFromQueue("transientLayer");
        const helperBar = transientLayer
          .getGraphic()
          .querySelector("line") as SVGElement;
        const transform = getTransform(helperBar);
        const newX = transform[0] + speed;
        helperBar.setAttribute("transform", `translate(${newX}, 0)`);
        instrument.setSharedVar("barX", newX, {});
      },
    ],
  },
  preAttach: function (instrument, layer) {
    layer.getGraphic().setAttribute("tabindex", 0);
    layer.getGraphic().focus();
    // const startX = layer.getSharedVar("startX", 0);
    const height = (layer as any)._height;
    const startPos = instrument.getSharedVar("startPos");
    const transientLayer = layer.getLayerFromQueue("transientLayer");
    const helperBar = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line"
    );
    helperBar.setAttribute("x1", startPos);
    helperBar.setAttribute("y1", "0");
    helperBar.setAttribute("x2", startPos);
    helperBar.setAttribute("y2", height);
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
        const transformers = instrument.transformers;
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
        });
      },
    ],
    drag: [
      async ({ layer, event, instrument, transformer }) => {
        if (event.changedTouches) event = event.changedTouches[0];
        const transformers = instrument.transformers;

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
              const newRangeX = startRangeX.map(
                (x, i) => x - event.clientX + startx
              );
              const newDomain = newRangeX.map((x) => scaleXOrigin.invert(x));
              sx.domain(newDomain);
              transformer.setSharedVar("scaleX", sx);
            }
            if (sy) {
              const scaleYOrigin = transformer.getSharedVar("$$scaleY");
              const startRangeY = scaleYOrigin.range();
              const newRangeY = startRangeY.map(
                (y, i) => y - event.clientY + starty
              );
              const newDomain = newRangeY.map((y) => scaleYOrigin.invert(y));
              sy.domain(newDomain);
              transformer.setSharedVar("scaleY", sy);
            }
          } else {
            if (sx) {
              const startRangeX = transformer.getSharedVar("$$scaleX").range();
              const newRangeX = startRangeX.map(
                (x, i) => x + event.clientX - startx
              );
              sx.range(newRangeX);
              transformer.setSharedVar("scaleX", sx);
            }
            if (sy) {
              // const newRangeY = sy.range().map((y) => y + offsetY);
              const startRangeY = transformer.getSharedVar("$$scaleY").range();
              const newRangeY = startRangeY.map(
                (y, i) => y + event.clientY - starty
              );
              sy.range(newRangeY);
              transformer.setSharedVar("scaleY", sy);
            }
          }
        });
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
        const transformers = instrument.transformers;
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
        });
      },
    ],
    drag: [
      async ({ layer, event, instrument, transformer }) => {
        if (event.changedTouches) event = event.changedTouches[0];
        const transformers = instrument.transformers;

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
              const newRangeX = startRangeX.map(
                (x, i) => x - event.clientX + startx
              );
              const newDomain = newRangeX.map((x) => scaleXOrigin.invert(x));
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
              const newRangeX = startRangeX.map(
                (x, i) => x + event.clientX - startx
              );
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

Instrument.register("GeometricZoomInstrument", {
  constructor: Instrument,
  interactors: ["MouseWheelInteractor"],
  on: {
    wheel: [
      ({ layer, instrument, event }) => {
        const layerGraphic = layer.getGraphic();
        const layerRoot = d3.select(layerGraphic);
        const transformers = instrument.transformers;

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
              sx.domain(
                sx
                  .domain()
                  .map((d) => d - offsetXDomain)
                  .map((d) => d * Math.exp(-delta))
                  .map((d) => d + offsetXDomain)
              );
              transformers.forEach((transformer) =>
                transformer.setSharedVar("scaleX", sx)
              );
            }
            if (sy) {
              const offsetYDomain = sy.invert(offsetY);
              sy.domain(
                sy
                  .domain()
                  .map((d) => d - offsetYDomain)
                  .map((d) => d * Math.exp(-delta))
                  .map((d) => d + offsetYDomain)
              );
              transformers.forEach((transformer) =>
                transformer.setSharedVar("scaleY", sy)
              );
            }
          } else {
            if (sx) {
              const newRangeX = sx
                .range()
                .map((x) => (x - offsetX) * Math.exp(delta) + offsetX);
              sx.range(newRangeX);
              transformer.setSharedVar("scaleX", sx);
            }
            if (sy) {
              const newRangeY = sy
                .range()
                .map((y) => (y - offsetY) * Math.exp(delta) + offsetY);
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

Instrument.register("SemanticZoomInstrument", {
  constructor: Instrument,
  interactors: ["MouseWheelInteractor"],
  sharedVar: {
    currentLevel: 0,
  },
  on: {
    wheel: [
      ({ layer, instrument, event }) => {
        const layerGraphic = layer.getGraphic();
        const layerRoot = d3.select(layerGraphic);
        const transformers = instrument.transformers;

        const scaleLevels = instrument.getSharedVar("scaleLevels");
        let currentLevel = instrument.getSharedVar("currentLevel");

        currentLevel += Math.sign(event.deltaY);

        instrument.setSharedVar("currentLevel", currentLevel);

        if (typeof scaleLevels === "object") {
          const closestLevel = Object.keys(scaleLevels).reduce(function (
            prev,
            curr
          ) {
            return Math.abs(parseInt(curr) - currentLevel) <
              Math.abs(parseInt(prev) - currentLevel)
              ? curr
              : prev;
          });

          transformers.setSharedVars(scaleLevels[closestLevel]);
        }

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
              sx.domain(
                sx
                  .domain()
                  .map((d) => d - offsetXDomain)
                  .map((d) => d * Math.exp(-delta))
                  .map((d) => d + offsetXDomain)
              );
              transformers.forEach((transformer) =>
                transformer.setSharedVar("scaleX", sx)
              );
            }
            if (sy) {
              const offsetYDomain = sy.invert(offsetY);
              sy.domain(
                sy
                  .domain()
                  .map((d) => d - offsetYDomain)
                  .map((d) => d * Math.exp(-delta))
                  .map((d) => d + offsetYDomain)
              );
              transformers.forEach((transformer) =>
                transformer.setSharedVar("scaleY", sy)
              );
            }
          } else {
            if (sx) {
              const newRangeX = sx
                .range()
                .map((x) => (x - offsetX) * Math.exp(delta) + offsetX);
              sx.range(newRangeX);
              transformer.setSharedVar("scaleX", sx);
            }
            if (sy) {
              const newRangeY = sy
                .range()
                .map((y) => (y - offsetY) * Math.exp(delta) + offsetY);
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
  postUse(instrument, layer) {
    const scaleLevels = instrument.getSharedVar("scaleLevels");
    const transformers = instrument.transformers;
    const currentLevel = instrument.getSharedVar("currentLevel");

    if (typeof scaleLevels === "object") {
      const closestLevel = Object.keys(scaleLevels).reduce(function (
        prev,
        curr
      ) {
        return Math.abs(parseInt(curr) - currentLevel) <
          Math.abs(parseInt(prev) - currentLevel)
          ? curr
          : prev;
      });

      transformers.setSharedVars(scaleLevels[closestLevel]);
    }
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
        const transformers = instrument.transformers;

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
              sx.domain(
                sx
                  .domain()
                  .map((d) => d - offsetXDomain)
                  .map((d) => d * Math.exp(-delta))
                  .map((d) => d + offsetXDomain)
              );
              transformers.forEach((transformer) =>
                transformer.setSharedVar("scaleX", sx)
              );
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
              const newRangeX = sx
                .range()
                .map((x) => (x - offsetX) * Math.exp(delta) + offsetX);
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

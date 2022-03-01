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
          GraphicalTransformer.initialize("HighlightSelection", {
            layer: layer.getLayerFromQueue("selectionLayer"),
            sharedVar: {
                 highlightAttrValues: instrument.getSharedVar("highlightAttrValues") || {},
              // highlightValue: instrument.getSharedVar("highlightValue"),
              // highlightAttr: instrument.getSharedVar("highlightAttr") || "fill",
            },
          });
        }
      },
    ],
  },
  preAttach: (instrument, layer) => {
    // Create default SM on layer
    instrument.services.find(
      "SelectionService",
      "SurfacePointSelectionService"
    );
    instrument.services.forEach((service) => {
      service._layerInstances.push(layer);
    });
  },
});

Instrument.register("BrushInstrument", {
  constructor: Instrument,
  interactors: ["MouseTraceInteractor", "TouchTraceInteractor"],
  on: {
    dragstart: [
      Command.initialize("setInitialState", {
        execute: async ({ event, layer, instrument }) => {
          if (event.changedTouches) event = event.changedTouches[0];
          const services = instrument.services.find("RectSelectionService")
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
        }
      }),
    ],
    drag: [
      Command.initialize("drawBrushAndSelect", {
        execute: async ({ event, layer, instrument }) => {
          if (event.changedTouches) event = event.changedTouches[0];

          const startx = instrument.getSharedVar("startx");
          const starty = instrument.getSharedVar("starty");

          const x = Math.min(startx, event.clientX);
          const y = Math.min(starty, event.clientY);
          const width = Math.abs(event.clientX - startx);
          const height = Math.abs(event.clientY - starty);

          // selection, currently service use client coordinates, but coordinates relative to the layer maybe more appropriate.
          const services = instrument.services.find("SelectionService")
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
          await Promise.all(instrument.services.results);
        },
        feedback: [
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
            const transformers = GraphicalTransformer.findTransformer("TransientRectangleTransformer");
            transformers.forEach((tf) => {
              tf.setSharedVar("x", x - baseBBox.left)
              tf.setSharedVar("y", y - baseBBox.top)
              tf.setSharedVar("width", width)
              tf.setSharedVar("height", height)
            }
            );
          },
          async ({ event, layer, instrument }) => {
            GraphicalTransformer.initialize("HighlightSelection", {
              layer: layer.getLayerFromQueue("selectionLayer"),
              sharedVar: {
                // highlightAttr: instrument.getSharedVar("highlightAttr") || "fill",
                // highlightValue: instrument.getSharedVar("highlightValue") || "red",
                highlightAttrValues: instrument.getSharedVar("highlightAttrValues") || {},
              },
            });
          }]
      })
    ],
    dragend: [
      Command.initialize("clearOrPersistant", {
        execute: async ({ event, layer, instrument }) => {
          if (event.changedTouches) event = event.changedTouches[0];
          if (!instrument.getSharedVar("persistant")) {
            const services = instrument.services.find("SelectionService");
            services.setSharedVar("width", -1, { layer });
            services.setSharedVar("height", -1, { layer });
          }
        },
        feedback: [async ({ event, layer, instrument }) => {
          if (event.changedTouches) event = event.changedTouches[0];
          if (!instrument.getSharedVar("persistant")) {
            const transformers = GraphicalTransformer.findTransformer("TransientRectangleTransformer");
            transformers.forEach((tf) => {
              tf.setSharedVar("width", 0)
              tf.setSharedVar("height", 0)
            }
            );
          }
        }]
      }),
    ],
    dragabort: [
      Command.initialize("abort", {
        execute: async ({ event, layer, instrument }) => {
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
          // const transientLayer = layer.getLayerFromQueue("transientLayer");
          // transientLayer.getGraphic().innerHTML = "";

        },
      })

    ],

  },
  preAttach: (instrument, layer) => {
    console.log(layer);
    // Create default SM on layer
    instrument.services.find("SelectionService", "RectSelectionService");
    const services = instrument.services.find("SelectionService");
    services[0]._layerInstances.push(layer);

    const transformer = GraphicalTransformer.initialize("TransientRectangleTransformer", {
      layer: layer.getLayerFromQueue("transientLayer"),
      sharedVar: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        fill: "#000",
        opacity: 0.3
      },
    });

  },
});






Instrument.register("BrushXInstrument", {
  constructor: Instrument,
  interactors: ["MouseTraceInteractor", "TouchTraceInteractor"],
  on: {
    dragstart: [
      Command.initialize("setInitialState", {
        execute: async ({ event, layer, instrument }) => {
          if (event.changedTouches) event = event.changedTouches[0];
          const services = instrument.services.find("RectSelectionService")
          services.setSharedVar("x", event.clientX, { layer });
          services.setSharedVar("width", 1, { layer });
          services.setSharedVar("startx", event.clientX, { layer });
          services.setSharedVar("currentx", event.clientX, { layer });
          instrument.setSharedVar("startx", event.clientX);
        }
      }),
    ],
    drag: [
      Command.initialize("drawBrushAndSelect", {
        execute: async ({ event, layer, instrument }) => {
          if (event.changedTouches) event = event.changedTouches[0];

          const startx = instrument.getSharedVar("startx");
          const starty = instrument.getSharedVar("starty");

          const x = Math.min(startx, event.clientX);
          const width = Math.abs(event.clientX - startx);

          // selection, currently service use client coordinates, but coordinates relative to the layer maybe more appropriate.
          const services = instrument.services.find("SelectionService")
          // services.setSharedVar("y", -100, { layer });
          // services.setSharedVar("height", 1000, { layer });
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
            const transformers = GraphicalTransformer.findTransformer("TransientRectangleTransformer");
            transformers.forEach((tf) => {
              tf.setSharedVar("x", x - baseBBox.left)
              tf.setSharedVar("width", width)
            }
            );
          },
          async ({ event, layer, instrument }) => {
            GraphicalTransformer.initialize("HighlightSelection", {
              layer: layer.getLayerFromQueue("selectionLayer"),
              sharedVar: {
                // highlightAttr: instrument.getSharedVar("highlightAttr") || "fill",
                // highlightValue: instrument.getSharedVar("highlightValue") || "red",
                highlightAttrValues: instrument.getSharedVar("highlightAttrValues") || {},
              },
            });
          }]
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
        feedback: [async ({ event, layer, instrument }) => {
          if (event.changedTouches) event = event.changedTouches[0];
          if (!instrument.getSharedVar("persistant")) {
            const transformers = GraphicalTransformer.findTransformer("TransientRectangleTransformer");
            transformers.forEach((tf) => {
              tf.setSharedVar("width", 0)
            }
            );
          }
        }]
      }),

    ],
    dragabort: [
      Command.initialize("abort", {
        execute: async ({ event, layer, instrument }) => {
          if (event.changedTouches) event = event.changedTouches[0];
          const services = instrument.services.find("SelectionService");
          services.setSharedVar("x", 0, { layer });
          services.setSharedVar("width", 0, { layer });
          services.setSharedVar("currentx", event.clientX, { layer });
          services.setSharedVar("endx", event.clientX, { layer });

        },
      })

    ],

  },
  preAttach: (instrument, layer) => {

    //     const targetLayer = instrument.getSharedVar("targetLayer");
    // const y = instrument.getSharedVar("y") ?? 0;
    // const height = instrument.getSharedVar("height") ?? (layer as any)._height;
    // // const service = Service.initialize("RectSelectionService"), {};

    // // Create default SM on layer
    // instrument.services.find("SelectionService", "RectSelectionService");
    // const services = instrument.services.find("SelectionService");
    // services[0]._layerInstances = [targetLayer];
    // services.setSharedVar("height", height, { targetLayer });
    // services.setSharedVar("y", y, { targetLayer });
    // console.log("services", services);

    // const transformer = GraphicalTransformer.initialize("TransientRectangleTransformer", {
    //   layer: layer.getLayerFromQueue("transientLayer"),
    //   sharedVar: {
    //     x: 0,
    //     y: y,
    //     width: 0,
    //     height: height,
    //     fill: "#000",
    //     opacity: 0.3
    //   },
    // });

    const y = instrument.getSharedVar("y") ?? 0;
    const height = instrument.getSharedVar("height") ?? (layer as any)._height;
    // Create default SM on layer
    instrument.services.find("SelectionService", "RectSelectionService");
    const services = instrument.services.find("SelectionService");

    const bbox = layer.getGraphic().getBoundingClientRect();
    services.setSharedVar("y", bbox.y+y);
    services.setSharedVar("height", height);

    services[0]._layerInstances.push(layer);

    const transformer = GraphicalTransformer.initialize("TransientRectangleTransformer", {
      layer: layer.getLayerFromQueue("transientLayer"),
      sharedVar: {
        x: 0,
        y: y,
        width: 0,
        height: height,
        fill: "#000",
        opacity: 0.3
      },
    });

  },
});


Instrument.register("BrushYInstrument", {
  constructor: Instrument,
  interactors: ["MouseTraceInteractor", "TouchTraceInteractor"],
  on: {
    dragstart: [
      ({ event, layer, instrument }) => {
        if (event.changedTouches) event = event.changedTouches[0];
        instrument.services.find("SelectionService").forEach((service) => {
          const baseBBox = (
            layer.getGraphic().querySelector(".ig-layer-background") ||
            layer.getGraphic()
          ).getBoundingClientRect();
          service.setSharedVar("x", baseBBox.x, { layer });
          service.setSharedVar("y", event.clientY, { layer });
          service.setSharedVar("width", baseBBox.width, { layer });
          service.setSharedVar("height", 1, { layer });
          service.setSharedVar("starty", event.clientY, { layer });
          service.setSharedVar("currenty", event.clientY, { layer });
          const transientLayer = layer.getLayerFromQueue("transientLayer");
          transientLayer.getGraphic().innerHTML = "";
        });
      },
    ],
    drag: [
      ({ event, layer, instrument }) => {
        if (event.changedTouches) event = event.changedTouches[0];
        instrument.services.find("SelectionService").forEach((service) => {
          const startx = service.getSharedVar("startx", { layer });
          const starty = service.getSharedVar("starty", { layer });
          service.setSharedVar("y", Math.min(event.clientY, starty), { layer });
          service.setSharedVar("height", Math.abs(event.clientY - starty), {
            layer,
          });
          service.setSharedVar("currenty", event.clientY, { layer });
          const baseBBox = (
            layer.getGraphic().querySelector(".ig-layer-background") ||
            layer.getGraphic()
          ).getBoundingClientRect();
          const transientLayer = layer.getLayerFromQueue("transientLayer");
          transientLayer.getGraphic().innerHTML = `<rect x=0 y=${Math.min(event.clientY, starty) - baseBBox.y
            } width=${baseBBox.width} height=${Math.abs(
              event.clientY - starty
            )} class="transientRect" fill="#000" opacity="0.3" />`;
        });
      },
    ],
    dragend: [
      ({ event, layer, instrument }) => {
        if (event.changedTouches) event = event.changedTouches[0];
        instrument.services.find("SelectionService").forEach((service) => {
          service.setSharedVar("currenty", event.clientY, { layer });
          service.setSharedVar("endy", event.clientY, { layer });
          if (!instrument.getSharedVar("persistant")) {
            const transientLayer = layer.getLayerFromQueue("transientLayer");
            transientLayer.getGraphic().innerHTML = "";
          }
        });
      },
    ],
    dragabort: [
      ({ event, layer, instrument }) => {
        if (event.changedTouches) event = event.changedTouches[0];
        instrument.services.find("SelectionService").forEach((service) => {
          service.setSharedVar("x", 0, { layer });
          service.setSharedVar("y", 0, { layer });
          service.setSharedVar("width", 0, { layer });
          service.setSharedVar("height", 0, { layer });
          service.setSharedVar("currentx", event.clientX, { layer });
          service.setSharedVar("currenty", event.clientY, { layer });
          service.setSharedVar("endx", event.clientX, { layer });
          service.setSharedVar("endy", event.clientY, { layer });
          const transientLayer = layer.getLayerFromQueue("transientLayer");
          transientLayer.getGraphic().innerHTML = "";
        });
      },
    ],
  },
  preAttach: (instrument, layer) => {
    // Create default SM on layer
    instrument.services.find("SelectionService", "RectSelectionService");
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
    const height = layer.getSharedVar("height", 100);
    const transientLayer = layer.getLayerFromQueue("transientLayer");
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

Instrument.register("HelperBarYaxisInstrument", {
  constructor: Instrument,
  interactors: ["MousePositionInteractor", "TouchPositionInteractor"],
  on: {
      hover: [
          ({ event, layer, instrument }) => {
              if (event.changedTouches)
                  event = event.changedTouches[0];
              const transientLayer = layer.getLayerFromQueue("transientLayer");
              const helperBarYaxis = transientLayer.getGraphic().querySelector("line");
              const helperBarYaxis2 = transientLayer.getGraphic().querySelector("line");
              helperBarYaxis.setAttribute("transform", `translate(0, ${event.offsetY - 20})`);
              helperBarYaxis2.setAttribute("transform", `translate(0, ${event.offsetY - 20})`);
              instrument.setSharedVar("barX", event.offsetX, {});
          },
      ],
  },
  preAttach: function (instrument, layer) {
      const width = layer.getSharedVar("width", 600);
      const transientLayer = layer.getLayerFromQueue("transientLayer");
      const helperBarYaxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
      helperBarYaxis.setAttribute("x1", "0");
      helperBarYaxis.setAttribute("y1", "0");
      helperBarYaxis.setAttribute("x2", `${width}`);
      helperBarYaxis.setAttribute("y2", "0");
      helperBarYaxis.setAttribute("stroke", `blue`);
      helperBarYaxis.setAttribute("stroke-width", `1px`);
      transientLayer.getGraphic().append(helperBarYaxis);
      const helperBarYaxis2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
      helperBarYaxis2.setAttribute("x1", "0");
      helperBarYaxis2.setAttribute("y1", "0");
      helperBarYaxis2.setAttribute("x2", `${width}`);
      helperBarYaxis2.setAttribute("y2", "0");
      helperBarYaxis2.setAttribute("stroke", `green`);
      helperBarYaxis2.setAttribute("stroke-width", `1px`);
      transientLayer.getGraphic().append(helperBarYaxis2);
  },
});

Instrument.register("DataBrushInstrument", {
  constructor: Instrument,
  interactors: ["MouseTraceInteractor", "TouchTraceInteractor"],
  on: {
    dragstart: [
      ({ event, layer, instrument }) => {
        if (event.changedTouches) event = event.changedTouches[0];
        instrument.services.find("SelectionService").forEach((service) => {
          service.setSharedVar("x", event.clientX, { layer });
          service.setSharedVar("y", event.clientY, { layer });
          service.setSharedVar("width", 1, { layer });
          service.setSharedVar("height", 1, { layer });
          service.setSharedVar("startx", event.clientX, { layer });
          service.setSharedVar("starty", event.clientY, { layer });
          service.setSharedVar("currentx", event.clientX, { layer });
          service.setSharedVar("currenty", event.clientY, { layer });
          service.setSharedVar(
            "attrNameX",
            layer.getSharedVar(
              "fieldX",
              service.getSharedVar("attrNameX", { layer })
            ),
            { layer }
          );
          service.setSharedVar(
            "attrNameY",
            layer.getSharedVar(
              "fieldY",
              service.getSharedVar("attrNameY", { layer })
            ),
            { layer }
          );
          service.setSharedVar("extentX", [0, 0], { layer });
          service.setSharedVar("extentY", [0, 0], { layer });
        });
        const transientLayer = layer.getLayerFromQueue("transientLayer");
        transientLayer.getGraphic().innerHTML = "";
      },
    ],
    drag: [
      ({ event, layer, instrument }) => {
        if (event.changedTouches) event = event.changedTouches[0];
        instrument.services.find("SelectionService").forEach((service) => {
          const baseBBox = (
            layer.getGraphic().querySelector(".ig-layer-background") ||
            layer.getGraphic()
          ).getBoundingClientRect();
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
          service.setSharedVar(
            "extentX",
            [event.clientX, startx]
              .map((x) => layer.getSharedVar("scaleX").invert(x - baseBBox.x))
              .sort((a, b) => a - b),
            { layer }
          );
          service.setSharedVar(
            "extentY",
            [event.clientY, starty]
              .map((y) => layer.getSharedVar("scaleY").invert(y - baseBBox.y))
              .sort((a, b) => a - b),
            { layer }
          );
          service.setSharedVar("currentx", event.clientX, { layer });
          service.setSharedVar("currenty", event.clientY, { layer });
          const transientLayer = layer.getLayerFromQueue("transientLayer");
          transientLayer.getGraphic().innerHTML = `<rect x=${Math.min(event.clientX, startx) - baseBBox.x
            } y=${Math.min(event.clientY, starty) - baseBBox.y} width=${Math.abs(
              event.clientX - startx
            )} height=${Math.abs(
              event.clientY - starty
            )} class="transientRect" fill="#000" opacity="0.3" />`;
        });
      },
    ],
    dragend: [
      ({ event, layer, instrument }) => {
        if (event.changedTouches) event = event.changedTouches[0];
        instrument.services.find("SelectionService").forEach((service) => {
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
          const transientLayer = layer.getLayerFromQueue("transientLayer");
          transientLayer.getGraphic().innerHTML = "";
        }
      },
    ],
    dragabort: [
      ({ event, layer, instrument }) => {
        if (event.changedTouches) event = event.changedTouches[0];
        instrument.services.find("SelectionService").forEach((service) => {
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
        const transientLayer = layer.getLayerFromQueue("transientLayer");
        transientLayer.getGraphic().innerHTML = "";
      },
    ],
  },
  preAttach: (instrument, layer) => {
    // Create default SM on layer
    instrument.services.find("SelectionService", "RectSelectionService");
  },
});

Instrument.register("DataBrushXInstrument", {
  constructor: Instrument,
  interactors: ["MouseTraceInteractor"],
  on: {
    dragstart: [
      ({ event, layer, instrument }) => {
        if (event.changedTouches) event = event.changedTouches[0];
        instrument.services.find("SelectionService").forEach((service) => {
          const baseBBox = (
            layer.getGraphic().querySelector(".ig-layer-background") ||
            layer.getGraphic()
          ).getBoundingClientRect();
          service.setSharedVar("x", event.clientX, { layer });
          service.setSharedVar("y", baseBBox.y, { layer });
          service.setSharedVar("width", 1, { layer });
          service.setSharedVar("height", baseBBox.height, { layer });
          service.setSharedVar("startx", event.clientX, { layer });
          service.setSharedVar("currentx", event.clientX, { layer });
          service.setSharedVar(
            "attrNameX",
            layer.getSharedVar(
              "fieldX",
              service.getSharedVar("attrNameX", { layer })
            ),
            { layer }
          );
          service.setSharedVar("extent", [0, 0], { layer });
          const transientLayer = layer.getLayerFromQueue("transientLayer");
          transientLayer.getGraphic().innerHTML = "";
        });
      },
    ],
    drag: [
      ({ event, layer, instrument }) => {
        if (event.changedTouches) event = event.changedTouches[0];
        instrument.services.find("SelectionService").forEach((service) => {
          const startx = service.getSharedVar("startx", { layer });
          const baseBBox = (
            layer.getGraphic().querySelector(".ig-layer-background") ||
            layer.getGraphic()
          ).getBoundingClientRect();
          service.setSharedVar("x", Math.min(event.clientX, startx), { layer });
          service.setSharedVar("width", Math.abs(event.clientX - startx), {
            layer,
          });
          service.setSharedVar(
            "extent",
            [event.clientX, startx]
              .map((x) => layer.getSharedVar("scaleX").invert(x - baseBBox.x))
              .sort((a, b) => a - b),
            { layer }
          );
          service.setSharedVar("currentx", event.clientX, { layer });
          const transientLayer = layer.getLayerFromQueue("transientLayer");
          // const matrix = matrixParse.fromElement(layer.getGraphic());
          transientLayer.getGraphic().innerHTML = `<rect x="${Math.min(event.clientX, startx) - baseBBox.x
            }" y="0" width="${Math.abs(event.clientX - startx)}" height="${baseBBox.height
            }" class="transientRect" fill="#000" opacity="0.3" />`;
        });
      },
    ],
    dragend: [
      ({ event, layer, instrument }) => {
        if (event.changedTouches) event = event.changedTouches[0];
        instrument.services.find("SelectionService").forEach((service) => {
          service.setSharedVar("currentx", event.clientX, { layer });
          service.setSharedVar("endx", event.clientX, { layer });
          if (!instrument.getSharedVar("persistant")) {
            const transientLayer = layer.getLayerFromQueue("transientLayer");
            transientLayer.getGraphic().innerHTML = "";
          }
        });
      },
    ],
    dragabort: [
      ({ event, layer, instrument }) => {
        if (event.changedTouches) event = event.changedTouches[0];
        instrument.services.find("SelectionService").forEach((service) => {
          service.setSharedVar("x", 0, { layer });
          service.setSharedVar("y", 0, { layer });
          service.setSharedVar("width", 0, { layer });
          service.setSharedVar("height", 0, { layer });
          service.setSharedVar("currentx", event.clientX, { layer });
          service.setSharedVar("extent", undefined, { layer });
          service.setSharedVar("endx", event.clientX, { layer });
          const transientLayer = layer.getLayerFromQueue("transientLayer");
          transientLayer.getGraphic().innerHTML = "";
        });
      },
    ],
  },
  preAttach: (instrument, layer) => {
    // Create default SM on layer
    instrument.services.find("SelectionService", "RectSelectionService");
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
        options.instrument.services
          .find("SelectionService")
          .forEach((service) => {
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
        options.instrument.services
          .find("SelectionService")
          .forEach((service) => {
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
    instrument.services.find(
      "SelectionService",
      "SurfacePointSelectionService"
    );
  },
});

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
        const speed = layer.getSharedVar("speed", 1) as number;
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
        console.log("right");
        const speed = layer.getSharedVar("speed", 1) as number;
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
    console.log("preAttach");
    console.log(layer.getContainerGraphic());
    layer.getGraphic().setAttribute("tabindex", 0);
    layer.getGraphic().focus();
    const height = layer.getSharedVar("height", 100);
    const startX = layer.getSharedVar("startX", 0);
    const transientLayer = layer.getLayerFromQueue("transientLayer");
    const helperBar = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line"
    );

    helperBar.setAttribute("x1", `${startX}`);
    helperBar.setAttribute("y1", `${startX}`);
    helperBar.setAttribute("x2", `${startX}`);
    helperBar.setAttribute("y2", `${height}`);
    helperBar.setAttribute("stroke", `black`);
    helperBar.setAttribute("stroke-width", `1px`);
    (transientLayer.getGraphic() as SVGGElement).append(helperBar);
  },
});

Instrument.register("PanInstrument", {
  constructor: Instrument,
  interactors: ["MouseTraceInteractor", "TouchTraceInteractor"],
  on: {
    dragstart: [
      ({ layer, event, instrument, transformer }) => {
        if (event.changedTouches) event = event.changedTouches[0];
        const sx = transformer.getTransformation("scaleX");
        const sy = transformer.getTransformation("scaleY");
        transformer.setTransformation("$scaleX", sx);
        transformer.setTransformation("$scaleY", sy);
        transformer.getTransformation("$$scaleX", sx);
        transformer.getTransformation("$$scaleY", sy);
        instrument.setSharedVar("startx", event.clientX);
        instrument.setSharedVar("starty", event.clientY);
        instrument.setSharedVar("currentx", event.clientX);
        instrument.setSharedVar("currenty", event.clientY);
        layer.getLayerFromQueue("selectionLayer").getGraphic().innerHTML = "";
        layer.getLayerFromQueue("transientLayer").getGraphic().innerHTML = "";
      },
    ],
    drag: [
      ({ layer, event, instrument, transformer }) => {
        if (event.changedTouches) event = event.changedTouches[0];
        let offsetX = event.clientX - instrument.getSharedVar("startx");
        let offsetY = event.clientY - instrument.getSharedVar("starty");
        instrument.setSharedVar("currentx", event.clientX);
        instrument.setSharedVar("currenty", event.clientY);
        const sx = transformer.getTransformation("$scaleX");
        const sy = transformer.getTransformation("$scaleY");
        const fixRange = instrument.getSharedVar("fixRange");
        if (fixRange) {
          if (sx) {
            const scaleX = sx
              .copy()
              .domain(sx.range().map((x) => x + offsetX))
              .range(sx.domain());
            if (scaleX.clamp) scaleX.clamp(false);
            scaleX.domain(sx.range().map((x) => scaleX(x))).range(sx.range());
            transformer.setTransformation("scaleX", scaleX);
          }
          if (sy) {
            const scaleY = sy
              .copy()
              .domain(sy.range().map((y) => y + offsetY))
              .range(sy.domain());
            if (scaleY.clamp) scaleY.clamp(false);
            scaleY.domain(sy.range().map((y) => scaleY(y))).range(sy.range());
            transformer.setTransformation("scaleY", scaleY);
          }
        } else {
          if (sx) {
            const proxyRaw = (
              raw: Transformation & { $origin: Transformation }
            ) =>
              new Proxy(raw, {
                get(target, path) {
                  if (path in target) return target[path];
                  if (path === "range")
                    return (...args) =>
                      (target.$origin as any)
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
              const anotherScaleXRaw = (domain) =>
                anotherScaleXRaw.$origin(domain) + offsetX;
              Object.assign(anotherScaleXRaw, scaleXRaw);
              anotherScaleXRaw.invert = (range) =>
                anotherScaleXRaw.$origin.invert(range - offsetX);
              anotherScaleXRaw.$origin = sx.copy();
              return proxyRaw(anotherScaleXRaw as any);
            };
            scaleXRaw.$origin = sx;
            const scaleX = proxyRaw(scaleXRaw);
            transformer.setTransformation("scaleX", scaleX);
          }
          if (sy) {
            const proxyRaw = (
              raw: Transformation & { $origin: Transformation }
            ) =>
              new Proxy(raw, {
                get(target, path) {
                  if (path in target) return target[path];
                  if (path === "range")
                    return (...args) =>
                      (target.$origin as any)
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
            scaleYRaw.invert = (range) =>
              scaleYRaw.$origin.invert(range - offsetY);
            scaleYRaw.$origin = sy;
            scaleYRaw.copy = () => {
              const anotherScaleYRaw = (domain) =>
                anotherScaleYRaw.$origin(domain) + offsetY;
              Object.assign(anotherScaleYRaw, scaleYRaw);
              anotherScaleYRaw.invert = (range) =>
                anotherScaleYRaw.$origin.invert(range - offsetY);
              anotherScaleYRaw.$origin = sy.copy();
              return proxyRaw(anotherScaleYRaw as any);
            };

            const scaleY = proxyRaw(scaleYRaw);
            transformer.setTransformation("scaleY", scaleY);
          }
        }
        layer.getLayerFromQueue("selectionLayer").getGraphic().innerHTML = "";
        layer.getLayerFromQueue("transientLayer").getGraphic().innerHTML = "";
      },
    ],
    dragabort: [
      ({ layer, event, instrument, transformer }) => {
        if (event.changedTouches) event = event.changedTouches[0];
        const sx = transformer.getTransformation("$$scaleX");
        const sy = transformer.getTransformation("$$scaleY");
        instrument.setSharedVar("startx", event.clientX);
        instrument.setSharedVar("starty", event.clientY);
        instrument.setSharedVar("currentx", event.clientX);
        instrument.setSharedVar("currenty", event.clientY);
        if (sx) {
          transformer.setTransformation("scaleX", sx);
          transformer.setTransformation("$scaleX", sx);
        }
        if (sy) {
          transformer.setTransformation("scaleY", sy);
          transformer.setTransformation("$scaleY", sy);
        }
        layer.getLayerFromQueue("selectionLayer").getGraphic().innerHTML = "";
        layer.getLayerFromQueue("transientLayer").getGraphic().innerHTML = "";
      },
    ],
  },
});

Instrument.register("ZoomInstrument", {
  constructor: Instrument,
  interactors: ["MouseWheelInteractor"],
  on: {
    wheel: [
      ({ layer, event, instrument, transformer }) => {
        const DEFAULT_DELTA_LEVEL_RATIO = 200;
        let sx = transformer.getTransformation("scaleX");
        let sy = transformer.getTransformation("scaleY");
        transformer.getTransformation("$$scaleX", sx);
        transformer.getTransformation("$$scaleY", sy);
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
              .domain(
                sx.range().map((x) => (x - offsetX) * Math.exp(delta) + offsetX)
              )
              .range(sx.domain());
            if (scaleX.clamp) scaleX.clamp(false);
            scaleX.domain(sx.range().map((x) => scaleX(x))).range(sx.range());
            transformer.setTransformation("scaleX", scaleX);
          }
          if (sy) {
            const scaleY = sy
              .copy()
              .domain(
                sy.range().map((y) => (y - offsetY) * Math.exp(delta) + offsetY)
              )
              .range(sy.domain());
            if (scaleY.clamp) scaleY.clamp(false);
            scaleY.domain(sy.range().map((y) => scaleY(y))).range(sy.range());
            transformer.setTransformation("scaleY", scaleY);
          }
        } else {
          if (sx) {
            const proxyRaw = (
              raw: Transformation & { $origin: Transformation }
            ) =>
              new Proxy(raw, {
                get(target, path) {
                  if (path in target) return target[path];
                  if (path === "range")
                    return (...args) =>
                      (target.$origin as any)
                        .range(
                          ...args.map(
                            (x) => (x - offsetX) / Math.exp(delta) + offsetX
                          )
                        )
                        .map((x) => (x - offsetX) * Math.exp(delta) + offsetX);
                  if (path === "bandwidth" && "bandwidth" in target.$origin) {
                    return () =>
                      (target.$origin as any).bandwidth() * Math.exp(delta);
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
            const scaleXRaw = (domain) =>
              (scaleXRaw.$origin(domain) - offsetX) * Math.exp(delta) + offsetX;
            scaleXRaw.invert = (range) =>
              scaleXRaw.$origin.invert(
                (range - offsetX) / Math.exp(delta) + offsetX
              );
            scaleXRaw.$origin = sx;
            scaleXRaw.copy = () => {
              const anotherScaleXRaw = (domain) =>
                (anotherScaleXRaw.$origin(domain) - offsetX) * Math.exp(delta) +
                offsetX;
              Object.assign(anotherScaleXRaw, scaleXRaw);
              anotherScaleXRaw.$origin = sx.copy();
              anotherScaleXRaw.invert = (range) =>
                anotherScaleXRaw.$origin.invert(
                  (range - offsetX) / Math.exp(delta) + offsetX
                );
              return proxyRaw(anotherScaleXRaw as any);
            };
            const scaleX = proxyRaw(scaleXRaw);
            transformer.setTransformation("scaleX", scaleX);
          }
          if (sy) {
            const proxyRaw = (
              raw: Transformation & { $origin: Transformation }
            ) =>
              new Proxy(raw, {
                get(target, path) {
                  if (path in target) return target[path];
                  if (path === "range")
                    return (...args) =>
                      (target.$origin as any)
                        .range(...args)
                        .map((y) => (y - offsetY) * Math.exp(delta) + offsetY);
                  if (path === "bandwidth" && "bandwidth" in target.$origin) {
                    return () =>
                      (target.$origin as any).bandwidth() * Math.exp(delta);
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
            const scaleYRaw = (domain) =>
              (scaleYRaw.$origin(domain) - offsetY) * Math.exp(delta) + offsetY;
            scaleYRaw.invert = (range) =>
              scaleYRaw.$origin.invert(
                (range - offsetY) / Math.exp(delta) + offsetY
              );
            scaleYRaw.$origin = sy;
            scaleYRaw.copy = () => {
              const anotherScaleYRaw = (domain) =>
                (anotherScaleYRaw.$origin(domain) - offsetY) * Math.exp(delta) +
                offsetY;
              Object.assign(anotherScaleYRaw, scaleYRaw);
              anotherScaleYRaw.invert = (range) =>
                anotherScaleYRaw.$origin.invert(
                  (range - offsetY) / Math.exp(delta) + offsetY
                );
              anotherScaleYRaw.$origin = sy.copy();
              return proxyRaw(anotherScaleYRaw as any);
            };
            const scaleY = proxyRaw(scaleYRaw);
            transformer.setTransformation("scaleY", scaleY);
          }
        }
        layer.getLayerFromQueue("selectionLayer").getGraphic().innerHTML = "";
        layer.getLayerFromQueue("transientLayer").getGraphic().innerHTML = "";
      },
    ],
    abort: [
      ({ layer, event, instrument, transformer }) => {
        const sx = transformer.getTransformation("$$scaleX");
        const sy = transformer.getTransformation("$$scaleY");
        instrument.setSharedVar("delta", 0);
        instrument.setSharedVar("currentx", event.offsetX);
        instrument.setSharedVar("currenty", event.offsetY);
        if (sx) {
          transformer.setTransformation("scaleX", sx);
        }
        if (sy) {
          transformer.setTransformation("scaleY", sy);
        }
        layer.getLayerFromQueue("selectionLayer").getGraphic().innerHTML = "";
        layer.getLayerFromQueue("transientLayer").getGraphic().innerHTML = "";
      },
    ],
  },
});

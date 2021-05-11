import IG from "~/IG";
import * as d3 from "d3";

if (process.env.NODE_ENV === "development") {
  require("../index.html");
}

const svg = d3.select("#ctner");

const backgroundLayer = IG.Layer.initialize("D3Layer", 500, 500, svg);
const timeboxLayers = [];
let recentLayer = null;
let offset = null;

const g = backgroundLayer.getGraphic();
g.selectAll("circle")
  .data(
    new Array(10).fill().flatMap(() =>
      new Array(11).fill().map((_, i) => ({
        x: i * 50,
        y: Math.random() * 480 + 10,
      }))
    )
  )
  .enter()
  .append("circle")
  .attr("cx", (d) => d.x)
  .attr("cy", (d) => d.y)
  .attr("r", 10)
  .attr(
    "fill",
    () =>
      `rgb(${new Array(3)
        .fill()
        .map(() => Math.floor(Math.random() * 128))
        .join(", ")})`
  )
  .attr("stroke-width", 0)
  .attr("stroke", "red");

IG.Layer.register("TimeboxLayer", {
  constructor: IG.Layer.D3Layer,
  attach: [
    {
      precondition: (event, layer) =>
        event.type === "pointer" && layer.inside(event),
      tools: [
        IG.Tool.initialize("DragTool", {
          activeCommand(_, e) {
            if (!(e.type === "pointer" && this.layer.inside(e))) debugger;
            this.offsetX = e.x;
            this.offsetY = e.y;
            this.rawLayer = this.layer;
          },
          frameCommand(_, e) {
            const node = this.rawLayer.getGraphic();
            const deltaX = e.x - this.offsetX;
            const deltaY = e.y - this.offsetY;
            const base = node
              .attr("transform")
              .split("(")[1]
              .split(")")[0]
              .split(",")
              .map((i) => parseFloat(i));
            node.attr(
              "transform",
              `translate(${base[0] + deltaX}, ${base[1] + deltaY})`
            );
            queryLines();
          },
        }),
      ],
    },
  ],
});

backgroundLayer.attach({
  tool: IG.Tool.initialize("BrushTool", {
    activeCommand: (_, e) => {
      if (timeboxLayers.find((layer) => layer.inside(e))) {
        recentLayer = null;
        return;
      }
      offset = e;
      recentLayer = IG.Layer.initialize("TimeboxLayer", 0, 0, svg);
      recentLayer
        .getGraphic()
        .attr("transform", `translate(${e.x},${e.y})`)
        .select("rect")
        .attr("fill", "black")
        .attr("opacity", 0.3);
      backgroundLayer.listen({
        layers: [recentLayer],
        frameCommand: queryLines,
      });
      timeboxLayers.push(recentLayer);
    },
    frameCommand: (_, e) => {
      if (!recentLayer) return;
      recentLayer
        .getGraphic()
        .select("rect")
        .attr("width", e.x - offset.x)
        .attr("height", e.y - offset.y);
      queryLines();
    },
  }),
});

const selector = IG.Query.initialize("RectQuery");
selector.bindLayer(backgroundLayer);

function queryLines() {
  const result = new Set();
  const base = backgroundLayer.getGraphic().node().getBoundingClientRect();
  for (let layer of timeboxLayers) {
    const bbox = layer.getGraphic().node().getBoundingClientRect();
    selector.x = bbox.left - base.left;
    selector.y = bbox.top - base.top;
    selector.width = bbox.width;
    selector.height = bbox.height;
    selector.update();
    selector.result.forEach((e) => result.add(e));
  }
  backgroundLayer.getGraphic().selectAll("circle").attr("stroke-width", 0);
  for (let e of result) {
    d3.select(e).attr("stroke-width", 3);
  }
}

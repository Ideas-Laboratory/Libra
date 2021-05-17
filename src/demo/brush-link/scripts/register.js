import IG from "~/IG";
import * as d3 from "d3";

export function registerBrushLayer() {
  IG.Layer.register("brushLayer", {
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
              //this.offsetY = e.y;
              this.rawLayer = this.layer;
            },
            frameCommand(_, e) {
              const extent = [50, 305];
              const node = this.rawLayer.getGraphic();
              const deltaX = e.x - this.offsetX;
              //const deltaY = e.y - this.offsetY;
              const base = getXYfromTransform(node);
              const brushWidth = +node.select("rect")?.attr("width") || 0;
              node.attr("transform", `translate(${base[0] + deltaX}, ${0})`);
            },
          }),
        ],
      },
    ],
  });
}

export function registerBrushableLayer() {
  IG.Layer.register("brushableLayer", {
    constructor: IG.Layer.D3Layer,
    attach: [
      {
        precondition: (event, layer) =>
          event.type === "pointer" && layer.inside(event),
        tools: [
          IG.Tool.initialize("BrushTool", {
            activeCommand: function (_, e) {
              this.layer.brushLayer?.getGraphic().remove();
              const backgroundLayer = this.layer;
              const bg = backgroundLayer.getGraphic();
              const brushHeight = +bg.select("rect").attr("height");
              const brushWidth = +bg.select("rect").attr("width");
              const brushLayer = IG.Layer.initialize(
                "brushLayer",
                0,
                brushHeight,
                bg
              );
              brushLayer
                .getGraphic()
                .attr("transform", `translate(${e.x}, 0)`)
                .select("rect")
                .attr("height", brushHeight) // 不太方便
                .attr("fill", "black")
                .attr("opacity", 0.3);
              backgroundLayer.brushLayer = brushLayer; // 不太方便
              backgroundLayer.brushStartX = e.x;
              // backgroundLayer.listen({
              //   layers: [scatterBackgroundLayer],
              //   //frameCommand: queryLines,
              //   frameCommand: () => {},
              // });
            },
            frameCommand: function (_, e) {
              const brushableLayer = this.layer;
              const brushLayer = brushableLayer.brushLayer;
              const g = brushLayer.getGraphic();
              const width = e.x - this.layer.brushStartX - 1;
              const start = 1;
              g.select("rect").attr("width", width >= 0 ? width : 0);
              const xy = getXYfromTransform(brushLayer.getGraphic());
              //console.log(xy);
              extents.set(
                brushableLayer.key,
                [xy[0], xy[0] + width].map(scales.get(brushableLayer.key))
              );
              //console.log("frame", extents);
            },
            terminateCommand: function () {
              console.log("terminate");
            },
          }),
        ],
      },
    ],
  });
}
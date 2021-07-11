import { getBackground } from "./helper";
import IG from "~/IG";
import * as d3 from "d3";
import { brush } from "d3";

/**
 * 通过setSharedScale暴露出三个对象：start/end/brushLayer
 * @param {} layer
 * @param {*} brushTool
 */
let _start = [0, 0];
function setDrawRectCommands(layer, brushTool) {
  layer.listen({
    tool: brushTool,
    startCommand: function (_, e) {
      const preBrushLayer = this.getSharedScale("brushLayer");
      preBrushLayer?.getGraphic().remove();
      _start = [e.x, e.y];
      const brushLayer = IG.Layer.initialize(
        "D3Layer",
        0,
        0,
        this.getGraphic()
      );
      const rect = getBackground(brushLayer);
      rect
        .attr("opacity", 0.3)
        .attr("transform", `translate(${_start[0]}, ${_start[1]})`);

      this.setSharedScale("brushLayer", brushLayer);
      this.setSharedScale("start", _start);
    },
    dragCommand: function (_, e) {
      const brushLayer = this.getSharedScale("brushLayer");
      const start = [Math.min(_start[0], e.x), Math.min(_start[1], e.y)];
      const end = [Math.max(_start[0], e.x), Math.max(_start[1], e.y)];

      const rect = getBackground(brushLayer);
      const width = end[0] - start[0];
      const height = end[1] - start[1];
      rect
        .attr("transform", `translate(${start[0]}, ${start[1]})`)
        .attr("width", width)
        .attr("height", height);

      this.setSharedScale("start", start);
      this.setSharedScale("end", end);
    },
  });
}

export default setDrawRectCommands;

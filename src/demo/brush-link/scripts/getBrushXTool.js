import { getBackground } from "./helper";
import IG from "~/IG";
import { brush } from "d3";

/**
 * 通过setSharedVar暴露出三个对象：start/end/brushLayer
 * @param {} layer
 * @param {*} brushTool
 */
let _start = [0, 0];
let _height = 0;
function getBrushXTool(layer, brushTool) {
  layer.listen({
    tool: brushTool,
    startCommand: function (_, e) {
      const preBrushLayer = this.getSharedVar("brushLayer");
      preBrushLayer?.getGraphic().remove();
      _start = [e.x, 0];
      const background = getBackground(this);
      _height = +background.attr("height");
      const brushLayer = IG.Layer.initialize(
        "D3Layer",
        0,
        _height,
        this.getGraphic()
      );
      const rect = getBackground(brushLayer);
      rect
        .attr("opacity", 0.3)
        .attr("transform", `translate(${_start[0]}, ${_start[1]})`);

      this.setSharedVar("brushLayer", brushLayer);
      this.setSharedVar("start", _start);
    },
    dragCommand: function (_, e) {
      const brushLayer = this.getSharedVar("brushLayer");
      const start = [Math.min(_start[0], e.x), -0];
      const end = [Math.max(_start[0], e.x), _height];

      const rect = getBackground(brushLayer);
      const width = end[0] - start[0];
      rect
        .attr("transform", `translate(${start[0]}, ${start[1]})`)
        .attr("width", width)
        .attr("height", _height);
        
      this.setSharedVar("start", start);
      this.setSharedVar("end", end);
    },
  });

  return brushTool;
}

export default getBrushXTool;

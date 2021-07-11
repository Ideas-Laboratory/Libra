import {getBackground} from "./helper";
import IG from "~/IG";
import * as d3 from 'd3';
/**
 * 通过setSharedScale暴露出三个对象：start/end/brushLayer
 * @param {} layer 
 * @param {*} brushTool 
 */
function setDrawRectCommands(layer, brushTool) {
  layer.listen({
    tool: brushTool,
    startCommand: function (_, e) {
      this.getGraphic().selectAll(".brush-layer").remove();
      const start = [e.x, e.y];
      const brushLayer = IG.Layer.initialize(
        "D3Layer",
        0,
        0,
        this.getGraphic()
      );
      brushLayer
        .getGraphic()
        .attr("transform", `translate(${start[0]}, ${start[1]})`)
        .attr("class", "brush-layer");
      const rect = d3.select(brushLayer.query("rect")[0]); //.attr("opacity", 0.3).attr("fill", "grey");
      rect.attr("opacity", 0.3);
     
      this.setSharedScale("brushLayer", brushLayer);
      this.setSharedScale("start", start);
    },
    dragCommand: function (_, e) {
      const brushLayer = this.getSharedScale("brushLayer");
      const start = this.getSharedScale("start");
      const rect = d3.select(brushLayer.query("rect")[0]);
      const width = e.x - start[0] - 1;
      const height2 = e.y - start[1] - 1;
      rect.attr("width", width >= 0 ? width : 0);
      rect.attr("height", height2 >= 0 ? height2 : 0);

      this.setSharedScale("end", [e.x, e.y]);
    },
  });
}

/**
 * 通过setSharedScale暴露出三个对象：start/end/brushLayer
 * @param {} layer 
 * @param {*} brushTool 
 */
function setDrawRectXCommands(layer, brushTool) {
  layer.listen({
    tool: brushTool,
    startCommand: function (_, e) {
      this.getGraphic().selectAll(".brush-layer").remove();
      const background = getBackground(this);
      console.log(background.node());
      const start = [e.x, 0];
      const brushLayer = IG.Layer.initialize(
        "D3Layer",
        0,
        +background.attr("height"),
        this.getGraphic()
      );
      brushLayer
        .getGraphic()
        .attr("transform", `translate(${start[0]}, ${0})`)
        .attr("class", "brush-layer");
      getBackground(brushLayer).attr("opacity", 0.3).attr("fill", "grey");

      this.setSharedScale("brushLayer", brushLayer);
      this.setSharedScale("start", start);
    },
    dragCommand: function (_, e) {
      const brushLayer = this.getSharedScale("brushLayer");
      const start = this.getSharedScale("start");
      const rect = getBackground(brushLayer);
      const width = e.x - start[0] - 1;
      rect.attr("width", width >= 0 ? width : 0);
      const height = +getBackground(brushLayer).attr("height");

      this.setSharedScale("end", [e.x, height]);
    },
  });
}


export {setDrawRectCommands, setDrawRectXCommands};
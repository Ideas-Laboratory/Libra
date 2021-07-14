import { getBackground } from "./helper";
import IG from "~/IG";

/**
 * 通过setSharedScale暴露出三个对象：
 * @param {} layer
 * @param {*} clickTool
 */
const magnetWidth = 50;
const magnetHeight = 50;
function setCreateMagnetCommands(layer, clickTool) {
  layer.listen({
    tool: clickTool,
    endCommand: function (_, e) {
      const dusts = this.getSharedScale("dusts");
      const magnetsProperties = this.getSharedScale("properties");
      const next = this.getSharedScale("next");

      const magnetLayer = IG.Layer.initialize(
        "D3Layer",
        magnetWidth,
        magnetHeight,
        this.getGraphic()
      );
      const magnetGroup = magnetLayer.getGraphic();

      magnetGroup
        .attr("transform", `translate(${e.x}, ${e.y})`);

      getBackground(magnetLayer)
        .attr("x", -magnetWidth / 2)
        .attr("y", -magnetHeight / 2)
        .attr("fill", "orange")
        .attr("opacity", 1);

      const property = magnetsProperties[next % magnetsProperties.length];
      magnetGroup
        .append("text")
        .text(property)
        .style("text-anchor", "middle")
        .style("font-size", "12")
        .style("font-weight", "700");
      magnetLayer.setSharedScale("property", property);

      this.setSharedScale("next", next + 1);
    },
  });
}

export default setCreateMagnetCommands;

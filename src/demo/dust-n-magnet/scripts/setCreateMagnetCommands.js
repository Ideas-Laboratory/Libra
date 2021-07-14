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
      const property = magnetsProperties[next % magnetsProperties.length];

      renderMagnet(this.getGraphic(), e.x, e.y, magnetWidth, magnetHeight, property);


      this.setSharedScale("next", next + 1);
    },
  });
}

function renderMagnet(root, x, y, magnetWidth, magnetHeight, property){
      const magnetLayer = IG.Layer.initialize(
        "D3Layer",
        magnetWidth,
        magnetHeight,
        root
      );
      const magnetGroup = magnetLayer.getGraphic();

      magnetGroup
        .attr("transform", `translate(${x}, ${y})`);

      getBackground(magnetLayer)
        .attr("x", -magnetWidth / 2)
        .attr("y", -magnetHeight / 2)
        .attr("fill", "orange")
        .attr("opacity", 1);

      magnetGroup
        .append("text")
        .text(property)
        .style("text-anchor", "middle")
        .style("font-size", "12")
        .style("font-weight", "700");
      magnetLayer.setSharedScale("property", property);
}

export default setCreateMagnetCommands;

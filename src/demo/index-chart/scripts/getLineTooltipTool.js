import * as d3 from "d3";
import { getBackground } from "./helper";

function getLineTooltipTool(layer, hoverTool) {

  const rule = preInstall(layer);

  layer.listen({
    tool: hoverTool,
    pointerCommand: function (_, event) {
      rule.attr("transform", `translate(${event.x + 0.5}, 0)`);
    },
  });


  return hoverTool;
}

function preInstall(layer) {
  const bg = getBackground(layer);
  const height = +bg.attr("height");
  const rule = layer.getGraphic()
    .append("g")
    .append("line")
    .attr("y1", height)
    .attr("y2", 0)
    .attr("x1", 0)
    .attr("x2", 0)
    .attr("stroke", "black");
  return rule;
}

export default getLineTooltipTool;
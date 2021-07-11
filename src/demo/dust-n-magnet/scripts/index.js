import IG from "~/IG";
import * as d3 from "d3";
import { maxIndex } from "d3";
import { render } from "node-sass";

if (process.env.NODE_ENV === "development") {
  require("../index.html");
}

max();

function main() {
  const width = 800,
    height = 600;

  const svg = d3
    .select("#ctner")
    .attr("width", width)
    .attr("height", height)
    .attr("viewbox", `0 0 width height`);

  const layer = render(svg, width, height, data);
  
  const dragTool = IG.Tool.initialize("DragTool");
  
  attachToolAndSetCommands(layer, dragTool);
}

function attachToolAndSetCommands(layer, dragTool) {
  
}

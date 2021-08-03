import IG from "~/IG";
import * as d3 from "d3";
import { getBackground } from "./helper";
import setCreateMagnetCommands from "./setCreateMagnetCommands";
import cars from "../../../data/cars.json";

if (process.env.NODE_ENV === "development") {
  require("../index.html");
}

main();

function main() {
  const data = processData(cars);

  const width = 800,
    height = 600;

  const svg = d3
    .select("#ctner")
    .attr("width", width)
    .attr("height", height)
    .attr("viewbox", `0 0 width height`);

  const layer = render(svg, width, height, data);

  const clickTool = IG.Tool.initialize("ClickTool");

  clickTool.attach(svg.node());
  setCreateMagnetCommands(layer, clickTool);
}

function processData(data) {
  return data.slice(0, 10);
}

function render(root, width, height, data) {
  const radius = 10;

  const mainLayer = IG.Layer.initialize("D3Layer", width, height, root);

  const background = getBackground(mainLayer);
  background.attr("fill", "#eee").attr("opacity", 1);

  const mainGroup = mainLayer.getGraphic();
  const dusts = mainGroup
    .selectAll("circle")
    .data(data)
    .join("circle")
    .attr("cx", width / 2)
    .attr("cy", height / 2)
    .attr("r", radius);

  const properties = [];
  const datum = data[0];
  for (const property in datum) {
    const value = datum[property];
    if (typeof value === "number") {
      properties.push(property);
    }
  }
  console.log(properties);

  mainLayer.setSharedVar("dusts", dusts);
  mainLayer.setSharedVar("properties", properties);
  mainLayer.setSharedVar("next", 0);
  return mainLayer;
}

function attachToolAndSetCommands(layer, dragTool) {}

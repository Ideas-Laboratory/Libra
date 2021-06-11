import IG from "~/IG";
import * as d3 from "d3";

if (process.env.NODE_ENV === "development") {
  require("../index.html");
}

const svg = d3.select("#ctner");

const layer = IG.Layer.initialize("D3Layer", 500, 500, svg);

const g = layer.getGraphic();
g.selectAll("circle")
  .data(
    new Array(100)
      .fill()
      .map(() => ({ x: Math.random() * 480 + 10, y: Math.random() * 480 + 10 }))
  )
  .enter()
  .append("circle")
  .attr("cx", (d) => d.x)
  .attr("cy", (d) => d.y)
  .attr("r", 10)
  .attr("fill", "red");

const tool = IG.Tool.initialize("HoverTool");
tool.attach(svg.node());

layer.listen({
  tool,
  pointerCommand: ({ result }) => {
    g.selectAll("circle").attr("fill", "red");
    result.forEach((circle) => d3.select(circle).attr("fill", "blue"));
  },
});

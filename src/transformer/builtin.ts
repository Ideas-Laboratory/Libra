import GraphicalTransformer from "./index";
import * as d3 from "d3";

GraphicalTransformer.register("dataTransformer", {
  redraw: ({ layer, transformer }) => {
    d3.select(layer.getGraphic())
      .selectAll("circle")
      .data(transformer.getSharedVar("data"))
      .append("circle")
      .attr("r", transformer.getSharedVar("radius"))
      .attr("cx", (d) => transformer.getTransformation("scaleX")(d))
      .attr("cy", (d) => transformer.getTransformation("scaleY")(d))
      .attr("fill", transformer.getSharedVar("fillColor"));
  },
});

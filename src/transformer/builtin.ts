import GraphicalTransformer from "./transformer";
import * as d3 from "d3";

GraphicalTransformer.register("transientRectangleTransformer", {
  constructor: GraphicalTransformer,
  redraw: ({ layer, transformer }) => {
    d3.select(layer.getGraphic())
      .append("rect")
      .attr("x", transformer.getSharedVar("x"))
      .attr("y", transformer.getSharedVar("y"))
      .attr("width", transformer.getSharedVar("width"))
      .attr("height", transformer.getSharedVar("height"))
      .attr("fill", transformer.getSharedVar("fillColor"));
  },
});

GraphicalTransformer.register("HighlightSelection", {
  constructor: GraphicalTransformer,
  redraw({ layer, transformer }) {
    d3.select(layer.getGraphic())
      .selectAll("*")
      .attr(
        transformer.getSharedVar("highlightAttr"),
        transformer.getSharedVar("highlightColor")
      );
  },
});

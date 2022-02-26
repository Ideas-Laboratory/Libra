import GraphicalTransformer from "./transformer";
import * as d3 from "d3";

GraphicalTransformer.register("TransientRectangleTransformer", {
  constructor: GraphicalTransformer,
  redraw: ({ layer, transformer }) => {
    d3.select(layer.getGraphic()).selectAll(":not(.ig-layer-background)").remove();
    d3.select(layer.getGraphic())
      .append("rect")
      .attr("x", transformer.getSharedVar("x"))
      .attr("y", transformer.getSharedVar("y"))
      .attr("width", transformer.getSharedVar("width"))
      .attr("height", transformer.getSharedVar("height"))
      .attr("fill", transformer.getSharedVar("fillColor"))
      .attr("opacity", transformer.getSharedVar("opacity"))
      ;
  },
});

GraphicalTransformer.register("HighlightSelection", {
  constructor: GraphicalTransformer,
  redraw({ layer, transformer }) {
    

        // const colorDataAccessor = layer.getSharedVar("colorDataAccessor");
        // const symbolsFilter = layer.getSharedVar("symbolsFilter");
        // const fieldColor = layer.getSharedVar("fieldColor");
        // const scaleColor = layer.getSharedVar("scaleColor");
        // console.log("fc",fieldColor);

        // const a = d3.select(layer.getLayerFromQueue("selectionLayer").getGraphic())
        // .selectChildren("circle")
        // .attr("stroke", (d) => scaleColor(d[fieldColor]));
        console.log(layer.getGraphic());

    d3.select(layer.getGraphic())
      .selectAll("*")
      .attr(
        transformer.getSharedVar("highlightAttr"),
        transformer.getSharedVar("highlightColor")
      );
  },
});

import GraphicalTransformer from "./transformer";
import * as d3 from "d3";
GraphicalTransformer.register("SliderTransformer", {
    constructor: GraphicalTransformer,
    redraw: ({ layer, transformer }) => {
        d3.select(layer.getGraphic())
            .selectAll(":not(.ig-layer-background)")
            .remove();
        const x1 = transformer.getSharedVar("x1") ?? 0;
        const x2 = transformer.getSharedVar("x2") ?? 0;
        const height = transformer.getSharedVar("height") ?? 0;
        const fill = transformer.getSharedVar("fill") ?? "#000000";
        const opacity = transformer.getSharedVar("opacity") ?? 0.3;
        d3.select(layer.getGraphic())
            .append("rect")
            .attr("x1", x1)
            .attr("x2", x2)
            .attr("width", x2 - x1)
            .attr("height", height)
            .attr("fill", fill)
            .attr("opacity", opacity);
    },
});
GraphicalTransformer.register("TransientRectangleTransformer", {
    constructor: GraphicalTransformer,
    redraw: ({ layer, transformer }) => {
        d3.select(layer.getGraphic())
            .selectAll(":not(.ig-layer-background)")
            .remove();
        d3.select(layer.getGraphic())
            .append("rect")
            .attr("x", transformer.getSharedVar("x"))
            .attr("y", transformer.getSharedVar("y"))
            .attr("width", transformer.getSharedVar("width"))
            .attr("height", transformer.getSharedVar("height"))
            .attr("fill", transformer.getSharedVar("fillColor"))
            .attr("opacity", transformer.getSharedVar("opacity"));
    },
});
GraphicalTransformer.register("HighlightSelection", {
    constructor: GraphicalTransformer,
    redraw({ layer, transformer }) {
        const elems = d3
            .select(layer.getGraphic())
            .selectAll(transformer.getSharedVar("selector") || "*");
        const attrValueEntries = Object.entries(transformer.getSharedVar("highlightAttrValues"));
        attrValueEntries.forEach(([key, value]) => {
            elems.attr(key, value);
        });
    },
});
GraphicalTransformer.register("TransientRectangleTransformer", {
    constructor: GraphicalTransformer,
    redraw: ({ layer, transformer }) => {
        d3.select(layer.getGraphic())
            .selectAll(":not(.ig-layer-background)")
            .remove();
        d3.select(layer.getGraphic())
            .append("rect")
            .attr("x", transformer.getSharedVar("x"))
            .attr("y", transformer.getSharedVar("y"))
            .attr("width", transformer.getSharedVar("width"))
            .attr("height", transformer.getSharedVar("height"))
            .attr("fill", transformer.getSharedVar("fillColor"))
            .attr("opacity", transformer.getSharedVar("opacity"));
    },
});
GraphicalTransformer.register("SelectionTransformer", {
    constructor: GraphicalTransformer,
    redraw: ({ layer, transformer }) => {
        transformer
            .getSharedVar("selectionResult")
            .forEach((resultNode) => layer.getGraphic().appendChild(resultNode));
    },
});

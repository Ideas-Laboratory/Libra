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
    className: ["draw-shape", "transient-shape", "rectangle-shape"],
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
        transformer.getSharedVar("result").forEach((resultNode) => {
            layer.getGraphic().appendChild(resultNode);
        });
        const highlightColor = transformer.getSharedVar("highlightColor");
        const attrValueEntries = Object.entries(transformer.getSharedVar("highlightAttrValues") || {});
        if (highlightColor || attrValueEntries.length) {
            const elems = d3.selectAll(transformer.getSharedVar("result"));
            if (highlightColor) {
                elems.attr("fill", highlightColor).attr("stroke", highlightColor);
            }
            attrValueEntries.forEach(([key, value]) => {
                elems.attr(key, value);
            });
        }
    },
});
GraphicalTransformer.register("HelperLineTransformer", {
    constructor: GraphicalTransformer,
    transient: true,
    sharedVar: {
        orientation: ["horizontal", "vertical"],
        style: {},
    },
    redraw({ layer, transformer }) {
        const mainLayer = layer.getLayerFromQueue("mainLayer");
        const orientation = transformer.getSharedVar("orientation");
        const style = transformer.getSharedVar("style");
        const x = transformer.getSharedVar("x");
        const y = transformer.getSharedVar("y");
        const tooltipConfig = transformer.getSharedVar("tooltip");
        const scaleX = transformer.getSharedVar("scaleX");
        const scaleY = transformer.getSharedVar("scaleY");
        const tooltipQueue = [];
        let tooltipOffsetX = 0;
        let tooltipOffsetY = 0;
        if (tooltipConfig) {
            if (typeof tooltipConfig === "object" && tooltipConfig.prefix) {
                tooltipQueue.push(tooltipConfig.prefix);
            }
            if (scaleX && scaleX.invert && typeof x === "number") {
                tooltipQueue.push(scaleX.invert(x - (layer._offset?.x ?? 0)));
            }
            if (scaleY && scaleY.invert && typeof y === "number") {
                tooltipQueue.push(scaleY.invert(y - (layer._offset?.y ?? 0)));
            }
            if (typeof tooltipConfig === "object" && tooltipConfig.suffix) {
                tooltipQueue.push(tooltipConfig.suffix);
            }
            if (typeof tooltipConfig === "object" && tooltipConfig.offset) {
                if (typeof tooltipConfig.offset.x === "number") {
                    tooltipOffsetX = tooltipConfig.offset.x;
                }
                if (typeof tooltipConfig.offset.y === "number") {
                    tooltipOffsetY = tooltipConfig.offset.y;
                }
                if (typeof tooltipConfig.offset.x === "function" &&
                    typeof x === "number") {
                    tooltipOffsetX = tooltipConfig.offset.x(x - (layer._offset?.x ?? 0));
                }
                if (typeof tooltipConfig.offset.y === "function" &&
                    typeof y === "number") {
                    tooltipOffsetY = tooltipConfig.offset.y(y - (layer._offset?.y ?? 0));
                }
            }
        }
        const tooltip = tooltipQueue.join(" ");
        if (orientation.includes("horizontal") && typeof y === "number") {
            const line = d3
                .select(layer.getGraphic())
                .append("line")
                .attr("x1", 0)
                .attr("x2", mainLayer.getGraphic().getBoundingClientRect().width)
                .attr("y1", y - (layer._offset?.y ?? 0))
                .attr("y2", y - (layer._offset?.y ?? 0))
                .attr("stroke-width", 1)
                .attr("stroke", "#000");
            if (style) {
                Object.entries(style).forEach(([key, value]) => {
                    line.attr(key, value);
                });
            }
        }
        if (orientation.includes("vertical") && typeof x === "number") {
            const line = d3
                .select(layer.getGraphic())
                .append("line")
                .attr("y1", 0)
                .attr("y2", mainLayer.getGraphic().getBoundingClientRect().height)
                .attr("x1", x - (layer._offset?.x ?? 0))
                .attr("x2", x - (layer._offset?.x ?? 0))
                .attr("stroke-width", 1)
                .attr("stroke", "#000");
            if (style) {
                Object.entries(style).forEach(([key, value]) => {
                    line.attr(key, value);
                });
            }
        }
        if (tooltip) {
            d3.select(layer.getGraphic())
                .append("text")
                .attr("x", x - (layer._offset?.x ?? 0))
                .attr("y", y - (layer._offset?.y ?? 0))
                .text(tooltip);
        }
    },
});
GraphicalTransformer.register("TextTransformer", {
    constructor: GraphicalTransformer,
    transient: true,
    sharedVar: {
        style: {},
        content: "",
        field: null,
    },
    redraw({ layer, transformer }) {
        const style = transformer.getSharedVar("style");
        const x = transformer.getSharedVar("offsetx") || transformer.getSharedVar("x");
        const y = transformer.getSharedVar("offsety") || transformer.getSharedVar("y");
        const content = transformer.getSharedVar("content");
        const field = transformer.getSharedVar("field");
        const result = transformer.getSharedVar("result");
        const position = transformer.getSharedVar("position");
        let displayContent = content;
        let displayX = x, displayY = y;
        if (field) {
            const datum = layer.getDatum(result);
            if (datum) {
                displayContent = datum?.[field] ?? "";
                if (position instanceof Function) {
                    let { x, y } = position(datum);
                    displayX = x ?? displayX;
                    displayY = y ?? displayY;
                }
                else {
                    displayX = position?.x ?? displayX;
                    displayY = position?.y ?? displayY;
                }
            }
            else {
                displayContent = "";
            }
        }
        d3.select(layer.getGraphic())
            .append("text")
            .attr("x", displayX)
            .attr("y", displayY)
            .text(displayContent)
            .call((t) => {
            if (style) {
                Object.entries(style).forEach(([key, value]) => {
                    t.style(key, value);
                });
            }
        });
    },
});

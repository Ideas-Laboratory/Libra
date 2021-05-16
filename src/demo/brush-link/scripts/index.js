import IG from "~/IG";
import * as d3 from "d3";
import cars from "../../../data/cars.json";
import D3Layer from "../../../IG/layer/d3";
import { brush } from "d3";

if (process.env.NODE_ENV === "development") {
  require("../index.html");
}

// fields to bin
const keys = ["Cylinders", "Displacement", "Weight_in_lbs", "Acceleration"]; // Can choosen from one of the properties.

// fields of scatter plot
const fieldX = "Horsepower";
const fieldY = "Miles_per_Gallon";
const fieldColor = "Origin";

// layout
const width = 950,
  height = 500;
const widthBinnedChart = width / 3,
  heightBinnedChart = height / keys.length;
const widthScatterPlot = width - widthBinnedChart,
  heightScatterPlot = height;

const svg = d3
  .select("#ctner")
  .attr("width", width)
  .attr("height", height)
  .attr("viewbox", `0 0 width height`);

const histogramBackgroundLayers = new Map();
registerHistogramLayer();
IG.Layer.register("brushLayer", {constructor: IG.Layer.D3Layer});

for (let i = 0; i < keys.length; i++) {
  const key = keys[i];
  const backgroundLayer = IG.Layer.initialize(
    "histogramLayer",
    widthBinnedChart,
    heightBinnedChart,
    svg
  );
  histogramBackgroundLayers.set(key, backgroundLayer);
  const g = backgroundLayer
    .getGraphic()
    .attr("transform", `translate(0, ${i * heightBinnedChart})`);
  renderBinnedChart(g, widthBinnedChart, heightBinnedChart, cars, key);
}

console.log(histogramBackgroundLayers);

const scatterBackgroundLayer = IG.Layer.initialize("D3Layer", 500, 500, svg);
const scatterG = scatterBackgroundLayer
  .getGraphic()
  .attr("transform", `translate(${widthBinnedChart}, 0)`);
renderScatterPlot(
  scatterG,
  widthScatterPlot,
  height,
  cars,
  fieldX,
  fieldY,
  fieldColor
);

//const g = backgroundLayer.getGraphic();
// g.selectAll("path")
//   .data(
//     new Array(10).fill().map(() =>
//       new Array(11).fill().map((_, i) => ({
//         x: i * 50,
//         y: Math.random() * 480 + 10,
//       }))
//     )
//   )
//   .enter()
//   .append("path")
//   .attr("fill", "none")
//   .attr("stroke-width", 1)
//   .attr(
//     "stroke",
//     () =>
//       `rgb(${new Array(3)
//         .fill()
//         .map(() => Math.floor(Math.random() * 128))
//         .join(", ")})`
//   )
//   .attr(
//     "d",
//     d3
//       .line()
//       .x((d) => d.x)
//       .y((d) => d.y)
//   );

// IG.Layer.register("TimeboxLayer", {
//   constructor: IG.Layer.D3Layer,
//   attach: [
//     {
//       precondition: (event, layer) =>
//         event.type === "pointer" && layer.inside(event),
//       tools: [
//         IG.Tool.initialize("DragTool", {
//           activeCommand(_, e) {
//             if (!(e.type === "pointer" && this.layer.inside(e))) debugger;
//             this.offsetX = e.x;
//             this.offsetY = e.y;
//             this.rawLayer = this.layer;
//           },
//           frameCommand(_, e) {
//             const node = this.rawLayer.getGraphic();
//             const deltaX = e.x - this.offsetX;
//             const deltaY = e.y - this.offsetY;
//             const base = node
//               .attr("transform")
//               .split("(")[1]
//               .split(")")[0]
//               .split(",")
//               .map((i) => parseFloat(i));
//             node.attr(
//               "transform",
//               `translate(${base[0] + deltaX}, ${base[1] + deltaY})`
//             );
//             queryLines();
//           },
//         }),
//       ],
//     },
//   ],
// });

// backgroundLayer.attach({
//   tool: IG.Tool.initialize("BrushTool", {
//     activeCommand: (_, e) => {
//       if (timeboxLayers.find((layer) => layer.inside(e))) {
//         recentLayer = null;
//         return;
//       }
//       offset = e;
//       recentLayer = IG.Layer.initialize("TimeboxLayer", 0, 0, svg);
//       recentLayer
//         .getGraphic()
//         .attr("transform", `translate(${e.x},${e.y})`)
//         .select("rect")
//         .attr("fill", "black")
//         .attr("opacity", 0.3);
//       backgroundLayer.listen({
//         layers: [recentLayer],
//         frameCommand: queryLines,
//       });
//       timeboxLayers.push(recentLayer);
//     },
//     frameCommand: (_, e) => {
//       if (!recentLayer) return;
//       recentLayer
//         .getGraphic()
//         .select("rect")
//         .attr("width", e.x - offset.x)
//         .attr("height", e.y - offset.y);
//       queryLines();
//     },
//   }),
// });

// const selector = IG.Query.initialize("RectQuery");
// selector.bindLayer(backgroundLayer);

// function queryLines() {
//   const result = new Set();
//   const base = backgroundLayer.getGraphic().node().getBoundingClientRect();
//   for (let layer of timeboxLayers) {
//     const bbox = layer.getGraphic().node().getBoundingClientRect();
//     selector.x = bbox.left - base.left;
//     selector.y = bbox.top - base.top;
//     selector.width = bbox.width;
//     selector.height = bbox.height;
//     selector.update();
//     selector.result.forEach((e) => result.add(e));
//   }
//   backgroundLayer.getGraphic().selectAll("path").attr("stroke-width", 1);
//   for (let e of result) {
//     d3.select(e).attr("stroke-width", 3);
//   }
// }

function registerHistogramLayer() {
  IG.Layer.register("histogramLayer", {
    constructor: IG.Layer.D3Layer,
    attach: [
      {
        precondition: (event, layer) =>
          event.type === "pointer" && layer.inside(event),
        tools: [
          IG.Tool.initialize("BrushTool", {
            activeCommand: function(_, e) {
            //console.log(e.type === "pointer" && this.layer.inside(e));
              // if (timeboxLayers.find((layer) => layer.inside(e))) {
              //   recentLayer = null;
              //   return;
              // }
              // offset = e;
              this.layer.brushLayer?.getGraphic().remove();
              const brushHeight = 90;
              const backgroundLayer = this.layer;
              const bg = backgroundLayer.getGraphic();
              const offsetY = bg.attr("transform").split("translate")[1].split(",")[1].split(")")[0];  // 不太方便
              const brushLayer = IG.Layer.initialize("brushLayer", 0, 100, svg);
              brushLayer
                .getGraphic()
                .attr("transform", `translate(${e.x},${offsetY})`)
                .select("rect")
                .attr("height", brushHeight)  // 不太方便
                .attr("fill", "black")
                .attr("opacity", 0.3);
              backgroundLayer.brushLayer = brushLayer;  // 不太方便
              backgroundLayer.brushStartX = e.x;
              backgroundLayer.listen({
                layers: [scatterBackgroundLayer],
                //frameCommand: queryLines,
                frameCommand: () => {},
              });
            },
            frameCommand: function(_, e) {
              // if (!recentLayer) return;
              // recentLayer
              //   .getGraphic()
              //   .select("rect")
              //   .attr("width", e.x - offset.x)
              //   .attr("height", e.y - offset.y);
              const g = this.layer.brushLayer.getGraphic();
              const width =  e.x - this.layer.brushStartX - 1;
              g.select("rect").attr("width", width >= 0? width : 0);
              //queryLines();
              console.log("frame");
            },
            terminateCommand: function() {
              console.log("terminate");
            }
          }),
        ],
      },
    ],
  });
}

function renderBinnedChart(root, width, height, data, key) {
  // layout
  const margin = { top: 10, right: 10, bottom: 40, left: 50 };
  width -= margin.left + margin.right;
  height -= margin.top + margin.bottom;

  // data manipulation
  const extent = d3.extent(data, (d) => d[key]);
  const bin = d3
    .bin()
    .domain(extent)
    .value((d) => d[key]);
  //.thresholds(d3.thresholdSturges);
  const binnedData = bin(data);
  let maxY = 0;
  binnedData.forEach((d) => {
    if (d.length > maxY) maxY = d.length;
  });
  const bandStep = width / binnedData.length;
  const bandWidth = bandStep * 0.9;
  const bandPadding = (bandStep - bandWidth) / 2;

  // scales
  const scaleX = d3
    .scaleLinear()
    .domain(extent)
    .range([0, width])
    .nice()
    .clamp(true);
  const scaleY = d3
    .scaleLinear()
    .domain([0, maxY])
    .range([height, 0])
    .nice()
    .clamp(true);

  // groups
  const groupAxisX = root
    .append("g")
    .attr("class", "groupAxisX")
    .attr("transform", `translate(${margin.left}, ${margin.top + height})`);
  const groupAxisY = root
    .append("g")
    .attr("class", "groupAxisY")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);
  const groupTitle = root
    .append("g")
    .attr("class", "title")
    .attr(
      "transform",
      `translate(${margin.left + width / 2}, ${margin.top + height})`
    );
  const groupPlot = root
    .append("g")
    .attr("class", "groupPlot")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);
  const groupMarks = groupPlot.append("g").attr("class", "groupMarks");
  const groupMarksFiltered = groupPlot
    .append("g")
    .attr("class", "groupMarksFiltered");

  // draw
  groupAxisX.call(d3.axisBottom(scaleX));
  groupAxisY
    .call(d3.axisLeft(scaleY))
    .call((g) =>
      g
        .selectAll(".tick line")
        .clone()
        .attr("stroke-opacity", 0.1)
        .attr("x2", width)
    )
    .call((g) =>
      g.selectAll(".tick").each(function (node, i) {
        if (i % 2 === 1) d3.select(this).select("text").remove();
      })
    );
  groupTitle
    .append("text")
    .text(key)
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("font-weight", "bold")
    .attr(
      "y",
      groupAxisX.node().getBBox().height + groupTitle.node().getBBox().height
    );
  groupMarks
    .selectAll("rect")
    .data(binnedData)
    .join("rect")
    //.attr("fill", "grey")
    .attr("fill", "steelblue")
    .attr("x", (d, i) => i * bandStep + bandPadding)
    .attr("y", (d) => scaleY(d.length))
    .attr("width", bandWidth)
    .attr("height", (d) => scaleY(0) - scaleY(d.length));
  // const barsFiltered = groupMarksFiltered.selectAll("rect")
  //   .data(binnedData)
  //   .join("rect")
  //   .attr("fill", "steelblue")
  //   .attr("x", (d, i) => i * bandStep + bandPadding)
  //   .attr("y", d => scaleY(d.length))
  //   .attr("width", bandWidth)
  //   .attr("height", d => scaleY(0) - scaleY(d.length));
}

function renderScatterPlot(
  root,
  width,
  height,
  data,
  fieldX,
  fieldY,
  fieldColor
) {
  // settings
  const radius = 3;
  const colorHidden = "#ddd";
  const tooltipFields = [
    "Miles_per_Gallon",
    "Cylinders",
    "Displacement",
    "Horsepower",
    "Weight_in_lbs",
    "Acceleration",
    "Name",
  ];

  // layout
  const margin = { top: 10, right: 100, bottom: 40, left: 60 };
  width -= margin.left + margin.right;
  height -= margin.top + margin.bottom;

  // data manipulation
  data = data.filter((d) => !!(d[fieldX] && d[fieldY]));
  const extentX = [0, d3.max(data, (d) => d[fieldX])];
  const extentY = [0, d3.max(data, (d) => d[fieldY])];
  const valuesColorSet = new Set();
  for (const datum of data) {
    valuesColorSet.add(datum[fieldColor]);
  }
  const valuesColor = Array.from(valuesColorSet);

  // scales
  const scaleX = d3
    .scaleLinear()
    .domain(extentX)
    .range([0, width])
    .nice()
    .clamp(true);
  const scaleY = d3
    .scaleLinear()
    .domain(extentY)
    .range([height, 0])
    .nice()
    .clamp(true);
  const scaleColor = d3
    .scaleOrdinal()
    .domain(valuesColor)
    .range(d3.schemeTableau10);

  // groups
  const groupAxisX = root
    .append("g")
    .attr("class", "groupAxisX")
    .attr("transform", `translate(${margin.left}, ${margin.top + height})`);
  const groupAxisY = root
    .append("g")
    .attr("class", "groupAxisY")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);
  const groupTitle = root
    .append("g")
    .attr("class", "title")
    .attr(
      "transform",
      `translate(${margin.left + width / 2}, ${margin.top + height})`
    );
  const groupMarks = root
    .append("g")
    .attr("class", "groupMarks")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);
  const groupLegends = root
    .append("g")
    .attr("class", "groupLegends")
    .attr("transform", `translate(${margin.left + width}, ${margin.top})`);
  const groupTooltip = root
    .append("g")
    .attr("class", "tooltip")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // draw
  groupAxisX
    .call(d3.axisBottom(scaleX))
    .call((g) =>
      g
        .selectAll(".tick line")
        .clone()
        .attr("stroke-opacity", 0.1)
        .attr("y2", -height)
    )
    .append("text")
    .text(fieldX)
    .attr("fill", "black")
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("font-weight", "bold")
    .attr("x", width / 2)
    .attr("y", 30);
  groupAxisY
    .call(d3.axisLeft(scaleY))
    .call((g) =>
      g
        .selectAll(".tick line")
        .clone()
        .attr("stroke-opacity", 0.1)
        .attr("x2", width)
    )
    .append("g")
    .attr("transform", `translate(${-margin.left / 2 - 5}, ${height / 2})`)
    .append("text")
    .text(fieldY)
    .attr("fill", "black")
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("font-weight", "bold")
    .style("writing-mode", "tb")
    .attr("transform", "rotate(180)");

  const circles = groupMarks
    .selectAll("circle")
    .data(data)
    .join("circle")
    .attr("fill", "none")
    .attr("stroke-width", 2)
    .attr("stroke", (d) => scaleColor(d[fieldColor]))
    .attr("cx", (d) => scaleX(d[fieldX]))
    .attr("cy", (d) => scaleY(d[fieldY]))
    .attr("r", radius);

  renderLegends(
    groupLegends,
    margin.right,
    height + margin.top + margin.left,
    fieldColor,
    scaleColor
  );
  //const { showTooltip, updateTooltip } = renderTooltip(groupTooltip, 0, 0, data, tooltipFields);
  //showTooltip(false);

  //groupTooltip.attr("display", null)
}

function renderLegends(root, width, height, field, scaleColor) {
  // settings
  const radius = 4;

  // layout
  const margin = { top: 30, right: 50, bottom: (height / 6) * 5, left: 10 };
  width -= margin.left + margin.right;
  height -= margin.top + margin.bottom;
  // data manipulation
  const domain = scaleColor.domain();

  //scale
  const scaleY = d3.scalePoint().domain(domain).range([height, 0]);

  // groups
  const groupTitle = root
    .append("g")
    .attr("class", "groupTitle")
    .attr("transform", `translate(${margin.left + width / 2}, ${5})`);
  const groupAxisY = root
    .append("g")
    .attr("class", "groupAxisY")
    .attr("transform", `translate(${margin.left + width}, ${margin.top})`);
  const groupMarks = root
    .append("g")
    .attr("class", "groupMarks")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // draw
  groupTitle.append("text").attr("text-anchor", "start").text(field);
  groupAxisY
    .call(d3.axisRight(scaleY))
    .call((g) => g.selectAll(".domain").remove());
  groupMarks
    .selectAll("circle")
    .data(domain)
    .join("circle")
    .attr("fill", "none")
    .attr("stroke-width", 2)
    .attr("stroke", (d) => scaleColor(d))
    .attr("cx", width / 2)
    .attr("cy", (d) => scaleY(d))
    .attr("r", radius);
}

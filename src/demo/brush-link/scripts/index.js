import IG from "~/IG";
import * as d3 from "d3";
import cars from "../../../data/cars.json";

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

registerBrushLayer();
registerBrushableLayer();

const plotLayers = new Map();
const frameFuncs = new Map();
const scales = new Map();
const extents = new Map();

for (let i = 0; i < keys.length; i++) {
  const key = keys[i];
  const histogramLayer = IG.Layer.initialize(
    "D3Layer",
    widthBinnedChart,
    heightBinnedChart,
    svg
  );
  const g = histogramLayer
    .getGraphic()
    .attr("transform", `translate(0, ${i * heightBinnedChart})`);

  const frameFunc = renderBinnedChart(
    histogramLayer,
    widthBinnedChart,
    heightBinnedChart,
    cars,
    key
  );

  frameFuncs.set(key, frameFunc);
}

const scatterBackgroundLayer = IG.Layer.initialize("D3Layer", 500, 500, svg);
const scatterG = scatterBackgroundLayer
  .getGraphic()
  .attr("transform", `translate(${widthBinnedChart}, 0)`);
const scatterFrameFunc = renderScatterPlot(
  scatterG,
  widthScatterPlot,
  height,
  cars,
  fieldX,
  fieldY,
  fieldColor
);

const plotLayersArr = keys.map((k) => plotLayers.get(k));
console.log(plotLayersArr);
for (const key of keys) {
  const plotLayer = plotLayers.get(key);
  const frameCommand = frameFuncs.get(key);
  plotLayer.listen({
    layers: plotLayersArr,
    frameCommand: () => {
      requestAnimationFrame(() => {
        frameCommand(extents);
        scatterFrameFunc(extents);
      });
    },
  });
}

/*********************** functions *************************/

function registerBrushLayer() {
  IG.Layer.register("brushLayer", {
    constructor: IG.Layer.D3Layer,
    attach: [
      {
        precondition: (event, layer) =>
          event.type === "pointer" && layer.inside(event),
        tools: [
          IG.Tool.initialize("DragTool", {
            activeCommand(_, e) {
              if (!(e.type === "pointer" && this.layer.inside(e))) debugger;
              this.offsetX = e.x;
              this.rawLayer = this.layer;
            },
            frameCommand(_, e) {
              const node = this.rawLayer.getGraphic();
              const deltaX = e.x - this.offsetX;
              const base = getXYfromTransform(node);
              node.attr("transform", `translate(${base[0] + deltaX}, ${0})`);
            },
          }),
        ],
      },
    ],
  });
}

function registerBrushableLayer() {
  IG.Layer.register("brushableLayer", {
    constructor: IG.Layer.D3Layer,
    attach: [
      {
        precondition: (event, layer) =>
          event.type === "pointer" && layer.inside(event),
        tools: [
          IG.Tool.initialize("BrushTool", {
            activeCommand: function (_, e) {
              this.layer.brushLayer?.getGraphic().remove();
              const backgroundLayer = this.layer;
              const bg = backgroundLayer.getGraphic();
              const brushHeight = +bg.select("rect").attr("height");
              const brushLayer = IG.Layer.initialize(
                "brushLayer",
                0,
                brushHeight,
                bg
              );
              brushLayer
                .getGraphic()
                .attr("transform", `translate(${e.x}, 0)`)
                .select("rect")
                .attr("height", brushHeight) // 不太方便
                .attr("fill", "black")
                .attr("opacity", 0.3);
              backgroundLayer.brushLayer = brushLayer; // 不太方便
              backgroundLayer.brushStartX = e.x;
            },
            frameCommand: function (_, e) {
              const brushableLayer = this.layer;
              const brushLayer = brushableLayer.brushLayer;
              const g = brushLayer.getGraphic();
              const width = e.x - this.layer.brushStartX - 1;
              g.select("rect").attr("width", width >= 0 ? width : 0);
              const xy = getXYfromTransform(brushLayer.getGraphic());
              extents.set(
                brushableLayer.key,
                [xy[0], xy[0] + width].map(scales.get(brushableLayer.key))
              );
            },
            terminateCommand: function () {
              console.log("terminate");
            },
          }),
        ],
      },
    ],
  });
}

function renderBinnedChart(rootLayer, width, height, data, key) {
  const root = rootLayer.getGraphic();
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

  /******************** layer *********************/
  const brushTool = IG.Tool.initialize("BrushTool");
  brushTool.attach(root.node());
  //let brushLayer = null;
  let brushLayer = null;
  let start = 0;  // 不同command共享变量不方便, 需要在command外设置全局变量, 不方便重用.
  rootLayer.listen({
    tools: [brushTool],
    startCommand: (_, e) => {
      console.log("start", e);
      //root.selectAll(".ig-layer-background").remove();
      brushLayer = IG.Layer.initialize("D3Layer", 0, height, root);
      brushLayer.getGraphic().attr(
        "transform",
        `translate(${e.x}, ${margin.top})`
      );
      const rect = d3.select(brushLayer.query("rect")[0]); //.attr("opacity", 0.3).attr("fill", "grey");
      rect.attr("opacity", 0.3);
      start = e.x;
    },
    dragCommand: (_, e) => {
      const rect = d3.select(brushLayer.query("rect")[0]); 
      const width = e.x - start - 1;
      rect.attr("width", width >= 0 ? width : 0);
      const xy = getXYfromTransform(brushLayer.getGraphic());
      console.log(xy);
      // extents.set(
      //   brushableLayer.key,
      //   [xy[0], xy[0] + width].map(scales.get(brushableLayer.key))
      // );
    },
  });

  scales.set(key, scaleX.invert);
  const plotLayer = IG.Layer.initialize("brushableLayer", width, height, root);
  plotLayer.key = key;
  plotLayers.set(key, plotLayer);

  const groupPlot = plotLayer
    .getGraphic()
    .attr("class", "groupPlot")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);
  const groupMarks = groupPlot.append("g").attr("class", "groupMarks");
  const groupMarksFiltered = groupPlot
    .append("g")
    .attr("class", "groupMarksFiltered");
  groupMarks
    .selectAll("rect")
    .data(binnedData)
    .join("rect")
    .attr("fill", "grey")
    .attr("x", (d, i) => i * bandStep + bandPadding)
    .attr("y", (d) => scaleY(d.length))
    .attr("width", bandWidth)
    .attr("height", (d) => scaleY(0) - scaleY(d.length));

  const barsFiltered = groupMarksFiltered
    .selectAll("rect")
    .data(binnedData)
    .join("rect")
    .attr("fill", "steelblue")
    .attr("x", (d, i) => i * bandStep + bandPadding)
    .attr("y", (d) => scaleY(d.length))
    .attr("width", bandWidth)
    .attr("height", (d) => scaleY(0) - scaleY(d.length));

  return filterData;

  function filterData(filterExtents) {
    barsFiltered
      .attr("y", (d) => {
        d = d.filter((d) => {
          for (const key of filterExtents.keys()) {
            const extent = filterExtents.get(key);
            if (extent && (d[key] < extent[0] || d[key] > extent[1]))
              return false;
          }
          return true;
        });
        return scaleY(d.length);
      })
      .attr("height", (d) => {
        d = d.filter((d) => {
          for (const key of filterExtents.keys()) {
            const extent = filterExtents.get(key);
            if (extent && (d[key] < extent[0] || d[key] > extent[1]))
              return false;
          }
          return true;
        });
        return scaleY(0) - scaleY(d.length);
      });
  }
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

  return filterData;

  function filterData(filterExtents) {
    circles.attr("stroke", (d) => {
      for (const key of filterExtents.keys()) {
        const extent = filterExtents.get(key);
        if (extent && (d[key] < extent[0] || d[key] > extent[1]))
          return colorHidden;
      }
      return scaleColor(d[fieldColor]);
    });
  }

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

function getXYfromTransform(node) {
  return node
    .attr("transform")
    .split("(")[1]
    .split(")")[0]
    .split(",")
    .map((i) => parseFloat(i));
}

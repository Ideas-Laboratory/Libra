import IG from "~/IG";
import * as d3 from "d3";
import cars from "../../../data/cars.json";
import { brush, extent, select } from "d3";
import { getBackground, getXYfromTransform } from "./helper";
import { addDrawRectTool, addDrawRectXTool } from "./tool";

if (process.env.NODE_ENV === "development") {
  require("../index.html");
}

const mainLayers = new Map();
const extents = new Map();
const brushTools = [];

main();

function main() {
  // fields to bin
  const histFields = [
    "Cylinders",
    "Displacement",
    "Weight_in_lbs",
    "Acceleration",
  ]; // Can choosen from one of the properties.
  const fieldX = "Horsepower";
  const fieldY = "Miles_per_Gallon";
  const fieldColor = "Origin";
  const keys = [...histFields].concat([fieldX, fieldY]);

  // layout
  const width = 950,
    height = 500;
  const widthHist = width / 3,
    heightHist = height / histFields.length;
  const widthScatterPlot = width - widthHist,
    heightScatterPlot = height;

  const svg = d3
    .select("#ctner")
    .attr("width", width)
    .attr("height", height)
    .attr("viewbox", `0 0 width height`);

  /***** histograms *****/
  for (let i = 0; i < histFields.length; i++) {
    const key = histFields[i];
    const histLayer = IG.Layer.initialize(
      "D3Layer",
      widthHist,
      heightHist,
      svg
    );
    const histG = histLayer
      .getGraphic()
      .attr("transform", `translate(0, ${i * heightHist})`);
    const histMainLayer = renderHistogram(
      histG,
      widthHist,
      heightHist,
      cars,
      key
    );
    mainLayers.set(key, histMainLayer);
  }

  /***** scatter plot *****/
  const scatterLayer = IG.Layer.initialize("D3Layer", 500, 500, svg);
  const scatterG = scatterLayer
    .getGraphic()
    .attr("transform", `translate(${widthHist}, 0)`);
  const scatterMainLayer = renderScatterPlot(
    scatterG,
    widthScatterPlot,
    height,
    cars,
    fieldX,
    fieldY,
    fieldColor
  );

  /* add interactions */
  for (const histMainLayer of mainLayers) {
    addInteractionToHist(histMainLayer);
  }
  addInteractionToScatter(scatterMainLayer);
}

/*********************** functions *************************/

function renderHistogram(root, width, height, data, key) {
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
  const groupBGMarks = root
    .append("g")
    .attr("class", "background-marks")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // draw things except main layer
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
  groupBGMarks
    .selectAll("new-rect")
    .data(binnedData)
    .join("rect")
    .attr("fill", "grey")
    .attr("x", (d, i) => i * bandStep + bandPadding)
    .attr("y", (d) => scaleY(d.length))
    .attr("width", bandWidth)
    .attr("height", (d) => scaleY(0) - scaleY(d.length));

  /******************** main layer *********************/
  const mainLayer = IG.Layer.initialize("D3Layer", width, height, root);
  const mainGroup = mainLayer
    .getGraphic()
    .attr("class", "main-layer")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);
  const mainRects = mainGroup
    .selectAll("new-rect")
    .data(binnedData)
    .join("rect")
    .attr("class", "mark")
    .attr("fill", "steelblue")
    .attr("x", (d, i) => i * bandStep + bandPadding)
    .attr("y", (d) => scaleY(d.length))
    .attr("width", bandWidth)
    .attr("height", (d) => scaleY(0) - scaleY(d.length));

  mainLayer.setSharedFiled("key", key);
  mainLayer.setSharedScale("scaleX", scaleX);
  mainLayer.setSharedScale("initialExtent", extent);
  mainLayer.setSharedScale("listener", filterData);
  mainLayer.setSharedScale("mainRects", mainRects);

  return mainLayer;

  function filterData(filterExtents) {
    mainRects
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

/**
 * It contains only the rendering part, except:
 *   1. Need to define a layer, which will do some interaction on it latter
 *   2. bind some information to layer with `layer.setSharedScale`. The information will be used for successive commands.
 *   3. return the layer
 * @param {d3.Selection<SVGGElement, unknown, unknown, unknown>} root
 * @param {*} width
 * @param {*} height
 * @param {*} data
 * @param {*} fieldX
 * @param {*} fieldY
 * @param {*} fieldColor
 * @returns
 */
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

  renderScatterLegends(
    groupLegends,
    margin.right,
    height + margin.top + margin.left,
    fieldColor,
    scaleColor
  );

  /***** main layer *****/
  const mainLayer = IG.Layer.initialize("D3Layer", width, height, root);
  const mainGroup = mainLayer
    .getGraphic()
    .attr("class", "groupMarks")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);
  const circles = mainGroup
    .selectAll("circle")
    .data(data)
    .join("circle")
    .attr("class", "mark")
    .attr("fill", "none")
    .attr("stroke-width", 2)
    .attr("stroke", (d) => scaleColor(d[fieldColor]))
    .attr("cx", (d) => scaleX(d[fieldX]))
    .attr("cy", (d) => scaleY(d[fieldY]))
    .attr("r", radius);

  /* share information */
  mainLayer.setSharedScale("fieldX", fieldX);
  mainLayer.setSharedScale("fieldY", fieldY);
  mainLayer.setSharedScale("fieldColor", fieldColor);
  mainLayer.setSharedScale("scaleX", scaleX);
  mainLayer.setSharedScale("scaleY", scaleY);
  mainLayer.setSharedScale("scaleColor", scaleColor);
  mainLayer.setSharedScale("extentX", extentX);
  mainLayer.setSharedScale("extentY", extentY);

  return mainLayer;
}

function renderScatterLegends(root, width, height, field, scaleColor) {
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

function addInteractionToHist() {}

function addInteractionToScatter(scatterMainLayer) {
  const fieldX = scatterMainLayer.getSharedScale("fieldX");
  const fieldY = scatterMainLayer.getSharedScale("fieldY");
  const fieldColor = scatterMainLayer.getSharedScale("fieldColor");
  const scaleX = scatterMainLayer.getSharedScale("scaleX");
  const scaleY = scatterMainLayer.getSharedScale("scaleY");
  const scaleColor = scatterMainLayer.getSharedScale("scaleColor");

  const brushTool = IG.Tool.initialize("BrushTool");
  brushTools.push(brushTool);
  const colorHidden = "#ddd";
  const scatterGroup = scatterMainLayer.getGraphic();
  console.log(scatterGroup.node());
  brushTool.attach(scatterGroup.node());
  //addDrawRectTool(scatterMainLayer, brushTool);
  addDrawRectXTool(scatterMainLayer, brushTool);
  // set extents
  scatterMainLayer.listen({
    tool: brushTool,
    startCommand: function () {
      extents.set(fieldX, scaleX.domain());
      extents.set(fieldY, scaleY.domain());
    },
    dragCommand: function () {
      const start = this.getSharedScale("start");
      const end = this.getSharedScale("end");
      extents.set(fieldX, [start[0], end[0]].map(scaleX.invert));
      extents.set(fieldY, [end[1], start[1]].map(scaleY.invert));
    },
  });
  // filter marks
  const circles = scatterMainLayer.getGraphic().selectAll("circle");
  scatterMainLayer.listen({
    tools: brushTools,
    dragCommand: function (selectionManager, e) {
      circles.attr("stroke", (d) => {
        for (const key of extents.keys()) {
          const extent = extents.get(key);
          if (extent && (d[key] < extent[0] || d[key] > extent[1]))
            return colorHidden;
        }
        return scaleColor(d[fieldColor]);
      });
    },
  });
}

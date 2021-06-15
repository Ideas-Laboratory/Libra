import IG from "~/IG";
import * as d3 from "d3";
import cars from "../../../data/cars.json";

if (process.env.NODE_ENV === "development") {
  require("../index.html");
}

// fields to bin
const histFields = ["Cylinders", "Displacement", "Weight_in_lbs", "Acceleration"]; // Can choosen from one of the properties.
const fieldX = "Horsepower";
const fieldY = "Miles_per_Gallon";
const fieldColor = "Origin";
const keys = [...histFields].concat([fieldX, fieldY]);

// layout
const width = 950,
  height = 500;
const widthBinnedChart = width / 3,
  heightBinnedChart = height / histFields.length;
const widthScatterPlot = width - widthBinnedChart,
  heightScatterPlot = height;

const svg = d3
  .select("#ctner")
  .attr("width", width)
  .attr("height", height)
  .attr("viewbox", `0 0 width height`);

const mainLayers = new Map();
const scales = new Map();
const extents = new Map();
const brushTools = [];
const histListeners = new Map();

/***** histograms *****/
for (let i = 0; i < histFields.length; i++) {
  const key = histFields[i];
  const histogramLayer = IG.Layer.initialize(
    "D3Layer",
    widthBinnedChart,
    heightBinnedChart,
    svg
  );
  const histG = histogramLayer
    .getGraphic()
    .attr("transform", `translate(0, ${i * heightBinnedChart})`);
  const { mainLayer, scaleX, scaleY, tool, initialExtent, listener } =
    renderBinnedChart(histG, widthBinnedChart, heightBinnedChart, cars, key);
  mainLayers.set(key, mainLayer);
  scales.set(key, scaleX);
  //scaleYs.set(key, scaleY);
  extents.set(key, initialExtent);
  //brushTools.set(key, tool);
  brushTools.push(tool);
  histListeners.set(key, listener);
}

/***** scatter plot *****/
const scatterBackgroundLayer = IG.Layer.initialize("D3Layer", 500, 500, svg);
const scatterG = scatterBackgroundLayer
  .getGraphic()
  .attr("transform", `translate(${widthBinnedChart}, 0)`);
const {
  mainLayer: scatterMainLayer,
  scaleX: scatterScaleX,
  scaleY: scatterScaleY,
  extentX: scatterExtentX,
  extentY: scatterExtentY,
  tool: scatterTool,
  listener: scatterListener,
} = renderScatterPlot(
  scatterG,
  widthScatterPlot,
  height,
  cars,
  fieldX,
  fieldY,
  fieldColor
);
scales.set(fieldX, scatterScaleX);
scales.set(fieldY, scatterScaleY);
extents.set(fieldX, scatterExtentX);
extents.set(fieldY, scatterExtentY);
brushTools.push(scatterTool);

/***** attach tools *****/
//const tools = Array.from(brushTools.values());
// attach tools to histograms
for (const key of histFields) {
  const histLayer = mainLayers.get(key);
  histLayer.listen({
    tools: brushTools,
    dragCommand: () => {
      histListeners.get(key)(extents);
    },
  });
}

// attach tools to scatter plot
scatterMainLayer.listen({
  tools: brushTools,
  dragCommand: () => {
    scatterListener(extents);
  },
});

/*********************** functions *************************/

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

  /******************** main layer and vice layer *********************/
  // vice layer
  const viceLayer = IG.Layer.initialize("D3Layer", width, height, root);
  const viceGroup = viceLayer
    .getGraphic()
    .attr("class", "vice-layer")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);
  viceGroup
    .selectAll("new-rect")
    .data(binnedData)
    .join("rect")
    .attr("fill", "grey")
    .attr("x", (d, i) => i * bandStep + bandPadding)
    .attr("y", (d) => scaleY(d.length))
    .attr("width", bandWidth)
    .attr("height", (d) => scaleY(0) - scaleY(d.length));

  // main layer
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

  /*************** attach tool ***************/
  const brushTool = IG.Tool.initialize("BrushTool");
  brushTool.attach(mainGroup.node());
  let brushLayer = null;
  let start = 0;
  // listen to brush tool
  mainLayer.listen({
    tool: brushTool,
    startCommand: (_, e) => {
      start = e.x;
      console.log("start on hist", e);
      mainLayer.getGraphic().selectAll(".brush-layer").remove();
      brushLayer = IG.Layer.initialize(
        "D3Layer",
        0,
        height,
        mainLayer.getGraphic()
      );
      brushLayer
        .getGraphic()
        .attr("transform", `translate(${start}, 0)`)
        .attr("class", "brush-layer");
      const rect = d3.select(brushLayer.query("rect")[0]); //.attr("opacity", 0.3).attr("fill", "grey");
      rect.attr("opacity", 0.3);
      extents.set(key, extent);
    },
    dragCommand: (_, e) => {
      console.log("drag on hist", e);
      const rect = d3.select(brushLayer.query("rect")[0]);
      const width = e.x - start - 1;
      rect.attr("width", width >= 0 ? width : 0);
      const xy = getXYfromTransform(brushLayer.getGraphic());
      extents.set(key, [xy[0], xy[0] + width].map(scales.get(key).invert));
    },
  });

  // const clearTool = IG.Tool.initialize("ClickTool");
  // clearTool.attach(mainGroup.node());
  // mainLayer.listen({
  //   tool: clearTool,
  //   startCommand: () => {  // 需要给ClickTool添加startCommand的relations
  //     console.log("start");
  //     extents.set(key, extent);
  //   },
  //   endCommand: () => {
  //     console.log("end");
  //     extents.set(key, extent);
  //   },
  // });

  return {
    mainLayer: mainLayer,
    scaleX: scaleX,
    scaleY: scaleY,
    tool: brushTool,
    initialExtent: extent,
    listener: filterData,
  };

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

  renderLegends(
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

  const brushTool = IG.Tool.initialize("BrushTool");
  brushTool.attach(mainGroup.node());
  let brushLayer = null;
  let start = [0, 0];
  // listen to brush tool
  mainLayer.listen({
    tool: brushTool,
    startCommand: (_, e) => {
      start = [e.x, e.y];
      mainLayer.getGraphic().selectAll(".brush-layer").remove();
      brushLayer = IG.Layer.initialize(
        "D3Layer",
        0,
        height,
        mainLayer.getGraphic()
      );
      brushLayer
        .getGraphic()
        .attr("transform", `translate(${start[0]}, ${start[1]})`)
        .attr("class", "brush-layer");
      const rect = d3.select(brushLayer.query("rect")[0]); //.attr("opacity", 0.3).attr("fill", "grey");
      rect.attr("opacity", 0.3);
      extents.set(fieldX, extentX);
      extents.set(fieldY, extentY);
    },
    dragCommand: (_, e) => {
      const rect = d3.select(brushLayer.query("rect")[0]);
      const width = e.x - start[0] - 1;
      const height2 = e.y - start[1] - 1;
      rect.attr("width", width >= 0 ? width : 0);
      rect.attr("height", height2 >= 0 ? height2 : 0);
      const xy = getXYfromTransform(brushLayer.getGraphic());
      extents.set(
        fieldX,
        [xy[0], xy[0] + width].map(scaleX.invert)
      );
      extents.set(
        fieldY,
        [xy[0], xy[0] + height2].map(scaleY.invert).reverse().map(d => d)
      );
        console.log(extents.get(fieldY));
    },
  });

  /***** attach tool *****/

  return {
    mainLayer: mainLayer,
    scaleX: scaleX,
    scaleY: scaleY,
    extentX: extentX,
    extentY: extentY,
    scaleColor: scaleColor,
    tool: brushTool,
    listener: filterData,
  };

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

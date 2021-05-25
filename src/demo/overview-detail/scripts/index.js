import IG from "~/IG";
import * as d3 from "d3";

if (process.env.NODE_ENV === "development") {
  require("../index.html");
}
var data = JSON.parse('{"success":true,"response":[{"product_date":"2019-09-01","value":{"temperature":"30.6029968261719"}},{"product_date":"2019-09-02","value":{"temperature":"30.1170043945312"}},{"product_date":"2019-09-03","value":{"temperature":"30.0830078125"}},{"product_date":"2019-09-04","value":{"temperature":"30.2479858398438"}},{"product_date":"2019-09-05","value":{"temperature":"30.9110107421875"}},{"product_date":"2019-09-06","value":{"temperature":"31.3150024414062"}},{"product_date":"2019-09-07","value":{"temperature":"31.2909851074219"}},{"product_date":"2019-09-08","value":{"temperature":"30.7149963378906"}},{"product_date":"2019-09-09","value":{"temperature":"30.010009765625"}},{"product_date":"2019-09-10","value":{"temperature":"29.7990112304688"}},{"product_date":"2019-09-11","value":{"temperature":"29.6549987792969"}},{"product_date":"2019-09-12","value":{"temperature":"30.0769958496094"}},{"product_date":"2019-09-13","value":{"temperature":"30.0830078125"}},{"product_date":"2019-09-14","value":{"temperature":"29.8619995117188"}},{"product_date":"2019-09-15","value":{"temperature":"30.0029907226562"}},{"product_date":"2019-09-16","value":{"temperature":"30.1080017089844"}},{"product_date":"2019-09-17","value":{"temperature":"30.6979980469"}},{"product_date":"2019-09-18","value":{"temperature":"30.3139953613"}},{"product_date":"2019-09-19","value":{"temperature":"30.5180053710938"}},{"product_date":"2019-09-20","value":{"temperature":"30.3720092773"}},{"product_date":"2019-09-21","value":{"temperature":"29.8710021973"}},{"product_date":"2019-09-22","value":{"temperature":"29.7460021972656"}},{"product_date":"2019-09-23","value":{"temperature":"29.5769958496"}},{"product_date":"2019-09-24","value":{"temperature":"29.1159973145"}},{"product_date":"2019-09-25","value":{"temperature":"28.908996582"}}]}');
var parseDate = d3.timeParse("%b %Y");
var svg = d3.select("#ctner");
svg.attr("width", 960)
  .attr("height", 500);
var tipg = svg.append("g");
var margin = { top: 20, right: 20, bottom: 110, left: 40 },
  margin2 = { top: 430, right: 20, bottom: 30, left: 40 },
  width = +svg.attr("width") - margin.left - margin.right,
  height = +svg.attr("height") - margin.top - margin.bottom,
  height2 = +svg.attr("height") - margin2.top - margin2.bottom;
let layer1Root = svg.append("g").attr("id", "layer1Root");
let layer2Root = svg.append("g").attr("id", "layer2Root");
const layer1 = IG.Layer.initialize("D3Layer", width, height, layer1Root);
const layer2 = IG.Layer.initialize("D3Layer", width, height2, layer2Root);

const axesLayer = IG.Layer.initialize("D3Layer", width, height, layer1Root);
const pointsLayer = IG.Layer.initialize("D3Layer", width, height, layer1Root);

const contextAxesLayer = IG.Layer.initialize("D3Layer", width, height2, layer2Root);

var x = d3.scaleTime().range([0, width]),
  x2 = d3.scaleTime().range([0, width]),
  y = d3.scaleLinear().range([height, 0]),
  y2 = d3.scaleLinear().range([height2, 0]);

var xAxis = d3.axisBottom(x),
  xAxis2 = d3.axisBottom(x2),
  yAxis = d3.axisLeft(y);
var line1 = d3.line()
  .curve(d3.curveMonotoneX)
  .x(function (d) { return x(d.date); })
  .y(function (d) { return y(d.value); });

var line2 = d3.line()
  .curve(d3.curveMonotoneX)
  .x(function (d) { return x2(d.date); })
  .y(function (d) { return y2(d.value); });

svg.append("defs").append("clipPath")
  .attr("id", "clip")
  .append("rect")
  .attr("width", width)
  .attr("height", height);
var focus = layer1.getGraphic()
  .attr("class", "focus")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
tipg.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
let axes = axesLayer.getGraphic()
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var points = pointsLayer.getGraphic()
  .attr("clip-path", "url(#clip)")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
  .attr("class", "d");


var context = layer2.getGraphic()
  .attr("class", "context")
  .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

var contextAxes = contextAxesLayer.getGraphic()
  .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");
var div = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

let vdata = data.response;

// format the data
vdata.forEach((d) => {
  d.date = d3.timeParse("%Y-%m-%d")(d.product_date);
  d.value = +d.value.temperature;
});

x.domain(d3.extent(vdata, function (d) { return d.date; }));
y.domain([0, d3.max(vdata, function (d) { return d.value; })]);
x2.domain(x.domain());
y2.domain(y.domain());
focus.append("path")
  .datum(vdata)
  .attr("clip-path", "url(#clip)")
  .attr("class", "line")
  .attr("fill", "none")
  .attr("stroke", "steelblue")
  .attr("stroke-width", 1.5)
  .attr("d", line1);

axes.append("g")
  .attr("class", "axis--x")
  .attr("transform", "translate(0," + height + ")")
  .call(xAxis);

axes.append("g")
  .attr("class", "axis axis--y")
  .call(yAxis);


axes.append("g")
  .attr("class", "axis axis--x")
  .attr("transform", "translate(0," + height + ")")
  .call(xAxis);

axes.append("g")
  .attr("class", "axis axis--y")
  .call(yAxis);

points.selectAll(".dot")
  .data(vdata)
  .enter().append("circle")
  .attr("class", "dot")
  .attr("cx", function (d, i) { return x(d.date); })
  .attr("cy", function (d) { return y(d.value); })
  .attr("r", 5)
  .attr("pointer-events", "all");


context.append("path")
  .datum(vdata)
  .attr("class", "line")
  .attr("fill", "none")
  .attr("stroke", "steelblue")
  .attr("stroke-width", 1.5)
  .attr("d", line2);
contextAxes.append("g")
  .attr("class", "axis axis--x")
  .attr("transform", "translate(0," + height2 + ")")
  .call(xAxis2);


function updateHover(circle, color) {
  d3.select(circle)
    .attr("fill", color)
    .attr("nothing", function (d) {
      textg.text(`Value:${d.value} `)
        .attr("x", function () {
          return +d3.select(circle).attr("cx") + 40;
        })
        .attr("y", function () {
          return +d3.select(circle).attr("cy") + 40;
        });
    });
}

function rectQuery() {
  let rect = brushLayer.getGraphic().select("rect");
  let lx = +rect.attr("x");
  let width = +rect.attr("width");
  let rx = width + lx;
  updateView(lx, rx);
}

function computeByDelta(delta) {
  let node = brushLayer.getGraphic().select("rect");
  let width = +node.attr("width");
  let x = +node.attr("x");
  if (delta > 0) {
    x = +x + 2;
    width = +width - 4;
  } else {
    x = +x - 2;
    width = +width + 4;
  }
  return { x, width };
}

function updateBrushRect(startX, width, height) {
  if (width >= 0) {
    brushLayer
      .getGraphic()
      .select("rect")
      .attr("x", startX)
      .attr("y", 0)
      .attr("width", width)
      .attr("height", height)
      .attr("class", "brush")
      .attr("fill", "black")
      .attr("opacity", 0.3);
  }
}

function updateView(lx, rx) {
  if (lx !== rx) {
    x.domain([x2.invert(lx), x2.invert(rx)]);
    focus.select(".line").attr("d", d3.line()
      .x(function (d) { return x(d.date); })
      .y(function (d) { return y(d.value); })
    );
    points.selectAll('circle')
      .attr("cx", function (d, i) { return x(d.date); })
      .attr("cy", function (d) { return y(d.value); })
      .attr("sid", function (d) {
        let sid = d3.select(this).attr("sid");
        if (sid !== undefined) {
          annotationLayers.forEach((annotationLayer) => {
            let group = annotationLayer.getGraphic();
            if (group.attr("sid") === sid) {
              let startX = x(d.date);
              let startY = y(d.value);
              updateAnnotationGroup(annotationLayer, startX, startY);
            }
          });
        }
        return sid;
      });
    axes.selectAll(".axis--x *").remove();
    axes.select(".axis--x").call(xAxis);
  } else {
    x.domain(d3.extent(vdata, function (d) { return d.date; }));
    focus.select(".line").attr("d", d3.line()
      .x(function (d) { return x(d.date); })
      .y(function (d) { return y(d.value); })
    );
    points.selectAll('circle')
      .attr("cx", function (d, i) { return x(d.date); })
      .attr("cy", function (d) { return y(d.value); })
      .attr("sid", function (d) {
        let sid = d3.select(this).attr("sid");
        if (sid !== undefined) {
          annotationLayers.forEach((annotationLayer) => {
            let group = annotationLayer.getGraphic();
            if (group.attr("sid") === sid) {
              let startX = x(d.date);
              let startY = y(d.value);
              updateAnnotationGroup(annotationLayer, startX, startY);
            }
          });
        }
        return sid;
      });
    axes.selectAll(".axis--x *").remove();
    axes.select(".axis--x").call(xAxis);
  }
}
function createAnnotationLayer() {
  let annotationLayer = IG.Layer.initialize("D3Layer", 0, 0, layer1Root);
  annotationLayer.getGraphic()
    .attr("clip-path", "url(#clip)")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .attr("class", "annotationLayer")
    .attr("sid", annotationLayers.length + 1)
    .append("line")
    .attr("fill", "black");
  annotationLayer.getGraphic()
    .append("rect")
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-width", 3)
    .attr("class", "rectBound");
  annotationLayer.getGraphic()
    .append("text")
    .attr("dominant-baseline", "middle");

  return annotationLayer;
}
let rectBoundWidth = 90;
let rectBoundHeight = 30;
function updateAnnotationLayer(annotationLayer, recentCircle, width, height) {
  let group = annotationLayer.getGraphic();
  let selection = d3.select(recentCircle)
    .attr("sid", annotationLayers.length);
  let info = selection.datum()["product_date"];
  let startX = +selection.attr("cx");
  let startY = +selection.attr("cy");
  let endX = startX + width;
  let endY = startY + height;
  group.select("line")
    .attr("x1", startX)
    .attr("y1", startY)
    .attr("x2", endX)
    .attr("y2", endY)
    .attr("stroke-width", 2)
    .attr("stroke", "black");
  group.select(".rectBound")
    .attr("x", endX)
    .attr("y", endY)
    .attr("width", rectBoundWidth)
    .attr("height", rectBoundHeight);
  group.select("text")
    .text(info)
    .attr("x", endX)
    .attr("y", endY + rectBoundHeight / 2);
}
function updateAnnotationGroup(annotationLayer, startX, startY) {
  let group = annotationLayer.getGraphic();
  let line = group.select("line");
  let rectBound = group.select(".rectBound");
  let text = group.select("text");
  let lineWidth = +line.attr("x2") - (+line.attr("x1"));
  let lineHeight = +line.attr("y2") - (+line.attr("y1"));
  let endX = startX + lineWidth;
  let endY = startY + lineHeight;
  line
    .attr("x1", startX)
    .attr("y1", startY)
    .attr("x2", endX)
    .attr("y2", endY);
  rectBound
    .attr("x", endX)
    .attr("y", endY);
  text
    .attr("x", endX)
    .attr("y", endY + rectBoundHeight / 2);
}
function computeOffset(obj1, obj2) {
  let startX = +obj1.x;
  let startY = +obj1.y;
  let endX = +obj2.rawEvent.clientX;
  let endY = + obj2.rawEvent.clientY;
  let width = endX - startX;
  let height = endY - startY;
  return { width, height };
}
function updateRectByDrag(offWidth) {
  let ratio = 0.3;
  let brushRect = brushLayer.getGraphic()
    .select("rect");
  let width = +brushRect.attr("width");
  if (width <= 0) return;
  let rectX = +brushRect.attr("x");
  let newX = offWidth * ratio + rectX;
  updateBrushRect(newX, width, height2);
  rectQuery();

}

let textg = tipg.append("text");
let brushLayer = IG.Layer.initialize("D3Layer", 0, 0, layer2Root);
brushLayer.getGraphic()
  .classed("star", true)
  .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");



let annotationLayers = [];
let recentCircle;
let annotationState = false;
let dragAnnoState = false;
let annoOffet = { x: 0, y: 0 };
let offset;
let brushState = false;
let dragState = false;
let OnCircle ;

/********************************  The part of interaction！  *********************************/
// HoverTool 
pointsLayer.attach({
  tool: IG.Tool.initialize("HoverTool", {
    frameCommand: ({ result, x, y }) => {
      textg.text("");
      points.selectAll("circle").attr("fill", "black");
      OnCircle = undefined;
      result.forEach((circle) => {
        updateHover(circle, "red");
        OnCircle = circle;
      });
    },
  }),
});

// DragTool
pointsLayer.attach({
  tool: IG.Tool.initialize("DragTool", {
    activeCommand: (obj, e) => {
      annoOffet.x = e.rawEvent.clientX;
      annoOffet.y = e.rawEvent.clientY;

      // if (obj.result.length === 0) {
      //   dragAnnoState = true;
      //   return;
      // }
      if(OnCircle === undefined){
        dragAnnoState = true;
        return;
      }
      annotationState = true;
      annotationLayers.push(createAnnotationLayer());
      recentCircle = OnCircle;
      //d3.select(obj.result[0]).attr("annotation", "true");
      d3.select(OnCircle).attr("annotation", "true");
    },
    frameCommand: (obj, e) => {
      let offset = computeOffset(annoOffet, e);
      if (dragAnnoState) {
        updateRectByDrag(offset.width);
        annoOffet.x = e.rawEvent.clientX;
        annoOffet.y = e.rawEvent.clientY;
        return;
      };
      updateAnnotationLayer(annotationLayers[annotationLayers.length - 1], recentCircle, offset.width, offset.height);
    },
    terminateCommand: () => {
      annotationState = false;
      dragAnnoState = false;
    }
  })
});

// Listen
pointsLayer.listen({
  layers: [brushLayer],
  frameCommand: rectQuery
});

// BrushTool
layer2.attach({
  tool: IG.Tool.initialize("BrushTool", {
    activeCommand: (_, e) => {
      if (brushLayer.inside(e)) return;
      brushState = true;
      offset = e;
      updateBrushRect(offset.x, 0, height2);
    },
    frameCommand: (_, e) => {
      if (!brushState) return;
      let width = Math.abs(e.x - offset.x);
      updateBrushRect(offset.x, width, height2);
    },
    terminateCommand: () => {
      brushState = false;
    },
  }),
});

// ZoomTool
brushLayer.attach({
  tool: IG.Tool.initialize("ZoomTool", {
    frameCommand: (_, e) => {
      let arg = computeByDelta(e.delta);
      updateBrushRect(arg.x, arg.width, height2);
    }
  })
});

// DragTool
brushLayer.attach({
  tool: IG.Tool.initialize("DragTool", {
    activeCommand(_, e) {
      if (brushState) return;
      dragState = true;
      this.offsetX = e.rawEvent.clientX;
      this.rawLayer = this.layer;
      this.x = +this.layer.getGraphic().select("rect").attr("x");
    },
    frameCommand(_, e) {
      if (brushState) return;
      const node = this.rawLayer.getGraphic();
      const deltaX = e.rawEvent.clientX - this.offsetX;
      node.select("rect").attr("x", this.x + deltaX);
      let width = +node.select("rect").attr("width");
    },
  })
});




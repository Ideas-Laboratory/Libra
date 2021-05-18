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

const layer1 = IG.Layer.initialize("D3Layer", width, height, svg);
const layer2 = IG.Layer.initialize("D3Layer", width, height2, svg);

const axesLayer = IG.Layer.initialize("D3Layer", width, height, svg);
const pointsLayer = IG.Layer.initialize("D3Layer", width, height, svg);

const contextAxesLayer = IG.Layer.initialize("D3Layer", width, height2, svg);

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
  .attr("r", 3)
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







let textg = tipg.append("text");
pointsLayer.attach({
  tool: IG.Tool.initialize("HoverTool", {
    frameCommand: ({ result, x, y }) => {

      textg.text("");
      result.forEach((circle) => {

        d3.select(circle)
          .attr("nothing", function (d) {
            textg.text(`Value:${d.value} `)
              .attr("x", function () {
                return +d3.select(circle).attr("cx") + 40;
              })
              .attr("y", function () {
                return +d3.select(circle).attr("cy") + 40;
              });
          });

      });

    },
  }),
});

let brushLayer = IG.Layer.initialize("D3Layer", 0, 0, svg);
brushLayer.getGraphic()
  .classed("star", true)
  .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");
let offset;
let brushState = false;
layer2.attach({
  tool: IG.Tool.initialize("BrushTool", {
    activeCommand: (_, e) => {
      if (brushLayer.inside(e)) {
        return;
      }

      brushState = true;
      offset = e;
      brushLayer
        .getGraphic()
        .select("rect")
        .attr("x", `${offset.x}`)
        .attr("class", "brush")
        .attr("fill", "black")
        .attr("opacity", 0.3);


    },
    frameCommand: (_, e) => {
      if (!brushState) return;
      brushLayer
        .getGraphic()
        .select("rect")
        .attr("x", `${offset.x}`)
        .attr("y", 0)
        .attr("width", Math.abs(e.x - offset.x))
        .attr("height", height2);
      if (+brushLayer.getGraphic().select("rect").attr("width") > 0) {
        updateView(offset.x, e.x);
      }

    },
    terminateCommand: () => {
      brushState = false;
      let width = +brushLayer.getGraphic().select("rect").attr("width");
      if (width <= 0) {
        x.domain(d3.extent(vdata, function (d) { return d.date; }));
        focus.select(".line").attr("d", d3.line()
          .x(function (d) { return x(d.date); })
          .y(function (d) { return y(d.value); })
        );
        points.selectAll('circle')
          .attr("cx", function (d, i) { return x(d.date); })
          .attr("cy", function (d) { return y(d.value); });
        //axes.select(".axis--x").call(xAxis);
        axes.selectAll(".axis--x *").remove();
        axes.select(".axis--x").call(xAxis);
      }
    },
  }),
});

brushLayer.attach({
  tool: IG.Tool.initialize("ZoomTool", {
    frameCommand: (_, e) => {
      let node = brushLayer.getGraphic().select("rect");
      let delta = 0;
      let width = +node.attr("width");
      let x = +node.attr("x");
      if (e.delta > 0) {
        x = +x + 2;
        width = +width - 4;
      } else {
        x = +x - 2;
        width = +width + 4;
      }
      if (width > 0) {
        brushLayer
          .getGraphic()
          .select("rect")
          .attr("x", x)
          .attr("y", 0)
          .attr("width", width)
          .attr("height", height2);
        updateView(x, x + width);
      }

    }
  })
});

let dragState = false;
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
      updateView(this.x + deltaX, this.x + deltaX + width);
    },
  })
});

function updateView(lx, rx) {
  x.domain([x2.invert(lx), x2.invert(rx)]);
  focus.select(".line").attr("d", d3.line()
    .x(function (d) { return x(d.date); })
    .y(function (d) { return y(d.value); })
  );
  points.selectAll('circle')
    .attr("cx", function (d, i) { return x(d.date); })
    .attr("cy", function (d) { return y(d.value); });
  axes.selectAll(".axis--x *").remove();
  axes.select(".axis--x").call(xAxis);
}



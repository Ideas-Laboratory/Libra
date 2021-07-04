import IG from "~/IG";
import * as d3 from "d3";
import IBMURL from "/src/data/stocks/IBM.csv";
import GOOGURL from "/src/data/stocks/GOOG.csv";
import MSFTURL from "/src/data/stocks/MSFT.csv";
import AAPLURL from "/src/data/stocks/AAPL.csv";
import AMZNURL from "/src/data/stocks/AMZN.csv";

if (process.env.NODE_ENV === "development") {
  require("../index.html");
}

init();

async function init() {
  const width = 600;
  const height = 400;
  const svg = d3.select("#ctner").attr("width", width).attr("height", height);
  const data = await loadData();
  console.log(data);
  renderIndexChart(svg, width, height, data);
}

function renderIndexChart(root, width, height, data) {
  const margin = { top: 20, left: 50, bottom: 50, right: 20 };
  width = width - margin.left - margin.right;
  height = height - margin.top - margin.bottom;

  // atomatic generate G with margin?
  const mainLayer = IG.Layer.initialize("D3Layer", width, height, root);
  const mainGroup = mainLayer.getGraphic().attr("class", "main").attr("transform", `translate(${margin.left}, ${margin.top})`);
  const xGroup = root
    .append("g")
    .attr("class", "xAxis")
    .attr("transform", `translate(${margin.left}, ${margin.top + height})`);
  const yGroup = root
    .append("g")
    .attr("class", "yAxis")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // data manimulation

  const series = d3
    .groups(data, (d) => d.name)
    .map(([key, values]) => {
      const v = values[0].value;
      return {
        key,
        values: values.map(({ date, value }) => ({ date, value: values / v })),
      };
    });
  const k = d3.max(
    d3.group(data, (d) => d.name),
    ([, group]) => d3.max(group, (d) => d.value) / d3.min(group, (d) => d.value)
  );
  const bisect = d3.bisector((d) => d.date).left;
  const formatDate = d3.utcFormat("%B, %Y");
  const line = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.value));

  const x = d3
    .scaleUtc()
    .domain(d3.extent(data, (d) => d.date))
    .range([0, width]);
  const y = d3
    .scaleLog()
    .domain([1 / k, k])
    .rangeRound([height - margin.bottom, margin.top])
    .range([height, 0]);
  const z = d3
    .scaleOrdinal(d3.schemeCategory10)
    .domain(data.map((d) => d.name));

  xGroup
    .call(
      d3
        .axisBottom(x)
        .ticks(width / 80)
        .tickSizeOuter(0)
    )
    .call((g) => g.select(".domain").remove());
  yGroup
    .call(d3.axisLeft(y).ticks(null, (x) => +x.toFixed(6) + "x"))
    .call((g) =>
      g
        .selectAll(".tick line")
        .clone()
        .attr("stroke-opacity", (d) => (d === 1 ? null : 0.2))
        .attr("x2", width)
    )
    .call((g) => g.select(".domain").remove());
  
  const rule = mainGroup.append("g")
    .append("line")
      .attr("y1", height)
      .attr("y2", 0)
      .attr("x1", width/2)
      .attr("x2", width/2)
      .attr("stroke", "black");
  
  // const serie = root.append("g")
  //     .style("font", "bold 10px sans-serif")
  //   .selectAll("g")
  //   .data(series)
  //   .join("g");
  
  // serie.append("path")
  //     .attr("fill", "none")
  //     .attr("stroke-width", 1.5)
  //     .attr("stroke-linejoin", "round")
  //     .attr("stroke-linecap", "round")
  //     .attr("stroke", d => z(d.key))
  //     .attr("d", d => line(d.values));

  // serie.append("text")
  //     .datum(d => ({key: d.key, value: d.values[d.values.length - 1].value}))
  //     .attr("fill", "none")
  //     .attr("stroke", "white")
  //     .attr("stroke-width", 3)
  //     .attr("x", x.range()[1] + 3)
  //     .attr("y", d => y(d.value))
  //     .attr("dy", "0.35em")
  //     .text(d => d.key)
  //   .clone(true)
  //     .attr("fill", d => z(d.key))
  //     .attr("stroke", null);

  // atomatic generate scale with margin?
  // const xScale = d3.scaleUtc().domain().range();
  // const ySclae = d3.scaleLog().domain().range();
}

async function loadData() {
  const names = ["IBM", "GOOG", "MSFT", "AAPL", "AMZN"];
  const urls = [IBMURL, GOOGURL, MSFTURL, AAPLURL, AMZNURL];
  const data = await Promise.all(urls.map((url) => d3.csv(url)));
  const parseDate = d3.utcParse("%Y-%m-%d");
  return data.flatMap((dataOneCompony, i) =>
    dataOneCompony.map((d) => ({
      name: names[i],
      date: parseDate(d.Date),
      value: +d.Close,
    }))
  );
}
// const g = layer.getGraphic();
// g.selectAll("circle")
//   .data(
//     new Array(100)
//       .fill()
//       .map(() => ({ x: Math.random() * 480 + 10, y: Math.random() * 480 + 10 }))
//   )
//   .enter()
//   .append("circle")
//   .attr("cx", (d) => d.x)
//   .attr("cy", (d) => d.y)
//   .attr("r", 10)
//   .attr("fill", "red");

// const tool = IG.Tool.initialize("HoverTool");
// tool.attach(svg.node());

// layer.listen({
//   tool,
//   pointerCommand: ({ result }) => {
//     g.selectAll("circle").attr("fill", "red");
//     result.forEach((circle) => d3.select(circle).attr("fill", "blue"));
//   },
// });

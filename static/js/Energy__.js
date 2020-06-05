/* * * * * * * * * * * * * * * * * * * * * * * *

* * * * * * * * * * * * * * * * * * * * * * * * */
$("#climabox").addClass("active");


var data = [
  { year: "2006", redDelicious: "10", mcintosh: "15", oranges: "9", pears: "6" },
  { year: "2007", redDelicious: "12", mcintosh: "18", oranges: "9", pears: "4" },
  { year: "2008", redDelicious: "05", mcintosh: "20", oranges: "8", pears: "2" },
  { year: "2009", redDelicious: "01", mcintosh: "15", oranges: "5", pears: "4" },
  { year: "2010", redDelicious: "02", mcintosh: "10", oranges: "4", pears: "2" },
  { year: "2011", redDelicious: "03", mcintosh: "12", oranges: "6", pears: "3" },
  { year: "2012", redDelicious: "04", mcintosh: "15", oranges: "8", pears: "1" },
  { year: "2013", redDelicious: "06", mcintosh: "11", oranges: "9", pears: "4" },
  { year: "2014", redDelicious: "10", mcintosh: "13", oranges: "9", pears: "5" },
  { year: "2015", redDelicious: "16", mcintosh: "19", oranges: "6", pears: "9" },
  { year: "2016", redDelicious: "19", mcintosh: "17", oranges: "5", pears: "7" },
];

var parse = d3.timeParse("%Y");


// Transpose the data into layers
var dataset = d3.stack()(["redDelicious", "mcintosh", "oranges", "pears"].map(function(fruit) {
  return data.map(function(d) {
    return {x: parse(d.year), y: +d[fruit]};
  });
}));

console.log("++++++", dataset)

data_ = [10,15,24,12]
// var Qh_T= Qh_T.map(d => [d, "Heating"]);
// var EUI= EUI.map(d => [d, "EUI"]);
var len = 10//data.length;
// place svg canvas into main
var margin = {top: 20, right: 10, bottom: 20, left: 36},
    width = 400 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

var xScale = d3.scaleLinear().domain([0, len-1]).range([10, width-10]);
    xAxis = d3.axisBottom().scale(xScale)

// y scale function
var yScale = d3.scaleLinear().domain([0, 100]).range([height, 0]);
    yAxis = d3.axisLeft().scale(yScale);


var svg = d3.select("#svgenergy")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

   
svg.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("height", height)
    .attr("width", width)    
    .style("strock", "grey")
    .style("fill", "grey")
    .style("opacity", 0.08);
  

// correlate the color with the value
var color = d3.scaleOrdinal()
    .domain(["Heating", "Cooling", "EUI"])
    .range(["orangered", "grey", "Gainsboro"]);

// append the rectangles for the bar chart
svg.selectAll(".bar")
    .data(dataset)
  .enter().append("rect")
    .attr("class", "bar")
    .attr("x", function(d, i) { return xScale(i%len); })
    .attr("width", xScale(1))
    .attr("y", function(d) { return yScale(d); })
    .attr("height", function(d) { return height - yScale(d); });


// draw legend
var legend = svg.selectAll(".legend")
    .data(color.domain())
  .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

// draw legend colored rectangles
legend.append("rect")
    .attr("x", width - 18)
    .attr("width", 16)
    .attr("height", 12)
    .style("fill", color);

// draw legend text
legend.append("text")
    .attr("x", width - 24)
    .attr("y", 9)
    .attr("dy", ".15em")
    .style("text-anchor", "end")
    .style("font-size","11px")
    .style("font-color","grey")
    .text(function(d) { return d;})

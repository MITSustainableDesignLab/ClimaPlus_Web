/* * * * * * * * * * * * * * * * * * * * * * * *

* * * * * * * * * * * * * * * * * * * * * * * * */
$("#Wind").addClass("active");

var data = WINDV
var binsize = 20
var datatc = WINDTC.slice(0,binsize)
var datatcdefault = WINDTCdefault.slice(0,binsize)

// place svg canvas into main
var margin = {top: 5, right: 35, bottom: 0, left: 35},
    width = 400 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

// x scale function
//var xScale = d3.scaleLinear().domain([-1, 12]).range([0, width]);
var xScale = d3.scaleLinear()
    //.domain(d3.extent(data)).nice()
    .domain([0,binsize])
    .range([0, width]) //[margin.left, width - margin.right])
    
    xAxis = d3.axisBottom().scale(xScale).tickSizeOuter(0);

var bins = d3.histogram()
    .domain(xScale.domain())
    .thresholds(xScale.ticks(binsize))
  (data)
// console.log("+++++",bins)
console.log("+++++",WINDV)

// y scale function
//var yScale = d3.scaleLinear().domain([-18,700]).range([height, 0]);
var yScale = d3.scaleLinear()
    .domain([0, d3.max(bins, d => d.length)]).nice()
    .range([height,margin.top]) //height - margin.bottom, margin.top
    
    // yAxisLeft = d3.axisLeft().scale(yScale);
var yScaletc = d3.scaleLinear().domain([0,d3.max(datatc.concat(datatcdefault))+150]).range([height, margin.top]);
    
// correlate the color with the value
var color = d3.scaleOrdinal()
    .domain(["Frequency of wind velocity", "Wind turbine efficiency"])
    .range(["orange", "black"]);


var svgW = d3.select("#svgwindenergy")
    .append("svg")
    .attr("width", width + margin.left + margin.right + 10)
    .attr("height", height + margin.top + margin.bottom +20)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")


// add distribution histogram bars
var bar = svgW.append("g")
      .attr("fill", "orange")
    .selectAll("rect")
    .data(bins)
    .join("rect")
      .attr("x", d => xScale(d.x0) + 1)
      .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 1))
      .attr("y", d => yScale(d.length))
      .attr("height", d => yScale(0) - yScale(d.length));

svgW.append("path")
    .datum(datatc)
    .attr("d", d3.line()
        .x(function(d,i) { return xScale(i%binsize) })
        .y(function(d) { return yScaletc(d) })
        )
    .attr("fill", "none")
    .attr("stroke", "grey")//function(d) { return color(d[1]); })
    .attr("stroke-width", 0.5);

svgW.append("path")
    .datum(datatcdefault)
    .attr("d", d3.line()
        .x(function(d,i) { return xScale(i%binsize) })
        .y(function(d) { return yScaletc(d) })
        )
    .attr("fill", "none")
    .attr("stroke", "black")//function(d) { return color(d[1]); })
    .attr("stroke-width", 0.5);


var recBor = svgW.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("height", height)
    .attr("width", width)    
    .style("strock", "grey")
    .style("fill", "grey")
    .style("opacity", 0.08);

svgW.append("g")
      .call(d3.axisLeft(yScale).tickSizeOuter(0));

svgW.append("g")
      .attr("transform", "translate( " + width + ", 0 )")
      .call(d3.axisRight(yScaletc).tickSizeOuter(0));


//xAxis = g => g
svgW.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(xScale).tickSizeOuter(0))
    .call(g => g.append("text")
        .attr("x", width - margin.right)
        .attr("y", -4)
        .attr("fill", "#000")
        .attr("font-weight", "bold")
        .attr("text-anchor", "end")
        .text(data.x))

/*
// y-axis
  svg.append("g")
      .attr("class", "y axis")
      //.attr("transform", "translate(" + 200 + ")",0)
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      //.attr("y", 20)
      //.attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Temperature (0c)");
*/
// svg.append("g")
//   .attr("transform", `translate(${margin.left},0)`)
//   .call(d3.axisLeft(yScale))
//   .call(g => g.select(".domain").remove())
//   .call(g => g.select(".tick:last-of-type text").clone()
//       .attr("x", 4)
//       .attr("text-anchor", "start")
//       .attr("font-weight", "bold")
//       .text(data.y))

// draw legend
var legend = svgW.selectAll(".legend")
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
    .style("font-size","12px")
    .style("font-color","grey")
    .text(function(d) { return d;})

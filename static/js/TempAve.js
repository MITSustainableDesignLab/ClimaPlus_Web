/* * * * * * * * * * * * * * * * * * * * * * * *
climate.js

Takes the climate data:
    1. a list of average hourly temps
    2. a list of max hourly temps
    3. a list of min hourly temps
And graphs it using D3.
* * * * * * * * * * * * * * * * * * * * * * * * */
$("#TempRH").addClass("active");

// map the color id to the data point
var means = mean.map(d => [d, "Mean temperature (°C)"]);
var maxes = max.map(d => [d, "Maximum temperature (°C)"]);
var mins = min.map(d => [d, "Minimum temperature (°C)"]);

// create a list of lists
// each list has 3 values: the min, max and mean for an hour
var hourlyVals = mean.map(d => [d]);
for (i = 0; i < 576; i++) {
    hourlyVals[i%288].push(max.concat(min)[i]);
}
// console.log(db);

// place svg canvas into main
var margin = {top: 20, right: 10, bottom: 20, left: 36},
    width = 400 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

xTickValues=["J","F","M","A","M","J","J","A","S","O","N","D"]
// x scale function
var xScale = d3.scaleLinear().domain([0, 287]).range([10, width-10]);
    xAxis = d3.axisBottom().scale(xScale);
var xScale_ = d3.scaleLinear().domain([0, 11]).range([10, width-10]).nice(12);
    xAxis_ = d3.axisBottom().scale(xScale_).tickFormat(function(d) { return xTickValues[d]})


// y scale function
var yScale = d3.scaleLinear().domain([-25, 50]).range([height, 0]);
    yAxis = d3.axisLeft().scale(yScale);


var svg = d3.select("#svgtemp")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")


var recBor = svg.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("height", height)
    .attr("width", width)    
    .style("strock", "grey")
    .style("fill", "grey")
    .style("opacity", 0.08);
  

// correlate the color with the value
var color = d3.scaleOrdinal()
    .domain(["Maximum temperature (°C)", "Mean temperature (°C)", "Minimum temperature (°C)"])
    .range(["orangered", "black", "grey"]);

// gridlines in x axis function
function make_x_gridlines() {       
    return d3.axisBottom(xScale_)
        .ticks(12)
}

// add the X gridlines
svg.append("g")         
    .attr("class", "grid")
    .attr("transform", "translate(0," + height + ")")
    .call(make_x_gridlines()
        .tickSize(-height)
        .tickFormat("")
          )

// gridlines in y axis function
function make_y_gridlines() {   
  return d3.axisLeft(yScale)
      .ticks(12)
} 

// add the Y gridlines
svg.append("g")     
  .attr("class", "grid")
  .call(make_y_gridlines()
      .tickSize(-width)
      .tickFormat("")
  )

// add axes to svg canvas
// x-axis
// svg.append("g")
//     .attr("class", "x axis")
//     .attr("transform", "translate( 0, " + height + " )")
//     .call(d3.axisBottom(xScale).ticks(12));
    // .append("text")
    // .attr("class", "label")
    // .attr("x", width)
    // .attr("y", 40)
    // .style("text-anchor", "end")
    // .text("Azimuth [&deg;]");

svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate( 0, " + height + " )")
    .call(d3.axisBottom(xScale_).ticks(12).tickFormat(function(d) { return xTickValues[d]}));

// y-axis
svg.append("g")
    .attr("class", "y axis")
    //.attr("transform", "translate(" + 200 + ")",0)
    .call(yAxis)
    .call(g => g.select(".domain").remove())
  .append("text")
    .attr("class", "label")
    .attr("transform", "rotate(-90)")
    .attr("y", 8)
    // .attr("x", -50)
    //.attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Temperature (deg C)");


// add drybulb temp points to the graph
var temps = svg.selectAll("circle")
    .data( means.concat(maxes, mins))
    .enter()
    .append("circle")
    .attr("cx", function(d, i) { return xScale(i%288); })
    .attr("cy", function(d) { return yScale(d[0]); })
    .attr("r", 1)
    .style("fill", function(d) { return color(d[1]); });

// upper and lower temperature thresholds, updated by user
svg.append("line")
    .attr("x1", xScale(0))
    .attr("y1", yScale(tupper))
    .attr("x2", xScale(288))
    .attr("y2", yScale(tupper))
    .attr("stroke-width", 1)
    .attr("stroke", "grey");

svg.append("line")
    .attr("x1", xScale(0))
    .attr("y1", yScale(tlower))
    .attr("x2", xScale(288))
    .attr("y2", yScale(tlower))
    .attr("stroke-width", 1)
    .attr("stroke", "grey");

// add shading to the graph
// var shading = svg.selectAll("line")
//     .data(hourlyVals)
//     .enter()
//     .attr("x1", function(d, i) { return xScale(i%288); })
//     .attr("y1", function(d) { return yScale(d[1]); })
//     .attr("x2", function(d, i) { return xScale(i%288); })
//     .attr("y2", function(d) { return yScale(d[2]); })
//     .style("stroke-width", 0.4)
//     .style("stroke", "grey");

//Updates area
area = d3.area()
    .x(function(d, i) { return xScale(i%288); }) 
    .y0(function(d) { return yScale(d[1]); })
    .y1(function(d) { return yScale(d[2]); });

//Area in between
var drawarea = svg.append("path")
    .datum(hourlyVals)
    .attr("class", "area")
    .attr("d", area);

area = d3.area()
    .x(function(d, i) { return xScale(i%288); }) 
    .y0(function(d) { return yScale(d[1]); })
    .y1(function(d) { return yScale(d[2]); });

d3.selectAll('.area')
    .attr("d", area);

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



















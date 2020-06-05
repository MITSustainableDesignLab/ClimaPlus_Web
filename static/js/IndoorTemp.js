/* * * * * * * * * * * * * * * * * * * * * * * *

* * * * * * * * * * * * * * * * * * * * * * * * */
$("#Climabox").addClass("active");

// map the color id to the data point

var Tin = Tin.map(d => [d, "Indoor temperature"]);
// var Tin_H = Tin_H.map(d => [d, "Indoor temperature"]);
var Tout = Tout.map(d => [d, "Outdoor temperature"]);
var Heating = Heating.map(d => [d, "Heating"]);
var Cooling = Cooling.map(d => [d, "Cooling"]);
var NV = NV.map(d => [d, "NV"]);
var len = Tout.length;


// place svg canvas into main
var margin = {top: 20, right: 10, bottom: 20, left: 36},
    width = 400 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;
xTickValues=["J","F","M","A","M","J","J","A","S","O","N","D"]

// x scale function
var xScale = d3.scaleLinear().domain([0, len-1]).range([10, width-10]);
    xAxis = d3.axisBottom().scale(xScale)
var xScale_ = d3.scaleLinear().domain([0, 11]).range([10, width-10]).nice(12);
    xAxis_ = d3.axisBottom().scale(xScale_).tickFormat(function(d) { return xTickValues[d]})

// y scale function
var yScale = d3.scaleLinear().domain([-25, 50]).range([height, 0]);
    yAxis = d3.axisLeft().scale(yScale);


var svgT = d3.select("#svgindoortemp")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

// add shading to the graph
// var shading = svg.selectAll("line")
//     .data(hourlyVals)
//     .enter()
//     .append("line")
//     .attr("x1", function(d, i) { return xScale(i%300); })
//     .attr("y1", function(d) { return yScale(d[1]); })
//     .attr("x2", function(d, i) { return xScale(i%300); })
//     .attr("y2", function(d) { return yScale(d[2]); })
//     .style("stroke-width", 0.4)
//     .style("stroke", "grey");

   
svgT.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("height", height)
    .attr("width", width)    
    .style("strock", "grey")
    .style("fill", "grey")
    .style("opacity", 0.08);
  

// correlate the color with the value
var color = d3.scaleOrdinal()
    .domain(["Indoor temperature", "Outdoor temperature", "Heating","Cooling","NV"])
    .range(["orangered", "grey", "Black","#737CA1","#B2C248"]);

var radius = d3.scaleOrdinal()
    .domain(["Indoor temperature", "Outdoor temperature", "Comfort range", "Heating","Cooling","NV"])
    .range([1, 1, 1,1,1,1]);


// add axes to svg canvas
// x-axis
svgT.append("g")
  .attr("transform", "translate( 0, " + height + " )")
  .attr("class", "x axis")
  .call(d3.axisBottom(xScale_).ticks(12).tickFormat(function(d) { return xTickValues[d]}))
  // .append("text")
  // .attr("class", "label")
  // .attr("x", width)
  // .attr("y", 40)
  // .style("text-anchor", "end")
  // .text("Months");

// y-axis
svgT.append("g")
    .attr("class", "y axis")
    //.attr("transform", "translate(" + 200 + ")",0)
    .call(yAxis)
    .call(g => g.select(".domain").remove())
  .append("text")
    .attr("class", "label")
    .attr("transform", "rotate(-90)")
    .attr("y", 8)
    //.attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Temperature (deg C)");


// gridlines in x axis function
function make_x_gridlines() {		
    return d3.axisBottom(xScale_)
        .ticks(8)
}

// add the X gridlines
svgT.append("g")			
    .attr("class", "grid")
    .attr("transform", "translate(0," + height + ")")
    .call(make_x_gridlines()
        .tickSize(-height)
        .tickFormat("")
    	  )

// add drybulb temp points to the graph
svgT.selectAll("circle")
    .data( Tout.concat(Tin,Heating,Cooling,NV))
    .enter()
    .append("circle")
    .attr("cx", function(d, i) { return xScale(i%len); })
    .attr("cy", function(d) { return yScale(d[0]); })
    .attr("r", function(d) { return radius(d[1]); })
    .style("fill", function(d) { return color(d[1]); });

// upper and lower temperature thresholds, updated by user
// svgT.append("line")
//     .attr("x1", xScale(0))
//     .attr("y1", yScale(climabox["tupper"]))
//     .attr("x2", xScale(len))
//     .attr("y2", yScale(climabox["tupper"]))
//     .attr("stroke-width", 1)
//     .attr("stroke", color("Comfort range"));

// svgT.append("line")
//     .attr("x1", xScale(0))
//     .attr("y1", yScale(climabox["tlower"]))
//     .attr("x2", xScale(len))
//     .attr("y2", yScale(climabox["tlower"]))
//     .attr("stroke-width", 1)
//     .attr("stroke", color("Comfort range"));

// draw legend
var legend = svgT.selectAll(".legend")
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



















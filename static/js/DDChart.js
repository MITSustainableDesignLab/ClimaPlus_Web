/* * * * * * * * * * * * * * * * * * * * * * * *
climate.js

Takes the climate data:
    1. a list of average hourly temps
    2. a list of max hourly temps
    3. a list of min hourly temps
And graphs it using D3.
* * * * * * * * * * * * * * * * * * * * * * * * */
$("#DDChart").addClass("active");


// map the color id to the data point
var hddlist = HDDL.map(d => [d, "Heating degree days (deg)"]);
var cddlist = CDDL.map(d => [d, "Cooling degree days (deg)"]);

var monthlyVals = HDDL.map(d => [d]);
for (i=0; i<12; i++) {
  monthlyVals[i].push(CDDL[i]);
}

// console.log('monthly vals are', monthlyVals)

// place svg canvas into main
var margin = {top: 20, right: 10, bottom: 20, left: 36},
    width = 400 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

dataset=["J","F","M","A","M","J","J","A","S","O","N","D"]

// x scale function
var xScale = d3.scaleLinear().domain([0, 11]).range([10, width-10]);
    xAxis = d3.axisBottom().scale(xScale).tickFormat(function(d) { return dataset[d]})


// y scale function
var yScale = d3.scaleLinear().domain([-18,d3.max(HDDL.concat(CDDL))+170]).range([height, 0]);
    yAxis = d3.axisLeft().scale(yScale);


// correlate the color with the value
var color = d3.scaleOrdinal()
    .domain(["Heating degree days (deg)", "Cooling degree days (deg)"])
    .range(["orangered", "black"]);


var svg = d3.select("#svgddchart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")


// add shading to the graph
/* * *
var shading = svg.selectAll("line")
    .data(monthlyVals)
    .enter()
    .append("line")
    .attr("x1", function(d, i) { return xScale(i%12); })
    .attr("y1", function(d) { return yScale(d[0]); })
    .attr("x2", function(d, i) { return xScale(i%12); })
    .attr("y2", function(d) { return yScale(d[1]); })
    .style("stroke-width", 0.4)
    .style("stroke", "grey");
* * */

// add tooltips to the graph
var tip = d3.tip()
    .attr('class', 'd3-tip').direction('e').offset([0,5])
    .html(function(d) {
      return "<span>" + d[0] + " kWh/m2</span>";
    })

svg.call(tip);


var recBor = svg.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("height", height)
    .attr("width", width)    
    .style("strock", "grey")
    .style("fill", "grey")
    .style("opacity", 0.08);


var marks = svg.selectAll("circle")
    .data(hddlist.concat(cddlist))
    .enter()
    .append("circle")
    .attr("cx", function(d, i) { return xScale(i%12); })
    .attr("cy", function(d) { return yScale(d[0]); })
    .attr("r", 2.5)
    .style("fill", function(d) { return color(d[1]); })
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide);
 

// add axes to svg canvas
// x-axis

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", 6)
      // .style("text-anchor", "end")
      // .text("Months");

// y-axis
  svg.append("g")
      .attr("class", "y axis")
      //.attr("transform", "translate(" + 200 + ")",0)
      .call(yAxis)
      .call(g => g.select(".domain").remove())
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      //.attr("y", 20)
      //.attr("dy", ".71em")
      // .style("text-anchor", "end")
      // .text("Temperature (0c)");


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
      .style("font-size","12px")
      .style("font-color","grey")
      .text(function(d) { return d;})

svg.append("path")
    .datum(hddlist)
    .attr("d", d3.line()
        .x(function(d,i) { return xScale(i%12) })
        .y(function(d) { return yScale(d[0]) })
        )
    .attr("fill", "none")
    .attr("stroke",function(d) { return color(d[1]); })
    .attr("stroke-width", 0.5);

svg.append("path")
    .datum(cddlist)
    .attr("d", d3.line()
        .x(function(d,i) { return xScale(i%12) })
        .y(function(d) { return yScale(d[0]) })
        )
    .attr("fill", "none")
    .attr("stroke",function(d) { return color(d[1]); })
    .attr("stroke-width", 0.5);
/* * * * * * * * * * * * * * * * * * * * * * * *

RadMonth.js

* * * * * * * * * * * * * * * * * * * * * * * * */
$("#Rolar").addClass("active");


// map the color id to the data point
var horradmlist = HORRADM.map(d => [d, "Horizontal"]);
var radmslist = RADMS.map(d => [d, "South"]);
var radmelist = RADME.map(d => [d, "East"]);
var radmwlist = RADMW.map(d => [d, "West"]);
var radmnlist = RADMN.map(d => [d, "North"]);

var radlist = horradmlist.concat(radmslist,radmelist,radmwlist,radmnlist)


// place svg canvas into main
var margin = {top: 20, right: 10, bottom: 20, left: 36},
    width = 400 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;


xTickValues=["J","F","M","A","M","J","J","A","S","O","N","D"]
// x scale function
var xScale = d3.scaleLinear().domain([0, 11]).range([10, width-10]).nice(12);
    xAxis = d3.axisBottom().scale(xScale).tickFormat(function(d) { return xTickValues[d]})


// y scale function
var yScale = d3.scaleLinear().domain([-18,250]).range([height, 0]);
    yAxis = d3.axisLeft().scale(yScale);


var svg = d3.select("#svgradmonth")
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
    //.domain(["Heating degree days (deg)", "Cooling degree days (deg)"])
    .range(["orange", "black", "grey", "red", "brown"]);

// gridlines in x axis function
function make_x_gridlines() {       
    return d3.axisBottom(xScale)
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


svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate( 0, " + height + " )")
    .call(d3.axisBottom(xScale).ticks(12).tickFormat(function(d) { return xTickValues[d]}));

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
    .text("Radiation (kWh/m2)");


var tip = d3.tip()
    .attr('class', 'd3-tip').direction('e').offset([0,5])
    .html(function(d) {
      return "<span>" + d[0] + " kWh/m2</span>";
    })

svg.call(tip);


var marks = svg.selectAll("circle")
    .data(radlist)
    .enter()
    .append("circle")
    .attr("cx", function(d, i) { return xScale(i%12); })
    .attr("cy", function(d) { return yScale(d[0]); })
    .attr("r", 2.5)
    .style("fill", function(d) { return color(d[1]); })
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide);
    // .append("svg:title")
    // .text(function(d) { return d[0]; });


// add axes to svg canvas
// x-axis
/*
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", 6)
      .style("text-anchor", "end")
      .text("Months");
*/
// y-axis
  // svg.append("g")
  //     .attr("class", "y axis")
  //     //.attr("transform", "translate(" + 200 + ")",0)
  //     .call(yAxis)
  //   .append("text")
  //     .attr("class", "label")
  //     .attr("transform", "rotate(-90)")
  //     //.attr("y", 20)
  //     //.attr("dy", ".71em")
  //     .style("text-anchor", "end")
  //     .text("Temperature (0c)");



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
    .datum(horradmlist)
    .attr("d", d3.line()
        .x(function(d,i) { return xScale(i%12) })
        .y(function(d) { return yScale(d[0]) })
        )
    .attr("fill", "none")
    .attr("stroke",function(d) { return color(d[1]); })
    .attr("stroke-width", 0.5);

 svg.append("path")
    .datum(radmslist)
    .attr("d", d3.line()
        .x(function(d,i) { return xScale(i%12) })
        .y(function(d) { return yScale(d[0]) })
        )
    .attr("fill", "none")
    .attr("stroke",function(d) { return color(d[1]); })
    .attr("stroke-width", 0.5);

svg.append("path")
    .datum(radmelist)
    .attr("d", d3.line()
        .x(function(d,i) { return xScale(i%12) })
        .y(function(d) { return yScale(d[0]) })
        )
    .attr("fill", "none")
    .attr("stroke",function(d) { return color(d[1]); })
    .attr("stroke-width", 0.5);

svg.append("path")
    .datum(radmwlist)
    .attr("d", d3.line()
        .x(function(d,i) { return xScale(i%12) })
        .y(function(d) { return yScale(d[0]) })
        )
    .attr("fill", "none")
    .attr("stroke",function(d) { return color(d[1]); })
    .attr("stroke-width", 0.5);

svg.append("path")
    .datum(radmnlist)
    .attr("d", d3.line()
        .x(function(d,i) { return xScale(i%12) })
        .y(function(d) { return yScale(d[0]) })
        )
    .attr("fill", "none")
    .attr("stroke",function(d) { return color(d[1]); })
    .attr("stroke-width", 0.5);
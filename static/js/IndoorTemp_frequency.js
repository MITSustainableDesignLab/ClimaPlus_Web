/* * * * * * * * * * * * * * * * * * * * * * * *

* * * * * * * * * * * * * * * * * * * * * * * * */
$("#climabox").addClass("active");
// var data = Tin.map(d => [d, "Indoor temperature"]);


var data = Tin_freq //Tin
var data_out = Tout
var binsize = 70
// data.slice().sort();
// data_out.slice().sort();

var tlowest = data.slice().sort()[0]
  thighest = data.slice().sort()[data.length-1]
console.log('----++++++++++++',tlowest,thighest)

// place svg canvas into main
var margin = {top: 20, right: 10, bottom: 20, left: 40},
    width = 400 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

// x scale function
xTickValues =[]
//var xScale_f = d3.scaleLinear().domain([-1, 12]).range([0, width]);
var xScale_f = d3.scaleLinear()
    //.domain(d3.extent(data)).nice()
    .domain([-20,50])
    .range([10, width-10]) //[margin.left, width - margin.right])
    
    xAxis_f = d3.axisBottom().scale(xScale_f).tickFormat(function(d) { return xTickValues[d]});
var xScale = d3.scaleLinear()
    .domain([-20,50])
    .range([10, width-10]).nice();

// var histGenerator = d3.histogram()
//   .domain([12,25])    // Set the domain to cover the entire intervall [0;]
//   .thresholds(19);  // number of thresholds; this will create 19+1 bins

// var bins_ = histGenerator(data);
// console.log('new bins generator',bins_);

var bins = d3.histogram()
    .domain(xScale_f.domain())
    .thresholds(xScale_f.ticks(binsize))
  (data.slice().sort())
var bins_out = d3.histogram()
    .domain(xScale_f.domain())
    .thresholds(xScale_f.ticks(binsize))
  (data_out.slice().sort())
console.log(bins)

//y scale function
//var yScale_f = d3.scaleLinear().domain([-18,700]).range([height, 0]);
var yScale_f = d3.scaleLinear()
    .domain([0, d3.max(bins.concat(bins_out), d => d.length)]).nice()
    .range([height,0]) //height - margin.bottom, margin.top
var yAxis = d3.axisLeft().scale(yScale_f);


// correlate the color with the value
var color_f = d3.scaleOrdinal()
    .domain(["Indoor occupied hours only", "Outdoor all hours"])
    .range(["orangered", "grey"]);


var svgF = d3.select("#svgclimafrequency")
    .append("svg")
    .attr("width", width + margin.left + margin.right + 10)
    .attr("height", height + margin.top + margin.bottom +20)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

// add tooltips to the graph
// var tip = d3.tip()
//     .attr('class', 'd3-tip').direction('e').offset([0,0])
//     .html(function(d) {
//       return "<span>" + (d[1]-d[0]); //+ " kWh/m2</span>";
//     })

var tip = d3.tip()
    .attr('class', 'd3-tip').direction('e').offset([0,0])
    .html(function(d) {
      return "<span>" + d.length + " hours, " + d[0] + " deg C";
    })

svgF.call(tip);


svgF.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("height", height)
    .attr("width", width)    
    .style("strock", "grey")
    .style("fill", "grey")
    .style("opacity", 0.08);

// add distribution histogram bars
// gridlines in y axis function
function make_y_gridlines() {   
  return d3.axisLeft(yScale_f)
      .ticks(12)
} 

// add the Y gridlines
svgF.append("g")     
  .attr("class", "grid")
  .call(make_y_gridlines()
      .tickSize(-width)
      .tickFormat("")
  )


// append the bars for series 2
svgF.selectAll("rect")
      .data(bins_out)
      .enter()
      .append("rect")
        .attr("x", 1)
        .attr("transform", function(d) { return "translate(" + (xScale_f(d.x0)+0.02) + "," + yScale_f(d.length) + ")"; })
        .attr("width", function(d) { return xScale_f(d.x1) - xScale_f(d.x0); })
        .attr("height", function(d) { return height - yScale_f(d.length); })
        .style("fill", "black")
        .style("opacity", 0.2);
        // .on('mouseover', tip.show)
        // .on('mouseout', tip.hide);


svgF.selectAll("rect2")
      .data(bins)
      .enter()
      .append("rect")
        .attr("x", 1)
        .attr("transform", function(d) { return "translate(" + xScale_f(d.x0) + "," + yScale_f(d.length) + ")"; })
        .attr("width", function(d) { return xScale_f(d.x1) - xScale_f(d.x0) ; })//{ return xScale_f(0.01); })//
        .attr("height", function(d) { return height - yScale_f(d.length); })
        .style("fill", "orangered")
        .style("opacity", 0.8)
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);




// y-axis
svgF.append("g")
    .attr("class", "y axis")
    //.attr("transform", "translate(" + 200 + ")",0)
    .call(yAxis)
    .call(g => g.select(".domain").remove())
  .append("text")
    .attr("class", "label")
    .attr("transform", "rotate(-90)")
    .attr("y", 8)
    // .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Number of hours");

//xAxis_f = g => g
svgF.append("g")
    .attr("transform", "translate( 0, " + height + " )")
    .attr("class", "x axis")
    .call(d3.axisBottom(xScale_f))
  .append("text")
    .attr("class", "label")
    .attr("y", 32)
    .attr("x", 180)
    //.attr("dy", ".71em")
    // .style("text-anchor", "center")
    .text("Temperature (deg C)");
    // .call(g => g.append("text")
    //     .attr("x", width - margin.right)
    //     .attr("y", 8)
    //     .attr("fill", "#000")
    //     .attr("font-weight", "bold")
    //     .attr("text-anchor", "end")
    //     .text(data.x))

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
//   .call(d3.axisLeft(yScale_f))
//   .call(g => g.select(".domain").remove())
//   .call(g => g.select(".tick:last-of-type text").clone()
//       .attr("x", 4)
//       .attr("text-anchor", "start")
//       .attr("font-weight", "bold")
//       .text(data.y))

// draw legend
// draw legend
var legend = svgF.selectAll(".legend")
    .data(color_f.domain())
  .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

// draw legend colored rectangles
legend.append("rect")
    .attr("x", width - 18)
    .attr("width", 16)
    .attr("height", 12)
    .style("fill", color_f);

// draw legend text
legend.append("text")
    .attr("x", width - 24)
    .attr("y", 9)
    .attr("dy", ".15em")
    .style("text-anchor", "end")
    .style("font-size","11px")
    .style("font-color","grey")
    .text(function(d) { return d;})

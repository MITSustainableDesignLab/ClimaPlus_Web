/* * * * * * * * * * * * * * * * * * * * * * * *

RadMonth.js

* * * * * * * * * * * * * * * * * * * * * * * * */
$("#Solar").addClass("active");

ALT_AZI = []

for (hr = 0; hr<24 ; hr++){
  alt_azi = []
  for (i = 0; i<ANALEMMA[hr][0].length; i++){
    alt_azi.push([ANALEMMA[hr][0][i], ANALEMMA[hr][1][i]])
  }
  var   alt_azi = alt_azi.map(d => [d, "analemma"]);
  // console.log(alt_azi)
  ALT_AZI = ALT_AZI.concat(alt_azi)
}

JUNE=ML["1"].map(d => [d, "June"])
JUNE_=ML_["4"].map(d => [d, "June"])
DEC=ML["2"].map(d => [d, "Dec"])
DEC_=ML_["6"].map(d => [d, "Dec"])
MAR=ML["3"].map(d => [d, "Mar"])
MAR_=ML_["5"].map(d => [d, "Mar"])
console.log(JUNE)
// place svg canvas into main
var margin = {top: 20, right: 10, bottom: 20, left: 36},
    width = 400 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;


var svg = d3.select("#svgsunpath")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")


// x scale function
var xScale = d3.scaleLinear().domain([-180, 180]).range([10, width-10]);

// y scale function
var yScale = d3.scaleLinear().domain([0,90]).range([height, 0]);

// correlate the color with the value
colors_ = ["orangered", "black", "grey", "orange"]
var color = d3.scaleOrdinal()
    .domain(["Analemma", "June", "March", "December"])
    .range(colors_);


var recBor = svg.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("height", height)
    .attr("width", width)    
    .style("strock", "grey")
    .style("fill", "grey")
    .style("opacity", 0.08);


// gridlines in x axis function
function make_x_gridlines() {       
    return d3.axisBottom(xScale)
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
} 

// add the Y gridlines
svg.append("g")     
  .attr("class", "grid")
  .call(make_y_gridlines()
      .tickSize(-width)
      .tickFormat("")
  )



var marks = svg.selectAll("circle")
    .data(ALT_AZI)
    .enter()
    .append("circle")
    .attr("cx", function(d) { return xScale(d[0][1]); })
    .attr("cy", function(d) { return yScale(d[0][0]); })
    .attr("r", 0.8)
    .attr("fill", colors_[0]);
    // .style("fill", function(d) { return color(d[1]); });

var lineFunction = d3.line()
  .x(function(d) { return xScale(d[0][1]); })
  .y(function(d) { return yScale(d[0][0]); })
  // .stroke(function(d) { return color(d[1]); })
  .curve(d3.curveLinear);
  

svg.append("path")
    .attr("d", lineFunction(DEC))
  .attr("stroke", colors_[3])
  .attr("id",colors_[3])
  .attr("stroke-width", 0.8)
  .attr("fill", "none")
svg.append("path")
    .attr("d", lineFunction(DEC_))
  .attr("stroke", colors_[3])
  .attr("id",colors_[3])
  .attr("stroke-width", 0.8)
  .attr("fill", "none")
svg.append("path")
    .attr("d", lineFunction(JUNE))
  .attr("stroke", colors_[1])
  .attr("id","june")
  .attr("stroke-width", 0.8)
  .attr("fill", "none");
svg.append("path")
    .attr("d", lineFunction(JUNE_))
  .attr("stroke", colors_[1])
  .attr("id","june")
  .attr("stroke-width", 0.8)
  .attr("fill", "none");
svg.append("path")
    .attr("d", lineFunction(MAR))
  .attr("stroke", colors_[2])
  .attr("id","mar")
  .attr("stroke-width", 0.8)
  .attr("fill", "none")
svg.append("path")
    .attr("d", lineFunction(MAR_))
  .attr("stroke", colors_[2])
  .attr("id","mar")
  .attr("stroke-width", 0.8)
  .attr("fill", "none")

  // y-axis
svg.append("g")
    .attr("class", "y axis")
    //.attr("transform", "translate(" + 200 + ")",0)
    .call(d3.axisLeft(yScale))
    .call(g => g.select(".domain").remove())
  .append("text")
    .attr("class", "label")
    .attr("transform", "rotate(-90)")
    .attr("y", 8)
    // .attr("x", -50)
    //.attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Altitude (deg)");

// Add the x Axis
svg.append("g")
  .attr("class", "y axis")
    .attr("transform", "translate( 0, " + height + " )")
    .call(d3.axisBottom(xScale))
svg.append("text")
    .attr("transform",
            "translate(" + (width-5) + " ," + 
                           (height-2) + ")")
    .attr("class", "label")
    .style("text-anchor", "end")
    .style("fill","rgb(100, 100, 100)")
    .text("Azimuth (deg)");

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

// svg.append("path")
//     .datum(horradmlist)
//     .attr("d", d3.line()
//         .x(function(d,i) { return xScale(i%12) })
//         .y(function(d) { return yScale(d[0]) })
//         )
//     .attr("fill", "none")
//     .attr("stroke",function(d) { return color(d[1]); })
//     .attr("stroke-width", 0.5);

//  svg.append("path")
//     .datum(radmslist)
//     .attr("d", d3.line()
//         .x(function(d,i) { return xScale(i%12) })
//         .y(function(d) { return yScale(d[0]) })
//         )
//     .attr("fill", "none")
//     .attr("stroke",function(d) { return color(d[1]); })
//     .attr("stroke-width", 0.5);

// svg.append("path")
//     .datum(radmelist)
//     .attr("d", d3.line()
//         .x(function(d,i) { return xScale(i%12) })
//         .y(function(d) { return yScale(d[0]) })
//         )
//     .attr("fill", "none")
//     .attr("stroke",function(d) { return color(d[1]); })
//     .attr("stroke-width", 0.5);

// svg.append("path")
//     .datum(radmwlist)
//     .attr("d", d3.line()
//         .x(function(d,i) { return xScale(i%12) })
//         .y(function(d) { return yScale(d[0]) })
//         )
//     .attr("fill", "none")
//     .attr("stroke",function(d) { return color(d[1]); })
//     .attr("stroke-width", 0.5);

// svg.append("path")
//     .datum(radmnlist)
//     .attr("d", d3.line()
//         .x(function(d,i) { return xScale(i%12) })
//         .y(function(d) { return yScale(d[0]) })
//         )
//     .attr("fill", "none")
//     .attr("stroke",function(d) { return color(d[1]); })
//     .attr("stroke-width", 0.5);
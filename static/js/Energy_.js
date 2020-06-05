/* * * * * * * * * * * * * * * * * * * * * * * *

* * * * * * * * * * * * * * * * * * * * * * * * */
$("#climabox").addClass("active");
var svgWidth = 900,
  svgHeight = 500;
  
var margin = {top: 20, right: 50, bottom: 30, left: 20},
svgWidth = 960 - margin.left - margin.right,
svgHeight = 500 - margin.top - margin.bottom;


data = [
  [{x: 1, y: 40},{x: 2, y: 43},{x: 3, y: 12},{x: 4, y: 60},{x: 5, y: 63},{x: 6, y: 23}],
  [{x: 1, y: 12},{x: 2, y: 5},{x: 3, y: 23},{x: 4, y: 18},{x: 5, y: 73},{x: 6, y: 27}],
  [{x: 1, y: 60},{x: 2, y: 49},{x: 3, y: 16},{x: 4, y: 20},{x: 5, y: 92},{x: 6, y: 20}]
]

stack = d3.stack()
layers = stack(data)

//colour scale
var c10 = d3.scaleOrdinal(d3.schemeCategory10);

//see http://stackoverflow.com/questions/37688982/nesting-d3-max-with-array-of-arrays/37689132?noredirect=1#comment62916776_37689132
//for details on the logic behind this
max_y = d3.max(layers, function(d) 
{
    return d3.max(d, function(d) 
  {
    return d.y0 + d.y;
  });
})

var yScale = d3.scaleLinear()
        .domain([0, max_y])
        .range([svgHeight,0]);

var yAxis = d3.axisLeft().scale(yScale);
        

var svg = svgT = d3.select("#svgenergy")
      .append("svg")
      .attr("width", svgWidth + margin.left + margin.right)
      .attr("height", svgHeight+ margin.top + margin.bottom)

var groups = svg.selectAll("g")
        .data(layers)
        .enter()
        .append("g")
        .style("fill", function (d,i) {return c10(i)});
        
var rects = groups.selectAll("rect")
    .data(function(d) {return d} )
    .enter()
    .append("rect")
    .attr("x", function(d) {return (d.x * 100) +70})
    .attr("y", function(d) {return yScale(d.y0 + d.y)} )
    .attr("width", 100)
    .attr("height", function (d) {return yScale(d.y0) - yScale(d.y + d.y0)}); 

//add y axis
svg.append("g")
  .attr("class", "y axis")
  .attr("transform", "translate(" + (svgWidth -100) +",0)")
  .call(yAxis)
  .style("stroke", "black");


// draw legend
var legend = svg.selectAll(".legend")
    .data(c10.domain())
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

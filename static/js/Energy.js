/* * * * * * * * * * * * * * * * * * * * * * * *

* * * * * * * * * * * * * * * * * * * * * * * * */
$("#climabox").addClass("active");



var initStackedBarChart = {
  draw: function(config) {
    me = this,
    domEle = config.element,
    stackKey = config.key,
    data = config.data,
    svgid = config.svgid,
    title = config.title,
    color = config.color
    margin = {top: 20, right: 20, bottom: 50, left: 50},
    parseDate = d3.timeParse("%m/%Y"),
    width = 200 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom,
    xScale = d3.scaleBand().range([0, width]).padding(0.1),
    yScale = d3.scaleLinear().range([height, 0]),

    color = d3.scaleOrdinal().domain(d3.keys(color)).range(d3.values(color)),
    xAxis = d3.axisBottom(xScale), //.tickFormat(d3.timeFormat("%b")),
    yAxis =  d3.axisLeft(yScale),

    svg = d3.select(svgid).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top+10 + margin.bottom+10)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // add tooltips to the graph
    var tip = d3.tip()
        .attr('class', 'd3-tip').direction('e').offset([0,0])
        .html(function(d) {
          return "<span>" + (d[1]-d[0]); //+ " kWh/m2</span>";
        })

    svg.call(tip);


    var stack = d3.stack()
      .keys(stackKey)
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone);

    var layers= stack(data);
      data.sort(function(a, b) { return b.total - a.total; });
      xScale.domain(data.map(function(d) { return parseDate(d.date); }));
      yScale.domain([0, d3.max(layers[layers.length - 1], function(d) { return d[0] + d[1]; }) ]).nice();

    var layer = svg.selectAll(".layer")
      .data(layers)
      .enter().append("g")
      .attr("class", "layer")
      .style("fill", color);

      layer.selectAll("rect")
        .data(function(d) { return d; })
      .enter().append("rect")
        .attr('class', 'bar')
        // .attr("x", function(d) { return xScale(parseDate(d.data.date)); })
        .attr("x", function(d) { return (d.name); })
        .attr("y", function(d) { return yScale(d[1]); })
        .attr("height", function(d) { return yScale(d[0]) - yScale(d[1]) -1; })
        // .attr("width", xScale.bandwidth())
        .attr("width", width/4)
        .on('click', function(d, i) {
          d3.selectAll('.bar').classed('selected', false);
          d3.select(this).classed('selected', true);})
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);

      svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .call(g => g.select(".domain").remove())
      .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", -30)
        .style("text-anchor", "end")
        .text(title);

    //   svg.append("g")
    //   .attr("class", "y axis")
    //   .call(xAxis)
    //   .call(g => g.select(".domain").remove())
    // .append("text")
    //   .attr("class", "label")
    //   .attr("y", 8)
    //   .style("text-anchor", "end")
    //   .text(title);

      // draw legend
      var legend = svg.selectAll(".legend")
          .data(stackKey)
        .enter().append("g")
          .attr("class", "legend")
          .attr("transform", function(d, i) { return "translate(0," + i * 15 + ")"; });

      // draw legend colored rectangles
      legend.append("rect")
          .attr("x", 0) //.attr("x", width - 18)
          .attr("y", height+8)
          .attr("width", 12) //.attr("width", 12)
          .attr("height", 8)
          .style("fill", color);

      // draw legend text
      legend.append("text")
          .attr("x", 15)
          .attr("y", height+13)
          .attr("dy", ".15em")
          // .style("text-anchor", "end")
          .style("font-size","9.5px")
          .style("font-color","grey")
          .text(function(d) { return d;})
  }
}
var initSavedBarChart = {
  draw: function(config) {
    me = this,
    domEle = config.element,
    stackKey = config.key,
    data = config.data,
    svgid = config.svgid,
    title = config.title,
    color = config.color,
    first = config.first,
    max = config.max,
    margin = {top: 20, right: 20, bottom: 50, left: 50},
    parseDate = d3.timeParse("%m/%Y"),
    width = 200 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom,
    xScale = d3.scaleBand().range([0, width]).padding(0.1),
    yScale = d3.scaleLinear().range([height, 0]),

    color = d3.scaleOrdinal().domain(d3.keys(color)).range(d3.values(color)),
    xAxis = d3.axisBottom(xScale), //.tickFormat(d3.timeFormat("%b")),
    yAxis =  d3.axisLeft(yScale),

    svg = d3.select(svgid).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top+10 + margin.bottom+10)
      .attr("style", "overflow:visible")
      .append("g")
      .attr("transform", "translate(" + margin.left*0 + "," + margin.top + ")");


    // add tooltips to the graph
    var tip = d3.tip()
        .attr('class', 'd3-tip').direction('e').offset([0,0])
        .html(function(d) {
          return "<span>" + (d[1]-d[0]); //+ " kWh/m2</span>";
        })

    svg.call(tip);


    var stack = d3.stack()
      .keys(stackKey)
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone);

    var layers= stack(data);
      data.sort(function(a, b) { return b.total - a.total; });
      xScale.domain(data.map(function(d) { return parseDate(d.date); }));
      yScale.domain([0, max*1.3]);//ratio*d3.max(layers[layers.length - 1], function(d) { return d[0] + d[1]; }) ]).nice();

    var layer = svg.selectAll(".layer")
      .data(layers)
      .enter().append("g")
      .attr("class", "layer")
      .style("fill", color);

      layer.selectAll("rect")
        .data(function(d) { return d; })
      .enter().append("rect")
        .attr('class', 'bar')
        // .attr("x", function(d) { return xScale(parseDate(d.data.date)); })
        .attr("x", function(d) { return (d.name); })
        .attr("y", function(d) { return yScale(d[1]); })
        .attr("height", function(d) { return (yScale(d[0]) - yScale(d[1]) -1); })
        // .attr("width", xScale.bandwidth())
        .attr("width", width/4)
        .on('click', function(d, i) {
          d3.selectAll('.bar').classed('selected', false);
          d3.select(this).classed('selected', true);})
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);

    if (first ==1){
        svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .call(g => g.select(".domain").remove())
      .append("text")
        .attr("class", "label")
//        .attr("transform", "rotate(-90)")
        .attr("style", "transform: rotate(-90deg) translateY(-10px);")
        .attr("y", -30)
        .style("text-anchor", "end")
        .text(title);

    //   svg.append("g")
    //   .attr("class", "y axis")
    //   .call(xAxis)
    //   .call(g => g.select(".domain").remove())
    // .append("text")
    //   .attr("class", "label")
    //   .attr("y", 8)
    //   .style("text-anchor", "end")
    //   .text(title);

      // draw legend
      var legend = svg.selectAll(".legend")
          .data(stackKey)
        .enter().append("g")
          .attr("class", "legend")
          .attr("transform", function(d, i) { return "translate(0," + i * 15 + ")"; });

      // draw legend colored rectangles
      legend.append("rect")
          .attr("x", 0) //.attr("x", width - 18)
          .attr("y", height+8)
          .attr("width", 12) //.attr("width", 12)
          .attr("height", 8)
          .style("fill", color);

      // draw legend text
      legend.append("text")
          .attr("x", 15)
          .attr("y", height+13)
          .attr("dy", ".15em")
          // .style("text-anchor", "end")
          .style("font-size","9.5px")
          .style("font-color","grey")
          .text(function(d) { return d;})
    }
   }

  }

var data = [
{"Heating":Qh_T, "Cooling":Qc_T, "Equipment":Qe_T, "Lighting":Ql_T,"total":EUI}
];

var keyEnergy = ["Equipment","Lighting", "Cooling", "Heating"];

var dataCO2 = [
{"Electricity":CO2Elec,"Gas":CO2Gas,"total":CO2Gas+CO2Elec}
];

var dataCost = [
{"Electricity":CostElec,"Gas":CostGas,"total":CostGas+CostElec}
];

var keyCO2_cost = ["Electricity","Gas"];


colorL = {"Equipment": "black", "Lighting": "yellow","Cooling":"#62749e","Heating":"orangered"}
colorL_ = {"Electricity":"darkgrey","Gas":"orange"}


function newBase(cookiedata, svgid, first, max){
    var svg = d3.select(svgid);
    svg.selectAll("*").remove();
//    if (first == 1){
////        initSavedBarChart.draw({
//        initStackedBarChart.draw({
//          data: cookiedata,
//          key: keyEnergy,
//          element: 'stacked-bar',
//          svgid: svgid,
//          title:"Energy Use (kWh/m2)",
//          color:colorL
//        });
//    }
//    else{
        initSavedBarChart.draw({
    //    initStackedBarChart.draw({
          data: cookiedata,
          key: keyEnergy,
          element: 'stacked-bar',
          svgid: svgid,
          title:"Energy Use (kWh/m2)",
          color: colorL,
          max: max,
          first: first
        });
//    }
}

initStackedBarChart.draw({
  data: data,
  key: keyEnergy,
  element: 'stacked-bar',
  svgid: "#svgenergy",
  title:"Energy Use (kWh/m2)",
  color:colorL
});

initStackedBarChart.draw({
  data: dataCO2,
  key: keyCO2_cost,
  element: 'stacked-bar',
  svgid: "#svgco2",
  title:"Emission (kgCO2e/kWh.m2)",
  color:colorL_
});

initStackedBarChart.draw({
  data: dataCost,
  key: keyCO2_cost,
  element: 'stacked-bar',
  svgid: "#svgcost",
  title:"Cost ($/kWh.m2)",
  color:colorL_
});


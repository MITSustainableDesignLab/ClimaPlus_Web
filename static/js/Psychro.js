/* * * * * * * * * * * * * * * * * * * * * * * *

* * * * * * * * * * * * * * * * * * * * * * * * */
$("#psychro").addClass("active");


// place svg canvas into main
// var margin = {top: 20, right: 10, bottom: 0, left: 36},
//     width = 400 - margin.left - margin.right,
//     height = 300 - margin.top - margin.bottom;


// var svg = d3.select("#svgsychrochart")
//     .append("svg")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//   .append("g")
//     .attr("transform", "translate(" + margin.left + "," + margin.top + ")")


// var recBor = svg.append("rect")
//     .attr("x", 0)
//     .attr("y", 0)
//     .attr("height", height)
//     .attr("width", width)    
//     .style("strock", "grey")
//     .style("fill", "grey")
//     .style("opacity", 0.08);


/*
https://github.com/jameswperakis/jwperakis.github.io
The main charting function is contained in psychrometricCart(). formatEPW() handles an epw
text string. psychrometrics() returns an object that has all the line informtion for drawing
the psychrometric chart, along with helper functions to derive humidity ratios, enthalpy, an rh
from various inputs. Based on functions in ASHRAE Book of Fundamentals.
*/



function hoursToDate(hour) {
  var d = Math.floor(hour/24),
  h = hour%24,
  date = new Date(2015, 0);
  date.setDate(d + 1);  
  return new Date(date.setHours(h));
}



function psychrometricChart() {
  var width,
  height,
  context,
  ar = 7/8,
  dbMin = -15,
  dbMax = 50,
  hrMin = 0,
  hrMax = 0.030,
  dropZone,
  epwPre,
  margin = {top: 20, right: 50, bottom: 170, left: 15},
  offset = offset = (($(window).width() <= 600) ? -10: 0),
  hExtent = [7,17],
  mExtent = [0, 11];

  var monthAbb = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  //set up the scales and line function
  var dbScale = d3.scaleLinear()
    .domain([dbMin, dbMax]);
  
  var hrScale = d3.scaleLinear()
    .domain([hrMin, hrMax]);

  var pLine = d3.line()
    .x(function(d) { return dbScale(d.db); })
    .y(function(d) { return hrScale(d.hr); });

  var hourScale = d3.scaleLinear()
    .domain([0, 23]);

  var monthScale = d3.scaleLinear()
    .domain([0, 11]);
    

  // var hBrush = d3.svg.brush()
  //   .on("brush", hbrushMove);

  // var mBrush = d3.svg.brush()
  //   .on("brush", mbrushMove);

  //set up the axis for the main chart
  var dbAxis = d3.axisBottom().scale(dbScale);
  var hrAxis = d3.axisRight().scale(hrScale);
  
  
  // function chart(selection) {
  //   selection.each(function(data, i) {
  //     //Set the context for the graph
  //     context = this;
  //     width = $(context).width()
  //     height = width * ar;


  hourScale.range([0, (width - margin.left - margin.right)]);
  monthScale.range([0, (width - margin.left - margin.right)]);
  // hBrush.x(hourScale).extent(hExtent);
  // mBrush.x(monthScale).extent(mExtent)


  // var avgPressure = d3.sum(data.weather, function(d) { return d.bp; }) / data.weather.length;
  var avgPressure = d3.sum(bp, function(d) { return d; }) / bp.length;
  console.log("PRINT AVE PRESSURE", avgPressure)

  //set up the new psyhrometric chart utility object
  var psych = new psychrometrics().barPress(avgPressure).humidityRange([hrMin, hrMax]).tempRange([dbMin, dbMax]);
  
  //draw the main psych chart - first clear the field
  d3.select(context).selectAll(".psychChart").remove()
  var psychChart = d3.select(context)
    .append("div").attr("class", "psychChart")
    .append("svg").attr({"width": width, "height": height})
    .append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // var psychChart = d3.select("#svgsychrochart")
  //   .append("svg")
  //   .attr("width", width + margin.left + margin.right)
  //   .attr("height", height + margin.top + margin.bottom)
  // .append("g")
  //   .attr("transform", "translate(" + margin.left + "," + margin.top + ")")


  //set up the scales
  hrScale.range([(height - margin.top - margin.bottom), 0]);
  dbScale.range([0, (width - margin.left - margin.right)]);
  var area = d3.area()
    .x(function(d) { return dbScale(d.db); })
    .y0(height - margin.top - margin.bottom)
    .y1(function(d) { return hrScale(d.hr); })
    // .interpolate("cardinal");

  // var defs = psychChart.append("defs");
  var defs = psychChart.append("defs");
    
  defs.append("clipPath")
    .attr("id", "saturationClip")
    .append("path")
      .attr("d", area(psych.rhCurves().rh100));
  defs.append("clipPath")
    .attr("id", "humidClip")
    .append("rect")
      .attr("width", width - margin.left - margin.right)
      .attr("height", height - margin.top - margin.bottom)
      .attr("id", "humidClipShape");
  defs.append("clipPath")
    .attr({"id": "clip", "clip-path": ("url(#saturationClip)")})
    .append("use")
      .attr({"x": 0, "y": 0, "width": width, "height": height, "xlink:href": "#humidClipShape"});

  //Draw all of the chart curves
  psychChart.selectAll(".wbCurve")
    .data(d3.keys(psych.wbCurves()))
    .enter()
    .append("path")
      .attr("class", "wbCurve")
      .attr("d", function(d) { return pLine.interpolate("linear")(psych.wbCurves()[d]); })
      .attr("clip-path", ("url(#clip)"));

  psychChart.selectAll(".hrCurve")
    .data(d3.keys(psych.hrCurves()))
    .enter()
    .append("path")
      .attr("class", "hrCurve")
      .attr("d", function(d) { return pLine.interpolate("linear")(psych.hrCurves()[d]); })
      .attr("clip-path", ("url(#clip)"));

  psychChart.selectAll(".tempCurve")
    .data(d3.keys(psych.tempCurves()))
    .enter()
    .append("path")
      .attr("class", "tempCurve")
      .attr("d", function(d) { return pLine.interpolate("linear")(psych.tempCurves()[d]); })
      .attr("clip-path", ("url(#clip)"));

  psychChart.selectAll(".rhCurve")
    .data(d3.keys(psych.rhCurves()))
    .enter()
    .append("path")
      .attr("id", function(d) { return d;})
      .attr("class", "rhCurve")
      .attr("d", function(d) { return pLine.interpolate("cardinal")(psych.rhCurves()[d]); })
      .attr("clip-path", ("url(#clip)"));


  //draw the axis
  var dbAxis = d3.svg.axis().scale(dbScale).tickPadding(8);
  var hrAxis = d3.svg.axis().scale(hrScale).orient("right").tickFormat(function(d) { return d * 1000; });

  psychChart.append("g")
    .attr("class", "db axis")
    .attr("id", "dbAxis")
    .attr("transform", "translate(0," + (height - margin.top - margin.bottom) + ")")
    .call(dbAxis);

  psychChart.append("g")
    .attr("class", "hr axis")
    .attr("id", "hrAxis")
    .attr("transform", "translate(" + (width - margin.left - margin.right) + ",0)")
    .call(hrAxis);

  psychChart.select("#dbAxis")
    .append("text")
    .text("Drybulb Temperature [°C]")
      .attr("id", "dbUnit")
      .attr("text-anchor", "middle")
      .attr("x", (width) / 2)
            .attr("y", 45);

        psychChart.select("#hrAxis")
    .append("text")
    .text("Humidity Ratio [g/kg]")
      .attr("id", "hrUnit")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("x", -(height - margin.bottom)/2)
            .attr("y", 45);

        var rhLabels = d3.keys(psych.rhCurves()).filter(function(d, i) { return !(i % 2); })

        //put the rh text on the lines with text shadows
        var textShadows = psychChart.selectAll(".rhLabelShadow")
          .data(rhLabels)
          .enter()
          .append("text")
          .attr("class", "rhLabelShadow")
          .attr("x", width*.70)
          .attr("dy", "0.5em");

        textShadows.each(function(d, i) {
          d3.select(this).append("textPath")
          .attr("xlink:href", "#" + d)
          .text(d.substring(2) + "%");
        });

        var text = psychChart.selectAll(".rhLabels")
          .data(rhLabels)
          .enter()
          .append("text")
          .attr("class", "rhLabels")
          .attr("x", width*.70)
          .attr("dy", "0.5em");

        text.each(function(d, i) {
          d3.select(this).append("textPath")
          .attr("xlink:href", "#" + d)
          .text(d.substring(2) + "%");
        });

  //finally - plot the points
  psychChart.selectAll(".hours")
    .data(data.weather)
    .enter()
    .append("circle")
    .attr("class", "hours")
    .attr("cx", function(d) { return dbScale(d.db); })
    .attr("cy", function(d) { return hrScale(d.hr); })
    .attr("r", (width < 600) ? 2: 3)
    .attr("fill", "#1c9099")
    .attr("fill-opacity", .2);
    // .classed("nir", function(d) { return (d.date.getHours() < hExtent[0] || d.date.getHours() > hExtent[1] || d.date.getMonth() < mExtent[0] || d.date.getMonth() > mExtent[1]); });
    
    
  //   });
  // }


 

  // chart.width = function(value) {
  //     if (!arguments.length) return width;
  //     width = value;
  //     return chart;
  //   };

  //   chart.height = function(value) {
  //     if (!arguments.length) return height;
  //     height = value;
  //     return chart;
  //   };

  //   chart.resize = function() {
  //     width = $(context).width();
  //     height = width * ar;

  //     offset = (($(window).width() <= 600) ? -10: -0);

  //     if ($(window).width() <= 1200) {
  //       d3.select(context).call(chart);
  //     }




    // }

    // return chart;


}




function psychrometrics() {
  var barPress = 101300;
  this.barPress = function(value) {
    if (!arguments.length) return barPress;
    barPress = value;
    return this;
  };

  var humidityRange = [0, 0.03];
  this.humidityRange = function(value) {
    if (!arguments.length) return humidityRange;
    humidityRange = value;
    return this;
  };

  var tempRange = [-20, 55];
  this.tempRange = function(value) {
    if (!arguments.length) return tempRange;
    tempRange = value;
    return this;
  };

  this.calcHumidRatio = function(temp, rh, bar) {

    var saturationPressure = this.calcVaporPressure(temp + 273.15);
    var humidityRatio = 0.62198 * (rh/100) * (saturationPressure/1000) / (bar / 1000 - (rh/100) * saturationPressure / 1000);
    var partialPressure = rh/100 * saturationPressure;
    var enthalpy = 1.006 * temp + humidityRatio * (2501 + 1.86 * temp);

    return {hr: humidityRatio, e: enthalpy, pp: partialPressure, sp: saturationPressure};
  }

  this.calcRhFromHumidRatio = function(absHumidity, bar, temp) {
    var ppW = bar/1000 * absHumidity / (0.62198 + absHumidity),
    spW = this.calcVaporPressure(temp + 273.15);
    return (ppW/spW) * 100;
  }

  this.calcTempFromEnthalpy = function(enthalpy, absHumidity) {
    return (enthalpy - (2501*absHumidity))/(1.006 + (1.86 * absHumidity));

  }


  //from ASHRAE fundamentals
  this.calcVaporPressure = function(tempK) {
    
    var C1 = -5674.5359,
      C2 = 6.3925247,
      C3 = -0.009677843,
      C4 = 0.00000062215701,
      C5 = 0.00000000020747825,
      C6 = -0.0000000000009484024,
      C7 = 4.1635019,
      C8 = -5800.2206,
      C9 = 1.3914993,
      C10 = -0.048640239,
      C11 = 0.000041764768,
      C12 = -0.000000014452093,
      C13 = 6.5459673;

      if (tempK <= 273.15) {
        var result = Math.exp(C1/tempK + C2 + C3*tempK + C4*Math.pow(tempK, 2) + C5*Math.pow(tempK, 3) + C6*Math.pow(tempK, 4) + C7*Math.log(tempK));
      }
      else {
        var result = Math.exp(C8/tempK + C9 + C10*tempK + C11*Math.pow(tempK, 2) + C12*Math.pow(tempK, 3) + C13*Math.log(tempK));
      }

      return result;

  }

  /* Untested functions from excel psychtools
  this.calcHumidRatiofromWetBulb = function(temp, wb, bar) {
    var saturationPressure = this.calcVaporPressure(wb) / 1000;
    var ws = 0.62198 * saturationPressure / (bar/1000 - saturationPressure);
    if (temp >= 0) {
      var result = (((2501 - 2.326*wb)*ws - 1.006*(temp - wb))/(2501 + 1.86*temp - 4.186*wb));
    }
    else {
      var result = (((2830 - 0.24*wb)*ws - 1.006*(temp - wb))/(2830 + 1.86*temp - 2.1*wb));
    }
    return result;
  }
  // from remcmurry python psych tool kit - uses newton-Rhapson iteration method
  this.calcWetBulb = function(temp, rh, bar) {
    var wNorm = this.calcHumidRatio(temp, rh, bar);
    var result = temp;
    var wNew = this.calcHumidRatiofromWetBulb(temp, result, bar);
    while (Math.abs((wNew - wNorm) / wNorm) > 0.00001) {
      var wNew2 = this.calcHumidRatiofromWetBulb(temp, result - 0.001, bar);
      var dw = (wNew - wNew2) / 0.001;
      result = result - (wNew - wNorm) / dw;
      wNew = this.calcHumidRatiofromWetBulb(temp, result, bar);
    }
    return result;
  }
  */

  this.rhCurves = function() {
    var psych = this;
    
    var temps = [];
    for (var i=tempRange[0]; i<=tempRange[1]; i+=5) {
      temps.push(i);
    }
    var relHumid = [];
    for (var i=10; i<110; i+=10) {
      relHumid.push(i);
    }
    var rhCoordinates = {};
    relHumid.forEach(function(d) { 
      var key = "rh" + d,
      value = temps.map(function(dd) {
        return {db: dd, hr: psych.calcHumidRatio(dd, d, barPress).hr};
      });
      rhCoordinates[key] = value;
    });
    return rhCoordinates;
  }


  this.wbCurves = function() {
    var wb = [];
    var psych = this;
    for (var i=tempRange[0]; i<40; i+=5) {
      wb.push(i);
    }

    var wbCoordinates = {};
    
    wb.forEach(function(d) {
      var key = d + " C",
      lineStart = {db: d, hr: psych.calcHumidRatio(d, 100, barPress).hr},
      lineEnd = {db: psych.calcTempFromEnthalpy(psych.calcHumidRatio(d, 100, barPress).e, 0.0), hr: 0.0},
      value = [lineStart, lineEnd];
      wbCoordinates[key] = value;
    });
    return wbCoordinates;
  }

  this.tempCurves = function() {
    var t = [];
    var psych = this;
    for (var i=tempRange[0]; i<tempRange[1]; i+=5) {
      t.push(i);
    }

    var tempCoordinates = {};

    t.forEach(function(d) {
      var key = d + " C",
      lineStart = {db: d, hr: 0.0},
      lineEnd = {db: d, hr: psych.calcHumidRatio(d, 100, barPress).hr},
      value = [lineStart, lineEnd];
      tempCoordinates[key] = value;
    });
    return tempCoordinates;
  }

  this.hrCurves = function() {
    var h = [];

    for (var i=humidityRange[0]; i<=humidityRange[1]; i+=0.005) {
      h.push(i);
    }
    h.push(humidityRange[1]);

    var hrCoordinates = {};

    h.forEach(function(d) {
      var key = d + " kg/kg",
      lineStart = {db: tempRange[0], hr: d},
      lineEnd = {db: tempRange[1], hr: d},
      value = [lineStart, lineEnd];
      hrCoordinates[key] = value;
    });
    return hrCoordinates;
  }
}


// // draw legend
//   var legend = svg.selectAll(".legend")
//       .data(color.domain())
//     .enter().append("g")
//       .attr("class", "legend")
//       .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

//   // draw legend colored rectangles
//   legend.append("rect")
//       .attr("x", width - 18)
//       .attr("width", 16)
//       .attr("height", 12)
//       .style("fill", color);

//   // draw legend text
//   legend.append("text")
//       .attr("x", width - 24)
//       .attr("y", 9)
//       .attr("dy", ".15em")
//       .style("text-anchor", "end")
//       .style("font-size","12px")
//       .style("font-color","grey")
//       .text(function(d) { return d;})



psychrometricChart();
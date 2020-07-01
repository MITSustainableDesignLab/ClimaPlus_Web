/*
The main charting function is contained in psychrometricCart(). formatEPW() handles an epw
text string. psychrometrics() returns an object that has all the line informtion for drawing
the psychrometric chart, along with helper functions to derive humidity ratios, enthalpy, an rh
from various inputs. Based on functions in ASHRAE Book of Fundamentals.
*/
// console.log('TESSSTT-----001')
// function formatEpw(epwCSV) {
// 	var ps = new psychrometrics();
// 	var la = d3.csvParseRows(epwCSV)[0];
// 	console.log('TESSSTT', l)
// 	var l = {city: la[1], state: la[2], country: globalCodes[la[3]].country, latitude: Number(la[6]), longitude: Number(la[7]), elevation: la[9], code: la[3]};
// 	var w = d3.csvParseRows(epwCSV, function(d, i) {
// 		if (i > 7) {
// 			return {
// 				hour: i-8,
// 				date: hoursToDate(i-8), 
// 				db: Number(d[6]), 
// 				rh: Number(d[8]), 
// 				bp: Number(d[9]), 
// 				dp: Number(d[7]), 
// 				hr: ps.calcHumidRatio(Number(d[6]), Number(d[8]), Number(d[9])).hr 
// 			};
// 		}
// 	});
// 	return {location: l, weather: w};
// }


function hoursToDate(hour) {
	var d = Math.floor(hour/24),
	h = hour%24,
	date = new Date(2015, 0);
	date.setDate(d + 1);	
	return new Date(date.setHours(h));
}



function psychrometricChart(h1 = 0, h2 = 23, m1 = 0 , m2 = 11) {
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
	// offset = offset = (($(window).width() <= 600) ? -10: 0),
	hExtent = [h1,h2],
	mExtent = [m1, m2];

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
		


	// var w = new globe()
	// 	.mapData("data/world-110m.json")
	// 	.countryNames("data/world-country-names.tsv");


	//set up the axis for the main chart
	var dbAxis = d3.axisBottom().scale(dbScale);
	var hrAxis = d3.axisRight().scale(hrScale);

	function chart(selection) {
		selection.each(function(data, i) {
			//Set the context for the graph
			context = this;
			// width = $(context).width() - 155
			width = 400
			// height = width * ar;
			height = 450
			brushHeight = 20
			hourScale.range([0, (width - margin.left - margin.right)]);
			monthScale.range([0, (width - margin.left - margin.right)]);
			// hBrush.x(hourScale).extent(hExtent);
			// mBrush.x(monthScale).extent(mExtent)

			// // hBrush.extent(hourScale(hExtent[0]), hourScale(hExtent[1]));
			// hBrush.extent([[0, hourScale.range()[0]], [hExtent, hourScale.range()[1]]]);
			// mBrush.extent([[0, monthScale.range()[0]], [mExtent, monthScale.range()[1]]]);
			// // hBrush.x(hourScale).extent(hExtent);
			// // mBrush.x(monthScale).extent(mExtent)
			// // .extent([[hourScale.range()[0], hExtent[0]], [hourScale.range()[1], hExtent[1]]])
			// console.log('hours scale extent test',hourScale(hExtent[0]))
			// console.log(hourScale.range()[0])

			var avgPressure = d3.sum(data.weather, function(d) { return d.bp; }) / data.weather.length;

			//set up the new psyhrometric chart utility object
			var psych = new psychrometrics().barPress(avgPressure).humidityRange([hrMin, hrMax]).tempRange([dbMin, dbMax]);
			
			//draw the main psych chart - first clear the field
			d3.select(context).selectAll(".psychChart").remove()
			var psychChart = d3.select(context)
				.append("div").attr("class", "psychChart")
				.append("svg").attr("width", width).attr("height", height)
				.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");


			//set up the scales
			hrScale.range([(height - margin.top - margin.bottom), 0]);
			dbScale.range([0, (width - margin.left - margin.right)]);
			var area = d3.area()
				.x(function(d) { return dbScale(d.db); })
				.y0(height - margin.top - margin.bottom)
				.y1(function(d) { return hrScale(d.hr); })
				.curve(d3.curveCardinal);

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
				.attr("id", "clip").attr("clip-path", ("url(#saturationClip)"))
				.append("use")
					.attr("x", 0).attr("y", 0).attr("width", width).attr("height", height)
					.attr("xlink:href", "#humidClipShape");

			

			//draw the box to hold the globe and station location text
			/*
			psychChart.append("rect")
				.attr({"fill": "#1c9099", "fill-opacity": .0})
				.attr("width", width/4)
				.attr("height", (height - margin.top - margin.bottom) * ((width < 700)? 0.75 : 0.62))
				.attr("y", -margin.top)
				.attr("x", -margin.left)
				.attr("rx", 10)
				.attr("ry", 10);
			*/

			// //draw the globe
			// w.diameter(width / 7);
			
			// psychChart.append("g")
			// 	.attr("id", "globe")
			// 	.attr("transform", "translate(" + (-margin.left + (width/4 - width/7)/2) + "," + (offset) + ")")
			// 	.datum(data.location)
			// 	.call(w);

			//draw the axis
			var dbAxis = d3.axisBottom().scale(dbScale).tickPadding(8);
			var hrAxis = d3.axisRight().scale(hrScale).tickFormat(function(d) { return d * 1000; });

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

          	

     //      	//add the weather station location text - offset it by the diameter of the globe
     //      	station = psychChart.selectAll(".station")
     //      		.data([data.location])
     //      		.enter()
     //      		.append("g")
     //      			.attr("class", "station")
     //      			.attr("transform", "translate(" + (-margin.left + (width/4/2)) + "," + (offset + width/5.5) + ")");


     //      	station.each(function(d, i) {
     //      		d3.select(this).append("text")
     //      		.attr("text-anchor", "middle")
     //      		.text(  ((d.city.length > 12) ? (d.city.substring(0, 9) + "...") : d.city) + " | " + d.code);
          		
     //      		var lat = d3.select(this).append("text")
     //      		.attr("text-anchor", "middle")
     //      		.attr("dy", "1.5em");

     //      		lat.append("tspan")
 				// 	.style("font-weight", "bold")
 				// 	.text("Latitude: ");

 				// lat.append("tspan")
 				// 	.text(d.latitude);

 				// var lon = d3.select(this).append("text")
 				// .attr("text-anchor", "middle")
     //      		.attr("dy", "3em");

     //      		lon.append("tspan")
 				// 	.style("font-weight", "bold")
 				// 	.text("Longitude: ");

 				// lon.append("tspan")
 				// 	.text(d.longitude);

 				// var elev = d3.select(this).append("text")
 				// .attr("text-anchor", "middle")
     //      		.attr("dy", "4.5em");

     //      		elev.append("tspan")
 				// 	.style("font-weight", "bold")
 				// 	.text("Elevation: ");

 				// elev.append("tspan")
 				// 	.text(d.elevation + " m");
     //      	});

			
     		//Draw all of the chart curves
			psychChart.selectAll(".wbCurve")
				.data(d3.keys(psych.wbCurves()))
				.enter()
				.append("path")
					.attr("class", "wbCurve")
					.attr("d", function(d) { return pLine.curve(d3.curveLinear)(psych.wbCurves()[d]); })
					.attr("clip-path", ("url(#clip)"));

			psychChart.selectAll(".hrCurve")
				.data(d3.keys(psych.hrCurves()))
				.enter()
				.append("path")
					.attr("class", "hrCurve")
					.attr("d", function(d) { return pLine.curve(d3.curveLinear)(psych.hrCurves()[d]); })
					.attr("clip-path", ("url(#clip)"));

			psychChart.selectAll(".tempCurve")
				.data(d3.keys(psych.tempCurves()))
				.enter()
				.append("path")
					.attr("class", "tempCurve")
					.attr("d", function(d) { return pLine.curve(d3.curveLinear)(psych.tempCurves()[d]); })
					.attr("clip-path", ("url(#clip)"));

			psychChart.selectAll(".rhCurve")
				.data(d3.keys(psych.rhCurves()))
				.enter()
				.append("path")
					.attr("id", function(d) { return d;})
					.attr("class", "rhCurve")
					.attr("d", function(d) { return pLine.curve(d3.curveLinear)(psych.rhCurves()[d]); })
					.attr("clip-path", ("url(#clip)"));



			//finally - plot the points
			psychChart.selectAll(".hours")
				.data(data.weather)
				.enter()
				.append("circle")
				.attr("class", "hours")
				.attr("cx", function(d) { return dbScale(d.db); })
				.attr("cy", function(d) { return hrScale(d.hr); })
				.attr("r", (width < 600) ? 2: 3)
				.attr("fill", "gray")
				.attr("fill-opacity", .8)
				.classed("nir", function(d) { 
					return (d.date.getHours() < hExtent[0] || d.date.getHours() > hExtent[1] || d.date.getMonth() < mExtent[0] || d.date.getMonth() > mExtent[1]); });



			//set up the sliders




			//put the rh text on the lines with text shadows
          	var textShadows = psychChart.selectAll(".rhLabelShadow")
          		.data(rhLabels)
          		.enter()
          		.append("text")
          		.attr("class", "rhLabelShadow")
          		// .style("font-size","10px")
          		.attr("x", width*.55)
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
          		// .style("font-size","10px")
          		.attr("x", width*.55)
          		.attr("dy", "0.5em");

          	text.each(function(d, i) {
          		d3.select(this).append("textPath")
          		.attr("xlink:href", "#" + d)
          		.text(d.substring(2) + "%");
          	});

			
			
			//set up the drop zone for the epw file
			dropZone = context;


			// Event Listener for when the dragged file is over the drop zone.
		  	dropZone.addEventListener('dragover', function(e) {
		  		if (e.preventDefault) e.preventDefault(); 
		  		if (e.stopPropagation) e.stopPropagation();

		  		e.dataTransfer.dropEffect = 'copy';
		  		this.className = "over";
			});

			// Event Listener for when the dragged file enters the drop zone.
			dropZone.addEventListener('dragenter', function(e) {
		  		this.className = "over";
			});

			// Event Listener for when the dragged file leaves the drop zone.
			dropZone.addEventListener('dragleave', function(e) {
		  		this.className = "";
			});

			// Event Listener for when the dragged file dropped in the drop zone.
			dropZone.addEventListener('drop', function(e) {
		  		if (e.preventDefault) e.preventDefault(); 
		  		if (e.stopPropagation) e.stopPropagation();

		  		this.className = "";

		  		var fileList = e.dataTransfer.files;

		  		if (fileList.length > 0) {
		    		readTextFile(fileList[0]);
		  		}
			});

			/* End og Filereader handling */
			



		});
	}


	// Drag and Drop EPW File - method using Filereader API
  	// Read the contents of a file.
	function readTextFile(file) {
  		var reader = new FileReader();


  		reader.onloadend = function(e) {
    		if (e.target.readyState == FileReader.DONE) {
      			var content = reader.result;
      			//set the csv file as the new data
  				d3.select(context).datum(formatEpw(content)).call(chart);

    		}
  		}

  		reader.readAsBinaryString(file);
  		
	}

	// chart.width = function(value) {
 //    	if (!arguments.length) return width;
 //    	width = value;
 //    	return chart;
 //  	};

 //  	chart.height = function(value) {
 //    	if (!arguments.length) return height;
 //    	height = value;
 //    	return chart;
 //  	};

 //  	chart.resize = function() {
 //  		width = $(context).width();
 //  		height = width * ar;

 //  		offset = (($(window).width() <= 600) ? -10: -0);

 //  		if ($(window).width() <= 1200) {
 //  			d3.select(context).call(chart);
 //  		}

 //  	}

  	return chart;

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





// function globe() {
// 	var diameter = 300,
// 	context,
// 	center,
// 	mapData,
// 	countryNames;

// 	var projection = d3.orthographic()
//   		.scale(diameter / 2 - 10)
//   		.translate([diameter / 2, diameter / 2])
//   		.clipAngle(90)
//   		.precision(0.25);


//   	var path = d3.path()
//   		.projection(projection)
//   		.pointRadius(4);


// 	function draw(selection) {
// 		selection.each(function(data, i) {
			
// 			context = this;
			
// 			center = data;

		
// 			queue()
// 				.defer(d3.json, mapData)
// 				.defer(d3.tsv, countryNames)
// 				.await(ready);


// 		});
// 	}


// 	function ready(error, world, names) {
// 		if (error) throw error;

// 		//var sphere = {type: "Sphere"},
// 		//land = topojson.feature(world, world.objects.land),
// 		var countries = topojson.feature(world, world.objects.countries).features;
// 		//borders = topojson.mesh(world, world.objects.countries, function(a, b) { return a != b; });

// 		countries = countries.filter(function(d) {
// 			return names.some(function(n) {
// 				if (d.id == n.id) return d.name = n.name;
// 			});
// 		});


// 		d3.select(context).selectAll("path.water")
// 			.data([{type: "Sphere"}])
// 			.enter().append("path")
// 				.attr("class", "water")
// 				.attr("d", path);

// 		var world = d3.select(context).selectAll("path.land")
// 			.data(countries)
// 			.enter().append("path")
// 			.attr("class", "land")
// 			.attr("d", path);

// 		d3.select(context).selectAll("path.outline")
// 			.data([{type: "Sphere"}])
// 			.enter().append("path")
// 				.attr("class", "outline")
// 				.attr("d", path);

//   		d3.select(context).selectAll("#location")
// 			.data([center])
// 			.enter().append("path")
// 			.attr("id", "location")
// 			.datum(function(d) { return {type: "Point", coordinates: [d.longitude, d.latitude]}; })
// 			.attr("d", path);


// 		draw.rotateGlobe(center);
// 	}

// 	draw.diameter = function(value) {
//     	if (!arguments.length) return diameter;
//     	diameter = value;
//     	projection.scale(diameter / 2 - 5).translate([diameter / 2, diameter / 2])
//     	return draw;
//   	};

//   	draw.mapData = function(value) {
//     	if (!arguments.length) return mapData;
//     	mapData = value;
//     	return draw;
//   	};

//   	draw.countryNames = function(value) {
//     	if (!arguments.length) return countryNames;
//     	countryNames = value;
//     	return draw;
//   	};


//   	draw.rotateGlobe = function(value) {
//   		center = value;
//   		(function transition() {
//   			d3.transition()
//   			.duration(1500)
//   			.tween("rotate", function() {
//   				var r = d3.interpolate(projection.rotate(), [-center.longitude, -center.latitude]);
//   				return function(t) {
//   					projection.rotate(r(t));
//   					d3.select(context).select("#location").datum({type: "Point", coordinates: [center.longitude, center.latitude]}).attr("d", path);

//   					d3.select(context).selectAll("path").attr("d", path)
//   					.classed("focused", function(d, i) { return d.name == value.country; });	
//   				};
//   			})
//   		})();

//   	};

// 	return draw;

// }

var globalCodes = {"DZA": {"country": "Algeria", "code": "DZ"}, "AGO": {"country": "Angola", "code": "AO"}, "EGY": {"country": "Egypt", "code": "EG"}, "BGD": {"country": "Bangladesh", "code": "BD"}, "NER": {"country": "Niger", "code": "NE"}, "LIE": {"country": "Liechtenstein", "code": "LI"}, "NAM": {"country": "Namibia", "code": "NA"}, "BGR": {"country": "Bulgaria", "code": "BG"}, "BOL": {"country": "Bolivia", "code": "BO"}, "GHA": {"country": "Ghana", "code": "GH"}, "CCK": {"country": "Cocos (Keeling) Islands", "code": "CC"}, "PAK": {"country": "Pakistan", "code": "PK"}, "CPV": {"country": "Cape Verde", "code": "CV"}, "JOR": {"country": "Jordan", "code": "JO"}, "LBR": {"country": "Liberia", "code": "LR"}, "LBY": {"country": "Libya", "code": "LY"}, "MYS": {"country": "Malaysia", "code": "MY"}, "DOM": {"country": "Dominican Republic", "code": "DO"}, "PRI": {"country": "Puerto Rico", "code": "PR"}, "MYT": {"country": "Mayotte", "code": "YT"}, "PRK": {"country": "Korea, Democratic People's Republic of", "code": "KP"}, "PSE": {"country": "Palestine, State of", "code": "PS"}, "TZA": {"country": "United Republic of Tanzania", "code": "TZ"}, "BWA": {"country": "Botswana", "code": "BW"}, "KHM": {"country": "Cambodia", "code": "KH"}, "UMI": {"country": "United States Minor Outlying Islands", "code": "UM"}, "TTO": {"country": "Trinidad and Tobago", "code": "TT"}, "PRY": {"country": "Paraguay", "code": "PY"}, "HKG": {"country": "Hong Kong", "code": "HK"}, "SAU": {"country": "Saudi Arabia", "code": "SA"}, "LBN": {"country": "Lebanon", "code": "LB"}, "SVN": {"country": "Slovenia", "code": "SI"}, "BFA": {"country": "Burkina Faso", "code": "BF"}, "SVK": {"country": "Slovakia", "code": "SK"}, "MRT": {"country": "Mauritania", "code": "MR"}, "HRV": {"country": "Croatia", "code": "HR"}, "CHL": {"country": "Chile", "code": "CL"}, "CHN": {"country": "China", "code": "CN"}, "KNA": {"country": "Saint Kitts and Nevis", "code": "KN"}, "JAM": {"country": "Jamaica", "code": "JM"}, "SMR": {"country": "San Marino", "code": "SM"}, "GIB": {"country": "Gibraltar", "code": "GI"}, "DJI": {"country": "Djibouti", "code": "DJ"}, "GIN": {"country": "Guinea", "code": "GN"}, "FIN": {"country": "Finland", "code": "FI"}, "URY": {"country": "Uruguay", "code": "UY"}, "VAT": {"country": "Holy See (Vatican City State)", "code": "VA"}, "STP": {"country": "Sao Tome and Principe", "code": "ST"}, "SYC": {"country": "Seychelles", "code": "SC"}, "NPL": {"country": "Nepal", "code": "NP"}, "CXR": {"country": "Christmas Island", "code": "CX"}, "LAO": {"country": "Lao People's Democratic Republic", "code": "LA"}, "YEM": {"country": "Yemen", "code": "YE"}, "BVT": {"country": "Bouvet Island", "code": "BV"}, "ZAF": {"country": "South Africa", "code": "ZA"}, "KIR": {"country": "Kiribati", "code": "KI"}, "PHL": {"country": "Philippines", "code": "PH"}, "SXM": {"country": "Sint Maarten (Dutch part)", "code": "SX"}, "ROU": {"country": "Romania", "code": "RO"}, "VIR": {"country": "US Virgin Islands", "code": "VI"}, "SYR": {"country": "Syrian Arab Republic", "code": "SY"}, "MAC": {"country": "Macao", "code": "MO"}, "NIC": {"country": "Nicaragua", "code": "NI"}, "MLT": {"country": "Malta", "code": "MT"}, "KAZ": {"country": "Kazakhstan", "code": "KZ"}, "TCA": {"country": "Turks and Caicos Islands", "code": "TC"}, "PYF": {"country": "French Polynesia", "code": "PF"}, "NIU": {"country": "Niue", "code": "NU"}, "DMA": {"country": "Dominica", "code": "DM"}, "GBR": {"country": "United Kingdom", "code": "GB"}, "BEN": {"country": "Benin", "code": "BJ"}, "GUF": {"country": "French Guiana", "code": "GF"}, "BEL": {"country": "Belgium", "code": "BE"}, "MSR": {"country": "Montserrat", "code": "MS"}, "TGO": {"country": "Togo", "code": "TG"}, "DEU": {"country": "Germany", "code": "DE"}, "GUM": {"country": "Guam", "code": "GU"}, "LKA": {"country": "Sri Lanka", "code": "LK"}, "SSD": {"country": "South Sudan", "code": "SS"}, "FLK": {"country": "Falkland Islands (Malvinas)", "code": "FK"}, "PCN": {"country": "Pitcairn", "code": "PN"}, "BES": {"country": "Bonaire", "code": "BQ"}, "GUY": {"country": "Guyana", "code": "GY"}, "CRI": {"country": "Costa Rica", "code": "CR"}, "COK": {"country": "Cook Islands", "code": "CK"}, "MAR": {"country": "Morocco", "code": "MA"}, "MNP": {"country": "Northern Mariana Islands", "code": "MP"}, "LSO": {"country": "Lesotho", "code": "LS"}, "HUN": {"country": "Hungary", "code": "HU"}, "TKM": {"country": "Turkmenistan", "code": "TM"}, "SUR": {"country": "Suriname", "code": "SR"}, "NLD": {"country": "Netherlands", "code": "NL"}, "BMU": {"country": "Bermuda", "code": "BM"}, "HMD": {"country": "Heard Island and McDonald Mcdonald Islands", "code": "HM"}, "TCD": {"country": "Chad", "code": "TD"}, "GEO": {"country": "Georgia", "code": "GE"}, "MNE": {"country": "Montenegro", "code": "ME"}, "MNG": {"country": "Mongolia", "code": "MN"}, "MHL": {"country": "Marshall Islands", "code": "MH"}, "MTQ": {"country": "Martinique", "code": "MQ"}, "BLZ": {"country": "Belize", "code": "BZ"}, "NFK": {"country": "Norfolk Island", "code": "NF"}, "MMR": {"country": "Myanmar", "code": "MM"}, "AFG": {"country": "Afghanistan", "code": "AF"}, "BDI": {"country": "Burundi", "code": "BI"}, "VGB": {"country": "British Virgin Islands", "code": "VG"}, "BLR": {"country": "Belarus", "code": "BY"}, "BLM": {"country": "Saint Barthalemy", "code": "BL"}, "GRD": {"country": "Grenada", "code": "GD"}, "ALA": {"country": "Åland Islands", "code": "AX"}, "TKL": {"country": "Tokelau", "code": "TK"}, "GRC": {"country": "Greece", "code": "GR"}, "GRL": {"country": "Greenland", "code": "GL"}, "SHN": {"country": "Saint Helena", "code": "SH"}, "AND": {"country": "Andorra", "code": "AD"}, "MOZ": {"country": "Mozambique", "code": "MZ"}, "TJK": {"country": "Tajikistan", "code": "TJ"}, "THA": {"country": "Thailand", "code": "TH"}, "HTI": {"country": "Haiti", "code": "HT"}, "MEX": {"country": "Mexico", "code": "MX"}, "ZWE": {"country": "Zimbabwe", "code": "ZW"}, "LCA": {"country": "Saint Lucia", "code": "LC"}, "IND": {"country": "India", "code": "IN"}, "LVA": {"country": "Latvia", "code": "LV"}, "BTN": {"country": "Bhutan", "code": "BT"}, "VCT": {"country": "Saint Vincent and the Grenadines", "code": "VC"}, "VNM": {"country": "Viet Nam", "code": "VN"}, "NOR": {"country": "Norway", "code": "NO"}, "CZE": {"country": "Czech Republic", "code": "CZ"}, "ATF": {"country": "French Southern Territories", "code": "TF"}, "ATG": {"country": "Antigua and Barbuda", "code": "AG"}, "FJI": {"country": "Fiji", "code": "FJ"}, "IOT": {"country": "British Indian Ocean Territory", "code": "IO"}, "HND": {"country": "Honduras", "code": "HN"}, "MUS": {"country": "Mauritius", "code": "MU"}, "ATA": {"country": "Antarctica", "code": "AQ"}, "LUX": {"country": "Luxembourg", "code": "LU"}, "ISR": {"country": "Israel", "code": "IL"}, "FSM": {"country": "Micronesia, Federated States of", "code": "FM"}, "PER": {"country": "Peru", "code": "PE"}, "REU": {"country": "Réunion", "code": "RE"}, "IDN": {"country": "Indonesia", "code": "ID"}, "VUT": {"country": "Vanuatu", "code": "VU"}, "MKD": {"country": "Macedonia, the Former Yugoslav Republic of", "code": "MK"}, "COD": {"country": "Democratic Republic of the Congo", "code": "CD"}, "COG": {"country": "Congo", "code": "CG"}, "ISL": {"country": "Iceland", "code": "IS"}, "GLP": {"country": "Guadeloupe", "code": "GP"}, "ETH": {"country": "Ethiopia", "code": "ET"}, "COM": {"country": "Comoros", "code": "KM"}, "COL": {"country": "Colombia", "code": "CO"}, "NGA": {"country": "Nigeria", "code": "NG"}, "TLS": {"country": "Timor-Leste", "code": "TL"}, "TWN": {"country": "Taiwan, Province of China", "code": "TW"}, "PRT": {"country": "Portugal", "code": "PT"}, "MDA": {"country": "Moldova, Republic of", "code": "MD"}, "GGY": {"country": "Guernsey", "code": "GG"}, "MDG": {"country": "Madagascar", "code": "MG"}, "ECU": {"country": "Ecuador", "code": "EC"}, "SEN": {"country": "Senegal", "code": "SN"}, "ESH": {"country": "Western Sahara", "code": "EH"}, "MDV": {"country": "Maldives", "code": "MV"}, "ASM": {"country": "American Samoa", "code": "AS"}, "SPM": {"country": "Saint Pierre and Miquelon", "code": "PM"}, "CUW": {"country": "Curaçao", "code": "CW"}, "FRA": {"country": "France", "code": "FR"}, "LTU": {"country": "Lithuania", "code": "LT"}, "RWA": {"country": "Rwanda", "code": "RW"}, "ZMB": {"country": "Zambia", "code": "ZM"}, "GMB": {"country": "Gambia", "code": "GM"}, "WLF": {"country": "Wallis and Futuna", "code": "WF"}, "JEY": {"country": "Jersey", "code": "JE"}, "FRO": {"country": "Faroe Islands", "code": "FO"}, "GTM": {"country": "Guatemala", "code": "GT"}, "DNK": {"country": "Denmark", "code": "DK"}, "IMN": {"country": "Isle of Man", "code": "IM"}, "MAF": {"country": "Saint Martin (French part)", "code": "MF"}, "AUS": {"country": "Australia", "code": "AU"}, "AUT": {"country": "Austria", "code": "AT"}, "SJM": {"country": "Svalbard and Jan Mayen", "code": "SJ"}, "VEN": {"country": "Venezuela", "code": "VE"}, "PLW": {"country": "Palau", "code": "PW"}, "KEN": {"country": "Kenya", "code": "KE"}, "TUR": {"country": "Turkey", "code": "TR"}, "ALB": {"country": "Albania", "code": "AL"}, "OMN": {"country": "Oman", "code": "OM"}, "TUV": {"country": "Tuvalu", "code": "TV"}, "ITA": {"country": "Italy", "code": "IT"}, "BRN": {"country": "Brunei Darussalam", "code": "BN"}, "TUN": {"country": "Tunisia", "code": "TN"}, "RUS": {"country": "Russian Federation", "code": "RU"}, "BRB": {"country": "Barbados", "code": "BB"}, "BRA": {"country": "Brazil", "code": "BR"}, "CIV": {"country": "Côte d'Ivoire", "code": "CI"}, "SRB": {"country": "Serbia", "code": "RS"}, "GNQ": {"country": "Equatorial Guinea", "code": "GQ"}, "USA": {"country": "United States", "code": "US"}, "QAT": {"country": "Qatar", "code": "QA"}, "WSM": {"country": "Samoa", "code": "WS"}, "AZE": {"country": "Azerbaijan", "code": "AZ"}, "GNB": {"country": "Guinea-Bissau", "code": "GW"}, "SWZ": {"country": "Swaziland", "code": "SZ"}, "TON": {"country": "Tonga", "code": "TO"}, "CAN": {"country": "Canada", "code": "CA"}, "UKR": {"country": "Ukraine", "code": "UA"}, "KOR": {"country": "Korea, Republic of", "code": "KR"}, "AIA": {"country": "Anguilla", "code": "AI"}, "CAF": {"country": "Central African Republic", "code": "CF"}, "CHE": {"country": "Switzerland", "code": "CH"}, "CYP": {"country": "Cyprus", "code": "CY"}, "BIH": {"country": "Bosnia and Herzegovina", "code": "BA"}, "SGP": {"country": "Singapore", "code": "SG"}, "SGS": {"country": "South Georgia and the South Sandwich Islands", "code": "GS"}, "SOM": {"country": "Somalia", "code": "SO"}, "UZB": {"country": "Uzbekistan", "code": "UZ"}, "CMR": {"country": "Cameroon", "code": "CM"}, "POL": {"country": "Poland", "code": "PL"}, "KWT": {"country": "Kuwait", "code": "KW"}, "ERI": {"country": "Eritrea", "code": "ER"}, "GAB": {"country": "Gabon", "code": "GA"}, "CYM": {"country": "Cayman Islands", "code": "KY"}, "ARE": {"country": "United Arab Emirates", "code": "AE"}, "EST": {"country": "Estonia", "code": "EE"}, "MWI": {"country": "Malawi", "code": "MW"}, "ESP": {"country": "Spain", "code": "ES"}, "IRQ": {"country": "Iraq", "code": "IQ"}, "SLV": {"country": "El Salvador", "code": "SV"}, "MLI": {"country": "Mali", "code": "ML"}, "IRL": {"country": "Ireland", "code": "IE"}, "IRN": {"country": "Iran, Islamic Republic of", "code": "IR"}, "ABW": {"country": "Aruba", "code": "AW"}, "SLE": {"country": "Sierra Leone", "code": "SL"}, "PAN": {"country": "Panama", "code": "PA"}, "SDN": {"country": "Sudan", "code": "SD"}, "SLB": {"country": "Solomon Islands", "code": "SB"}, "NZL": {"country": "New Zealand", "code": "NZ"}, "MCO": {"country": "Monaco", "code": "MC"}, "JPN": {"country": "Japan", "code": "JP"}, "KGZ": {"country": "Kyrgyzstan", "code": "KG"}, "UGA": {"country": "Uganda", "code": "UG"}, "NCL": {"country": "New Caledonia", "code": "NC"}, "PNG": {"country": "Papua New Guinea", "code": "PG"}, "ARG": {"country": "Argentina", "code": "AR"}, "SWE": {"country": "Sweden", "code": "SE"}, "BHS": {"country": "Bahamas", "code": "BS"}, "BHR": {"country": "Bahrain", "code": "BH"}, "ARM": {"country": "Armenia", "code": "AM"}, "NRU": {"country": "Nauru", "code": "NR"}, "CUB": {"country": "Cuba", "code": "CU"}};





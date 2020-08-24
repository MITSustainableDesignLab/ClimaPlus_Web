$(document).ready(function() {

	var container = $('header').after($('<div/>').addClass('container main'));
	
	$('div.main').append($('<div/>').addClass('row').attr('id', 'chart'));
  	
	//d3.select('#chart').append('svg').attr("id", "psychChart").style({'width': '100%', 'height': '100%'});
	
	var chart = new psychrometricChart();
	//var data = d3.csv.parse(d3.select("#epw").text());
	//console.log(data);

	d3.text("data/USA_NY_New.York-J.F.Kennedy.Intl.AP.744860_TMY3.epw", function(data) {
		console.log('888888testinngggg')
		d3.select("#chart").datum(formatEpw(data)).call(chart);
	});

	$(window).resize(chart.resize);


});



  	
  






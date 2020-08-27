/* * * * * * * * * * * * * * * * * * * * * * * *

* * * * * * * * * * * * * * * * * * * * * * * * */
$("#Wind").addClass("active");

columns = ['N',"NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"]
var bincount = columns.length
var binsize = 360/bincount
angleS = -1*(binsize/2)
// console.log(WINDV)

function wrangleWind(WINDA, WINDV) {
  orient = []
  var b=0;
  remo = 0, test = []
  while (columns[b]){
    var i=0;
    var count = 0, v_1 = 0, v_2 = 0, v_3 = 0, v_4 = 0, v_5 = 0, v_6 = 0, v_7 = 0, v_8 = 0;
    var a_s = binsize*b+angleS 
    var a_e = binsize*(b+1)+angleS
    var a_s_ = 360+angleS
    while (i<WINDA.length) { 
      if ((a_s < 0) && ((WINDA[i] <= a_e) || (WINDA[i] >= a_s_))){
        count += 1;
        if (WINDV[i]<1){v_1+=1;}
        else if (WINDV[i]<2){ v_2+=1}
          else if (WINDV[i]<3){ v_3+=1}
            else if (WINDV[i]<4){ v_4+=1}
              else if (WINDV[i]<5){ v_5+=1}
                else if (WINDV[i]<6){ v_6+=1}
                  else if (WINDV[i]<7){ v_7+=1}
                    else { v_8+=1}
      }
      else if ((WINDA[i] <= a_e) && (WINDA[i] >= a_s)){
        count += 1;
        if (WINDV[i]<1){v_1+=1;}
        else if (WINDV[i]<2){ v_2+=1}
          else if (WINDV[i]<3){ v_3+=1}
            else if (WINDV[i]<4){ v_4+=1}
              else if (WINDV[i]<5){ v_5+=1}
                else if (WINDV[i]<6){ v_6+=1}
                  else if (WINDV[i]<7){ v_7+=1}
                    else { v_8+=1}
      }
     
      i++;}
    orient["columns"] = [ "angle", "0-1", "1-2", "2-3", "3-4", "4-5", "5-6", "6-7", "7+" ]
    orient[b]={}
    orient[b]['angle']=columns[b];
    orient[b]['total']=(count*100/WINDA.length);
    orient[b]['0-1']=+((v_1*100/WINDA.length).toFixed(1));
    orient[b]['1-2']=+((v_2*100/WINDA.length).toFixed(1));
    orient[b]['2-3']=+((v_3*100/WINDA.length).toFixed(1));
    orient[b]['3-4']=+((v_4*100/WINDA.length).toFixed(1));
    orient[b]['4-5']=+((v_5*100/WINDA.length).toFixed(1));
    orient[b]['5-6']=+((v_6*100/WINDA.length).toFixed(1));
    orient[b]['6-7']=+((v_7*100/WINDA.length).toFixed(1));
    orient[b]['7+']=+((v_8*100/WINDA.length).toFixed(1));
    remo+=orient[b]['total']
    // console.log(v_1,v_2,v_3,v_4,v_5,v_6,v_7,v_8);
    b++
  }  return (orient)
}

//// place svg canvas into main
//var margin = {top: -30, right: 100, bottom: 18, left: 36},
//    width = (400*1.2) - margin.left - margin.right,
//    height = (300*1.2) - margin.top - margin.bottom;
//
//var svg = d3.select("#svgwindrose")
//    .append("svg")
//    .attr("width", width + margin.left + margin.right + 10)
//    .attr("height", height + margin.top + margin.bottom +20)
//  // .append("g")
//  //   .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
//
//
//    innerRadius = 20,
//    chartWidth = width - margin.left - margin.right,
//    chartHeight= height - margin.top - margin.bottom,
//    // outerRadius = (Math.min(chartWidth, chartHeight) / 2),
//    outerRadius = 150
//    g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
//
//    var angle = d3.scaleLinear()
//        .range([0, 2 * Math.PI]);
//
//    var radius = d3.scaleLinear()
//        .range([innerRadius, outerRadius]);
//
//    var x = d3.scaleBand()
//        .range([0, 2 * Math.PI])
//        .align(0);
//
//    var y = d3.scaleLinear() //you can try scaleRadial but it scales differently
//        .range([innerRadius, outerRadius]);
//
//    var z = d3.scaleOrdinal()
//        .range(["#4242f4", "#42c5f4", "#42f4ce", "#42f456", "#adf442", "#f4e242", "#f4a142", "#f44242"]);


    // d3.csv("/static/dataWind_.csv",processRow).then(processData)
      
    //   function processRow (d, i, columns) {
    //     for (i = 1, t = 0; i < columns.length; ++i) t += d[columns[i]] = +d[columns[i]];
    //     d.total = t;
    //     return d;
    // } 

  function processData(data) {
    // place svg canvas into main
var margin = {top: -30, right: 100, bottom: 18, left: 36},
    width = (400*1.2) - margin.left - margin.right,
    height = (300*1.2) - margin.top - margin.bottom;

var svg = d3.select("#svgwindrose")
    .append("svg")
    .attr("width", width + margin.left + margin.right + 10)
    .attr("height", height + margin.top + margin.bottom +20)
  // .append("g")
  //   .attr("transform", "translate(" + margin.left + "," + margin.top + ")")


    innerRadius = 20,
    chartWidth = width - margin.left - margin.right,
    chartHeight= height - margin.top - margin.bottom,
    // outerRadius = (Math.min(chartWidth, chartHeight) / 2),
    outerRadius = 150
    g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var angle = d3.scaleLinear()
        .range([0, 2 * Math.PI]);

    var radius = d3.scaleLinear()
        .range([innerRadius, outerRadius]);

    var x = d3.scaleBand()
        .range([0, 2 * Math.PI])
        .align(0);

    var y = d3.scaleLinear() //you can try scaleRadial but it scales differently
        .range([innerRadius, outerRadius]);

    var z = d3.scaleOrdinal()
        .range(["#4242f4", "#42c5f4", "#42f4ce", "#42f456", "#adf442", "#f4e242", "#f4a142", "#f44242"]);

    x.domain(data.map(function(d) {
      return d.angle; }));
    y.domain([0, d3.max(data, function(d) { return d.total; })]);
    z.domain(data.columns.slice(1));
    // Extend the domain slightly to match the range of [0, 2π].
    angle.domain([0, d3.max(data, function(d,i) { return i + 1; })]);
    radius.domain([0, d3.max(data, function(d) { return d.y0 + d.y; })]);
    angleOffset = -360.0/data.length/2.0;

    g.append("g")
        .selectAll("g")
        .data(d3.stack().keys(data.columns.slice(1))(data))
        .enter().append("g")
        .attr("fill", function(d) { return z(d.key); })
        .selectAll("path")
        .data(function(d) { return d; })
        .enter().append("path")
        .attr("d", d3.arc()
            .innerRadius(function(d) { return y(d[0]); })
            .outerRadius(function(d) { return y(d[1]); })
            .startAngle(function(d) { return x(d.data.angle); })
            .endAngle(function(d) { return x(d.data.angle) + x.bandwidth(); })
            .padAngle(0.01)
            .padRadius(innerRadius))
        .attr("transform", function() {return "rotate("+ angleOffset + ")"});

    var label = g.append("g")
        .selectAll("g")
        .data(data)
        .enter().append("g")
        .attr("text-anchor", "middle")
        .attr("transform", function(d) { return "rotate(" + ((x(d.angle) + x.bandwidth() / 2) * 180 / Math.PI - (90-angleOffset)) + ")translate(" + (outerRadius+30) + ",0)"; });

    label.append("text")
        .attr("transform", function(d) { return (x(d.angle) + x.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI ? "rotate(90)translate(0,16)" : "rotate(-90)translate(0,-9)"; })
        .text(function(d) { return d.angle; })
        .style("font-size",10);

    g.selectAll(".axis")
        .data(d3.range(angle.domain()[1]))
        .enter().append("g")
        .attr("class", "axis")
        .attr("transform", function(d) { return "rotate(" + angle(d) * 180 / Math.PI + ")"; })
        .call(d3.axisLeft()
            .scale(radius.copy().range([-innerRadius, -(outerRadius+10)])));

    var yAxis = g.append("g")
        .attr("text-anchor", "middle");

    var yTick = yAxis
        .selectAll("g")
        .data(y.ticks(5).slice(1))
        .enter().append("g");

    yTick.append("circle")
        .attr("fill", "none")
        .attr("stroke", "gray")
        .attr("stroke-dasharray", "4,4")
        .attr("r", y);

    yTick.append("text")
        .attr("y", function(d) { return -y(d); })
        .attr("dy", "-0.35em")
        .attr("x", function() { return -10; })
        .text(y.tickFormat(5, "s"))
        .style("font-size",10);


    var legend = g.append("g")
        .selectAll("g")
        .data(data.columns.slice(1).reverse())
        .enter().append("g")
//            .attr("transform", function(d, i) { return "translate(-40," + (i - (data.columns.length - 1) / 2) * 20 + ")"; });
        .attr("transform", function(d, i) { return "translate(" + (outerRadius+30) + "," + (-outerRadius + 40 +(i - (data.columns.length - 1) / 2) * 15) + ")"; });

    legend.append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", z);

    // legend.append("text")
    //     .attr("x", 24)
    //     .attr("y", 9)
    //     .attr("dy", "0.35em")
    //     .text(function(d) { return d; })
    //     .style("font-size",12);

    legend.append("text")
        .attr("x", 30)
        .attr("y", 5)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .style("font-size","10px")
        .style("font-color","grey")
        .text(function(d) { return d;})

}
      
WINDA_ = WINDA.slice(WC_START,WC_END)
WINDV_ = WINDV.slice(WC_START,WC_END)
// console.log(WINDV_)
// console.log(WINDA_)
data = wrangleWind(WINDA_,WINDV_);
processData(data)
// console.log(data.columns)

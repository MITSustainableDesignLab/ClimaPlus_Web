
//  var sldrs = [0, 23, 0, 11];
  function sliders(sldrs, state1, state2, WC_START, WC_END) {
    WINDA_ = WINDA.slice(WC_START,WC_END)
    WINDV_ = WINDV.slice(WC_START,WC_END)
    var hrdata = [0, 5, 11, 18, 23];
      if (state1 == false) {
          var fcolor1 = '#ff4501';
          var bcolor1 = '#eee';
        }else{
            var fcolor1 = '#eee';
            var bcolor1 = '#ff4501';
        }
      // Hour slider
      var hsliderRange = d3
        .sliderBottom()
        .min(d3.min(hrdata))
        .max(d3.max(hrdata))
        .width(350)
        .tickValues([0, 5, 11, 17, 23])
        .tickFormat(function(d) {
                            var suffix = ((d + 1) >= 12 && d != 23)? " PM": " AM";
                            return ((d + 12) % 12 + 1) + suffix;
                        })
        .ticks(5)
        .step(1)
        .default([sldrs[0], sldrs[1]])
        .fill(fcolor1)
        .background(bcolor1)
        .on('onchange', val => {
            var svg = d3.select('#svgwindrose');
            svg.selectAll("*").remove();
            sldrs[0] = val[0];
            sldrs[1] = val[1];
            var WCs = findDates(sldrs, state1, state2, WINDA, WINDV);
            data = wrangleWind(WCs[0],WCs[1]);
            processData(data);
        });

      var hgRange = d3
        .select('div#h2slider-range')
        .append('svg')
        .attr('width', 500)
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(30,30)');


      hgRange.call(hsliderRange);

      if (state2 == false) {
              var fcolor2 = '#ff4501';
              var bcolor2 = '#eee';
            }else{
                var fcolor2 = '#eee';
                var bcolor2 = '#ff4501';
            }
           var mdata = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ,10, 11]
           var monthAbb = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          var msliderRange = d3
            .sliderBottom()
            .min(d3.min(mdata))
            .max(d3.max(mdata))
            .width(350)
            .tickValues([0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ,10, 11])
            .tickFormat(function(d) {
                    return monthAbb[d];
                })
            .ticks(5)
            .step(1)
            .default([sldrs[2], sldrs[3]])
            .fill(fcolor2)
            .background(bcolor2)
            .on('onchange', val => {
                var svg = d3.select('#svgwindrose');
                svg.selectAll("*").remove();
                sldrs[2] = val[0];
                sldrs[3] = val[1];
                var WCs = findDates(sldrs, state1, state2, WINDA, WINDV);
                data = wrangleWind(WCs[0],WCs[1]);
                processData(data);
            });

          var mgRange = d3
            .select('div#m2slider-range')
            .append('svg')
            .attr('width', 500)
            .attr('height', 100)
            .append('g')
            .attr('transform', 'translate(30,30)');


          mgRange.call(msliderRange);

  }
function findDates(sldrs, inverth, invertm, WINDA ,WINDV){
    var WINDA_ = [];
    var WINDV_ = [];
//    console.log("INSIDE")
//    console.log(sldrs)
    if (inverth){
        if (invertm){
            for (d=0; d<8760; d++){
                month= parseInt(d/730.001);
                if ((sldrs[2]>=month || month>=sldrs[3])){
                    var days = parseInt(d/24)
                    START = sldrs[0] + days*24;
                    END = sldrs[1] + days*24;
                    if(START<=d && d<=END){
                        WINDA_.push(WINDA[d]);
                        WINDV_.push(WINDV[d]);
    //                    console.log("added");
                    }
                }
            }
//            console.log(WINDA_)
            return [WINDA_, WINDV_];

        }else{
            for (d=0; d<8760; d++){
                month = parseInt(d/730.001);
                if (sldrs[2] <= month && month <= sldrs[3]){
                    var days = parseInt(d/24)
                    START = sldrs[0] + days*24;
                    END = sldrs[1] + days*24;
                      if(START<=d && d<=END){
                        WINDA_.push(WINDA[d]);
                        WINDV_.push(WINDV[d]);
    //                    console.log("added");
                    }
                }
            }
//            console.log(WINDV_)
            return [WINDA_, WINDV_];
        }
    }else{
        if (invertm){
            for (d=0; d<8760; d++){
                month= parseInt(d/730.001);
                if ((sldrs[2]>=month || month>=sldrs[3])){
                    var days = parseInt(d/24)
                    START = sldrs[0] + days*24;
                    END = sldrs[1] + days*24;
                    if(d<=START || d>=END){
                        WINDA_.push(WINDA[d]);
                        WINDV_.push(WINDV[d]);
    //                    console.log("added");
                    }
                }
            }
//            console.log(WINDA_)
            return [WINDA_, WINDV_];

        }else{
            for (d=0; d<8760; d++){
                month = parseInt(d/730.001);
                if (sldrs[2] <= month && month <= sldrs[3]){
                    var days = parseInt(d/24)
                    START = sldrs[0] + days*24;
                    END = sldrs[1] + days*24;
                      if(d<=START || d>=END){
                        WINDA_.push(WINDA[d]);
                        WINDV_.push(WINDV[d]);
    //                    console.log("added");
                    }
                }
            }
//            console.log(WINDV_)
            return [WINDA_, WINDV_];

    }
   }
}
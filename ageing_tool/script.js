if (Modernizr.svg) {

  var graphic = d3.selectAll('#graphic');
  var selectedColour;
  var hoverColour = "blue";
  var x_key;
  var previousArea;
  var listValues;
  var valueColourPairs =[];
  var selected=[];
  var hover = [];
  var unusedColours = ["#a6cee3","#1f78b4","#b2df8a","#33a02c"];
  var filter;
  var legendVarName;
  var data;

  //setup pymjs
  var pymChild = new pym.Child();
  pymChild.sendHeight();

  d3.json("https://api.cmd-dev.onsdigital.co.uk/v1/datasets/ageing-population-projections").then(function(latest_data) {
    console.log(latest_data.links.latest_version.href + "/observations?time=2018%20-%20Population%20estimate&geography=*&sex=all&agegroups=old-age-dependancy-ratio");
    var latest_link = latest_data.links.latest_version.href;

    Promise.all([
      d3.json(latest_link + "/observations?time=2018%20-%20Population%20estimate&geography=*&sex=all&agegroups=old-age-dependancy-ratio"),
      d3.json(latest_link + "/observations?time=2018%20-%20Population%20estimate&geography=*&sex=all&agegroups=16-spa"),
      d3.json(latest_link + "/observations?time=2018%20-%20Population%20estimate&geography=*&sex=all&agegroups=spa%2B"),
      d3.json(latest_link + "/observations?time=2018%20-%20Population%20estimate&geography=*&sex=all&agegroups=16-64"),
      d3.json(latest_link + "/observations?time=2018%20-%20Population%20estimate&geography=*&sex=all&agegroups=0-15"),
      d3.json(latest_link + "/observations?time=2018%20-%20Population%20estimate&geography=*&sex=all&agegroups=85%2B"),
      d3.json(latest_link + "/observations?time=2018%20-%20Population%20estimate&geography=*&sex=all&agegroups=65%2B")

    ]).then(function(data) {
      ready(data)
    });

  })

  // Promise.all([
  //   d3.json("https://api.cmd-dev.onsdigital.co.uk/v1/datasets/ageing-population-projections/editions/time-series/versions/1/observations?time=2017&geography=*&sex=male&agegroups=old-age-dependancy-ratio"),
  //   d3.json("https://api.cmd-dev.onsdigital.co.uk/v1/datasets/ageing-population-projections/editions/time-series/versions/1/observations?time=2017&geography=*&sex=male&agegroups=16-spa"),
  //   d3.json("https://api.cmd-dev.onsdigital.co.uk/v1/datasets/ageing-population-projections/editions/time-series/versions/1/observations?time=2017&geography=*&sex=male&agegroups=spa%2B"),
  //   d3.json("https://api.cmd-dev.onsdigital.co.uk/v1/datasets/ageing-population-projections/editions/time-series/versions/1/observations?time=2017&geography=*&sex=male&agegroups=16-64"),
  //   d3.json("https://api.cmd-dev.onsdigital.co.uk/v1/datasets/ageing-population-projections/editions/time-series/versions/1/observations?time=2017&geography=*&sex=male&agegroups=0-15"),
  //   d3.json("https://api.cmd-dev.onsdigital.co.uk/v1/datasets/ageing-population-projections/editions/time-series/versions/1/observations?time=2017&geography=*&sex=male&agegroups=85%2B"),
  //   d3.json("https://api.cmd-dev.onsdigital.co.uk/v1/datasets/ageing-population-projections/editions/time-series/versions/1/observations?time=2017&geography=*&sex=male&agegroups=65%2B")
  //
  // ]).then(function(data) {
  //   ready(data)
  // });

  function ready(data) {

    var oldLA = [
      "Waveney", "Bournemouth", "West Somerset", "Poole", "Forest Heath", "Purbeck", "North Dorset", "Taunton Deane", "West Dorset",
      "Glasgow City", "Suffolk Coastal", "Christchurch", "East Dorset", "North Lanarkshire", "Perth and Kinross", "Fife", "Weymouth and Portland", "St Edmundsbury"
    ];



    // reorganise the data
    var names = [];

    var clean_data=[];

    data.forEach(function(d,i) {
      var group = d.dimensions.agegroups.option.id;
      names.push(group)
      d.observations.forEach(function(d,i) {
        clean_data.push({ 'id':d.dimensions.geography.id, 'label':d.dimensions.geography.label, 'value':+d.observation, 'group':group })
      })
    });



    // // filter out the blank observations - pre 2019 boundaries/areas
    oldLA.forEach(function(d,i) {
      clean_data = clean_data.filter(function(item) {
        if(item.label !== d) {
          return item;
        }
      })
    })

    // clear the dropdown
    d3.select("#selectNav").selectAll("*").remove();
    // Build option menu for occupations
    var optns = d3.select("#selectNav")
      .append("div")
      .attr("id","sel")
      // .attr("style","padding-left:2%")
      .append("select")
      .attr("id","areaselect")
      .attr('multiple', 'true')
      .attr("style", function(d,i){
        if(parseInt(graphic.style("width")) <580){
          return "width:99%"
        } else {
          return "width:300px"
        }
      })
      .attr("class","chosen-select");

    var dropdownData = clean_data.filter(function(v,i,a){return a.findIndex(function(t){return t.id === v.id})===i});

    optns.selectAll("p")
      .data(dropdownData)
      .enter()
      .append("option")
      .attr("value", function(d){ return d.id })
      .text(function(d){ return d.label });

    $('#areaselect').chosen({
      placeholder_text_single: "Choose an area",
      allow_single_deselect:true,
      max_selected_options: 3
    })
    .on('change',function(evt,params){
      if(Object.keys(params)[0] === 'selected') {
        //if add an options
        selected.push(params.selected)
        //if remove an option

        // do .pop()

        valueColourPairs.push({"value":params.selected,"colour":unusedColours[0]})
        unusedColours.shift()
        hoverColour = unusedColours[0];

        d3.selectAll(".search-choice")
        .data(selected)
        .join()
        .style("background-color",function(d){
          return valueColourPairs.filter(function(e){return e.value==d})[0].colour
        });

        selectedColour = valueColourPairs.filter(function(d){ return d.value===params.selected })[0].colour;
        highlight(params.selected)
        filter = ['match', ['get', 'AREACD'], selected, true, false]
        map.setFilter('state-fills-hover',filter)
      } else {
        // delete deselected item from selected array
        selected = selected.filter(function(item) {
          return item !== params.deselected;
        });
        // push the colour associated with the value to the beginning of the unusedColours array
        unusedColours.unshift(valueColourPairs.filter(function(d){ return d.value===params.deselected })[0].colour)
        if(unusedColours.length === 4) {
          unusedColours = ["#a6cee3","#1f78b4","#b2df8a","#33a02c"];
        }
        hoverColour = unusedColours[0];

        if(selected.length > 0) {
          filter = ['match', ['get', 'AREACD'], selected, true, false]
          map.setFilter('state-fills-hover',filter)

        } else {
          map.setFilter("state-fills-hover", ["==", "AREACD", ""]);
        }

        // delete the entry from value colour pairs
        valueColourPairs = valueColourPairs.filter(function(d) {
          return d.value !== params.deselected
        });

        unhighlight(params.deselected);
      }
    })

    //headers for each chart
    var headers = d3.select('#graphic').selectAll('div')
      .data(names)
      .enter()
      .append('div')
      .attr('class', 'col-xl-6 col-lg-6 col-sm-12 col-xs-12 barcode')
      .attr('id', function(d,i) {
        return 'category-' + d.replace('+','') + '-category';
      })
      .append('div')
      .attr('class', 'chartTitle')
      .append('div')
      .style('display', 'inline-block')
      // .append('p')
      .html(function(d,i) {
        return d
      })

    // map buton for each category
    d3.selectAll('.chartTitle')
      .data(names)
      .append('div')
      .style('display', 'inline-block')
      .style('float', 'right')
      .append('button')
      .attr('class', "btn btn--primary")
      .attr('value', function(d) {
        return d;
      })
      .append('img')
      .attr('src', 'lib/uk.svg')
      .attr('width', '30px')

    d3.json('lib/config.json').then(function(config_data) {
      drawGraphic(clean_data, names, config_data)
    });

  } // end of ready

  function drawGraphic(chart_data, categories, config) {

    dvc = config;

    var threshold_md = 788;
    var threshold_sm = dvc.optional.mobileBreakpoint;

      //set variables for chart dimensions dependent on width of #graphic
     if (parseInt(graphic.style("width")) < threshold_sm) {
         var margin = {top: dvc.optional.margin_sm[0], right: dvc.optional.margin_sm[1], bottom: dvc.optional.margin_sm[2], left: dvc.optional.margin_sm[3]};
         var chart_width = parseInt(graphic.style("width")) - margin.left - margin.right;
         var height = dvc.essential.barHeight_sm_md_lg[0] +0 - margin.top - margin.bottom;
     } else if (parseInt(graphic.style("width")) < threshold_md){
         var margin = {top: dvc.optional.margin_md[0], right: dvc.optional.margin_md[1], bottom: dvc.optional.margin_md[2], left: dvc.optional.margin_md[3]};
         var chart_width = parseInt(graphic.style("width")) - margin.left - margin.right;
         var height = dvc.essential.barHeight_sm_md_lg[0] +0 - margin.top - margin.bottom;
     } else {
         var margin = {top: dvc.optional.margin_lg[0], right: dvc.optional.margin_lg[1], bottom: dvc.optional.margin_lg[2], left: dvc.optional.margin_lg[3]}
         var chart_width = parseInt(graphic.style("width")) - margin.left - margin.right;
         var height = dvc.essential.barHeight_sm_md_lg[0] +0 - margin.top - margin.bottom;
     }

     var barcode_width = parseInt(d3.select('.barcode').style("width"))

     var x = d3.scaleLinear()
       .range([ 0, barcode_width-margin.left - margin.right]);

     var xAxis = d3.axisBottom()
       .scale(x)

    categories.forEach(function(d,i) {
      var category = d
      var graphic_data = chart_data.filter(function(d) {
        return d.group === category;
      })
      category = d.replace('+','');
      // find maximum as they cannot have same domain
      var max = d3.max(graphic_data, function(d) { return +d.value; });

      var min = d3.min(graphic_data, function(d) { return +d.value; });

      x.domain([min,max]).nice();

      var svg = d3.select("#category-" + category + '-category').append('svg')
        .attr("class","chart")
        .style("background-color","#fff")
        .attr("width", barcode_width)
        .attr("height", height + margin.top + margin.bottom )

      var g = svg
        .append("g")
        .attr("transform", "translate(" + 0 + "," + margin.top + ")");

      g.append('g').attr("class","bars")
        .selectAll('rect')
        .data(graphic_data)
        .enter()
        .append('rect')
        .attr("fill","#323132")
        .attr("class",function(d,i){ return d.id })
        // .attr("id",function(d,i){
        //   return d.AREACD
        // })
        .attr("stroke-width",10)
        .attr("stroke","rgba(1,1,1,0)")
        .attr("opacity","0.4")
        .attr("width", 1)
        .attr("x", function(d){
          if(d.value !="null"){
            return x(d.value);
          }
        })
        .style("display", function(d){
          if(d[name] =="null"){
            return "none";
          }
        })
        .attr("y",0)
        .attr("height", 30)

      //Appends the x axis
      var xAxisGroup = g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

      // voronoi
      var voronoi = d3.voronoi()
        .x(function(d) { return x(d.value) })
        .y(function(d) { return 0 })
        .extent([
          [-margin.left, -margin.top],
          [barcode_width + margin.right, height + margin.bottom]
        ]);

      var voronoiGroup = g.append('g')
        .attr('class', 'voronoi');

      voronoiGroup.selectAll('path')
        .data(voronoi.polygons((graphic_data.map(function(d) { return d }))))
        .enter().append("path")
        .attr("d", function(d) { return d ? "M" + d.join("L") + "Z" : null; })
        .on("mouseover", function(d) {
          if(d3.selectAll("."+d.data.id).classed("active") === false && selected.length < 4) {
            onMove(d.data.id)
          }
        })
        .on("mouseout", function(d) {mouseout(d.data.id)})
        .on("click", function(d) {onClick(d.data.id)});

    }) // end of forEach loop

    d3.json('lib/geog2019.json').then(function(geog) {
      drawMap(chart_data, dvc, geog)
    });

    function drawMap(graphic_data, dvc, geog) {

      data = chart_data.filter(function(d) {
        return d.group === "old-age-dependancy-ratio";
      });

      //Set up global variables
      dvc = dvc.map.ons;
      oldAREACD = "";
      firsthover = true;

      //get column name
      for (var column in data[0]) {
        if (column == 'id') continue;
        if (column == 'label') continue;
        if (column == 'group') continue;
        dvc.varname = column;
      }

      //set title of page
      //Need to test that this shows up in GA
      document.title = dvc.maptitle;

      //Fire design functions
      // selectlist(data);

      //Set up number formats
      displayformat = d3.format("." + dvc.displaydecimals + "f");
      legendformat = d3.format("." + dvc.legenddecimals + "f");

      //set up basemap
      map = new mapboxgl.Map({
        container: 'map', // container id
        style: 'lib/style.json', //stylesheet location
        center: [-2.5, 54], // starting position
        zoom: 4.5, // starting zoom
        maxZoom: 13, //
        attributionControl: false
      });
      //add fullscreen option
      map.addControl(new mapboxgl.FullscreenControl());

      // Add zoom and rotation controls to the map.
      map.addControl(new mapboxgl.NavigationControl());

      // Disable map rotation using right click + drag
      map.dragRotate.disable();

      // Disable map rotation using touch rotation gesture
      map.touchZoomRotate.disableRotation();

      // Add geolocation controls to the map.
      map.addControl(new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        }
      }));

      //add compact attribution
      map.addControl(new mapboxgl.AttributionControl({
        compact: true
      }));

      // addFullscreen();

      // updateLayers()

      function defineBreaks() {
        //set up d3 color scales

        rateById = {};
        areaById = {};

        data.forEach(function(d) {rateById[d.id] = +eval("d." + dvc.varname); areaById[d.id] = d.label});

        //Flatten data values and work out breaks
        var values =  data.map(function(d) { return +eval("d." + dvc.varname); }).filter(function(d) {return !isNaN(d)}).sort(d3.ascending);

        if(dvc.breaks =="jenks") {
          breaks = [];

          ss.ckmeans(values, (dvc.numberBreaks)).map(function(cluster,i) {
            if(i<dvc.numberBreaks-1) {
              breaks.push(cluster[0]);
            } else {
              breaks.push(cluster[0])
              //if the last cluster take the last max value
              breaks.push(cluster[cluster.length-1]);
            }
          });
        }
        else if (dvc.breaks == "equal") {
          breaks = ss.equalIntervalBreaks(values, dvc.numberBreaks);
        }
        else {breaks = dvc.breaks;};

        //round breaks to specified decimal places
        breaks = breaks.map(function(each_element){
          return Number(each_element.toFixed(dvc.legenddecimals));
        });
        //work out halfway point (for no data position)
        midpoint = breaks[0] + ((breaks[dvc.numberBreaks] - breaks[0])/2)
      }

      function setupScales() {
        //Load colours
        if(typeof dvc.varcolour === 'string') {
          // colour = colorbrewer[dvc.varcolour][dvc.numberBreaks];
          color=chroma.scale(dvc.varcolour).colors(dvc.numberBreaks)
          colour=[]
          color.forEach(function(d){colour.push(chroma(d).darken(0.4).saturate(0.6).hex())})
        } else {
          colour = dvc.varcolour;
        }

        //set up d3 color scales
        color = d3.scaleThreshold()
            .domain(breaks.slice(1))
            .range(colour);
      }

      function updateLayers() {

        //update properties to the geojson based on the csv file we've read in
        areas.features.map(function(d,i) {
           if(!isNaN(rateById[d.properties.AREACD]))
            {d.properties.fill = color(rateById[d.properties.AREACD])}
           else {d.properties.fill = '#ccc'};

        });

        //Reattach geojson data to area layer
        map.getSource('area').setData(areas);

        //set up style object
        styleObject = {
                    type: 'identity',
                    property: 'fill'
              }
        //repaint area layer map usign the styles above
        map.setPaintProperty('area', 'fill-color', styleObject);

      }


      //now ranges are set we can call draw the key
      defineBreaks()
      setupScales()
      createKey(config);

      //convert topojson to geojson
      for(key in geog.objects){
        var areas = topojson.feature(geog, geog.objects[key])
      }

      //Work out extend of loaded geography file so we can set map to fit total extent
      bounds = turf.extent(areas);

      //set map to total extent
      setTimeout(function(){
        map.fitBounds([[bounds[0],bounds[1]], [bounds[2], bounds[3]]])
      },1000);

      //and add properties to the geojson based on the csv file we've read in
      areas.features.map(function(d,i) {
        d.properties.fill = color(rateById[d.properties.AREACD])
      });

      map.on('load', function() {

        map.addSource('area', { 'type': 'geojson', 'data': areas });

          map.addLayer({
            'id': 'area',
            'type': 'fill',
            'source': 'area',
            'layout': {},
            'paint': {
              'fill-color': {
                type: 'identity',
                property: 'fill',
               },
              'fill-opacity': 0.7,
              'fill-outline-color': '#fff'
            }
          });

        //Get current year for copyright
        today = new Date();
        copyYear = today.getFullYear();
        map.style.sourceCaches['area']._source.attribution = "Contains OS data &copy; Crown copyright and database right " + copyYear;

        map.addLayer({
          "id": "state-fills-hover",
          "type": "line",
          "source": "area",
          "layout": {},
          "paint": {
            "line-color": "#000",
            "line-width": 2
          },
          "filter": ["==", "AREACD", ""]
        });

          map.addLayer({
            'id': 'area_labels',
            'type': 'symbol',
            'source': 'area',
            'minzoom': 10,
            'layout': {
              "text-field": '{AREANM}',
              "text-font": ["Open Sans","Arial Unicode MS Regular"],
              "text-size": 14
            },
            'paint': {
              "text-color": "#666",
              "text-halo-color": "#fff",
              "text-halo-width": 1,
              "text-halo-blur": 1
            }
          });

        //test whether ie or not
        function detectIE() {
          var ua = window.navigator.userAgent;

          // Test values; Uncomment to check result …

          // IE 10
          // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';

          // IE 11
          // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';

          // Edge 12 (Spartan)
          // ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';

          // Edge 13
          // ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586';

          var msie = ua.indexOf('MSIE ');
          if (msie > 0) {
          // IE 10 or older => return version number
          return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
          }

          var trident = ua.indexOf('Trident/');
          if (trident > 0) {
          // IE 11 => return version number
          var rv = ua.indexOf('rv:');
          return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
          }

          var edge = ua.indexOf('Edge/');
          if (edge > 0) {
          // Edge (IE 12+) => return version number
          return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
          }

          // other browser
          return false;
        }

        if(detectIE()){
          onMove = onMove.debounce(100);
          onLeave = onLeave.debounce(100);
        };

        //Highlight stroke on mouseover (and show area information)

        map.on("mousemove", "area", function(d) {
          if(d3.selectAll("."+d.features[0].properties.AREACD).classed("active") === false && selected.length < 4) {
            if(previousArea !== d.features[0].properties.AREACD) {
              onMove(d.features[0].properties.AREACD)
            }
          }
        });
        //
        // // Reset the state-fills-hover layer's filter when the mouse leaves the layer.
        map.on("mouseleave", "area", onLeave);
        //
        // //Add click event
        map.on("click", "area", function(d) {onClick(d.features[0].properties.AREACD)});

        //get location on click
        // d3.select(".mapboxgl-ctrl-geolocate").on("click",geolocate);

      });


      function selectArea(code) {
        $("#areaselect").val(code).trigger("chosen:updated");
      }

      $('#areaselect').on('select2:unselect', function () {
              dataLayer.push({
                  'event': 'deselectCross',
                  'selected': 'deselect'
              })
      });

      function zoomToArea(code) {

        specificpolygon = areas.features.filter(function(d) {return d.properties.AREACD == code})

        specific = turf.extent(specificpolygon[0].geometry);

        map.fitBounds([[specific[0],specific[1]], [specific[2], specific[3]]], {
            padding: {top: 150, bottom:150, left: 100, right: 100}
        });

      }

      function resetZoom() {

        map.fitBounds([[bounds[0], bounds[1]], [bounds[2], bounds[3]]]);

      }


      function createKey(config){

        d3.select("#keydiv").selectAll("*").remove();

        keywidth = d3.select("#keydiv").node().getBoundingClientRect().width;

        var svgkey = d3.select("#keydiv")
          .append("svg")
          .attr("id", "key")
          .attr("width", keywidth)
          .attr("height",65);


        var color = d3.scaleThreshold()
           .domain(breaks)
           .range(colour);

        // Set up scales for legend
        x_key = d3.scaleLinear()
          .domain([breaks[0], breaks[dvc.numberBreaks]]) /*range for data*/
          .range([0,keywidth-30]); /*range for pixels*/


        var xAxis = d3.axisBottom(x_key)
          .tickSize(15)
          .tickValues(color.domain())
          .tickFormat(legendformat);

        var g2 = svgkey.append("g").attr("id","horiz")
          .attr("transform", "translate(15,30)");


        keyhor = d3.select("#horiz");

        g2.selectAll("rect")
          .data(color.range().map(function(d,i) {

            return {
            x0: i ? x_key(color.domain()[i+1]) : x_key.range()[0],
            x1: i < color.domain().length ? x_key(color.domain()[i+1]) : x_key.range()[1],
            z: d
            };
          }))
          .enter().append("rect")
          .attr("class", "blocks")
          .attr("height", 8)
          .attr("x", function(d) {
             return d.x0; })
          .attr("width", function(d) {return d.x1 - d.x0; })
          .style("opacity",0.8)
          .style("fill", function(d) { return d.z; });


        g2.append("line")
          .attr("id", "currLine")
          .attr("x1", x_key(10))
          .attr("x2", x_key(10))
          .attr("y1", -10)
          .attr("y2", 8)
          .attr("stroke-width","2px")
          .attr("stroke","#000")
          .attr("opacity",0);

        g2.append("text")
          .attr("id", "currVal")
          .attr("x", x_key(10))
          .attr("y", -15)
          .attr("fill","#000")
          .text("");



        keyhor.selectAll("rect")
          .data(color.range().map(function(d, i) {
            return {
            x0: i ? x_key(color.domain()[i]) : x_key.range()[0],
            x1: i < color.domain().length ? x_key(color.domain()[i+1]) : x_key.range()[1],
            z: d
            };
          }))
          .attr("x", function(d) { return d.x0; })
          .attr("width", function(d) { return d.x1 - d.x0; })
          .style("fill", function(d) { return d.z; });

        keyhor.call(xAxis).append("text")
          .attr("id", "caption")
          .attr("x", -63)
          .attr("y", -20)
          .text("");

        keyhor.append("rect")
          .attr("id","keybar")
          .attr("width",8)
          .attr("height",0)
          .attr("transform","translate(15,0)")
          .style("fill", "#ccc")
          .attr("x",x_key(0));


        if(dvc.dropticks) {
          d3.select("#horiz").selectAll("text").attr("transform",function(d,i){
              // if there are more that 4 breaks, so > 5 ticks, then drop every other.
              if(i % 2){return "translate(0,10)"} }
          );
        }
        //Temporary	hardcode unit text
        dvc.unittext = "change in life expectancy";

        d3.select("#keydiv")
          .append("p")
          .attr("id","keyunit")
          .style("margin-top","-10px")
          .style("margin-left","10px")
          .text(data[0].group);

    } // Ends create key

    function addFullscreen() {

      currentBody = d3.select("#map").style("height");
      d3.select(".mapboxgl-ctrl-fullscreen").on("click", setbodyheight)

    }

    function setbodyheight() {
      d3.select("#map").style("height","100%");

      document.addEventListener('webkitfullscreenchange', exitHandler, false);
      document.addEventListener('mozfullscreenchange', exitHandler, false);
      document.addEventListener('fullscreenchange', exitHandler, false);
      document.addEventListener('MSFullscreenChange', exitHandler, false);

    }


    function exitHandler() {

        if (document.webkitIsFullScreen === false)
        {
          shrinkbody();
        }
        else if (document.mozFullScreen === false)
        {
          shrinkbody();
        }
        else if (document.msFullscreenElement === false)
        {
          shrinkbody();
        }
      }

    function shrinkbody() {
      d3.select("#map").style("height",currentBody);
      pymChild.sendHeight();
    }

    function geolocate() {
      dataLayer.push({
                  'event': 'geoLocate',
                  'selected': 'geolocate'
      })

      var options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      };

      navigator.geolocation.getCurrentPosition(success, error, options);
    }

    function success(pos) {
      crd = pos.coords;

      //go on to filter
      //Translate lng lat coords to point on screen
      point = map.project([crd.longitude,crd.latitude]);

      //then check what features are underneath
      var features = map.queryRenderedFeatures(point);

      //then select area
      disableMouseEvents();

      map.setFilter("state-fills-hover", ["==", "AREACD", features[0].properties.AREACD]);

      // selectArea(features[0].properties.AREACD);
      setAxisVal(features[0].properties.AREACD);


    };

      function selectlist(datacsv) {

        var areacodes =  datacsv.map(function(d) { return d.AREACD; });
        var areanames =  datacsv.map(function(d) { return d.AREANM; });
        var menuarea = d3.zip(areanames,areacodes).sort(function(a, b){ return d3.ascending(a[0], b[0]); });

        // Build option menu for occupations
        var optns = d3.select("#selectNav").append("div").attr("id","sel").append("select")
          .attr("id","areaselect")
          .attr("style","width:98%")
          .attr("class","chosen-select");


        optns.append("option")
          .attr("value","first")
          .text("");

        optns.selectAll("p").data(menuarea).enter().append("option")
          .attr("value", function(d){ return d[1]})
          .text(function(d){ return d[0]});

        myId=null;

        $('#areaselect').chosen({width: "98%", allow_single_deselect:true}).on('change',function(evt,params){

            if(typeof params != 'undefined') {

                disableMouseEvents();

                map.setFilter("state-fills-hover", ["==", "AREACD", params.selected]);

                selectArea(params.selected);
                setAxisVal(params.selected);

                zoomToArea(params.selected);

                dataLayer.push({
                    'event': 'mapDropSelect',
                    'selected': params.selected
                })
            }
            else {
                enableMouseEvents();
                hideaxisVal();
                onLeave();
                resetZoom();
            }

        });

    };

    // get the clicked "show map" button
    d3.selectAll(".btn")
      .on('click', function(d,i) {
        updateMap(this.value)
      })

    function updateMap(dataCategory) {
      data = chart_data.filter(function(d) {
        return d.group === dataCategory;
      });
      defineBreaks();
			setupScales();
      createKey(config);
      updateLayers();

      } // end of update map

    } // end of drawMap

  } // end of drawGraphic

  function mouseover(d) {
    d3.selectAll('.'+d)
      .attr("fill", hoverColour)
      .attr("opacity","1")
      .attr("width","2")
      .attr("y",0)
      .attr("height", 40);
  }

  function mouseout(d) {

    hover = [];

    if(selected.length > 0) {
      filter = ['match', ['get', 'AREACD'], selected, true, false]
      map.setFilter('state-fills-hover',filter)

    } else {
      map.setFilter("state-fills-hover", ["==", "AREACD", ""]);
    }

    if(previousArea !== "" && d3.selectAll("." + previousArea).classed("active") === false) {
      d3.selectAll("."+previousArea)
        .attr("fill", "#323132")
        .attr("opacity","0.4")
        .attr("y",0)
        .attr("height", 30)

        unusedColours.unshift(valueColourPairs.filter(function(d){ return d.value===previousArea})[0].colour)
        if(unusedColours.length === 4) {
          unusedColours = ["#a6cee3","#1f78b4","#b2df8a","#33a02c"];
        }
        hoverColour = unusedColours[0];

        // delete the entry from value colour pairs
        valueColourPairs = valueColourPairs.filter(function(d) {
          return d.value !== previousArea;
        });
    }

      oldAREACD = "";
      previousArea = "";
      // $("#areaselect").val("").trigger("chosen:updated");
      hideaxisVal();

      $("#areaselect").val(selected);
      $("#areaselect").trigger("chosen:updated");
      $("#areaselect").setSelectionOrder(selected.concat(hover))

      d3.selectAll(".search-choice")
      .data(selected)
      .join()
      .style("background-color",function(d){
        return valueColourPairs.filter(function(f){return f.value===d})[0].colour
      })

  }

  function highlight(area) {

    d3.selection.prototype.last = function() {
      var last = this.size() - 1;
      return d3.select(this[0][last]);
    };

    d3.selectAll("."+area)
      .attr('class', 'active ' + area)
      .attr("fill", selectedColour)
      .attr("opacity","1")
      .attr("width","2")
      .attr("y",0)
      .attr("height", 40)
      .raise()
  } // end of highlight

  /* Remove the current selected polygon */
  function unhighlight(area) {

    d3.selectAll("." + area)
      .attr('class', area)
      .attr("fill", "#323132")
      .attr("opacity","0.4")
      .attr("y",0)
      .attr("height", 30)

} // end of unhighlight

function onMove(e) {

    hover = []

    hover.push(e)

    d3.selectAll('.'+e)
      .attr("fill", hoverColour)
      .attr("opacity","1")
      .attr("width","2")
      .attr("y",0)
      .attr("height", 40)
      .raise()

    // if(previousArea !== undefined && d3.selectAll("." + previousArea).classed("active") === false) {
    if(previousArea!=="" && previousArea !== undefined && previousArea !== e) {
      if(d3.selectAll("." + previousArea).classed("active") === false) {

        d3.selectAll("."+previousArea)
          .attr("fill", "#323132")
          .attr("opacity","0.4")
          .attr("y",0)
          .attr("height", 30)

        // push the colour associated with the value to the beginning of the unusedColours array

        unusedColours.unshift(valueColourPairs.filter(function(d){ return d.value===previousArea})[0].colour)
        if(unusedColours.length === 4) {
          unusedColours = ["#a6cee3","#1f78b4","#b2df8a","#33a02c"];
        }
        hoverColour = unusedColours[0];

        // delete the entry from value colour pairs
        valueColourPairs = valueColourPairs.filter(function(d) {
          return d.value !== previousArea;
        });

      }
    }

    newAREACD = e;

    if(firsthover) {
        dataLayer.push({
            'event': 'mapHoverSelect',
            'selected': newAREACD
        })

        firsthover = false;
    }

    if(newAREACD != oldAREACD) {
      oldAREACD = e;

      // map.setFilter("state-fills-hover", ["==", "AREACD", e]);
      filter = ['match', ['get', 'AREACD'], selected.concat(hover), true, false]
      map.setFilter('state-fills-hover',filter)

      // selectArea(e);
      setAxisVal(e);

      listValues = $("#areaselect").val();

      if(selected.length === 0) {

        $("#areaselect").val(hover);
        $("#areaselect").trigger("chosen:updated");

        hoverColour = unusedColours[0];

      }

      else if(selected.length < 4) {

        $("#areaselect").val(selected.concat(hover));
        $("#areaselect").trigger("chosen:updated");
        $("#areaselect").setSelectionOrder(selected.concat(hover))

        hoverColour = unusedColours[0];
      }

      valueColourPairs.push({"value":e,"colour":unusedColours[0]})
      unusedColours.shift()
      // hoverColour = unusedColours[0];

      d3.selectAll(".search-choice")
      .data(selected.concat(hover))
      .join()
      .style("background-color",function(d){
        return valueColourPairs.filter(function(f){return f.value===d})[0].colour
      })
    }

    previousArea = e;
};


function onLeave() {

  hover = [];

  if(selected.length > 0) {
    filter = ['match', ['get', 'AREACD'], selected, true, false]
    map.setFilter('state-fills-hover',filter)

  } else {
    map.setFilter("state-fills-hover", ["==", "AREACD", ""]);
  }

  if(previousArea !== "" && d3.selectAll("." + previousArea).classed("active") === false) {
    d3.selectAll("."+previousArea)
      .attr("fill", "#323132")
      .attr("opacity","0.4")
      .attr("y",0)
      .attr("height", 30)

      unusedColours.unshift(valueColourPairs.filter(function(d){ return d.value===previousArea})[0].colour)
      if(unusedColours.length === 4) {
        unusedColours = ["#a6cee3","#1f78b4","#b2df8a","#33a02c"];
      }
      hoverColour = unusedColours[0];

      // delete the entry from value colour pairs
      valueColourPairs = valueColourPairs.filter(function(d) {
        return d.value !== previousArea;
      });
  }

    oldAREACD = "";
    previousArea = "";
    // $("#areaselect").val("").trigger("chosen:updated");
    hideaxisVal();

    $("#areaselect").val(selected);
    $("#areaselect").trigger("chosen:updated");
    $("#areaselect").setSelectionOrder(selected.concat(hover))

    d3.selectAll(".search-choice")
    .data(selected)
    .join()
    .style("background-color",function(d){
      return valueColourPairs.filter(function(f){return f.value===d})[0].colour
    })
};

function onClick(e) {

    if(selected.length < 4) {
      selected.push(e)
      //if remove an option

      // do .pop()

      unusedColours.unshift(valueColourPairs.filter(function(d){ return d.value===e})[0].colour)
      if(unusedColours.length === 4) {
        unusedColours = ["#a6cee3","#1f78b4","#b2df8a","#33a02c"];
      }
      hoverColour = unusedColours[0];

      // delete the entry from value colour pairs
      valueColourPairs = valueColourPairs.filter(function(d) {
        return d.value !== e;
      });


      valueColourPairs.push({"value":e,"colour":unusedColours[0]})
      unusedColours.shift()
      hoverColour = unusedColours[0];

      d3.selectAll(".search-choice")
      .data(selected)
      .join()
      .style("background-color",function(d){
        return valueColourPairs.filter(function(f){return f.value===d})[0].colour
      })


      d3.selectAll(".search-choice").each(function(d,i) {
      })

      selectedColour = valueColourPairs.filter(function(d){ return d.value===e })[0].colour;
      highlight(e)

      // disableMouseEvents();
      newAREACD = e;

      if(newAREACD != oldAREACD) {
        oldAREACD = e;
        filter = ['match', ['get', 'AREACD'], selected, true, false]
        map.setFilter('state-fills-hover',filter)

        // map.setFilter("state-fills-hover", ["==", "AREACD", e]);

        // selectArea(e);
        setAxisVal(e);
    }
    }

    dataLayer.push({
        'event':'mapClickSelect',
        'selected': newAREACD
    })
};

function disableMouseEvents() {
    map.off("mousemove", "area", onMove);
    map.off("mouseleave", "area", onLeave);
}

function enableMouseEvents() {
    map.on("mousemove", "area", onMove);
    map.on("click", "area", onClick);
    map.on("mouseleave", "area", onLeave);
}

function setAxisVal(code) {
  d3.select("#currLine")
    .style("opacity", function(){if(!isNaN(rateById[code])) {return 1} else{return 0}})
    .transition()
    .duration(400)
    .attr("x1", function(){if(!isNaN(rateById[code])) {return x_key(rateById[code])} else{return x_key(midpoint)}})
    .attr("x2", function(){if(!isNaN(rateById[code])) {return x_key(rateById[code])} else{return x_key(midpoint)}});


  d3.select("#currVal")
    .text(function(){if(!isNaN(rateById[code]))  {return displayformat(rateById[code])} else {return "Data unavailable"}})
    .style("opacity",1)
    .transition()
    .duration(400)
    .attr("x", function(){if(!isNaN(rateById[code])) {return x_key(rateById[code])} else{return x_key(midpoint)}});

}

function hideaxisVal() {
  d3.select("#currLine")
    .style("opacity",0)

  d3.select("#currVal").text("")
    .style("opacity",0)
}

} else {

}

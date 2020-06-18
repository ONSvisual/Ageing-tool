if (Modernizr.svg) {

  var graphic = d3.select('#projections');
  var selectedColour;
  var hoverColour = "#236092";
  var x_key;
  var previousArea;
  var valueColourPairs =[];
      selected=[];
  var hover = [];
      startColours = ["#053d58","#24a79b","#3a7899","#abc149"];
      unusedColours = ["#053d58","#24a79b","#3a7899","#abc149"];
    //  bc_name = [];
  var filter;
  var legendVarName;
  var data;
  var currSel = 0;
  var inc;
      dvc = {};
      graphic_data_full = [];
  var graphic_data = [];
  var names = [];
  var shortNames = [];
  var dataCategory;
  var addedtoDD = [];

      laCode = [];

  //setup pymjs
  var pymChild = new pym.Child();
  pymChild.sendHeight();
  //console.log(height);

//  api.beta.ons.gov.uk/v1/datasets
d3.json("https://api.develop.onsdigital.co.uk/v1/datasets/ageing-population-projections").then(function(latest_data) {
  //console.log(latest_data.links.latest_version.href + "/observations?time,geography,sex,agegroups=old-age-dependancy-ratio");
  var latest_link = latest_data.links.latest_version.href;
  console.log(latest_link);


    Promise.all([
      d3.json(latest_link + "/observations?time=2018&geography=*&sex=all&agegroups=all"),// this will change from 'all' to 'median'
      d3.json(latest_link + "/observations?time=2018&geography=*&sex=all&agegroups=old-age-dependancy-ratio"),
      d3.json(latest_link + "/observations?time=2018&geography=*&sex=all&agegroups=65%2B"),
      d3.json(latest_link + "/observations?time=2018&geography=*&sex=all&agegroups=85%2B"),
      d3.json(latest_link + "/observations?time=2018&geography=*&sex=all&agegroups=0-15"),
      d3.json(latest_link + "/observations?time=2018&geography=*&sex=all&agegroups=16-64"),
      d3.json(latest_link + "/observations?time=2018&geography=*&sex=all&agegroups=spa%2B"),
      d3.json(latest_link + "/observations?time=2018&geography=*&sex=all&agegroups=16-spa"),

      d3.json("https://api.develop.onsdigital.co.uk/v1/datasets/ageing-sex-ratios/editions/time-series/versions/2" + "/observations?time=2018&geography=*&agegroups=65%2B"),
      d3.json("https://api.develop.onsdigital.co.uk/v1/datasets/ageing-sex-ratios/editions/time-series/versions/2" + "/observations?time=2018&geography=*&agegroups=85%2B"),

    //  d3.json("https://api.beta.ons.gov.uk/v1/datasets/ageing-population-estimates/editions/time-series/versions/1" + "/observations?time=2018&geography=*&sex=all&age-groups=ageing-employment-rate"),
    //  d3.json("https://api.beta.ons.gov.uk/v1/datasets/older-people-economic-activity/editions/time-series/versions/1" + "/observations?time=2018&geography=*&sex=all&age-groups=ageing-economic-activity"),

      d3.json("https://api.develop.onsdigital.co.uk/v1/datasets/ageing-single-households/editions/time-series/versions/2" + "/observations?time=2018&geography=*&sex=all&agegroups=65%2B"),
      d3.json("https://api.develop.onsdigital.co.uk/v1/datasets/ageing-single-households/editions/time-series/versions/2" + "/observations?time=2018&geography=*&sex=all&agegroups=85%2B"),

      d3.json("https://api.develop.onsdigital.co.uk/v1/datasets/ageing-economic-activity/editions/time-series/versions/1/observations?time=2018&geography=*&sex=all&economicactivity=economic-activity"),

      d3.json("https://api.develop.onsdigital.co.uk/v1/datasets/ageing-economic-activity/editions/time-series/versions/1/observations?time=2018&geography=*&sex=all&economicactivity=employment-rate"),

	  d3.json("lib/geog2019.json")

    ]).then(function(dat) {
      ready(dat)
    });

  })


function ready(data) {  console.log(data);

  d3.json('config.json').then(function(config_data) {

	  configdata = config_data;

    // reorganise the data
  //  var names = [];

    var clean_data = [];

    data.forEach(function(d,i) {
		if(i < data.length-1){ // -1
      if (i <12){ //console.log(i, d.dimensions)
        var group = d.dimensions.agegroups.option.id;
      } else {
         var group = d.dimensions.economicactivity.option.id;
      }
        // you gotta tally up names and cats
        groupie = group; // for those that don't need changing
      //  if(group=='old-age-dependancy-ratio') groupie = 'old-age-dependancy-ratio';
        if(group=='16-spa') groupie = 'sixteen-spa';
        if(group=='spa+') groupie = 'spa';
        if(group=='16-64') groupie = 'sixteen-64';
        if(group=='0-15') groupie = 'zero-15';
        if(group=='65+' && i == 2) groupie = 'over65';
        if(group=='85+' && i == 3) groupie = 'over85';
        // ageing-sex-ratio
          if(group=='65+' && i == 8) groupie = 'over65-sr';
          if(group=='85+' && i == 9) groupie = 'over85-sr';
        // migration
        //  if(group=='65+' && i == 10) groupie = 'over65-nf';
        //  if(group=='85+' && i == 11) groupie = 'over85-nf';
        // ageing single households
          if(group=='65+' && i == 10) groupie = 'hh-over-65';
          if(group=='85+' && i == 11) groupie = 'hh-over-85';
			  names.push(groupie);

			  d.observations.forEach(function(d,i) {
          clean_data.push({ 'id':d.dimensions.geography.id, 'label':d.dimensions.geography.label, 'value':d.observation, 'group':groupie })
          });

		} // ends if
    });
       //console.log("names");
      //  console.log(names);


    // // filter out the blank observations - pre 2019 boundaries/areas
    //   "Perth and Kinross", "Fife", "Glasgow City", "North Lanarkshire",
    var oldLA = [
      "Waveney", "Bournemouth", "West Somerset", "Poole", "Forest Heath", "Purbeck", "North Dorset", "Taunton Deane", "West Dorset",
       "Suffolk Coastal", "Christchurch", "East Dorset", "Weymouth and Portland", "St Edmundsbury", "Great Britain"
    ];
    var removeGR = ["London", "South East", "South West", "East of England", "East Midlands", "West Midlands", "North West", "North East", "Yorkshire and The Humber" ];

    oldLA.forEach(function(d,i) {
      clean_data = clean_data.filter(function(item) {
      //  console.log(i, item.group);
        if(item.group=='16-spa') item.group = 'sixteen-spa';
        if(item.group=='spa+') item.group = 'spa';
        if(item.group=='16-64') item.group = 'sixteen-64';
        if(item.group=='0-15') item.group = 'zero-15';
        if(item.group=='85+') item.group = 'over85'; // two of these 85+ exist
        if(item.group=='65+') item.group = 'over65'; // two of these 65+ exist
        if(item.group=='85') item.group = 'eighty-five';
        if(item.group=='65') item.group = 'eighty-six';

        if(item.label !== d) {
          return item;
        }
      })
    });

    // // clean Internal migration so the GA & countries are removed
    // for (var column in data[0]) {
    //   if (column == 'id') continue;
    //   if (column == 'label') continue;
    //   if (column == 'group') continue;
    //   dvc.varname = column;
    // clean_data = clean_data.filter(function(v,i,a){ //console.log(v,i,a);
    //       return a.findIndex(function(t){
    //                                       return t.id === v.id
    //                                     })===i});

  //  console.log("Cleaned data with appropriate group names")
  //  console.log(clean_data);

  // clear the dropdown
  d3.select("#selectNav").selectAll("*").remove();

   var yui = d3.select('.chosen-container');//.remove();//.getAttribute('width');
   //var tr = getComputedStyle(yui)
   //console.log(tr.width);

  // Add orange average block
    var avg = d3.select("#selectNav").append('div').attr('id', 'bloc')
    .attr("style", function(d,i){
      if(parseInt(graphic.style("width")) <580){
        return "width:99%"
      } else {
              return "width:300px"
            }
    })
    .style('padding', '4px 19px 4px 8px');

                avg.append('div')
                        .style('float', 'left')
                        .attr('id', 'blocLeft')
                        .append('b')
                      //  .style('padding-right', '100px')
                        .text('UK average');

                      avg.append('div')
                        .attr('id', 'blocRight')


  // Build option menu
  // .style('clear', 'both')
  var optns = d3.select("#selectNav")
                .append("div")
                .attr("id","sel")
                //.style('position', 'absolute')
                .attr('height', 'auto') // 200px
                .style("margin-bottom","30px")
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
                //.attr("class","chosen-select");

  //  d3.select("#sel").append('div').attr('id', 'newList');



	  //sort function
	  function compare( a, b ) {
		  if ( a.label < b.label ){
			return -1;
		  }
		  if ( a.label > b.label ){
			return 1;
		  }
		  return 0;
	  }


    // This may take up a load of CPU. And the more we add  ?????
    dropdownData = clean_data.filter(function(v,i,a){
          return a.findIndex(function(t){
                                          return t.id === v.id
                                        })===i});

            // place names on each svg for retreval
            var bc_name = dropdownData.map(function(n){
                    return n.label;
              })
                //console.log(bc_name);
            d3.select('#barcodes2.chart').selectAll("div")
                .data(bc_name)
                .enter()
                .append("div")
                .attr("id", function(d,i){
                            return 'bc_label' + bc_name;
                          })
                .attr("class", "tabContent")
                .style("display", "inline-block");


	dropdownData.sort( compare );
  //console.log(dropdownData);

    optns.selectAll("p")
      .data(dropdownData)
      .enter()
      .append("option")
      .attr("value", function(d){ return d.id })
      .text(function(d){ return d.label });

    $('#areaselect').chosen({
      placeholder_text_multiple: "Choose up to 4 areas",
      allow_single_deselect:true,
      disable_search:true,
      max_selected_options: 4,
      search_contains: true
    })
    .on('change',function(evt,params){ console.log("on change list: ", params.deselected, params.selected);
      if(Object.keys(params)[0] === 'selected') {
        if(selected.length <= 4) {
//console.log(selected); // nothing here
                // add a selection
                selected.push(params.selected);
              //  console.log(selected);
                if(d3.select("#barcodes").style("display") === 'inline'){//.block
                        setAxisVal(params.selected); }

                valueColourPairs.push({"value":params.selected,"colour":unusedColours[0]});
            //  console.log("valueColourPairs", valueColourPairs);
                unusedColours.shift();
                hoverColour = unusedColours[0];

                selectedColour = valueColourPairs.filter(function(d){
                   return d.value === params.selected })[0].colour;

////////////////////////
            //  var newSelection = params.selected;
            //console.log('DDonChange:');
            //console.log(params.selected);
              addtoDDlist(params.selected); // , selected.length);


        //newOrder(params.selected); // dropdownData,

                filter = ['match', ['get', 'AREACD'], selected, true, false];
                map.setFilter('state-fills-hover',filter);


                if(d3.select("#barcodes").style("display") == 'inline'){//.block
                                  console.log('barcode page open');
                                  // add data to graphic_data_full
                                  highlight(params.selected);
                                //  barCodeInfo(clickCode)
                                barCodeInfo(params.selected)
                    }else{ console.log('projected page open');
                      readData();
                      //  ==> drawLine
                      }
            } // ends if(selected.len < 4 )
      }  // ends  === 'selected'

  // else deleting deleting deleting deleting deleting deleting
      else { console.log("deleting ",params.deselected);
        // remove whole div
      //  d3.select('#blocDiv_'+params.deselected).remove();

      // delete deselected item from selected array
      selected = selected.filter(function(item,i) {
                              return item !== params.deselected;
                            });

        // push the colour associated with the value to the beginning of the unusedColours arrayfg
        unusedColours.unshift(valueColourPairs.filter(function(d){ return d.value == params.deselected })[0].colour)
        if(unusedColours.length === 4) {
          unusedColours = startColours;
        }
        hoverColour = unusedColours[0];
        //  console.log("hoverColour ", unusedColours[0]);

        // delete the entry from value colour pairs
        valueColourPairs = valueColourPairs.filter(function(d,i) {
          //console.log(i, d.value, params.deselected);
          if(d.value == params.deselected) {inc = i;}
          return d.value !== params.deselected;
        });
      //  console.log(inc, " F Ready, Now only: ", valueColourPairs);

        if(selected.length > 0) {
              filter = ['match', ['get', 'AREACD'], selected, true, false]
              map.setFilter('state-fills-hover',filter)
            } else {
              map.setFilter("state-fills-hover", ["==", "AREACD", ""]);
            }

            // find i and remove it for filter below.
            addedtoDD.splice(inc,1);
            console.log(addedtoDD);
            //addtoDDlist(params.selected)
              $("#areaselect").val(selected);
              $("#areaselect").trigger("chosen:updated")
              $("#areaselect").setSelectionOrder(selected);

              d3.selectAll(".search-choice")
               .data(selected)  // .concat(hover)
               .join()
               .style("background-color",function(d){
                return valueColourPairs.filter(function(f){
                              return f.value == d
                            })[0].colour
                   })
                   .on('mouseover', function(d,i){//console.log("why i",i, d);
                       if(d3.select("#barcodes").style("display") === 'inline') { rehighlightbc(d);}
                       else{ highLightLine(d,i);}
                   })
                   .on('mouseout', function(d){ //console.log('mouseout')
                       if(d3.select("#projections").style("display") === 'inline') { unhighlightLine(d);}
                       else{ unhighlightbc(d);}
                   });

                hoverColour = unusedColours[0];

           d3.selectAll('.search-choice')
             .select('span')
             .attr('class', 'li_span1')
             .attr('id', function(d,i){ //console.log(i, d);
                   return 'li_span_' + d; })
             .append('span')
             .text(function(d,i){return addedtoDD[i]+dvc.essential.xAxisBarLabel[currSel]; });

  //  addtoDDlist();
    removeLine(params.deselected); // I need to add 0-n
    unhighlight(params.deselected);

      } // ends else

  }); // ends event listener

  d3.select("#selectNav")
  .append("div")
  .attr("id","keyunit")
    .append("p")
    .attr('class', 'chose_bg')
    //.attr("id","keyunit")
    .style("padding", '6px 6px')
    .style("margin","10px")
    .text(configdata.essential.variablelabels[currSel]);

    d3.select('#current').on('click', function(){ console.log('current');
                                      d3.select("#barcodes").style("display", "inline");
                                      d3.select("#projections").style("display", "none");
          // hide key
          d3.select('#keydiv').style('display', 'block');
          d3.select('p.chose_bg').style('display', 'block');

           areas.features.map(function(d,i) { //console.log(d);
              if(!isNaN(rateById[d.properties.AREACD]) && rateById[d.properties.AREACD] !=0 )
               {d.properties.fill = color(rateById[d.properties.AREACD])}
              else {d.properties.fill = '#ccc'};
           });
           map.getSource('area').setData(areas);
               //set up style object
               styleObject = {
               type: 'identity',
               property: 'fill'
               }
               //repaint area layer map usign the styles above
               map.setPaintProperty('area', 'fill-color', styleObject);

      });

    d3.select('#projection').on('click', function(){

        if(selected.length > 0){
           console.log('projected');
      // hide key
      d3.select('#keydiv').style('display', 'none');
      d3.select('p.chose_bg').style('display', 'none');
      // clear drop down values
      selected.forEach(function(d){ console.log(d);
          d3.select('#li_span_'+d+' span').text('');
      });
      d3.select('#blocRight').text('');

                d3.select("#barcodes").style("display", "none");
                d3.select("#projections")
              //  .attr('width', 100+'%')
                .style("display", "inline");

                areas.features.map(function(d,i) {
                    d.properties.fill = '#ccc'
               });
               map.getSource('area').setData(areas);

             //set up style object
             styleObject = {
             type: 'identity',
             property: 'fill'
             }
             //repaint area layer map usign the styles above
             map.setPaintProperty('area', 'fill-color', styleObject);

                //  get data if first time??!?
                // if laCode != selected ¬
                  readData();
                }
  }); // ends projection on click

    d3.select('#help').append('div')
                        //  .style('clear', 'both')
                          .append('p')
                          .attr('id', 'selectNavPara')
                          .style("margin", "0px 5px 18px 5px")
                          .text("Hover over the distribution of lines below to show data for each area.")


      drawGraphic(clean_data, config_data, data[data.length-1])
    });

} // end of ready


function drawGraphic(chart_data, config, geog) {

    dvc = config;

    var threshold_md = 788;
    var threshold_sm = dvc.optional.mobileBreakpoint;

    var innerPadding_values = {
                              "sm":dvc.optional.innersm, //[50 , 15 , 40 , 30 ],
                              "md":dvc.optional.innermd, //[35 , 15 , 50 , 30 ],
                              "lg":dvc.optional.innerlg  //[50 , 15 , 50 , 30 ],
                            };

      //set variables for chart dimensions dependent on width of #graphic
     if (parseInt(graphic.style("width")) < threshold_sm) {
         margin = {top: dvc.optional.margin_sm[0], right: dvc.optional.margin_sm[1], bottom: dvc.optional.margin_sm[2], left: dvc.optional.margin_sm[3]};
         //var chart_width = parseInt(graphic.style("width")) - margin.left - margin.right;
         height = dvc.essential.barHeight_sm_md_lg[0] +0 - margin.top - margin.bottom;
         innerPadding = { top : innerPadding_values.sm[0] ,  right : innerPadding_values.sm[1] ,  bottom : innerPadding_values.sm[2] ,  left : innerPadding_values.sm[3] };
     } else if (parseInt(graphic.style("width")) < threshold_md){
         margin = {top: dvc.optional.margin_md[0], right: dvc.optional.margin_md[1], bottom: dvc.optional.margin_md[2], left: dvc.optional.margin_md[3]};
         //var chart_width = parseInt(graphic.style("width")) - margin.left - margin.right;
         height = dvc.essential.barHeight_sm_md_lg[0] +0 - margin.top - margin.bottom;
         innerPadding = { top : innerPadding_values.md[0] ,  right : innerPadding_values.md[1] ,  bottom : innerPadding_values.md[2] ,  left : innerPadding_values.md[3] };
     } else {
         margin = {top: dvc.optional.margin_lg[0], right: dvc.optional.margin_lg[1], bottom: dvc.optional.margin_lg[2], left: dvc.optional.margin_lg[3]}
         //var chart_width = parseInt(graphic.style("width")) - margin.left - margin.right;
         height = dvc.essential.barHeight_sm_md_lg[0] +0 - margin.top - margin.bottom;
         innerPadding = { top : innerPadding_values.lg[0] ,  right : innerPadding_values.lg[1] ,  bottom : innerPadding_values.lg[2] ,  left : innerPadding_values.lg[3] };
     }

// // Main loop down to Voronoi was ere ////////////////////////////////////////////////////////////
//


 //   d3.json('lib/geog2019.json').then(function(geog) {
      createLegend(chart_data);
      drawMap(chart_data, dvc, geog);
  //  });


function drawMap(map_data, dvc, geog) {

    //data = functionName('all');
      data = map_data.filter(function(d) {
        return d.group === "all"; //change this to median
      });

      // sort avg value for orange
      var avgNo1 = data.filter(function(dat){
          return dat.label == 'United Kingdom';
        });
        d3.select('#blocRight').text((avgNo1[0].value)+config.essential.xAxisBarLabel[currSel]);


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
//console.log(dvc.varname);
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
      //map.addControl(new mapboxgl.FullscreenControl());

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
        //  dvc.varname = 'value'
        //console.log(data);
        data.forEach(function(d) {
              rateById[d.id] = +eval("d." + dvc.varname);
              areaById[d.id] = d.label  });
//console.log("rateById[d.id], areaById[d.id]");
//console.log(rateById, areaById);

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

      function updateLayers() { //console.log(areas);

        //update properties to the geojson based on the csv file we've read in
        areas.features.map(function(d,i) {
           if(!isNaN(rateById[d.properties.AREACD]) && rateById[d.properties.AREACD] !=0)
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

      } //  ends F updateLayers


      //now ranges are set we can call draw the key
      defineBreaks()
      setupScales()
      createKey(config,currSel);

      //convert topojson to geojson
      for(key in geog.objects){
        areas = topojson.feature(geog, geog.objects[key])
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
            "line-color": "#f00",
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
          onMove = onMove.debounce(500);
          onLeave = onLeave.debounce(500);
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
        map.on("click", "area", function(d){
          console.log("Map -> onClick ", currSel);
          //console.log("laCode OnClick: ", laCode, laCode.length);
          //console.log("valueColourPairs OnClick: ", valueColourPairs, valueColourPairs[0].length);
          if(selected.length < 4) onClick(d.features[0].properties.AREACD)
        });

        //get location on click
        // d3.select(".mapboxgl-ctrl-geolocate").on("click",geolocate);

  }); // map.on('load', function() {


      // function selectArea(code) { console.log(code);
      //   $("#areaselect").val(code).trigger("chosen:updated");
      // }

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


  function createKey(config, currSel){

        d3.select("#keydiv").selectAll("*").remove();

    var keywidth = d3.select("#keydiv").node().getBoundingClientRect().width;

        var svgkey = d3.select("#keydiv")
          .append("svg")
          .attr("id", "key")
          .attr("width", keywidth)
          .attr("height", 80);


        var color = d3.scaleThreshold()
           .domain(breaks)
           .range(colour);

        // Set up scales for legend
        x_key = d3.scaleLinear()
          .domain([breaks[0], breaks[dvc.numberBreaks]]) /*range for data*/
          .range([0,keywidth-30]); /*range for pixels*/


        var xAxis = d3.axisBottom(x_key)
		  //.ticks(5)
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
          .attr("height", 16)
          .attr("x", function(d) {
             return d.x0; })
          .attr("width", function(d) {return d.x1 - d.x0; })
          .style("opacity",0.8)
          .style("fill", function(d) { return d.z; });


        g2.append("line")
          .attr("id", "currLine")
          .attr("x1", x_key(10))
          .attr("x2", x_key(10))
          .attr("y1", -6)
          .attr("y2", 15)
          .attr("stroke-width","3px")
          .attr("stroke","#333")
          .style("opacity",0);

        g2.append("text")
          .attr("id", "currVal")
          .attr("x", x_key(10))
          .attr("y", -15)
          .attr("font-size", '14px')
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
          .attr("y", -30)
          .text("id:caption");

        keyhor.append("rect")
          .attr("id","keybar")
          .attr("width",8)
          .attr("height",0)
          .attr("transform","translate(15,0)")
          .style("fill", "#ccc")
          .attr("x",x_key(0));

d3.select("#horiz").selectAll("text").attr("transform", "translate(0,6)");
        if(dvc.dropticks) {
          d3.select("#horiz").selectAll("text").attr("transform",function(d,i){
              // if there are more that 4 breaks, so > 5 ticks, then drop every other.
              if(i % 2){return "translate(0,14)"} }
          );
        }

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

    d3.selectAll(".radiobtn").on('click', function(d,i){
         //console.log(i, names[i]);
         console.log(".radiobtn clicked")

        d3.selectAll('.chose_bc').classed("chose_bg",false);
        d3.select('.chose_ind'+i).classed("chose_bg",true);
           updateMap(names[i],i); //this.value
           currSel = i;
          }) // ends on click


    function updateMap(cattype,currSel) { console.log("updateMap ", cattype,currSel);

      d3.select('.chose_bg').text(configdata.essential.variablelabels[currSel]);
          //  d3.select('input #id'+dataCategory).attr('aria-pressed',true);
            data = /* chart_data */map_data.filter(function(d) {
                                          return d.group == cattype;
                                        });
                                          //console.log(data);

                // ADD graphic_data[count] and blocRight
                var avgNo = data.filter(function(dat){
                    return dat.label == 'United Kingdom';
                  });
                  console.log(avgNo[0].value);
                  d3.select('#blocRight').text((avgNo[0].value)+config.essential.xAxisBarLabel[currSel]);

                defineBreaks();
          	    setupScales();
                createKey(config,currSel);
                updateLayers();  // then update layers calls the above again

              // Sort selected array and resubmit through chosen
        var selLen = addedtoDD.length;
          var selecta = [];
            selected.forEach(function(d,i){
            var newNo = data.filter(function(dat,j){

                return dat.id == d;
              });
              selecta.push(newNo[0].value);
              d3.select('#li_span_'+d+' span')
              .text((newNo[0].value)+config.essential.xAxisBarLabel[currSel]);
            });

      // addedtoDD need new values
       addedtoDD.push(selecta);
       addedtoDD.splice(0,selLen);
       addedtoDD = addedtoDD[0];

      } // end of update map


    } // end of drawMap

  } // end of drawGraphic

function createLegend(bigData) { //console.log('createLegend');
//  console.log(bigData);
    open = true;

          //var chart_width = parseInt(graphic.style("width"))
          var barcode_width = parseInt(d3.select('#graphic').style("width")) - 20; // the slider
          console.log("barcode_width, height  ", barcode_width, height);

          var x = d3.scaleLinear()
            .range([ 0, (barcode_width - innerPadding.left-innerPadding.right)]); // -20


         //  !Important Hard wired
         var adj = (barcode_width - margin.left-margin.right)/6;
         var middle = (((barcode_width - margin.left-margin.right)/2) - adj);

          var xAxis = d3.axisBottom()
                        .scale(x)
                        .ticks(5);

    // Can this go!!!!!!!!!!!!!!!
    // d3.select(".details__summary")
    //       .on("click",function(){
    //         if(open == true){
    //           d3.select(this).text("Show variables")
    //           open = false;
    //         } else {
    //           d3.select(this).text("Hide variables")
    //           open = true;
    //         }
    //
    //       })

    //First get unique values in array (hierarchy)

    hierarchy = d3.set(dvc.essential.structure).values();
// console.log('hierarchy');console.log(hierarchy);
    //merge structure and labels
    mergedvars = d3.zip(dvc.essential.structure,configdata.essential.variablelabels);
//console.log('mergedvars');console.log(mergedvars);
    //draw bc strips


    hierarchy.forEach(function(k,j) { //console.log(k.substring(0,3));
// Only goes round the 5 times the when are the sub cats added.
// Will probably need external counter for graphic_data

    var detailshier = d3.select("#radioselect")
                  .append("details")
                  .attr('id', function() { //count++;
                                  return 'indic_' + k.substring(0,3);
                                })
                  .attr("class", "detailsvar")
                  .attr("role","group")
                  .style("padding","0px 0px 0px 10px")
                  .attr("min-height","20px");

              //d3.select("#details0").property("open",true);
              d3.select('#indic_'+'Pop').property("open",true);


          detailshier.append("summary")
              .attr('id', function() {
                //count = count*(j);
                return 'summary'+j; })
              .text(k)
              .style("font-weight","bold")
              .style("font-size","16px")
              .style("color","#206095")
              .style("margin-bottom","5px")
              .on("click", function(){
                 //d3.selectAll(".detailsvar").property("open",false);
                 d3.select('indic_' + k).property("open",true);
              });

  }); // ends forEach hierarchy

  // now to hang the other stuff on the above
    var count = 0;
   hierarchy.forEach(function(m,l) {

   var subLoop = mergedvars.filter(function(d,i){
                              return d[0] == hierarchy[l]; });
        //console.log(subLoop);

         subLoop.forEach(function(dat,inc){
           //console.log(names[count]);

           graphic_data[count] = bigData.filter(function(d) { //filter clean_data passed by argument
                                 return d.group === names[count]; //'all'...
                               }).filter(function(d){
                                 return d.value!=null;
                               });

       //console.log(graphic_data[count]);
     //console.log('mergedvars',m);
      //console.log(mergedvars[count]);//.filter(function(d){return d[0] == hierarchy[count]}));

                     // find maximum as they cannot have same domain
                     var max = d3.max(graphic_data[count], function(d) { return +d.value; });

                     var min = d3.min(graphic_data[count], function(d) {
                       if(+d.value !==0) return +d.value; });
     //console.log('max, min');console.log(max, min);
                     x.domain([min,max])//.nice();

                     // Maybe loop to grab UK value to place into x(mean)
                     var ukMean = graphic_data[count].filter(function(d){
                           if(d.label === "United Kingdom" /*&& +d.value != 0*/){ return d.label === "United Kingdom"}
                         });
       //console.log(ukMean, ukMean.length, ukMean[0]);
       // if mex ain't make it 0
       if (ukMean != undefined && ukMean.length > 0) {var mex = ukMean[0].value;// check array is not empty and exist
             if(ukMean[0].value != 0){ diff = parseInt(middle) - parseInt(x(mex)); }
             else{ var diff = 0; } }else{var diff=0;}
            // console.log("middle, mex, diff: ", middle, mex, diff);


     //console.log('pin divs on #indic_'+m.substring(0,3));
         var subGroup = d3.select('#indic_'+m.substring(0,3)) //("#details" + j)
                      //  .selectAll('rad')
                      //  .data(mergedvars.filter(function(d){return d[0] == hierarchy[count]}))
                      //  .enter()
                       .append('div')
                       .attr('id', 'sub_bc'+count)
                       .style("float","left")
                       .style("width","100%")
                       .style("padding-left","10px")
                       .style("padding-right","10px");

      // Add info panel
      var getin = subGroup.append('div')
              //.attr('class', 'chose_bc')
                      //.style('display', 'inline-block')
                    //.style('background-color', '#fff')
                      //.attr('width', '100%')
                      .attr('class', function(){return 'chose_bc chose_ind'+count;});

                     getin.append('div')
                       .attr('class', 'radioBoxed')
                         .append('input')
                         .attr('class', 'input input--radio js-focusable radiobtn')
                         .attr('checked', function(d){
                                // if(d.replace('+','') == 'all') // all is CMD for median at the mo.
                                if(count === 0)
                                       { return 'checked'; } })
                         .attr('name', 'maps')
                         .attr('aria-pressed', function(d){
                                // if(d.replace('+','') == 'all')
                                  if(count === 0)
                                       { //console.log('all aria ' , d.replace('+','') );
                                              return 'true'; }
                                       else { // console.log('false: '+ d.replace('+',''));
                                               return 'false'; }
                                       })
                         .attr('id', function(d){ return "radioID" + count //d.replace('+','');
                       })
                         .attr('type', 'radio');

            d3.select('.chose_ind0').classed("chose_bg",true);

                         getin.append('div')
                                   .attr('class', 'chartTitle')
                                   .style('float', 'left')
                                   .html(function() {
                                     return dvc.essential.variablelabels[count];
                                   });

                         var getin2 = subGroup.append('div')
                               .attr('class', 'info_bc')
                               .style('height', 23+'px');

                                 getin2.append('div')
                                       .attr('class', 'bc_names')
                                       .attr('id', function() {
                                           return 'bc_names' + count;
                                         })
                                       .html("LA/ UA");

                                 getin2.append('div')
                                       .attr('class', 'bc_vals')
                                       .attr('id', function() {
                                           return 'bc_vals' + count;
                                         })
                                         .style('float', 'right')
                                         .style('padding', '0px 3px')
                                         .html("yrs % ratio");


               //  var svg = d3.select("#category-" + names[j] + '-category')
           var indicSVG = subGroup.append('svg')
                     .attr("class","chart")
                     .style("background-color","#fff")
                     .attr("width", barcode_width)
                     .attr("height", height + margin.top + margin.bottom );


     // loop mergevars[1]
     //megavars.filter for all 'Age' use loop to pin to details.


             var g = indicSVG.append("g")
                     .attr("transform", "translate(" + (diff+30) + "," + (margin.top+ 20) + ")");

               g.append('g')
                  .attr("class","bars")
                     .selectAll('rect')
                     .data(graphic_data[count]) // category
                     .enter()
                     .append('rect')
                     .attr("fill", function(d){// console.log(diff);
                               if(d.label === 'United Kingdom' && diff !==0) { return "#f93"; }
                                     else  { return "#ccc"; }
                     })
                     //.attr("class", "bc_rects")
                     .attr("class",function(d,i){ return "bc_rects "+d.id; })
                     .attr("width", function(d){
                               if(d.label === 'United Kingdom' && diff !==0) { return "4"; }
                                    else  {return "1"; }
                                  })
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
                     .attr("y", function(d){
                               if(d.label === 'United Kingdom') { return "-10"; }
                                    else  {return "0"; }
                                  })
                     .attr("height", function(d){
                               if(d.label === 'United Kingdom') { return "40"; }
                                    else  {return "30"; }
                                  })
                     .style("zIndex", function(d){
                               if(d.label === 'United Kingdom') return "1";
                     });

             		//Raise the UK to the top of the pile
             		d3.selectAll(".K02000001").style("opacity",1).raise();

             //Appends the x axis
             var xAxisGroup = g.append("g")
                             .attr("class", "x axis")
                             .attr("transform", "translate(0," + (35) + ")")
                             .call(xAxis.tickFormat(function(d){ return d + dvc.essential.xAxisBarLabel[count] }) );


           // voronoi
                   var voronoi = d3.voronoi()
                     .x(function(d) { return x(d.value) })
                     .y(function(d) { return 0 })
                     .extent([ [-margin.left, -innerPadding.top/2 ],
                       [barcode_width , height-innerPadding.bottom] ]);
                 //    .range([ 0, (barcode_width - innerPadding.left-innerPadding.right)]); // -20
             // svg    .attr("height", height + margin.top + margin.bottom );
                   var voronoiGroup = g.append('g')
                     .attr('class', 'voronoi');
//console.log(graphic_data[count]);
                   voronoiGroup.selectAll('path')
                   // you are mapping data and returning it untouched?!?!
                     .data(voronoi.polygons((graphic_data[count].map(function(d) { return d; }))))
                     .enter().append("path")
                     .attr("d", function(d) { return d ? "M" + d.join("L") + "Z" : null; })
                     .on("mouseover", function(d) { console.log("sel len: " , selected.length)
                       if(d3.select("."+d.data.id).classed("active") === false && selected.length < 4) {//
                             //console.log("voronoi gives : ");
                             //console.log(d.data, d.data.id);
                               onMove(d.data.id);
                             }
                             //else { onMoveOnly(d.data.id); }

                          // if(d3.select("."+d.data.id).classed("active") === false && selected.length > 4 && selected.length < 6) {
                          //      onMoveOnly(d.data.id);
                          //    }
                     })
                     .on("mouseout", function(d) { mouseout(d.data.id)})
                     .on("click", function(d) {
                       if(selected.length < 4){
                          console.log("voronoi > onClick ", currSel);
                       onClick(d.data.id)} });

                count++;
          });  // ends subLoop

    }); // ends hierarchy pt2


          //
          //
          // count = count + mergedvars.filter(function(d,i){return d[0] == hierarchy[j]}).length;

} //end createLegend

//_________________________________________________________________________

//_________________________________________________________________________

//_________________________________________________________________________

function drawGraphicLines(read_data) { console.log("drawGraphicLines with: read_data from graphic-data-full", read_data);

	   var graphic = $('#graphic');

      // you must clear everything maybe not header with buttons
      d3.select("#projections").selectAll("*").remove();

          var threshold_md = 788;
          var threshold_sm = dvc.optional.mobileBreakpoint;

      innerPadding_values = {
                            "sm":dvc.optional.innersm, //[50 , 15 , 40 , 30 ],
                            "md":dvc.optional.innermd, //[35 , 15 , 50 , 30 ],
                            "lg":dvc.optional.innerlg  //[50 , 15 , 50 , 30 ],
                          };

        var margin = {
          top: dvc.optional.margin_lg[0],
          right: dvc.optional.margin_lg[1],
          bottom: dvc.optional.margin_lg[2],
          left: dvc.optional.margin_lg[3]
        }

        // Loop this if you need mobile innerPadding
        var innerPadding = {
          top: innerPadding_values.lg[0],
          right: innerPadding_values.lg[1],
          bottom: innerPadding_values.lg[2],
          left: innerPadding_values.lg[3]
        }

        var tim = d3.timeFormat(dvc.optional.xAxisTextFormat_sm_md_lg[0]);

        var chart_width = graphic.width(); // - margin.left - margin.right;
        // use pym
        d3.select('#projections').style('width', chart_width+'px');

      height = (Math.ceil(((chart_width/2)* dvc.optional.aspectRatio_lg[1]) / dvc.optional.aspectRatio_lg[0])); //  - innerPadding.top - innerPadding.bottom
      if(height > 240) height = 240;
        numberColumns = dvc.essential.numColumns_sm_md_lg[2];
        console.log("chart_width, height: ", chart_width, height);
      //};

      var l = 0;
      // parse data into columns
      var lines = [];

      var myMinimum = 0;
      var myMaximum = 0;

      for (var numLines = 0; numLines < read_data.length; numLines++) { // 2 files at present
        lines[numLines] = {};
         //console.log(read_data[numLines])

        for (var column in read_data[numLines][0]) {
          if (column == "date") continue;
            shortNames.push(column);
          //console.log("[numLines][column]");
          //console.log(numLines, column);

          lines[numLines][column] = read_data[numLines].map(function(d, i) {
                          if (+d[column] > myMaximum) {
                            myMaximum = d[column]
                          }
                          if (+d[column] < myMinimum) {
                            myMinimum = d[column]
                          }
                return { // map data
                  'date': d.date,
                  'amt': +d[column]
                };
          }); // end lines
          l++;
        } // end column in read_data
      } // end read_data.length;
      console.log("lines");
      console.log(lines);


      // lines now has JUST the data needed for all the charts.
      //myMaxi = myMaximum.toFixed(1);

      if (myMinimum < 0 && myMaximum > (myMinimum) * (-1)) {
        myMinimum = myMaximum * (-1);
      } else if (myMinimum < 0 && myMaximum < (myMinimum) * (-1)) {
        myMaximum = myMinimum * (-1);
      }
    //  console.log("min,max in "+ myMinimum + " , " + myMaximum);

      dvc.mrtsTicks = calcOptimumTicks(myMinimum, myMaximum);
      dvc.mrtsTicks[0] = dvc.mrtsTicks[0] - 0.0000001;
      dvc.mrtsTicks[1] = dvc.mrtsTicks[1] + 0.0000001;

      var yDomain = dvc.essential.yDomain;

      var graph_unitWidth = (chart_width*0.95) / numberColumns;
      var graph_unitHeight = height;
      console.log("graph_unitWidth graph_unitHeight",graph_unitWidth, graph_unitHeight);
      console.log("innerPadding.left - innerPadding.right");
      console.log(innerPadding.left, innerPadding.right);

      // define x-axis
      if (dvc.essential.chart_type == "line") {

        x = d3.scaleTime()
          .range([0, (graph_unitWidth - innerPadding.left - innerPadding.right)])
          .domain(d3.extent(read_data[0], function(d) {
            return d.date;
          }));

      } else {
        var xDom = [];
        read_data[0].forEach(function(d, i) {
          xDom[i] = d3.time.format(dvc.essential.dateFormat)(d.date);
        });

        x = d3.scaleOrdinal()
          .range([0, (graph_unitWidth - innerPadding.left - innerPadding.right)])
          //.range([0, graph_unitWidth])
          .domain(xDom);
      }

      // my interpolator
      dvc.line = d3.line()
        .defined(function(d) {
          return d.amt != '';
        })
        .x(function(d) {
          return x(d.date);
        })
        .y(function(d) {
          return y(+d.amt);
        });


      // initial SM graph count variable (k = SM number being created
      var k = 0;
    //  var graphLines = {};
      var currentColoumn;

      // Find the length of the data for number of chart. Deduct 1 - date column
      numberCharts = (Object.keys(read_data[0][0])).length-1; //read_data[0][0].length;
      console.log(numberCharts);
      console.log("chart_width, height", chart_width, height);


      numberRows = Math.ceil(numberCharts / numberColumns);
      //console.log(numberRows, numberColumns);
      // for each row ...
      for (var i = 1; i <= numberRows; i++) {
        // for each column ...
        for (var j = 1; j <= numberColumns; j++) {
          // if graph panel [to draw] is greater than for which data is provided in data files ...
          if (k >= l) {
            continue;
          }
          //console.log(i,j,k,l);
          graphLines = [];
          // for each input data file...
          for (y = 0; y < read_data.length; y++) { //y = 0 then 1

            // define and initialise data file column counter ..
            var l = 0;

            // for each 'column in data file'
            for (var column in lines[y]) {

              // if column counter is equal to graph panel number to draw
              if (l == k) {

                // initialise inner object to store data asscoaited with a single line (i.e. one column in a single file)
                graphLines[y] = {};

                // create lines object
              //  console.log(column, lines[y][column]);
                graphLines[y][column] = lines[y][column].map(function(d, i) {

                            currentColoumn = column;
                            return {
                              'date': d.date,
                              'amt': d.amt
                            };
                          });

              } //   end if l == k

              l++;
            } // column in lines[y]

          } // end graphic_data_full.length loop

        //  console.log("graphLines");
        //  console.log(graphLines);
        //  var key =  Object.keys(graphLines[d])
        //  console.log(Object.keys(graphLines));

          xCoord = (j - 1) * graph_unitWidth;
          //console.log(i,j, xCoord)
      //   yCoord = (j - 1) * graph_unitHeight;

    var chartGroup = d3.select('#projections').append('div')
                  .style("position", "relative")
                  .style("display", "inline-block")
                //.attr("display", function(){
                // if(j == 1){ return 'inline-block'}else { return 'block'} })
                // .style("float", function(){ if(j == 2){ return 'right'} })

                var double = chartGroup
                //d3.select('#projections')
                      .append('div')
                    //  .attr('class', 'titleTx')
                      .style('width', (graph_unitWidth-innerPadding.right)+'px')
                      .style('height', 25+'px')
                      .style("pointer-events", "none");

                      double.append('div')
                      .style('font-size', '14px')
                      .style('width', (graph_unitWidth-innerPadding.right-30)+'px')
                       .attr('class', 'infoEllip')
                       .html(configdata.essential.projlabels[k]);

                       double.append('div')
                       .attr('class', 'dateLine')
                          .attr('id', function() { return 'date' + k; })
                        // .style('float', 'right')
                         .style('width', 20+'px')
                         // innerPadding.right/*+innerPadding.right*/)

        // create and append small SVG panel for each individual graph, k
        // d3.select('#projections').append('div')
        //             .style('position', 'relative')
        //             .style('display', 'block')
        //             .style('width', (graph_unitWidth-5)+'px')
        //             .attr('id', function(d) {
        //               return 'svgContainer'+k;
        //               //currentColoumn.replace(/\d/g, '');
        //             });
      //var svg = d3.select('#svgContainer'+k)


      chartGroup.append('div')
                .attr('id', function(d) {
                               return 'svgContainer'+k; })
                .style('width', (graph_unitWidth)+'px');

      var svg = d3.select('#svgContainer'+k)
            .append('svg')
            .attr("class", "graphUnitSVGs")
            .attr("id", "svg" + (k + 1))
            //.attr("x",xCoord)  // (i-1)*graph_unitWidth + graph_unitMargins.left )
            //.attr("y",yCoord)  //(j-1)*graph_unitHeight + graph_unitMargins.top )
            .attr("width", graph_unitWidth)
            .attr("height", graph_unitHeight-20)
            //.style("background-color", "#eee")
            .append("g")
            //.attr("transform", "translate(" + (0) + ", " + (innerPadding.top) + ")" );

          xAxis = d3.axisBottom(x);

          if (dvc.essential.chart_type /*[dataIndex]*/ === "line") {

            if (graphic.width() < threshold_sm) {//console.log(dvc.optional.xAxisTextFormat_sm_md_lg[0]);
              xAxis.tickValues(x.ticks(dvc.optional.x_num_ticks_sm_md_lg[0])); //.concat( x.domain() ));
                xAxis.tickFormat(d3.timeFormat(dvc.optional.xAxisTextFormat_sm_md_lg[0]));
            } else if (graphic.width() <= threshold_md) { //console.log(dvc.optional.xAxisTextFormat_sm_md_lg[1]);
              xAxis.tickValues('\u2019' + x.ticks(dvc.optional.x_num_ticks_sm_md_lg[1]));
              xAxis.tickFormat('\u2019' + d3.timeFormat(dvc.optional.xAxisTextFormat_sm_md_lg[1]));
            } else {
              xAxis.tickValues('\u2019' + x.ticks(dvc.optional.x_num_ticks_sm_md_lg[2]));
              xAxis.tickFormat('\u2019' + d3.timeFormat(dvc.optional.xAxisTextFormat_sm_md_lg[2]));
			 // console.log(x.ticks(dvc.optional.x_num_ticks_sm_md_lg[2]))

            }
          } else { // bar format
            xAxis.tickFormat(function(d) {
              return d.substr(3, 4);
            }) // Grab just the last digit
          }

  //  .call(xAxis.tickFormat(function(d){ return d + dvc.essential.xAxisBarLabel[i] }) );


          //set up y-axis scale
          var maxArr = [];
          var max;
          Object.keys(graphLines).forEach(function(d) { // for each line in the chart

            var key =  Object.keys(graphLines[d])
          //   console.log(key);
            max =  d3.max(graphLines[d][key], function (ms) {
                                  // console.log(ms)
                                  return ms.amt
                              });
            maxArr.push(max);
            // console.log('max', max, maxArr)
          });
          var yMax = d3.max(maxArr);
          //console.log(Math.ceil(yMax / 10) * 10)

          y = d3.scaleLinear()
            .domain([0, Math.ceil(yMax / 10) * 10])
            .range([(graph_unitHeight - innerPadding.top - innerPadding.bottom), 0]);

          yAxis = d3.axisLeft(y);

            yAxis.tickSize(-(graph_unitWidth - innerPadding.right - innerPadding.left));

          //specify number or ticks on y axis
          if (graphic.width() <= threshold_sm) {
            yAxis.ticks(dvc.mrtsTicks[2] / dvc.optional.y_num_ticks_sm_md_lg[0])
          } else if (graphic.width() <= threshold_md) //threshold_md
          {
            yAxis.ticks(dvc.mrtsTicks[2] / dvc.optional.y_num_ticks_sm_md_lg[1])
          } else {
            yAxis.ticks(dvc.mrtsTicks[2] / dvc.optional.y_num_ticks_sm_md_lg[2])
          }
          //yAxis.ticks(dvc.mrtsTicks[2]/dvc.optional.y_num_ticks_sm_md_lg[2]);

          svg.append("g")
            .attr("class", "y axis")
            .attr("id", "focusYAxis" + k)
            .attr("transform", function() {
              // if (j == 1 || j == 3) {
                 return "translate(" + (innerPadding.left) + ", " + (innerPadding.top) + ")";
              // } else {
              //   return "translate(" + (innerPadding.left) + ", " + (innerPadding.top) + ")";
              // }

            }) //  + graph_drop
            .call(yAxis);


          // **** only draw y-axis config labels if drawing graphs in first COLUMN  - find Bootstrap alternative
          // if (j == 1) {

            // add y-axis label and line annotation if they are to both be only on the first in the row

            // svg.append("text")
            //   .attr("class", "axislabel")
            //   .attr("id", "yAxisLabel" + k)
            //   .attr("x", innerPadding.left / 2)
            //   .attr("y", innerPadding.top - 10) //  + graph_drop
            //   .text(dvc.essential.yAxisLabel[k]);


          //create x axis on every chart (you can place so bottom row only), if y axis doesn't start at 0 drop x axis accordingly
          svg.append('g')
            .attr('class', 'x axis')
            .attr('id', 'focusXAxis' + k)
            .attr('transform', function() {
              if (yDomain[0] != 0) {
                return "translate(" + (innerPadding.left) + "," + (graph_unitHeight - innerPadding.bottom + innerPadding.bottom / 2.5) + ")"
              } // + graph_drop
              else { //console.log("no drop for x-axis")
                return "translate(" + (innerPadding.left) + "," + (graph_unitHeight - innerPadding.bottom) + ")";
              }
            })
            .call(xAxis);

//console.log(innerPadding.top,innerPadding.right,innerPadding.bottom,innerPadding.left);
//console.log(graph_unitHeight, graph_unitHeight -(innerPadding.top/3) );
                    // Add X axis label:
                      // svg.append("text")
                      //       .attr("class", "axislabel")
                      //       .attr("text-anchor", "end")
                      //       .attr('font-size', "14px")
                      //       .attr("x", graph_unitWidth-(innerPadding.right+innerPadding.left))
                      //       .attr("y", graph_unitHeight -(innerPadding.top/2))
                      //       .text(dvc.essential.xAxisLabel);

       //console.log(valueColourPairs);

        //  if (dvc.essential.chart_type /*[dataIndex]*/ === "line") {
            //create lines

            // delete me
            //var g = indicSVG.append("g")
            //         .attr("transform", "translate(" + (diff+30) + "," + (margin.top+ 20) + ")");

      var line_g = svg.append('g')
              //.attr("id", function() {  return 'group' + k; })
              .attr("transform", function() {
                if (j == 1 || j == 3) {
                  return "translate(" + (innerPadding.left) + ", " + (innerPadding.top) + ")";
                } else {
                  return "translate(" + (innerPadding.left) + ", " + (innerPadding.top) + ")";
                }
              })
              .append('svg')
              .attr("id", function() { return 'group' + (k+1); })
              // .on('mousemove', function(evt){
              //   console.log(currentColoumn, graphLines);//, evt.pageY);
              //   popDDest(evt.target.id, evt.pageX, graphLines, currentColoumn);
              //       });

   //.on("mousemove", function(d,i){//console.log(i,d);
        //  $('svg #group'+(k+1)).mousemove(function(evt){
            $('#svg'+(k+1)+' g g').mousemove(function(evt){
            popDDest(evt.target.id, evt.pageX, evt.pageY, lines);
       });
//console.log(graphLines);
//console.log('currentColoumn', currentColoumn);
       line_g.selectAll('mainpath')
             .data(d3.values(graphLines))
             .enter()
             .append('path')
             .attr('class', 'bgline')
             .attr('id', function(d,xrs) {
             //   if(xrs==0) { return 'orange'+xrs; } else {
                return (valueColourPairs[xrs].value) +'_' +i+'_'+j;
           //   }
         })
             .style("fill", "none")
             .style("stroke-width", "20px")
             .attr("stroke",function(d,g){
             //  if(g==0) { return '#f93' } else {
                 return valueColourPairs[g].colour;
             //  }
               })
             .style('stroke-linecap', 'butt')
             .style('opacity', 0)
             .attr('d', function(d, i) {
               return dvc.line(d[currentColoumn]);
             });

        //      d3.selectAll('.line').style("opacity","0.2");
        //      d3.selectAll('.line.line-'+num).style("opacity","1");
        //  function unhighlightLine(unareaLine) {
        //      d3.selectAll('.line').style("opacity","1");

line_g.selectAll('topline')
             .data(d3.values(graphLines))
             .enter()
             .append('path')
             .attr('class', function(d,f) {
              // if(f==0){return 'line line-uk'; } else {
               return (valueColourPairs[f].value) + ' line line-' + (f);
            // }
             })
             .attr('id', function(d,xrs) {
             //   if(xrs==0) { return 'orange'+xrs; } else {
                return (valueColourPairs[xrs].value) +'_' +i+'_'+j;
           //   }
             })
             .style("stroke-width", "3px")
             .style('fill', 'none')
             .attr("stroke",function(d,g){
                 return valueColourPairs[g].colour;
               })
             .style('opacity', 0.8)
             .attr('d', function(d, i) {
               return dvc.line(d[currentColoumn]);
             });




        // line_g.selectAll('mainpath')
        //       .data(d3.values(graphLines))
        //       .enter()
        //       .append('path')
        //       .attr('class', function(d,f) {
        //       //  if(f==0){return 'line line-uk'; } else {
        //         return (valueColourPairs[f].value) + ' line line-' + (f);
        //     //  }
        //       })
        //       .attr('id', function(d,xrs) {
        //       //   if(xrs==0) { return 'orange'+xrs; } else {
        //          return (valueColourPairs[xrs].value) +'_' +i+'_'+j;
        //     //   }
        //       })
        //       .style("stroke-width", "3px")
        //       .attr("stroke",function(d,g){
        //       //  if(g==0) { return '#f93' } else {
        //           return valueColourPairs[g].colour;
        //       //  }
        //         })
        //       .style('opacity', 0.8)
        //       .attr('d', function(d, i) {
        //         return dvc.line(d[currentColoumn]);
        //       });


                  line_g.append("line")
                //  d3.select('svg #group'+svgNo).append('line')
                      .attr("id", "yrLine_" +i+"_"+j)
                      .attr('class', 'chartLine')
                      // SET IT TO ZERO THEN TRANSFORM...
                            .attr('x1', 0) //xVal - myCoords['x'])
                            .attr('y1', 0)
                            .attr('x2', 0) //xVal - myCoords['x'])
                            .attr('y2', graph_unitHeight-(innerPadding.top+innerPadding.bottom))
                            .style('stroke', '#206095')
                            .style('visibility', 'hidden');



          k++; // next row

        } // ends columns j

      } // finally end the rows K *********************************


      //use pym to calculate chart dimensions - is this needed?
      if (pymChild) {
        pymChild.sendHeight();
      }

  } // end function drawGraphicLines()

 // _________________________________________________________________________


  function calcOptimumTicks(inputMin, inputMax) {
      var mrtsMin;
      var mrtsMax;
      var myRange;
      var myMagnitudeUnrounded;
      var myMagnitudeFloor;
      var myMagnitudeCeil;
      var myRoundingValue;
      var myBigArray = [];
      var mrtsArray = [];
      var myWinner;
      var mrtsArray;

      //        Calculate
      if (inputMin > inputMax) {
        mrtsMin = inputMax;
        mrtsMax = inputMin;
      } else {
        mrtsMin = inputMin;
        mrtsMax = inputMax;
      }

      myRange = mrtsMax - mrtsMin;

      if (myRange == 0) {
        myMagnitudeUnrounded = 1;
      } else {
        myMagnitudeUnrounded = Math.log(myRange) / Math.log(10);
      }

      //myMagnitudeCeil = Math.ceil(myMagnitudeUnrounded.toFixed(1));
      myMagnitudeFloor = Math.floor(myMagnitudeUnrounded);
      myRoundingValue = Math.pow(10, (myMagnitudeFloor - 1));

      myBigArray[0] = calculateTicksForGivenStepLength(1 * myRoundingValue, mrtsMin, mrtsMax);
      myBigArray[1] = calculateTicksForGivenStepLength(2 * myRoundingValue, mrtsMin, mrtsMax);
      myBigArray[2] = calculateTicksForGivenStepLength(5 * myRoundingValue, mrtsMin, mrtsMax);
      myBigArray[3] = calculateTicksForGivenStepLength(10 * myRoundingValue, mrtsMin, mrtsMax);
      myBigArray[4] = calculateTicksForGivenStepLength(20 * myRoundingValue, mrtsMin, mrtsMax);
      myBigArray[5] = calculateTicksForGivenStepLength(50 * myRoundingValue, mrtsMin, mrtsMax);

      if (myBigArray[0][2] < 9) {
        myWinner = 0;
      } else
      if (myBigArray[1][2] < 9) {
        myWinner = 1;
      } else
      if (myBigArray[2][2] < 9) {
        myWinner = 2;
      } else
      if (myBigArray[3][2] < 9) {
        myWinner = 3;
      } else
      if (myBigArray[4][2] < 9) {
        myWinner = 4;
      } else {
        myWinner = 5;
      }

      //Handover
      mrtsArray[0] = myBigArray[myWinner][0];
      mrtsArray[1] = myBigArray[myWinner][1];
      mrtsArray[2] = myBigArray[myWinner][2];
      mrtsArray[3] = myBigArray[myWinner][3];
      return mrtsArray;
    } // ends calcOptimumTicks

function calculateTicksForGivenStepLength(inputStep, inputMin, inputMax) {
      //        Define local variables
      var i;
      var myStep;
      var myMin;
      var myMax;
      var myTicks;
      var myLowestTick;
      var myHighestTick;
      var tickArray = [];

      //        Calculate
      if (inputStep == 0) {
        myStep = 1;
      } else {
        myStep = inputStep
      };

      if (inputMin > inputMax) {
        myMin = inputMax;
        myMax = inputMin;
      } else {
        myMin = inputMin;
        myMax = inputMax;
      }

      myLowestTick = myStep * Math.floor(myMin / myStep);
      myHighestTick = myLowestTick;

      i = 0;
      do {
        //myHighestTick=myHighestTick+myStep;
        myHighestTick = ((myHighestTick * 1000000) + (myStep * 1000000)) / 1000000;
        i++;
      } while (myHighestTick < myMax);
      myTicks = i;

      tickArray[0] = myLowestTick;
      tickArray[1] = myHighestTick;
      tickArray[2] = myTicks;
      tickArray[3] = myStep;
      return tickArray;

    } // end calcTicks


function readData() { console.log("readData");
		console.log("selected: "+selected);
  //  console.log("laCode readData: ", laCode, laCode.length);

    //  throw new Error("Something went badly wrong!");
      // I'm projecting and just require the time series if I don't
      // already have it: use selected, check graphic_data_full

      // I'm adding an LA to the dataset from projected: selected

      var difference = [];
      var datasets = [];

//       if (typeof /*graphic_data_full != "undefined" && */ graphic_data_full != null && graphic_data_full.length > 0)
//         {
//           console.log("We have data and been here already. BUT what of it is the same as this...", graphic_data_full);
//... see previous code
//
//           } else {
            //console.log("No data: complete apiCall...", selected);

            var removeGR = ['E12000007', 'E12000008', 'E12000009', 'E12000006', 'E12000004', 'E12000007', 'E12000002', 'E12000001', 'E12000003', 'E92000001', 'S92000003', 'W92000004', 'K04000001'];

            removeGR.forEach(function(d,i) {
              selected = selected.filter(function(item) {
                //console.log(i, item.group);
                if(item !== d)   return item;
              })
            });
          //  selected.unshift('K02000001');
//console.log("with just", selected);

  // if(selected.indexOf("E06000059") !== -1) {
  //   console.log("I'm off to Dorset");
  //   dorset(); }


      selected.forEach(function(code,i) {
        // datasets.push(
          Promise.all(
            [
          //  d3.json("https://api.develop.onsdigital.co.uk/v1/datasets/ageing-population-projections/editions/time-series/versions/1/observations?time=*&geography="+code+"&sex=male&agegroups=all"),
// there's a code median [25]


        d3.json("https://api.develop.onsdigital.co.uk/v1/datasets/ageing-projections-population/editions/time-series/versions/1/observations?time=*&geography="+code+"&sex=male&agegroups=median&unitofmeasure=number"),

        d3.json("https://api.develop.onsdigital.co.uk/v1/datasets/ageing-projections-population/editions/time-series/versions/1/observations?time=*&geography="+code+"&sex=all&agegroups=old-age-dependancy-ratio&unitofmeasure=number"),

        d3.json("https://api.develop.onsdigital.co.uk/v1/datasets/ageing-projections-population/editions/time-series/versions/1/observations?time=*&geography="+code+"&sex=male&agegroups=65%2B&unitofmeasure=percentage"),

        d3.json("https://api.develop.onsdigital.co.uk/v1/datasets/ageing-projections-population/editions/time-series/versions/1/observations?time=*&geography="+code+"&sex=male&agegroups=85%2B&unitofmeasure=percentage"),

			  d3.json("https://api.develop.onsdigital.co.uk/v1/datasets/ageing-projections-population/editions/time-series/versions/1/observations?time=*&geography="+code+"&sex=male&agegroups=0-15&unitofmeasure=percentage"),

			  d3.json("https://api.develop.onsdigital.co.uk/v1/datasets/ageing-projections-population/editions/time-series/versions/1/observations?time=*&geography="+code+"&sex=male&agegroups=16-64&unitofmeasure=percentage"),

			  d3.json("https://api.develop.onsdigital.co.uk/v1/datasets/ageing-projections-population/editions/time-series/versions/1/observations?time=*&geography="+code+"&sex=male&agegroups=spa%2B&unitofmeasure=percentage"),

			  d3.json("https://api.develop.onsdigital.co.uk/v1/datasets/ageing-projections-population/editions/time-series/versions/1/observations?time=*&geography="+code+"&sex=male&agegroups=16-spa&unitofmeasure=percentage"),
//https://api.develop.onsdigital.co.uk/v1/datasets/projections-older-people-in-single-households/editions/time-series/versions/1/observations?time=*&geography="+code+"&sex=people&agegroups=65%2B

      // projections not there yet
    //  https://api.develop.onsdigital.co.uk/v1/datasets/projections-older-people-in-single-households/editions/time-series/versions/1/observations?time=*&geography=E07000032&sex=men&agegroups=85%2B
           d3.json("https://api.develop.onsdigital.co.uk/v1/datasets/projections-older-people-in-single-households/editions/time-series/versions/1/observations?time=*&geography="+code+"&sex=people&agegroups=65%2B"),
           d3.json("https://api.develop.onsdigital.co.uk/v1/datasets/projections-older-people-in-single-households/editions/time-series/versions/1/observations?time=*&geography="+code+"&sex=people&agegroups=85%2B")

                    ]
                  // )
                ).then(function(all_dataset) {  //do the calcs somewhere else as
                                              //obj are getting manipulated before completion
                   console.log("all_dataset collected from api: ",code);
                    console.log(all_dataset);

                  var smallMultipleData = [];

                  // Skim off data required from download
                  all_dataset.forEach(function(data, inx) {
                      var group = data.dimensions.agegroups.option.id;
                       // if group exists 65+ rename somehow
                       if (inx == 8) group = "hh85+";
                       if (inx == 9) group = "hh65+";
                       //console.log(group);

                      data.observations.forEach(function(d,i) {
                                                var row = {};
                                                row[group] = +d.observation;
                                                row['date'] = d.dimensions.time.id;
                                                row['group'] = group;
                                                // console.log(row)
                                                smallMultipleData.push(row)
                                              })
                                    });

                    datasets.push(smallMultipleData);
                    console.log('datasets.length ',datasets);//.length
                    //console.log(i,selected.length-1);

                				if(i== selected.length-1){
                          // if(laCode.length<1){
                          //        laCode.push(selected); // remember old calls just to check
                          //      } else {
                          //        laCode[0].push(selected);
                          //      }
                              //   console.log("laCode after 1st api grab ",laCode);
                						 	ready1(datasets);
                						 }
                }) // ends then

            }) // ends forEach require api pull

    //  } // ends else
} // end function readData()

function dorset(){ console.log('here');
  // Dorset issue
      var indy = selected.indexOf("E06000059");
      console.log(indy);
        if(indy !== -1) selected[indy] = "E07000050";

}


function ready1(all_data) {   console.log("Ready1");
        console.log(all_data);

        function sortByDateAscending(a, b) {
            // Dates will be cast to numbers automagically:
            return a.date - b.date;
        }

        // data = data.sort(sortByDateAscending);
        all_data.forEach(function(d, i) {
          d.forEach(function(e, j) {
            d = d.sort(sortByDateAscending);
          })
        });

        var new_data = [];

        all_data.forEach(function(data,i) {
          var nest = d3.nest()
            .key(function(d) { return d.date; })
            .entries(data);
          // console.log(nest);
          new_data.push(nest);
        })

        console.log('new_data');
        console.log(new_data);

        final_data = []

        new_data.forEach(function(data) {
          var object = []
          var result = data.map(function(d) {
            var objectIn = {}
            objectIn.date = d.key
            d.values.forEach(function(e) {
              // console.log(Object.keys(e))
              var all_keys = Object.keys(e)
              objectIn[all_keys[0]] = e[all_keys[0]]
              // all_keys[0].forEach(function(f) {
                // console.log(f)
              // })
            })
            object.push(objectIn)
          })

          final_data.push(object)

        })

        final_data.forEach(function(d, i) {
          d.forEach(function(e, j) {
            e.date = d3.timeParse(dvc.essential.dateFormat)(e.date);
          })
        });
        console.log("final_data", final_data);
          //  selected.shift('K02000001');
          //  console.log(selected);

    //  if(I got a partial data Add with (graphic_data_full+final_data)) then pym
      //  graphic_data_full = final_data;

      //console.log("graphLines");
          //console.log(graphLines);

      // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
      // Now need to add lines to chart and
      // merge data and lacode to = new selection after F ready1
   //.... active contents removed
   //      console.log("Now go to function drawGraphicLines");
   // drawGraphicLines(graphic_data_full[0]);
drawGraphicLines(final_data);
} // end of ready1

//////////////////////////////////////  rollovers ///////////////////////////////


function popDDest(la_x_y, xVal, yVal, theData){
// popDDest(evt.target.id, evt.pageX, evt.pageY, lines);
//console.log(theData);
    var la = la_x_y.substring(0,9);
    var xPos = la_x_y.substring(10,11);
    var yPos = la_x_y.substring(12,13);
    //console.log(la, xPos, yPos);

if(xPos){

      var svgNo = yPos % 2 ? (2*xPos)-1 : 2*xPos;
    //  var svgNo = yPos % 2 ? xPos : parseInt(numberRows)+parseInt(xPos);
    //  console.log(svgNo, shortNames[svgNo-1]);

      //var myX =
      var myCoords = d3.select('svg #group' +svgNo).node().getBoundingClientRect();
                    // for (var key in myCoords){
                    //   if(typeof myCoords[key] !== 'function') {
                    //     console.log(key, myCoords[key]);
                    //   }
                    // }

// Hide all class chartLine and unhide below

        var tim = d3.timeFormat(dvc.optional.xAxisTextFormat_sm_md_lg[0]);
          //  console.log(x.invert(xVal - myCoords['x']));
          var yum = tim(x.invert(xVal - myCoords['x']));
                //console.log(yum);
                d3.selectAll('.dateLine').style('visibility','hidden');
                d3.select('#date'+(svgNo-1)).style('visibility', 'visible').html(yum);

//console.log(theData);
//console.log(shortNames);
//console.log(theData[0][theGroup]);
//d3.zip(dvc.essential.structure,configdata.essential.variablelabels);

    var newNo2 = [];
              theData.forEach(function(dat,ix){
                //console.log(theData[ix][shortNames[svgNo]]);
                fud = theData[ix][shortNames[svgNo-1]].filter(function(d){
                // console.log(d);
                      return tim(d.date) == yum;
                })
                newNo2.push(fud);
            })
          //  console.log(newNo2);
          //  console.log(tim(newNo2[0][0].date);


  // Add values to left DD
  var fmt = d3.format(".1f");
  var newAmt = [];
    selected.forEach(function(d,i){
      // for Dorset
    //  if(d == "E0700050"){ console.log("DD: "+d); d = "E06000059";}
      d3.select('#li_span_'+d+' span')
      .text(fmt(newNo2[i][0].amt)+dvc.essential.xAxisLineLabel[svgNo-1] );
      //console.log(newNo2[i]);
      newAmt.push(newNo2[i][0].amt);
    });
// console.log(newAmt);

    // Create zip, Index time from zip. put index val in y.invert scale
    // It comes out sorted by line
//var yum = tim(x.invert(xVal - myCoords['x']));
  //  console.log(xVal, myCoords['x']);
    //console.log(xVal - myCoords['x']);
    //.attr("id", "yrLine_" +i+"_"+j)
    //.attr('class', 'chartLine')

    d3.selectAll('.chartLine').style('visibility', 'hidden');
    d3.select('#yrLine_'+xPos+'_'+yPos)
    //.attr("transform", "translate(" + (xVal - myCoords['x']) + ", 0 )")
      //  .attr('display' ,'block')
        .style('visibility', 'visible')
        .attr('x1', (xVal - myCoords['x']))
        .attr('x2', (xVal - myCoords['x']))
          .style('stroke-width', 2+'px');
  } // ends if


}


function highlight(areaCode) { console.log("F highlight", areaCode);

    d3.selection.prototype.last = function() { // Is this needed?
      var last = this.size() - 1; //console.log(last);
      return d3.select(this[0][last]);
    };

    d3.selectAll("."+areaCode)
      .attr('class', 'active bc_rects ' + areaCode)
      .attr("fill", selectedColour)
      .style("opacity","1")
      .attr("width","4px")
      .attr("y",-8)
      .attr("height", 38)
      .raise();

        //console.log(valueColourPairs, unusedColours, hoverColour );
  } // end of highlight

// function leavebars(){console.log('bye SVG')}

function rehighlightbc(areaCodebc) {
      d3.selectAll("."+areaCodebc)
        .attr("y",-20)
        .attr("height", 50)
}
function unhighlightbc(unareaCodebc) {
      d3.selectAll("."+unareaCodebc)
        .attr("y",-8)
        .attr("height", 38)
}
function highLightLine(areaLine, num) {
  //console.log(areaLine, num)
    d3.selectAll('.line').style("opacity","0.2");
    d3.selectAll('.line.line-'+num).style("opacity","1");
     //'#line_'+areaLine+  style("opacity","1");
}
function unhighlightLine(unareaLine) {
  //  console.log('unhighlight '+unareaLine);
    d3.selectAll('.line').style("opacity","0.8");
}


  /* Remove the current selected polygon */
function unhighlight(unareaCode) { console.log("unhighlight from deleting list item only ", unareaCode);
// != sp h/h  dvc.essential.variablelabels[count]
    d3.selectAll("." + unareaCode)
      //.attr('class', area)
      .attr("fill", function(d){ //console.log(d); // != sp h/h
          if(d.label === 'United Kingdom'/* && diff !==0 */) {return "#FF9933";}
          else{ return "#ccc";} })
      .style("opacity", function(d){
          if(d.label === 'United Kingdom') {return "1";}
          else{ return "0.4";} })
  	  .attr("width", function(d){
          if(d.label === 'United Kingdom'/* && diff !==0 */) {return "4px";}
          else{ return "1px";} })
      .attr("y",function(d){
          if(d.label === 'United Kingdom') {return "-10px";}
          else{ return "0px";} })
      .attr("height", function(d){
          if(d.label === 'United Kingdom') {return "40px";}
          else{ return "30px";} });

      // clear barcodeInfo
      d3.selectAll('.bc_names')
            .html('');

          names.forEach(function(d,i){
                    d3.select('#bc_vals'+i)
                      .html('')
        }); // ends names

} // end of unhighlight


// This needs chaecking .# after changes
function removeLine(removeMe){ console.log("removeLine[0-n] ", removeMe, inc);

    d3.selectAll("path."+removeMe).remove();
    // colours sorted before call
    //console.log(valueColourPairs, unusedColours, hoverColour );
}


function onMove(e) { //console.log("F onMove to", e);
// bars back to normal
//

    hover = [];
    hover.push(e);

    var barInfo = d3.selectAll('.'+e)
      .attr("fill", hoverColour)
      .style("opacity","1")
      .attr("width","3px")
      .attr("y",-20)
      .attr("height", 50)
      .raise();

    // if(previousArea !== undefined && d3.selectAll("." + previousArea).classed("active") === false) {
    //  previous area visit defined as so and greyed back
    if(previousArea !== "" && previousArea !== undefined && previousArea !== e) {
      if(d3.selectAll("." + previousArea).classed("active") === false) {
        //console.log("onMove from previousArea: ", previousArea);
        d3.selectAll("."+previousArea)
          .attr("fill", "#ccc")
          .style("opacity","0.4")
		      .attr("width","1px")
          .attr("y",0)
          .attr("height", 30);

        //push the colour associated with the value to the beginning of the unusedColours array
        unusedColours.unshift(valueColourPairs.filter(function(d){ return d.value===previousArea})[0].colour)
        if(unusedColours.length === 4) {
          unusedColours = startColours;
        }
        hoverColour = unusedColours[0];

        // delete the entry from value colour pairs
        valueColourPairs = valueColourPairs.filter(function(d) { //console.log("minus previous area ")
                            return d.value !== previousArea;
                          });

      } // ends returning everything back
    }  // ends an LA must be lit but we've moused now over a different one


    newAREACD = e;
    if(newAREACD != oldAREACD) {
      //console.log("onMove from previous, even if no previous");
      oldAREACD = e;

      // map.setFilter("state-fills-hover", ["==", "AREACD", e]);
      filter = ['match', ['get', 'AREACD'], selected.concat(hover), true, false]
      map.setFilter('state-fills-hover',filter)

      // selectArea(e);
      setAxisVal(e);
      barCodeInfo(e);


                hoverColour = unusedColours[0];

     valueColourPairs.push({"value":e,"colour":unusedColours[0]});
     unusedColours.shift();
    //  hoverColour = unusedColours[0];
    //console.log(valueColourPairs, unusedColours, hoverColour, hover);


    }  // ends if(newAREACD != oldAREACD)

    previousArea = e;

////////////////////////////////////////////////////////////////////

              // google tag manager for mapHoverSelect.
              if(firsthover) {
                      dataLayer.push({
                          'event': 'mapHoverSelect',
                          'selected': newAREACD
                      })
                      firsthover = false;
              }

}  // ends F onMove


function onMoveOnly(evt){ console.log('five');

  var barInfo = d3.selectAll('.'+evt)
    .attr("fill", hoverColour)
    .style("opacity","1")
    .attr("width","3px")
    .attr("y",-20)
    .attr("height", 50)
    .raise();

    if(previousArea !== "" && previousArea !== undefined && previousArea !== e) {
      if(d3.selectAll("." + previousArea).classed("active") === false) {
        console.log("onMove5 from previousArea: ", previousArea);
        d3.selectAll("."+previousArea)
          .attr("fill", "#ccc")
          .style("opacity","0.4")
          .attr("width","1px")
          .attr("y",0)
          .attr("height", 30);
        }
      }
      previousArea = evt;
} // ends onMoveOnly


function mouseout(barBack) {//console.log("mouseout"); console.log(barBack);

    hover = [];

    if(selected.length > 0) { //console.log("F mouseout, selected = "+selected);
      filter = ['match', ['get', 'AREACD'], selected, true, false]
      map.setFilter('state-fills-hover',filter)

    } else {
      map.setFilter("state-fills-hover", ["==", "AREACD", ""]);
    }

    if(previousArea !== "" && d3.selectAll("." + previousArea).classed("active") === false) {
      d3.selectAll("."+previousArea)

      //d3.selectAll("." + area)
      //  .attr('class', area)
        .attr("fill", function(d){
          if(d.label === 'United Kingdom' /*&& diff !==0 */) {return "#FF9933";}
            else{ return "#ccc";} })
        .style("opacity", function(d){
          if(d.label === 'United Kingdom') {return "1";}
          else{ return "0.4";} })
        .attr("width", function(d){
          if(d.label === 'United Kingdom' /*&& diff !==0 */) {return "4px";}
          else{ return "1px";} })
          .attr("y", function(d){
            if(d.label === 'United Kingdom') {return "-10px";}
            else{ return "0px";} })
          .attr("height", function(d){
            if(d.label === 'United Kingdom') {return "40px";}
            else{ return "30px";} });

        unusedColours.unshift(valueColourPairs.filter(function(d){ return d.value===previousArea})[0].colour)
        if(unusedColours.length === 4) {
          unusedColours = startColours;
        }
        hoverColour = unusedColours[0];

        // delete the entry from value colour pairs
        valueColourPairs = valueColourPairs.filter(function(d) {
          return d.value !== previousArea;
        });
    }

      oldAREACD = "";
      previousArea = "";

      d3.selectAll('.bc_names').text('');
      d3.selectAll('.bc_vals').text('');

///////////////////  ADD ALL THIS TO DDlist f
//addtoDDlist(barBack);

  } // ends F mouseout


function onLeave() {  //console.log("onLeave");

  hover = []; //  I guess this is to empty it

  if(selected.length > 0) {
    filter = ['match', ['get', 'AREACD'], selected, true, false]
    map.setFilter('state-fills-hover',filter)

  } else {
    map.setFilter("state-fills-hover", ["==", "AREACD", ""]);
  }

  if(previousArea !== "" && d3.selectAll("." + previousArea).classed("active") === false) {
    d3.selectAll("."+previousArea)
      .attr("fill", "#ccc")
      .style("opacity","0.4")
	     .attr("width","1px")
      .attr("y",0)
      .attr("height", 30)

      unusedColours.unshift(valueColourPairs.filter(function(d){ return d.value===previousArea})[0].colour)
      if(unusedColours.length === 4) {
        unusedColours = startColours;
      }
      hoverColour = unusedColours[0];

      // delete the entry from value colour pairs
      valueColourPairs = valueColourPairs.filter(function(d) {
        return d.value !== previousArea;
      });
  }

    oldAREACD = "";
    previousArea = "";

} // ends onLeave


function onClick(e) { console.log("onClick Map or barcode: "+e, currSel);

          // HOW DOES LAcODE INCREASE BY ONE??????
          //throw new Error("Something went badly wrong!");
 // add to list by map or maybe list whilst in barcodeview - then hit projections.
 // laCode has the new area code therefore difference is 0, hence no line.
  //console.log("laCode middle: ", laCode, laCode.length);
  //if(selected.length < 4) {

        selected.push(e);
        // Add back new colour to unusedCol
          unusedColours.unshift(valueColourPairs.filter(function(d){ return d.value == e})[0].colour)
            if(unusedColours.length === 4){
              unusedColours = startColours;
            }
          hoverColour = unusedColours[0];

          // delete the entry from value colour pairs
          valueColourPairs = valueColourPairs.filter(function(d) {
            return d.value !== e;
          });

          valueColourPairs.push({"value":e,"colour":unusedColours[0]});
          unusedColours.shift();
          hoverColour = unusedColours[0];

          selectedColour = valueColourPairs.filter(function(d){ return d.value === e })[0].colour;
  //console.log('onClick:  hoverColour, selected,e');
  //console.log(hoverColour, selected,e);

            addtoDDlist(e); // , selected.length);
          // d3.selectAll(".search-choice")
          // .data(selected)
          // .join()
          // .style("background-color",function(d){
          //   return valueColourPairs.filter(function(f){return f.value == d})[0].colour
          // })

      //  newOrder(e);

          // disableMouseEvents();
          newAREACD = e;
                  if(newAREACD != oldAREACD) {
                          oldAREACD = e;
                          filter = ['match', ['get', 'AREACD'], selected, true, false];
                          map.setFilter('state-fills-hover',filter);

                          // map.setFilter("state-fills-hover", ["==", "AREACD", e]);

                          // selectArea(e);
                          setAxisVal(e);
                        };

            // If clicked via map add line to projections
            //console.log("laCode b4 readData: ", laCode, laCode.length);
            if(d3.select("#projections").style('display') === 'inline')  { readData();} //.block

    dataLayer.push({
        'event':'mapClickSelect',
        'selected': newAREACD
    });

    highlight(e); // even though we may click on map during projections
                  // we still need to in case we swap over to barcodes??

    // Add to write in box
    // then add new function (Maybe use F readData as it has the nesting required)
    // to get just the one api call and add it to chart!!

} // ends F onClick


function addtoDDlist(idpassed){ //console.log('addtoDDlist ',selected, idpassed)

// IF a users switches radio btn half way update for all chosen
  var ddvalue = data.filter(function(u){
                           return u.id == idpassed;
                         });
        //console.log(ddvalue[0].value);
  addedtoDD.push(ddvalue[0].value);


//console.log(selected, selected.length) //, ddvalue[0].label, addedtoDD);
        //if(selected.length === 1) {
            $("#areaselect").val(selected);
            $("#areaselect").trigger("chosen:updated")
            $("#areaselect").setSelectionOrder(selected)
            $('#areaselect').chosen({
              placeholder_text_multiple: "Choose "});

// d3.selectAll(".search-choice")
// .data(selected.concat(hover)). add BEFORE
// .join()
                 d3.selectAll(".search-choice")
                  .data(selected)  // .concat(hover)
                  .join()
                  .style("background-color",function(d){
                   return valueColourPairs.filter(function(f){
                                 return f.value == d
                               })[0].colour
                      })
                      .on('mouseover', function(d,i){
                        console.log("why i",i, d);
                        //if(d == "E0700050") d = "E06000059";
                          if(d3.select("#barcodes").style("display") === 'inline') { rehighlightbc(d);}
                          else{ highLightLine(d,i);}
                      })
                      .on('mouseout', function(d){ //console.log('mouseout')
                      //if(d == "E0700050") d = "E06000059";
                          if(d3.select("#projections").style("display") === 'inline') { unhighlightLine(d);}
                          else{ unhighlightbc(d);}
                      });

            hoverColour = unusedColours[0];

// does this work for Map??
//d3.selection.prototype.last = function(){// console.log(this, this.size());
            //            return d3.select(this.nodes()[this.size() - 1]);
          //            };
          d3.selectAll('.search-choice')
    //g.selectAll(".tick:first-of-type text").remove();
    //.selectAll('li.search-choice:last-child')
    // use a forEach here and re do the lot like chosen does.
                .select('span')
                .attr('class', 'li_span1')
                .attr('id', function(d,i){ //console.log(i, d);
                      return 'li_span_' + d; })
                .append('span')
                .text(function(d,i){return addedtoDD[i]+dvc.essential.xAxisBarLabel[currSel]; });
                // my selected indicator index
//console.log(currSel);
} // ends F addtoDDlist


function barCodeInfo(clickCode){
//console.log(names);
  var clickName = areaById[clickCode];

  d3.selectAll('.bc_names')
        .html(clickName); //+displayformat

      // for each indicator
      names.forEach(function(d,i){
                d3.select('#bc_vals'+i)
                  .html(function(){ // val for each category
                   var bcvnum = graphic_data[i].filter(function(v){
                               return v.id == clickCode;
                               })
                  return (bcvnum[0].value)+dvc.essential.xAxisBarLabel[i];
         })
    }); // ends names

}  // ends barCodeInfo


function setAxisVal(code) {// console.log("setaxisVal: ", code);

  var meLA = dropdownData.filter(function(n){
     return n.id == code;
 });
 //console.log(meLA[0].label);

  d3.select("#currLine")
    .style("opacity", function(){if(!isNaN(rateById[code])) {return 1} else{return 0}})
    .transition()
    .duration(400)
    .attr("x1", function(){if(!isNaN(rateById[code])) {return x_key(rateById[code])} else{return x_key(midpoint)}})
    .attr("x2", function(){if(!isNaN(rateById[code])) {return x_key(rateById[code])} else{return x_key(midpoint)}});

    // console.log(code);
     //console.log(displayformat(rateById[code]));
  d3.select("#currVal")
    .text(function(){if(!isNaN(rateById[code]) && rateById[code] !=0)  {
          return meLA[0].label+": "+displayformat(rateById[code]); }
          else {return "Data unavailable"; }
          })
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

  function disableMouseEvents() {  console.log("F disableMouseEvents");
      map.off("mousemove", "area", onMove);
      map.off("mouseleave", "area", onLeave);
  }

  function enableMouseEvents() { console.log("F enableMouseEvents")
      map.on("mousemove", "area", onMove);
      map.on("click", "area", onClick);
      map.on("mouseleave", "area", onLeave);
  }

} // else {
// add fallback
// }

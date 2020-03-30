if (Modernizr.svg) {

  var graphic = d3.select('#projections');
  var selectedColour;
  var hoverColour = "#236092";
  var x_key;
  var previousArea;
  var listValues;
  var valueColourPairs =[];
      selected=[];
  var hover = [];
      startColours = ["#053d58","#24a79b","#3a7899","#abc149"];
      unusedColours = ["#053d58","#24a79b","#3a7899","#abc149"];
  var filter;
  var legendVarName;
  var data;
  var currSel = 0;
  var inc;
      dvc = {};
      graphic_data_full = [];
      laCode = [];

      //start tooltips
        //  tippy.setDefaults({
        //    animation:'fade',
        //    arrow:true,
        //    allowHTML:true,
        //    //a11y:true,
        //    maxWidth:375,
        //    theme:'ons',
        //  });

  //setup pymjs
  var pymChild = new pym.Child();
  pymChild.sendHeight();

//   https://develop.onsdigital.co.uk/datasets/ageing-population-projections/editions/time-series/versions/2
  d3.json("https://api.develop.onsdigital.co.uk/v1/datasets/ageing-population-projections").then(function(latest_data) {
    //console.log(latest_data.links.latest_version.href + "/observations?time,geography,sex,agegroups=old-age-dependancy-ratio");
    var latest_link = latest_data.links.latest_version.href;
    //console.log(latest_link);

    // https://develop.onsdigital.co.uk/datasets/ageing-single-households/editions/time-series/versions/2
    // https://develop.onsdigital.co.uk/datasets/ageing-net-flows/editions/time-series/versions/2
    // https://develop.onsdigital.co.uk/datasets/ageing-population-projections/editions/time-series/versions/2
    // https://develop.onsdigital.co.uk/datasets/ageing-economic-activity/editions/time-series/versions/1
    // https://develop.onsdigital.co.uk/datasets/ageing-sex-ratios/editions/time-series/versions/2

    Promise.all([
      d3.json(latest_link + "/observations?time=2018&geography=*&sex=all&agegroups=all"),// this will change from 'all' to 'median'
      d3.json(latest_link + "/observations?time=2018&geography=*&sex=all&agegroups=65%2B"),
      d3.json(latest_link + "/observations?time=2018&geography=*&sex=all&agegroups=85%2B"),
      d3.json(latest_link + "/observations?time=2018&geography=*&sex=all&agegroups=0-15"),
      d3.json(latest_link + "/observations?time=2018&geography=*&sex=all&agegroups=16-64"),
      d3.json(latest_link + "/observations?time=2018&geography=*&sex=all&agegroups=spa%2B"),
      d3.json(latest_link + "/observations?time=2018&geography=*&sex=all&agegroups=16-spa"),
      d3.json(latest_link + "/observations?time=2018&geography=*&sex=all&agegroups=old-age-dependancy-ratio"),
                                                                // ¬
      d3.json("https://api.develop.onsdigital.co.uk/v1/datasets/ageing-sex-ratios/editions/time-series/versions/2" + "/observations?time=2018&geography=*&agegroups=65%2B"),
      d3.json("https://api.develop.onsdigital.co.uk/v1/datasets/ageing-sex-ratios/editions/time-series/versions/2" + "/observations?time=2018&geography=*&agegroups=85%2B"),

      // d3.json("https://api.develop.onsdigital.co.uk/v1/datasets/ageing-net-flows/editions/time-series/versions/2" + "/observations?time=2018&geography=*&sex=all&agegroups=65%2B"),
      // d3.json("https://api.develop.onsdigital.co.uk/v1/datasets/ageing-net-flows/editions/time-series/versions/2" + "/observations?time=2018&geography=*&sex=all&agegroups=85%2B"),

      //d3.json("https://api.develop.onsdigital.co.uk/v1/datasets/ageing-economic-activity/editions/time-series/versions/1" + "/observations?time=2018&geography=*&sex=all&agegroups=ageing-employment-rate"),
      //d3.json("https://api.develop.onsdigital.co.uk/v1/datasets/ageing-economic-activity/editions/time-series/versions/1" + "/observations?time=2018&geography=*&sex=all&agegroups=ageing-economic-activity"),

      d3.json("https://api.develop.onsdigital.co.uk/v1/datasets/ageing-single-households/editions/time-series/versions/2" + "/observations?time=2018&geography=*&sex=all&agegroups=65%2B"),
      d3.json("https://api.develop.onsdigital.co.uk/v1/datasets/ageing-single-households/editions/time-series/versions/2" + "/observations?time=2018&geography=*&sex=all&agegroups=85%2B"),

    //  https://api.develop.onsdigital.co.uk/v1/datasets/ageing-single-households/editions/time-series/versions/2

	  d3.json("lib/geog2019.json")

    ]).then(function(dat) {
      ready(dat)
    });

  })


function ready(data) {  //console.log(data);

  d3.json('config.json').then(function(config_data) {

	  configdata = config_data;

    // reorganise the data
    var names = [];

    var clean_data=[];

    data.forEach(function(d,i) {
		if(i < data.length-1){
			  var group = d.dimensions.agegroups.option.id;
        // you gotta tally up names and cats
        groupie = group; // for those that don't need changing
        if(group=='old-age-dependancy-ratio') groupie = 'old-age-dependancy-ratio';
        if(group=='16-spa') groupie = 'sixteen-spa';
        if(group=='spa+') groupie = 'spa';
        if(group=='16-64') groupie = 'sixteen-64';
        if(group=='0-15') groupie = 'zero-15';
        if(group=='65+' && i == 1) groupie = 'over65';
        if(group=='85+' && i == 2) groupie = 'over85';
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
          clean_data.push({ 'id':d.dimensions.geography.id, 'label':d.dimensions.geography.label, 'value':+d.observation, 'group':groupie })
          });

		} // ends if
    });
        //console.log("names");
        //console.log(names);

    // // filter out the blank observations - pre 2019 boundaries/areas
    var oldLA = [
      "Waveney", "Bournemouth", "West Somerset", "Poole", "Forest Heath", "Purbeck", "North Dorset", "Taunton Deane", "West Dorset",
      "Glasgow City", "Suffolk Coastal", "Christchurch", "East Dorset", "North Lanarkshire", "Perth and Kinross", "Fife", "Weymouth and Portland", "St Edmundsbury", "Great Britain"
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


    //   removeGR.forEach(function(d,i) {
    //     clean_data = clean_data.filter(function(item) {
    //
    //     if(item.group=='over65-nf' && item.label !== d){}
    //
    //
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

    console.log("Cleaned data with appropriate group names")
    console.log(clean_data);

  // clear the dropdown
  d3.select("#selectNav").selectAll("*").remove();

  // Build option menu
  var optns = d3.select("#selectNav")
                .append("div")
                .attr("id","sel")
                .attr('style', 'height:200px')
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
                //.attr("class","chosen-select");

    var newLi = d3.select("#sel").append('div')
                        .attr('id', 'newList');

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
    dropdownData = clean_data.filter(function(v,i,a){ //console.log(v,i,a);
          return a.findIndex(function(t){
                                          return t.id === v.id
                                        })===i});

	dropdownData.sort( compare );
  console.log(dropdownData);

    optns.selectAll("p")
      .data(dropdownData)
      .enter()
      .append("option")
      .attr("value", function(d){ return d.id })
      .text(function(d){ return d.label });

    $('#areaselect').chosen({
      placeholder_text_single: "Choose up to 4 areas",
      allow_single_deselect:true,
      disable_search:true,
      max_selected_options: 4
    })
    .on('change',function(evt,params){ console.log(evt, params.selected);
      if(Object.keys(params)[0] === 'selected') {
        if(selected.length <= 4) {

                // add a selection
                selected.push(params.selected);
              //  console.log("selected+ ", selected, evt, params.selected);
                if(d3.select("#barcodes").style("display") === 'inline'){
                                                        setAxisVal(params.selected); }
                //allChange(params.selected);

                valueColourPairs.push({"value":params.selected,"colour":unusedColours[0]});
            //  console.log("valueColourPairs", valueColourPairs);
                unusedColours.shift();
                hoverColour = unusedColours[0];

                d3.selectAll(".search-choice")
                .data(selected)
                .join()
                .style("background-color",function(d){
                                  return valueColourPairs.filter(function(e){
                                          //console.log(e);
                                          return e.value == d})[0].colour;
                                          });

                selectedColour = valueColourPairs.filter(function(d){ return d.value===params.selected })[0].colour;

                newOrder(params.selected); // dropdownData,

                filter = ['match', ['get', 'AREACD'], selected, true, false];
                map.setFilter('state-fills-hover',filter);

                //highlight(params.selected);


                if(d3.select("#barcodes").style("display") === 'inline'){
                                  console.log('barcode page open');
                                  // add data to graphic_data_full
                                  highlight(params.selected);
                    }else{ console.log('projected page open');
                      readData();
                      //  ==> drawLine
                      }
            } // ends if(selected.len < 4 )
      }  // ends  === 'selected'
  // else deleting deleting deleting deleting deleting deleting
      else { console.log("deleting ",params.deselected);
        // delete deselected item from selected array
        selected = selected.filter(function(item) {
          return item !== params.deselected;
        });
    console.log("selected- ", selected);
        // push the colour associated with the value to the beginning of the unusedColours arrayfg
        unusedColours.unshift(valueColourPairs.filter(function(d){ return d.value == params.deselected })[0].colour)
        if(unusedColours.length === 4) {
          unusedColours = startColours;
        }
        hoverColour = unusedColours[0];
        //  console.log("hoverColour ", unusedColours[0]);

        if(selected.length > 0) {
              filter = ['match', ['get', 'AREACD'], selected, true, false]
              map.setFilter('state-fills-hover',filter)
            } else {
              map.setFilter("state-fills-hover", ["==", "AREACD", ""]);
            }

      //  var inc;
        // delete the entry from value colour pairs
        valueColourPairs = valueColourPairs.filter(function(d,i) {
          //console.log(i, d.value, params.deselected);
          if(d.value == params.deselected) {inc = i;}
          return d.value !== params.deselected;
        });
      //  console.log(inc, " F Ready, Now only: ", valueColourPairs);

// NOT WORKING %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
         //console.log(graphic_data_full[0].length, graphic_data_full);
         //console.log(graphic_data_full[0].splice(inc+1,1));

    if (typeof /*graphic_data_full != "undefined" && */graphic_data_full != null && graphic_data_full.length > 0)
     {
         graphic_data_full[0].splice(inc+1,1);
         console.log("removed data from graphic-data-full - sure?: ",params.deselected);
          console.log(graphic_data_full);
      }

//////////////////////////// NEW  //////////////////////////////
            // remove index inc??
              if (laCode[0] > 0){
              laCode[0] = laCode[0].filter(function(d,i) {
                    console.log(i, d, params.deselected);
                    return d !== params.deselected;
                    });
                console.log("laCode - params - WORKING - sure?  ", laCode);
              }

    removeLine(params.deselected); // I need to add 0-n
    unhighlight(params.deselected);

          //  if(d3.select("#barcodes").style("display") === 'inline'){

      } // ends else

    }); // ends event listener


    d3.select('#current').on('click', function(){ console.log('current');
                                      d3.select("#barcodes").style("display", "inline");
                                      d3.select("#projections").style("display", "none");
                                    });
    d3.select('#projection').on('click', function(){ console.log('projected');
                                        //console.log(this);
                                        if(selected.length > 0){
                                        d3.select("#barcodes").style("display", "none");
                                        d3.select("#projections").style("display", "inline");

                                        //  get data if first time??!?
                                        // if laCode != selected ¬
                                          readData();
                                        }
                                    });


    d3.select('#barcodes').append('div')
                          .style('clear', 'both')
                          .append('p')
                          .attr('id', 'selectNavPara')
                          .text("Hover over the distribution of lines below to show data for each area. Multiple local authorities may have the same values.")

          // Add orange average block
            d3.select("#barcodes").append('div')
            .style('float', 'left')
            //.attr("class", "chosen-choices")
            .append('b')
            .attr('class', 'bloc')
            .style('padding', '5px 30px 5px 8px')
            .style('margin-bottom', '8px')
            .text('UK average')
            .style('color', '#fff')
            .style("background-color", "#f93");

            d3.select('#barcodes')
            .append('div')
            .attr('id', 'blocmap')
            .append('p')
            .text('Select ageing indicator');

          //  .style('color', '#')
//console.log('names in barcodes div');
//console.log(names);

        d3.select("#barcodes").append('div')
          .attr('id', 'barcodes2');


    var headers = d3.select('#barcodes2').selectAll('nbbath')
                    .data(names).enter()
                    .append('div')
                    //.attr('class', 'col-sm-6 col-xs-12 barcode')
                    .attr('id', function(d,i) { //console.log("h " + names)
                                        return 'category-' + d.replace('+','') + '-category';
                                      })
                    .append('div')
                    .attr('class', 'chartTitle')
                    .html(function(d,i) {
                      return config_data.essential.variablelabels[i];
                    })
                    .append('div');

      headers.attr('class', 'field__item field__right js-focusable-box')
              .style('display', 'inline-block')
              .style('float', 'right')
              .append('input')
              .attr('checked', function(d){
                      if(d.replace('+','') == 'all') // all is CMD for median at te mo.
                            { //console.log('input checked ',d);
                            return 'checked'; }
                            })
              // .on('click', function(d){
              //                        console.log(d);
              //                          updateMap(d); //this.value
              //                     })
              .attr('class', 'input input--radio js-focusable radiobtn')
              //.attr('width', 10)
              //.attr('height', 10)
              .attr('name', 'maps')
              .style('margin', 0+'px')
              .attr('aria-pressed', function(d){
                      if(d.replace('+','') == 'all')
                            { //console.log('all aria ' , d.replace('+','') );
                            return 'true'; }
                            else {// console.log('false: '+ d.replace('+',''));
                                    return 'false'; }
                            })
              .attr('id', function(d){ return "id" + d.replace('+','');  })
              .attr('type', 'radio');

      // headers.append('label')
      //         //.text('click for map')
      //         .attr('class', 'label label--inline venus')
      //         .attr('for', function(d){ return d.replace('+','');  });

      drawGraphic(clean_data, names, config_data, data[data.length-1])
    });

} // end of ready




function drawGraphic(chart_data, categories, config, geog) {

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
         var margin = {top: dvc.optional.margin_sm[0], right: dvc.optional.margin_sm[1], bottom: dvc.optional.margin_sm[2], left: dvc.optional.margin_sm[3]};
         //var chart_width = parseInt(graphic.style("width")) - margin.left - margin.right;
         var height = dvc.essential.barHeight_sm_md_lg[0] +0 - margin.top - margin.bottom;
         	var innerPadding = { top : innerPadding_values.sm[0] ,  right : innerPadding_values.sm[1] ,  bottom : innerPadding_values.sm[2] ,  left : innerPadding_values.sm[3] };
     } else if (parseInt(graphic.style("width")) < threshold_md){
         var margin = {top: dvc.optional.margin_md[0], right: dvc.optional.margin_md[1], bottom: dvc.optional.margin_md[2], left: dvc.optional.margin_md[3]};
         //var chart_width = parseInt(graphic.style("width")) - margin.left - margin.right;
         var height = dvc.essential.barHeight_sm_md_lg[0] +0 - margin.top - margin.bottom;
         	var innerPadding = { top : innerPadding_values.md[0] ,  right : innerPadding_values.md[1] ,  bottom : innerPadding_values.md[2] ,  left : innerPadding_values.md[3] };
     } else {
         var margin = {top: dvc.optional.margin_lg[0], right: dvc.optional.margin_lg[1], bottom: dvc.optional.margin_lg[2], left: dvc.optional.margin_lg[3]}
         //var chart_width = parseInt(graphic.style("width")) - margin.left - margin.right;
         var height = dvc.essential.barHeight_sm_md_lg[0] +0 - margin.top - margin.bottom;
         var innerPadding = { top : innerPadding_values.lg[0] ,  right : innerPadding_values.lg[1] ,  bottom : innerPadding_values.lg[2] ,  left : innerPadding_values.lg[3] };
     }
     //var chart_width = parseInt(graphic.style("width"))
     var barcode_width = parseInt(d3.select('#graphic').style("width"));
     console.log("barcode_width, height  ", barcode_width, height);

     var x = d3.scaleLinear()
       .range([ 0, (barcode_width - innerPadding.left-innerPadding.right - 20)]);
       //.range([ 0, barcode_width - margin.left-margin.right]);
    //  var middle = (barcode_width - innerPadding.left-innerPadding.right)/2;
    var middle = (((barcode_width - margin.left-margin.right)/2) - 40);

     var xAxis = d3.axisBottom()
       .scale(x)
	   .ticks(5);


// Main loop  ////////////////////////////////////////////////////////////


  categories.forEach(function(d,i) {
      var category = d;
      var graphic_data = chart_data.filter(function(d) {
                      return d.group === category; // cats were hand picked
                    });
      // find maximum as they cannot have same domain
      var max = d3.max(graphic_data, function(d) { return +d.value; });

      var min = d3.min(graphic_data, function(d) { return +d.value; });

      x.domain([min,max]).nice();


      // Maybe loop to grab UK value to place into x(mean)
      var ukMean = graphic_data.filter(function(d){
            if(d.label === "United Kingdom" /*&& +d.value != 0*/){ return d.label === "United Kingdom"}
          });
          //console.log(ukMean, ukMean.length, ukMean[0]);
// if mex ain't make it 0
    var mex = ukMean[0].value;
      if(ukMean[0].value != 0){ var diff = parseInt(middle) - parseInt(x(mex)); }
      else{ var diff = 0; } // console.log(diff, ukMean[0]) }
    //  console.log("middle, mex, diff: ", middle, mex, diff);


    //  hh over 65 - not a selector
      var svg = d3.select("#category-" + category + '-category').append('svg')
        .attr("class","chart")
        .style("background-color","#fff")
        .attr("width", barcode_width)
        .attr("height", height + margin.top + margin.bottom );

      var g = svg
        .append("g")
        .attr("transform", "translate(" + (diff+20) + "," + (margin.top+30) + ")");

      g.append('g').attr("class","bars")
        .selectAll('rect')
        .data(graphic_data)
        .enter()
        .append('rect')
        //.attr("fill","#d8dadb")
        .attr("fill", function(d){
                  if(d.label === 'United Kingdom' && diff !=0) { return "#f93"; }
                        else  { return "#ccc"; } // //console.log(diff, d.group);
        })
        .attr("class",function(d,i){ return d.id; })
        // .attr("id",function(d,i){
        //   return d.AREACD
        // })
      //  .attr("stroke-width",10)
      //  .attr("stroke","rgba(1,1,1,0)")
        .attr("opacity","0.6")
        .attr("width", function(d){
                  if(d.label === 'United Kingdom' && diff !=0) { return "3"; }
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
		d3.selectAll(".K02000001").attr("opacity",1).raise();

      //Appends the x axis
      var xAxisGroup = g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (35) + ")")
        .call(xAxis.tickFormat(function(d){ return d + dvc.essential.xAxisBarLabel[i] }) );


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
          if(d3.select("."+d.data.id).classed("active") === false && selected.length < 4) {//
                //console.log("voronoi gives : ");
                //console.log(d.data, d.data.id);
                  onMove(d.data.id);
                }
        })
        .on("mouseout", function(d) { mouseout(d.data.id)})
        .on("click", function(d) {
        //  console.log("valueColourPairs OnClick: ", valueColourPairs, valueColourPairs.length);
          if(selected.length < 4) onClick(d.data.id) });

    }) // end of forEach loop

 //   d3.json('lib/geog2019.json').then(function(geog) {
      drawMap(chart_data, dvc, geog)
  //  });



function drawMap(map_data, dvc, geog) {

      data = map_data.filter(function(d) {
        return d.group === "all"; //change this to median
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
      createKey(config,currSel);

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
          //console.log("laCode OnClick: ", laCode, laCode.length);
          //console.log("valueColourPairs OnClick: ", valueColourPairs, valueColourPairs[0].length);
          if(selected.length < 4) onClick(d.features[0].properties.AREACD)
        });

        //get location on click
        // d3.select(".mapboxgl-ctrl-geolocate").on("click",geolocate);

  });


      function selectArea(code) { console.log(code);
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


  function createKey(config, currSel){

        d3.select("#keydiv").selectAll("*").remove();

        keywidth = d3.select("#keydiv").node().getBoundingClientRect().width;

        var svgkey = d3.select("#keydiv")
          .append("svg")
          .attr("id", "key")
          .attr("width", keywidth)
          .attr("height",100);


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
          .attr("transform", "translate(15,50)");

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
          .attr("opacity",0);

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
        //Temporary	hardcode unit text
        //dvc.unittext = "change in life expectancy";

        d3.select("#keydiv")
          .append("p")
          .attr("id","keyunit")
          .style("margin-top","-10px")
          .style("margin-left","10px")
          .text(configdata.essential.variablelabels[currSel]);

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



    // get the clicked "show map" button
    // d3.selectAll(".btn")
    //   .on('click', function(d,i) {
    //     updateMap(this.value)
    //   })

    d3.selectAll(".radiobtn").on('click', function(d,i){
                           console.log(d);
                             updateMap(d,i); //this.value
                        })
    //.attr('class', 'input input--radio js-focusable')



            function updateMap(dataCategory,currSel) {
              data = chart_data.filter(function(d) {
                                            return d.group === dataCategory;
                                          });

                    defineBreaks();
              	    setupScales();
                    createKey(config,currSel);
                    updateLayers();

              } // end of update map

    } // end of drawMap

  } // end of drawGraphic
//_________________________________________________________________________

//_________________________________________________________________________

//_________________________________________________________________________


function drawGraphicLines(read_data) { console.log("drawGraphicLines with: read_data from graphic-data-full", graphic_data_full);

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

      //set variables for chart dimensions dependent on width of #graphic. Could put this in with button creation
      // if (graphic.width() + 20 < threshold_sm) {
      //   var margin = {
      //     top: dvc.optional.margin_sm[0],
      //     right: dvc.optional.margin_sm[1],
      //     bottom: dvc.optional.margin_sm[2],
      //     left: dvc.optional.margin_sm[3]
      //   };
      //
      //   height = (Math.ceil((chart_width * dvc.optional.aspectRatio_sm[1]) / dvc.optional.aspectRatio_sm[0]) - margin.top - margin.bottom);
      //
      //   var innerPadding = {
      //     top: innerPadding_values.sm[0],
      //     right: innerPadding_values.sm[1],
      //     bottom: innerPadding_values.sm[2],
      //     left: innerPadding_values.sm[3]
      //   }
      //
      //   numberColumns = dvc.essential.numColumns_sm_md_lg[0];
      //
      // } else if (graphic.width() + 20 < threshold_md) {
      //   var margin = {
      //     top: dvc.optional.margin_md[0],
      //     right: dvc.optional.margin_md[1],
      //     bottom: dvc.optional.margin_md[2],
      //     left: dvc.optional.margin_md[3]
      //   };
      //
      //   height = (Math.ceil((chart_width * dvc.optional.aspectRatio_md[1]) / dvc.optional.aspectRatio_md[0]) - margin.top - margin.bottom);
      //
      //   var innerPadding = {
      //     top: innerPadding_values.md[0],
      //     right: innerPadding_values.md[1],
      //     bottom: innerPadding_values.md[2],
      //     left: innerPadding_values.md[3]
      //   }
      //
      //   numberColumns = dvc.essential.numColumns_sm_md_lg[1];
      //
      // } else {
        var margin = {
          top: dvc.optional.margin_lg[0],
          right: dvc.optional.margin_lg[1],
          bottom: dvc.optional.margin_lg[2],
          left: dvc.optional.margin_lg[3]
        }

        var innerPadding = {
          top: innerPadding_values.lg[0],
          right: innerPadding_values.lg[1],
          bottom: innerPadding_values.lg[2],
          left: innerPadding_values.lg[3]
        }

        var chart_width = graphic.width(); // - margin.left - margin.right;

      height = (Math.ceil(((chart_width/2)* dvc.optional.aspectRatio_lg[1]) / dvc.optional.aspectRatio_lg[0])); //  - innerPadding.top - innerPadding.bottom
      if(height > 240) height = 240;
        numberColumns = dvc.essential.numColumns_sm_md_lg[2];
        console.log("chart_width, height: ", chart_width, height);
      //};

      var l = 0;
      // parse data into columns
      var lines = {};

      var myMinimum = 0;
      var myMaximum = 0;

      for (var numLines = 0; numLines < read_data.length; numLines++) { // 2 files at present
        lines[numLines] = {};
         //console.log(read_data[numLines])

        for (var column in read_data[numLines][0]) {
          if (column == "date") continue;
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
      //console.log("min,max in "+ myMinimum + " , " + myMaximum);

      dvc.mrtsTicks = calcOptimumTicks(myMinimum, myMaximum);
      dvc.mrtsTicks[0] = dvc.mrtsTicks[0] - 0.0000001;
      dvc.mrtsTicks[1] = dvc.mrtsTicks[1] + 0.0000001;

      var yDomain = dvc.essential.yDomain;

      var graph_unitWidth = (chart_width*0.95) / numberColumns;
      var graph_unitHeight = height;
      console.log("graph_unitWidth graph_unitHeight",graph_unitWidth,graph_unitHeight);
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
    //  console.log("chart_width, height", chart_width, height);


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
          graphLines = {};

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
          //console.log("graphLines  ", graphLines);

          dvc.numGraphs = k;
          xCoord = (i - 1) * graph_unitWidth;
          yCoord = (j - 1) * graph_unitHeight;

        // create and append small SVG panel for each individual graph, k
      var svg = d3.select('#projections')
            .append('svg')
            .attr("class", "graphUnitSVGs")
            .attr("id", "svg" + (k + 1))
            //.attr("x",xCoord)  // (i-1)*graph_unitWidth + graph_unitMargins.left )
            //.attr("y",yCoord)  //(j-1)*graph_unitHeight + graph_unitMargins.top )
            .attr("width", graph_unitWidth)
            .attr("height", graph_unitHeight)
            //.style("background-color", "#eee")
            .append("g");
          //.attr("transform", "translate(" + (0) + "," + (0) + ")");

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
          Object.keys(graphLines).forEach(function(d) { // for each chart

            var key =  Object.keys(graphLines[d])
            // console.log(graphLines[d][key].length)
            max =  d3.max(graphLines[d][key], function (ms) {
                                                            // console.log(ms)
                                                            return ms.amt
                                                        });
            maxArr.push(max);
            // console.log('max', max, maxArr)

          })
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


          // draw text in upper right corner of each graph with the associated title from data.csv
          // var wrap,
          //   text;
          //   wrap = d3.textwrap()
          //         .bounds({height:120, width:graph_unitWidth - innerPadding.right - innerPadding.left});
          //
          //         text = d3.selectAll(configdata.essential.variablelabels[k])
          //                   .attr('class', 'titleTx')
          //                   .attr('id', function(d) {
          //                     return currentColoumn.replace(/\d/g, '');
          //                   })
          //                   .style("pointer-events", "none")
          //                   .attr("text-anchor", "start")
          //                   .attr('transform', "translate(0, 14)");
          //         text.call(wrap);

          svg.append("text")
            .attr('class', 'titleTx')
            .attr('id', function(d) {
              return currentColoumn.replace(/\d/g, '');
            })
            .style("pointer-events", "none")
            .attr("text-anchor", "start")
            .attr('transform', "translate(0, 14)")

           .text(configdata.essential.variablelabels[k+1])//, (graph_unitWidth - innerPadding.right))


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

          //create centre line if required
          if (dvc.optional.centre_line == true) {
            svg.append("line")
              .attr("id", "centreline")
              .attr('y1', y(dvc.optional.centre_line_value) + innerPadding.top)
              .attr('y2', y(dvc.optional.centre_line_value) + innerPadding.top) //   + graph_drop
              .attr('x1', innerPadding.left)
              .attr('x2', graph_unitWidth - innerPadding.right);
          } else if (yDomain[0] < 0) {

            svg.append("line")
              .attr("id", "centreline")
              .attr('y1', y(0) + innerPadding.top) //  + graph_drop
              .attr('y2', y(0) + innerPadding.top) //  + graph_drop
              .attr('x1', innerPadding.left)
              .attr('x2', graph_unitWidth - innerPadding.right);

          } // end else if...

          // **** only draw y-axis config labels if drawing graphs in first COLUMN  - find Bootstrap alternative
          // if (j == 1) {

            // add y-axis label and line annotation if they are to both be only on the first in the row
            svg.append("text")
              .attr("class", "axislabel")
              .attr("id", "yAxisLabel" + k)
              .attr("x", innerPadding.left / 2)
              .attr("y", innerPadding.top - 10) //  + graph_drop
              .text(dvc.essential.yAxisLabel[k]);


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
                            svg.append("text")
                            .attr("text-anchor", "end")
                            .attr('font-size', "14px")
                            .attr("x", graph_unitWidth)
                            .attr("y", graph_unitHeight -(innerPadding.top/3))
                            .text("year");

       //console.log(valueColourPairs);

        //  if (dvc.essential.chart_type /*[dataIndex]*/ === "line") {
            //create lines
            svg.append('g')
              .attr("id", function() {
                return 'group' + k;
              })
              .attr("transform", function() {
                if (j == 1 || j == 3) {
                  return "translate(" + (innerPadding.left) + ", " + (innerPadding.top) + ")";
                } else {
                  return "translate(" + (innerPadding.left) + ", " + (innerPadding.top) + ")";
                }

              })
              .selectAll('path')
              .data(d3.values(graphLines))
              .enter()
              .append('path')
              .attr('class', function(d,i) { return 'line line-' + i;/* +" "+ valueColourPairs[i].value; */})
              .attr('id', function(d,i) { return 'line_' + valueColourPairs[i].value + i; } )
            // .attr("data-tippy-content", function(d,i){
            //           return "I'm trippy";
            //         })
              .style("stroke-width", "2px")
			        //.attr("stroke",function(d,i){ return startColours[i]})
              .attr("stroke",function(d,i){ return valueColourPairs[i].colour})
              .style('opacity', 0.8)
              .attr('d', function(d, i) {
                return dvc.line(d[currentColoumn]);
              })
              .on('mouseover', function(d,i){
              //var idHighlight = valueColourPairs[i].value;
                d3.selectAll('.bloc').style('opacity', 0.2);
                d3.select('#'+'blocNo_' + valueColourPairs[i].value).style('opacity', 1);

                d3.selectAll('path.line').style('opacity', 0.2);
                d3.selectAll('#line_' + valueColourPairs[i].value + i).style('opacity', 1);
                })
               .on('mouseout', function(d){
                 d3.selectAll('.bloc').style('opacity', 1);
                 d3.selectAll('path.line').style('opacity', 1);
                });
                //tippy(path.node());  // .node()
                // d3.selectAll('.line')
                //   .html(function(d,i){
                //                   return "<p data-tippy-content='" + 'Source: '+ valueColourPairs[i].value + "</p>";
                //               });
                //         tippy('p');


          // only draw x-axis config labels if drawing graphs in final ROW
          //if ( i == numberRows ) {

          svg.append("text")
            .attr("class", "axislabel")
            .attr("id", "xAxisLabel" + k)
            .attr("x", graph_unitWidth - innerPadding.right)
            .attr("y", graph_unitHeight - 16) //   + graph_drop
            //									.attr("y" , function (d,i){
            //										if (graphic.width() < threshold_sm) { return graph_unitHeight - (0); }
            //										else if (graphic.width() < threshold_md) { return graph_unitHeight - (0); }
            //										else { return graph_unitHeight - (10); }
            //									})
            .text(dvc.essential.xAxisLabel);

          //} // end if ...

          k++; // next row

        } // ends columns j

      } // finally end the rows K *********************************


      // writeAnnotation(); ==> removed from code.
      // function drawLine() ==> removed from code.


      //create link to source
      d3.select('#source').text('Source: ' + dvc.essential.sourceText);

      //use pym to calculate chart dimensions - is this needed
      if (pymChild) {
        pymChild.sendHeight();
      }

  } // end function drawGraphicLines()
 // _________________________________________________________________________


function newOrder(listID){ console.log('newOrder', selectedColour, listID);
// dropMurphy,
  var localA = dropdownData.filter(function(d){
    return d.id == listID;
  });

            d3.select('#newList')
        //  newLi
              .append('div')
              .attr('class', 'newBloc')
              .style('float', 'left')
              .append('b')
              .attr('class', 'bloc')
              .attr("id", function(d,i){
                      return 'blocNo_' + localA[0].id;
              })
              .style('padding', '5px 30px 5px 8px')
              .style('margin-bottom', '8px')
              .style('color', '#fff')
              .style("background-color", selectedColour)
            //  .append('span')
              .text(localA[0].label)
              .append('span')
              .style('float', 'right')
              .text(localA[0].value)
              .append('span')
              .style('float', 'right')
              .append('div')
              .text(' x')
              .attr('class','search-choice-close')
// split the above to manage
              // .on('mouseover', function(d,i){
              // //var idHighlight = valueColourPairs[i].value;
              //   d3.selectAll('.bloc').style('opacity', 0.2);
              //   d3.select('#'+'blocNo_' + valueColourPairs[i].value).style('opacity', 1);
              //
              //   d3.selectAll('path.line').style('opacity', 0.2);
              //   d3.selectAll('#line_' + valueColourPairs[i].value + i).style('opacity', 1);
              //   })
              //  .on('mouseout', function(d){
              //    d3.selectAll('.bloc').style('opacity', 1);
              //    d3.selectAll('path.line').style('opacity', 1);
              //   });
}




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
    console.log("laCode readData: ", laCode, laCode.length);

    //  throw new Error("Something went badly wrong!");
      // I'm projecting and just require the time series if I don't
      // already have it: use selected, check graphic_data_full

      // I'm adding an LA to the dataset from projected: selected

      var difference = [];
      var datasets = [];

//       if (typeof /*graphic_data_full != "undefined" && */ graphic_data_full != null && graphic_data_full.length > 0)
//         {
//           console.log("We have data and been here already. BUT what of it is the same as this...", graphic_data_full);
//
//           // diff = selections - laCode
//               //laCode[0].pop();
//               console.log("laCode readData: ", laCode, laCode[0].length/*, laCode[0].pop() */);
// laCode[0].pop();
//           difference.push(diffArray(laCode[0], selected));// get laCode sorted first
//
//                     function diffArray(arr1, arr2) {
//                                                   return arr1.filter(function(elem){
//                                                     return arr2.indexOf(elem) < 0;
//                                                   }).concat(arr2.filter(function(elem){
//                                                     return arr1.indexOf(elem) < 0;
//                                                   }));
//                       }
//                       console.log("difference. Can be > 1 as you could go to current yr then selected a load, then hit projection again.");
//                       // Because laCode seems to be bound to selected which gives 0, I'll push a value in to test.
//                       //difference.push(selected[selected.length-1]);
//                       console.log(" difference ", difference);
//                         // function read(difference)
//           difference[0].forEach(function(code,i) { console.log(i, code);
//             // datasets.push(
//               Promise.all(
//                 [
//                   d3.json("https://api.develop.onsdigital.co.uk/v1/datasets/ageing-population-projections/editions/time-series/versions/1/observations?time=*&geography="+code+"&sex=male&agegroups=old-age-dependancy-ratio"),
//                   d3.json("https://api.develop.onsdigital.co.uk/v1/datasets/ageing-population-projections/editions/time-series/versions/1/observations?time=*&geography="+code+"&sex=male&agegroups=16-spa"),
//                   d3.json("https://api.develop.onsdigital.co.uk/v1/datasets/ageing-population-projections/editions/time-series/versions/1/observations?time=*&geography="+code+"&sex=male&agegroups=spa%2B"),
//                   d3.json("https://api.develop.onsdigital.co.uk/v1/datasets/ageing-population-projections/editions/time-series/versions/1/observations?time=*&geography="+code+"&sex=male&agegroups=16-64"),
//                   d3.json("https://api.develop.onsdigital.co.uk/v1/datasets/ageing-population-projections/editions/time-series/versions/1/observations?time=*&geography="+code+"&sex=male&agegroups=0-15"),
//                   d3.json("https://api.develop.onsdigital.co.uk/v1/datasets/ageing-population-projections/editions/time-series/versions/1/observations?time=*&geography="+code+"&sex=male&agegroups=85%2B"),
//                   d3.json("https://api.develop.onsdigital.co.uk/v1/datasets/ageing-population-projections/editions/time-series/versions/1/observations?time=*&geography="+code+"&sex=male&agegroups=65%2B")
//                 ]
//               // )
//             ).then(function(all_dataset) {
//                console.log(all_dataset);
//
//               var smallMultipleData = [];
//
//               all_dataset.forEach(function(data) {
//                   var group = data.dimensions.agegroups.option.id;
//                   // console.log(group)
//                   data.observations.forEach(function(d,i) {
//                                             var row = {};
//                                             row[group] = +d.observation;
//                                             row['date'] = d.dimensions.time.id;
//                                             row['group'] = group;
//                                             // console.log(row)
//                                             smallMultipleData.push(row)
//                                           })
//                                 });
//
//                 datasets.push(smallMultipleData);
//                 console.log(smallMultipleData, datasets);
//                 console.log("push difference in laCode nth round ", i, difference.length-1);
//                 if(i == difference.length-1){
//                       //  re address laCode to new knowns
//                       laCode = [];
//                       console.log(selected, difference);
//                       laCode.push(selected);
//                     //  laCode[0].push(difference[0]); // be careful if > 1
//                       console.log("laCode: ",laCode);
//                      ready1(datasets);
//                 }
//               }) // ends then
//
//             }) // ends forEach require api pull
//
//
//       // pymChild = new pym.Child({
//       //   renderCallback: drawGraphicLines
//       // });
//
//           } else {
            console.log("No data: complete apiCall...", selected);

            var removeGR = ['E12000007', 'E12000008', 'E12000009', 'E12000006', 'E12000004', 'E12000007', 'E12000002', 'E12000001', 'E12000003', 'E92000001', 'S92000003', 'W92000004', 'K04000001'];

            removeGR.forEach(function(d,i) {
              selected = selected.filter(function(item) {
              //  console.log(i, item.group);
                if(item !== d)   return item;
              })
            });
console.log("with just", selected);


              selected.forEach(function(code,i) {
                // datasets.push(
                  Promise.all(
                    [
                      d3.json("https://api.develop.onsdigital.co.uk/v1/datasets/ageing-population-projections/editions/time-series/versions/1/observations?time=*&geography="+code+"&sex=male&agegroups=65%2B"),
					  d3.json("https://api.develop.onsdigital.co.uk/v1/datasets/ageing-population-projections/editions/time-series/versions/1/observations?time=*&geography="+code+"&sex=male&agegroups=85%2B"),
					  d3.json("https://api.develop.onsdigital.co.uk/v1/datasets/ageing-population-projections/editions/time-series/versions/1/observations?time=*&geography="+code+"&sex=male&agegroups=0-15"),
					  d3.json("https://api.develop.onsdigital.co.uk/v1/datasets/ageing-population-projections/editions/time-series/versions/1/observations?time=*&geography="+code+"&sex=male&agegroups=16-64"),
					  d3.json("https://api.develop.onsdigital.co.uk/v1/datasets/ageing-population-projections/editions/time-series/versions/1/observations?time=*&geography="+code+"&sex=male&agegroups=spa%2B"),
					  d3.json("https://api.develop.onsdigital.co.uk/v1/datasets/ageing-population-projections/editions/time-series/versions/1/observations?time=*&geography="+code+"&sex=male&agegroups=16-spa"),
					  d3.json("https://api.develop.onsdigital.co.uk/v1/datasets/ageing-population-projections/editions/time-series/versions/1/observations?time=*&geography="+code+"&sex=male&agegroups=old-age-dependancy-ratio"),


                  // projections not there yet
                      d3.json("https://api.develop.onsdigital.co.uk/v1/datasets/ageing-single-households/editions/time-series/versions/2/observations?time=*&geography="+code+"&sex=male&agegroups=85%2B"),
                      d3.json("https://api.develop.onsdigital.co.uk/v1/datasets/ageing-single-households/editions/time-series/versions/2/observations?time=*&geography="+code+"&sex=male&agegroups=65%2B")
                    ]
                  // )
                ).then(function(all_dataset) {  //do the calcs somewhere else as
                                              //obj are getting manipulated before completion
                   console.log("all_dataset collected from api: ",code);
                    console.log(all_dataset);

                  var smallMultipleData = [];

                  // Skim off data required from download
                  all_dataset.forEach(function(data) {
                      var group = data.dimensions.agegroups.option.id;
                      // console.log(group)
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
                    console.log(datasets.length);
                  //  console.log("push difference in laCode first round ", i, selected.length-1);

                				if(i== selected.length-1){
                          if(laCode.length<1){
                                 laCode.push(selected); // remember old calls just to check
                               } else {
                                 laCode[0].push(selected);
                               }
                              //   console.log("laCode after 1st api grab ",laCode);
                						 	ready1(datasets);
                						 }
                }) // ends then

            }) // ends forEach require api pull

    //  } // ends else
} // end function readData()


function ready1(all_data) {   console.log("Ready1");
        console.log(all_data);

        function sortByDateAscending(a, b) {
            // Dates will be cast to numbers automagically:
            return a.date - b.date;
        }

        // data = data.sort(sortByDateAscending);

        all_data.forEach(function(d, i) {
          // console.log(d)
          d.forEach(function(e, j) {
            d = d.sort(sortByDateAscending);
          })
        });
         console.log(all_data);

        var new_data = [];

        all_data.forEach(function(data,i) {
          // console.log(data)
          var nest = d3.nest()
            .key(function(d) { return d.date; })
            .entries(data);
          // console.log(nest);
          new_data.push(nest);
        })

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
    //  if(I got a partial data Add with (graphic_data_full+final_data)) then pym
      //  graphic_data_full = final_data;

      //console.log("graphLines");
          //console.log(graphLines);

      // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
      // Now need to add lines to chart and
      // merge data and lacode to = new selection after F ready1
   //    console.log("projections require merging data");
   //    console.log("datasets");
   //    console.log(final_data);
   //    console.log("&");
   //      console.log("graphic_data_full");
   //      console.log(graphic_data_full, graphic_data_full.length);
   //        if(graphic_data_full.length == 0) {
   //          console.log("gdf empty - push new api data");
   //                  graphic_data_full.push(final_data); // graphic_data_full first then graphic_data_full[0] ?!?!?
   //            } else { console.log("gdf has data - push new api data");
   //                    graphic_data_full[0].push(final_data[0]);   }
   //        console.log("=");
   //        console.log("graphic_data_full", graphic_data_full[0].length);
   //        // surely this can be avoided by setting up a  =[0]
   //        //graphic_data_full = graphic_data_full[0];
   //          console.log(graphic_data_full);
   //
   //      console.log("Now go to function drawGraphicLines");
   // drawGraphicLines(graphic_data_full[0]);
drawGraphicLines(final_data);
} // end of ready1

//////////////////////////////////////  rollovers ///////////////////////////////


//function mouseover(d) { console.log("mouseover", d);
    //onMove(d);
        //   d3.selectAll('.'+d)
        //     .attr("fill", hoverColour)
        //     .attr("opacity","1")
        //     .attr("width","3px")
        //     .attr("y",0)
        //     .attr("height", 40);
        //
        //     //  previous area defined as so and greyed back
        //     if(previousArea !== "" && previousArea !== undefined && previousArea !== e) {
        //       if(d3.selectAll("." + previousArea).classed("active") === false) {
        // console.log("mouseover - previousArea: ", previousArea);
        //         d3.selectAll("."+previousArea)
        //           .attr("fill", "#d8dadb")
        //           .attr("opacity","0.4")
        //           .attr("width","1px")
        //           .attr("y",0)
        //           .attr("height", 30);
        //}



function highlight(area) { //console.log("F highlight", area);

    d3.selection.prototype.last = function() {
      var last = this.size() - 1;
      return d3.select(this[0][last]);
    };

    d3.selectAll("."+area)
      .attr('class', 'active ' + area)
      .attr("fill", selectedColour)
      .attr("opacity","1")
      .attr("width","3px")
      .attr("y",-10)
      .attr("height", 40)
      .raise();

        //console.log(valueColourPairs, unusedColours, hoverColour );
  } // end of highlight

  /* Remove the current selected polygon */
function unhighlight(area) { console.log("unhighlight from deleting list item only ", area);

    d3.select("." + area)
      //.attr('class', area)
      .attr("fill", function(d){ console.log(d);
        if(d.label === 'United Kingdom') {return "#FF9933";}
          else{console.log("fill #ccc"); return "#ccc";} })
      .attr("opacity", function(d){
        if(d.label === 'United Kingdom') {return "1";}
        else{ return "0.4";} })
  	  .attr("width", function(d){
        if(d.label === 'United Kingdom') {return "3px";}
        else{ console.log("width 1px");return "1px";} })
        .attr("y",0)
        .attr("height", 30);

      // colours sorted before call
      // console.log(valueColourPairs, unusedColours, hoverColour );

} // end of unhighlight

function removeLine(removeMe){ console.log("removeLine[0-n] ", removeMe, inc);

    d3.selectAll("path#line_"+removeMe+inc).remove();
    // colours sorted before call
    //console.log(valueColourPairs, unusedColours, hoverColour );
}


function onMove(e) { //console.log("F onMove", e, hoverColour);

    hover = [];
    hover.push(e);

    d3.selectAll('.'+e)
      .attr("fill", hoverColour)
      .attr("opacity","1")
      .attr("width","3px")
      .attr("y",-10)
      .attr("height", 40)
      .raise();

    // if(previousArea !== undefined && d3.selectAll("." + previousArea).classed("active") === false) {
    //  previous area visit defined as so and greyed back
    if(previousArea !== "" && previousArea !== undefined && previousArea !== e) {
      if(d3.selectAll("." + previousArea).classed("active") === false) {
      //  console.log("onMove from previousArea: ", previousArea);
        d3.selectAll("."+previousArea)
          .attr("fill", "#ccc")
          .attr("opacity","0.4")
		      .attr("width","1px")
          .attr("y",0)
          .attr("height", 30);
          // d3.selectAll("." + area)
            // .attr('class', area)
            // .attr("fill", function(d){
            //   if(d.label === 'United Kingdom') {return "#FF9933";}
            //     else{ return "#ccc";} })
            // .attr("opacity", function(d){
            //   if(d.label === 'United Kingdom') {return "1";}
            //   else{ return "0.4";} })
            // .attr("width", function(d){
            //   if(d.label === 'United Kingdom') {return "3px";}
            //   else{ return "1px";} })
            //   .attr("y",0)
            //   .attr("height", 30);

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

      listValues = $("#areaselect").val();

              if(selected.length === 0) {
                $("#areaselect").val(hover);
                $("#areaselect").trigger("chosen:updated");

                hoverColour = unusedColours[0];
              }else if(selected.length < 4) {
                //console.log("New area rolled into: ")
                $("#areaselect").val(selected.concat(hover));
                $("#areaselect").trigger("chosen:updated");
                $("#areaselect").setSelectionOrder(selected.concat(hover));

                hoverColour = unusedColours[0];
              }

     valueColourPairs.push({"value":e,"colour":unusedColours[0]});
     unusedColours.shift();
    //  hoverColour = unusedColours[0];
    //console.log(valueColourPairs, unusedColours, hoverColour, hover);

          d3.selectAll(".search-choice")
          .data(selected.concat(hover))
          .join()
          .style("background-color",function(d){ //console.log(d);
            return valueColourPairs.filter(function(f){ return f.value == d })[0].colour
          });

    }  // ends if(newAREACD != oldAREACD)

    previousArea = e;

              // google tag manager.
              if(firsthover) {
                      dataLayer.push({
                          'event': 'mapHoverSelect',
                          'selected': newAREACD
                      })
                      firsthover = false;
              }

} // ends F onMove

function mouseout(d) {  //console.log("mouseout", d.label);

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
          if(d.label === 'United Kingdom') {return "#FF9933";}
            else{ return "#ccc";} })
        .attr("opacity", function(d){
          if(d.label === 'United Kingdom') {return "1";}
          else{ return "0.4";} })
        .attr("width", function(d){
          if(d.label === 'United Kingdom') {return "3px";}
          else{ return "1px";} })
          .attr("y",0)
          .attr("height", 30);
        // .attr("stroke","rgba(1,1,1,0)")
        // .attr("opacity","0.6")
        //
        // .attr("fill", "#ccc")
        // .attr("opacity","0.4")
		    // .attr("width","1px")
        // .attr("y",0)
        // .attr("height", 30);

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
      // $("#areaselect").val("").trigger("chosen:updated");
      //hideaxisVal();
      $("#areaselect").val(selected);
      $("#areaselect").trigger("chosen:updated");
      $("#areaselect").setSelectionOrder(selected.concat(hover))

      d3.selectAll(".search-choice")
      .data(selected)
      .join()
      .style("background-color",function(d){
              return valueColourPairs.filter(function(f){return f.value==d})[0].colour
              })
  } // ends F mouseout


function onLeave() {  //console.log("onLeave", hoverColour);

  hover = [];

  if(selected.length > 0) {
    filter = ['match', ['get', 'AREACD'], selected, true, false]
    map.setFilter('state-fills-hover',filter)

  } else {
    map.setFilter("state-fills-hover", ["==", "AREACD", ""]);
  }

  if(previousArea !== "" && d3.selectAll("." + previousArea).classed("active") === false) {
    d3.selectAll("."+previousArea)
      .attr("fill", "#ccc")
      .attr("opacity","0.4")
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
    // $("#areaselect").val("").trigger("chosen:updated");
    //hideaxisVal();

    $("#areaselect").val(selected);
    $("#areaselect").trigger("chosen:updated");
    $("#areaselect").setSelectionOrder(selected.concat(hover))

    d3.selectAll(".search-choice")
    .data(selected)
    .join()
    .style("background-color",function(d){
      return valueColourPairs.filter(function(f){return f.value==d})[0].colour
    })
} // ends onLeave


function onClick(e) { console.log("onClick Map or barcode: "+e);

        //  console.log("laCode OnClick: ", laCode, laCode.length);
          // HOW DOES LAcODE INCREASE BY ONE??????
          //console.log("valueColourPairs OnClick: ", valueColourPairs, valueColourPairs.length);
          //throw new Error("Something went badly wrong!");
 // add to list by map or maybe list whilst in barcodeview - then hit projections.
 // laCode has the new area code therefore difference is 0, hence no line.
  //console.log("laCode middle: ", laCode, laCode.length);
  //if(selected.length < 4) {

        //console.log("selected.length: ", selected, selected.length);
        selected.push(e);
      //  console.log("e: ", e, valueColourPairs);

        // Add back new colour to unusedCol
          unusedColours.unshift(valueColourPairs.filter(function(d){ return d.value == e})[0].colour)
            if(unusedColours.length === 4) {
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

          d3.selectAll(".search-choice")
          .data(selected)
          .join()
          .style("background-color",function(d){
            return valueColourPairs.filter(function(f){return f.value == d})[0].colour
          })

          selectedColour = valueColourPairs.filter(function(d){ return d.value === e })[0].colour;

        newOrder(e);

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
            if(d3.select("#projections").style('display') === 'inline')  { readData();}

//    } // ends if(selected.length < 4)
    // else{
      // console.log("No more can be added. 4 max.");
    //
    //   d3.selectAll(".search-choice")
    //   .data(selected.push("No more can be added"))
    //   .join()
    //   .style("background-color", "#222");
    //
    // }

    dataLayer.push({
        'event':'mapClickSelect',
        'selected': newAREACD
    });
    //console.log(dataLayer);

    highlight(e); // even though we may click on map during projections
                  // we still need to in case we swap over to barcodes??

    // Add to write in box
    // then add new function (Maybe use F readData as it has the nesting required)
    // to get just the one api call and add it to chart!!

} // ends F onClick


// function allChange(laSelected){
//
//     valueColourPairs.push({"value":laSelected,"colour":unusedColours[0]});
//   console.log(valueColourPairs);
//     unusedColours.shift();
//     hoverColour = unusedColours[0];
//
//     d3.selectAll(".search-choice")
//     .data(selected)
//     .join()
//     .style("background-color",function(d){
//                                 return valueColourPairs.filter(function(e){return e.value==d})[0].colour;
//                               });
//
//     selectedColour = valueColourPairs.filter(function(d){ return d.value===laSelected })[0].colour;
//
//     filter = ['match', ['get', 'AREACD'], selected, true, false];
//     map.setFilter('state-fills-hover',filter);
//
//
//
// } // ends allChange


function disableMouseEvents() {  console.log("F disableMouseEvents");
    map.off("mousemove", "area", onMove);
    map.off("mouseleave", "area", onLeave);
}

function enableMouseEvents() { console.log("F enableMouseEvents")
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

    // console.log(code);
     //console.log(displayformat(rateById[code]));
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

} // else {
// add fallback
// }

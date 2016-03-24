function find_query_parameter(name) {
  url = location.href;
  var regexS = "[\\?&]"+name+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var results = regex.exec( url );
  return results == null ? null : results[1];
}


// here we set up the configuration of the highCharts chart
var data = [];
var unit_tracker =[];
var counter = 0;
unit_different1=null;
counter1 =[];
number = 0;
// here we set up the configuration of the highCharts chart
var chart_options = {
	chart: {
        type: 'scatter',
		zoomType: 'xy',
		resetZoomButton: {
            position: {
                align: 'left', // by default
                verticalAlign: 'bottom', // by default
                x: 0,
                y: 60
            }
        }
	},
    exporting:{
        buttons:{
            contextButton:{

                align: 'right',
                verticalAlign: 'top',

                text: 'print / export chart',
                symbol: 'url(/static/correlation_tool/images/print16.png)'
            }
        },
        chartOptions:{
            legend:{
                borderWidth: 0
            }
        },
        sourceWidth: 1200,
        sourceHeight: 600
    },
	title: {
		text: ''
	},
	xAxis: {
	    title: {
	        text: 'x value'
	    },
        lineWidth:2,
        lineColor: 'lightgray'
	},
	yAxis: {
	    title: {
	        text: 'y value'
	    },
	    lineWidth:2,
        lineColor: 'lightgray'
	},
	legend: {
	}
};

// shows an error message in the chart title
function show_error(chart, error_message) {
    chart.legend.group.hide();
    var button = chart.exportSVGElements[0];
    button.destroy();
    chart.hideLoading();
    $('#metadata-loading').hide();
    console.log(error_message);
    $('#error-message').text(error_message);
    chart.setTitle({ text: "" });
}


function add_series_to_chart(chart, res_ids) {

    console.log('add_series_to_chart!');

    var current_url = location.href;
    var index = current_url.indexOf("correlation-tool");
    var base_url = current_url.substring(0, index);

    // we send the two resource IDs to the controller joined by underscore ('_')
    var res_url = res_ids.replace(',', '_');

    // URL to get the metadata (used for the legend table)
    var metadata_url = base_url + 'correlation-tool/chart_metadata/' + res_url + '/';

    // URL to get the WPS result (used for the scatter plot chart)
    var wps_url = base_url + 'correlation-tool/wps/' + res_url + '/';

    console.log(metadata_url);
    console.log(wps_url);

    // add the legend table (this is run asynchronously)
    add_table(chart, metadata_url);

    // call the WPS and add the scatter plot data (this is run asynchronously)
    $.ajax({
        url: wps_url,
        success: function(json) {

            //json = JSON.parse(json_string)
            console.log('add_series_to_chart2 data received!')

            // here we must check if the WPS execution was successful

            // add the time series to the chart
            var series = {
                id: 0,
                name:  'Correlation plot series',
                data: json.data
            }

            // this part seems to be taking lots of time ...
            chart.addSeries(series);

            console.log('add_series_to_chart2 series added!')

            // set the chart title with Rsquared, intercept and slope of regression
            var chartTitle = 'R' + '\u00B2' + '=' + json.stats[0].rsquared +
                                ', Intercept = ' + json.stats[0].intercept +
                                ', Slope = ' + json.stats[0].slope;
            chart.setTitle({ text: chartTitle});

            chart.legend.group.hide();

            finishloading();
            $(window).resize();//This fixes an error where the grid lines are misdrawn when legend layout is set to vertical
        },
        error: function() {
            show_error("Error loading time series from " + res_id);
        }
    });

}


function add_table(chart, metadata_url) {

    console.log('running add_table ' + metadata_url);

    $.ajax({
        url: metadata_url,
        success: function(json) {

            console.log('chart_metadata success!');

            var x_units=json.x.units;
            var y_units=json.y.units;

            // set axis titles
            chart.yAxis[0].setTitle({ text: json.y.variable_name + ' (' + y_units+')' });
            chart.xAxis[0].setTitle({text: json.x.variable_name + ' (' + x_units+')'});

            // add the first row to the statistics table
            add_row_to_table(json.x, "x", 0);
            add_row_to_table(json.y, "y", 0);

        }, error: function() {
            show_error('Error loading data table');
        }
    });
}


function add_row_to_table(metadata, series_name, row_number) {

    // adding a row to the legend data table
    var site_name = metadata.site_name
    var variable_name = metadata.variable_name
    var unit = metadata.units
    var organization = metadata.organization
    var quality = metadata.quality
    var method = metadata.method
    var datatype = metadata.datatype
    var valuetype = metadata.valuetype
    var samplemedium = metadata.samplemedium
    var count = metadata.count
    var mean = metadata.mean
    var median = metadata.median
    var stdev = metadata.stdev
    var timesupport = metadata.timesupport
    var timeunit = metadata.timeunit
    var sourcedescription = metadata.sourcedescription
    var boxplot = metadata.boxplot

    // replace null with N/A for the data table
    if (site_name==null) site_name = "N/A";
    if (variable_name==null) variable_name = "N/A";
    if (organization==null) organization = "N/A";
    if (quality==null) quality = "N/A";
    if (method==null) method = "N/A";
    if(datatype==null) datatype = "N/A";
    if(valuetype==null) valuetype = "N/A";
    if(unit==null) unit = "N/A";
    if (timesupport==null) timesupport = "N/A";
    if(timeunit==null) timeunit = "N/A";
    if(sourcedescription==null) sourcedescription = "N/A";
    if(samplemedium==null) samplemedium = "N/A";

    var series_color = '#7cb5ec';

    var legend = "<td style='text-align:center' bgcolor = "+series_color+">" + series_name + "</td>"
    var dataset = {legend:legend,organization:organization,name:site_name,variable:variable_name,unit:unit,samplemedium:samplemedium,count:count,
        quality:quality,method:method,datatype:datatype,valuetype:valuetype, timesupport:timesupport,timeunit:timeunit,
        sourcedescription:sourcedescription,
        mean:mean,median:median,stdev:stdev,boxplot:boxplot,boxplot_count:row_number}
    var table = $('#example').DataTable();

    table.row.add(dataset).draw();
}





function myFunc(id)
{
    var chart1 = $('#ts-chart').highcharts();
    var series = chart1.series[id];
        if (series.visible) {
            series.hide();
        } else {
            series.show();
        }
}

var popupDiv = $('#welcome-popup');
//end new table

$(document).ready(function (callback) {
    var res_ids = find_query_parameter("res_id");

    console.log('document ready!');

    var table = $('#example').DataTable( {
        "createdRow":function(row,data,dataIndex)
        {
            //$('td',row).eq(0).css("backgroundColor", chart.series[number].color)
        },
        data: data,
        "columns":
            [
            {   "className": "legend",
                "data": "legend" },
            {
                "className":      'details-control',
                "orderable":      false,
                "data":           null,
                "defaultContent": ''
            },
            { "data": "organization" },
            { "data": "name" },
            { "data": "variable" },
            { "data": "unit" },
            { "data": "samplemedium" },
            { "data": "count" }
            ],
        "order": [[1, 'asc']]
    } );
    // Add event listener for opening and closing details
    $('#example tbody').on('click', 'td.details-control', function () {
        var tr = $(this).closest('tr');
        var row = table.row( tr );
        if ( row.child.isShown() )
        {
            // This row is already open - close it
            row.child.hide();
            tr.removeClass('shown');
        }
        else
        {
            // Open this row
            console.log(row.data().number1)
            row.child( format(row.data()) ).show();
            box(row.data().boxplot_count);
            var series =
            {
                name:  'Site:'+row.data().name+
                ' Variable:'+row.data().variable,
                data: [],
                groupPadding:0,
            }
            // add the time series to the chart
            series.data = [row.data().boxplot.map(Number)];

            var name_plot = '#container'+row.data().boxplot_count
            console.log(name_plot)
            var chart = $(name_plot).highcharts();
            chart.setTitle({ text: row.data().name });
            chart.yAxis[0].setTitle({ text: row.data().variable + ' (' + row.data().unit+')' })
            chart.addSeries(series);
            tr.addClass('shown');
        }
    } );

    if (res_ids == null) {
        if (document.referrer == "https://apps.hydroshare.org/apps/") {
            $('#extra-buttons').append('<a class="btn btn-default btn" href="https://apps.hydroshare.org/apps/">Return to HydroShare Apps</a>');
        }
        popupDiv.modal('show');
    }

    // initialize the chart and set chart height
    var page_height = $(document).height();
    if (page_height > 500) {
        chart_options.chart.height = page_height - 225;
    }

    $('#ts-chart').highcharts(chart_options);
    $('#ts-chart').hide()
    $('#stat_div').hide();
    $('#button').hide();


    // add the series to the chart
    main_chart = $('#ts-chart').highcharts();

    console.log('before running add_series_to_chart!');

    // call the function is responsible for adding the series to the chart
    add_series_to_chart(main_chart, res_ids);

    // change the app title
    document.title = 'Correlation Tool';
    // force to adjust chart width when user hides or shows the side bar
    $("#app-content").on("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(event) {
        if (event.originalEvent.propertyName == 'padding-right') {
            $(window).resize(); // this forces the chart to redraw
        }
    });

})



/* Formatting function for row details - modify as you need */
function format ( d ) {
    // `d` is the original data object for the row
    console.log(d.boxplot_count)
    name ='container'+ d.boxplot_count
    console.log(name)

    return '<div id = "container'+ d.boxplot_count+'"class ="highcharts-boxplot" style = "float:right;height:250px;width:40%" ></div>'+

    '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:100px; margin-left:8.5%;font-size: 9pt">'+

        '<tr>'+
            '<td>Quality Control:</td>'+
            '<td>'+d.quality+'</td>'+
        '</tr>'+
        '<tr>'+
            '<td>Method:</td>'+
            '<td>'+d.method+'</td>'+
        '</tr>'+
        '<tr>'+
            '<td>Data Type:</td>'+
            '<td>'+ d.datatype+'</td>'+
        '</tr>'+
            '<tr>'+
            '<td>Value Type:</td>'+
            '<td>'+d.valuetype+'</td>'+
        '</tr>'+
            '<tr>'+
            '<td>Time Support:</td>'+
            '<td>'+d.timesupport+'</td>'+
        '</tr>'+
        '<tr>'+
            '<td>Time Units:</td>'+
            '<td>'+d.timeunit+'</td>'+
        '</tr>'+
        '<tr>'+
            '<td>Source Description:</td>'+
            '<td>'+d.sourcedescription+'</td>'+
        '</tr>'+
    '</table>';
}

function box (number) {
    var name = '#container'+number
    console.log(name)

    $(name).highcharts({

        chart: {

            type: 'boxplot'
        },
        legend:{
            enabled:false
        },
        xAxis: {
            categories: 1,
            minRange: 1,
            labels:{enabled:false}

        },
        title:{
            align: 'center'
        },
        plotOptions: {
            series: {
                groupPadding: 0
            }
        },


    });
};
function finishloading(callback)
{
    console.log('run finishloading()')
    $(window).resize();
    $('#ts-chart').show()
    $('#stat_div').show();
    $('#button').show();
    $(window).resize();
    $('#loading').hide();
}

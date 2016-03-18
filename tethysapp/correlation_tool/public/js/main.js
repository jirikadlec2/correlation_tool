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
    current_url = location.href;
    index = current_url.indexOf("correlation-tool");
    base_url = current_url.substring(0, index);

    // in the start we show the loading...
    // we send the resource IDs to the chart_data separated by underscore ('_')
    res_url = res_ids.replace(',', '_');
    data_url = base_url + 'correlation-tool/chart_data/' + res_url + '/';
    console.log(data_url);

    // we also create the wps url
    wps_url = base_url + 'correlation-tool/wps/' + res_url + '/';
    console.log(wps_url)

    // first we send ajax request to the wps
    $.ajax({
        url: wps_url,
        success: function(json) {
            var status = json.status
            var data_url = json.data_url

            console.log(status)
            console.log(data_url)

            add_series_to_chart2(chart, data_url);

        }, error: function(request, ajax_status, ajax_error) {
            console.log('wps ajax error!');
            console.log(request.responseText);
        }
    })

    var run_chart = false;
    if (!run_chart) {
        return;
    }

    $.ajax({
        url: data_url,
        success: function(json) {
            // first of all check for the status
            var status1 = json.series[0].status;
            if (status1 !== 'success') {
                res_id1 = res_ids.split('_')[0];
                show_error(chart, "Error loading time series from " + res_id1 + ": " + status1);
                return;
            }
            var status2 = json.series[1].status;
            if (status2 !== 'success') {
                res_id2 = res_ids.split('_')[1];
                show_error(chart, "Error loading time series from " + res_id2 + ": " + status2);
                return;
            }

            console.log('initial loading data successful')

            // set the x and y axis title and units
            var x_units = json.series[0].units;
            if(x_units==null) {
                x_units = "";
            }
            console.log('x_units: ' + x_units);

            var y_units = json.series[1].units;
            if(y_units==null) {
                y_units = "";
            }
            console.log('y_units: ' + y_units);

            // add the time series to the chart
            var series = {
                id: 0,
                name:  'Correlation plot series',
                data: json.xy.data
            }
            chart.addSeries(series);

            // set axis titles
            chart.yAxis[0].setTitle({ text: json.series[1].variable_name + ' (' + y_units+')' });
            chart.xAxis[0].setTitle({text: json.series[0].variable_name + ' (' + x_units+')'});


            chart.setTitle({ text: "Correlation Plot" });
            // now we can hide the loading... indicator
            //chart.hideLoading();
            chart.legend.group.hide();



            finishloading();

            $(window).resize();//This fixes an error where the grid lines are misdrawn when legend layout is set to vertical
        },
        error: function() {
            show_error("Error loading time series from " + res_id);
        }
    });
}


function add_series_to_chart2(chart, data_url) {

    $.ajax({
        url: data_url,
        success: function(json_string) {

            json = JSON.parse(json_string)

            console.log('add_series_to_chart success!')
            var x_units='cm';
            var y_units='cm';
            // need to fetch metadata for units!

            // add the time series to the chart
            var series = {
                id: 0,
                name:  'Correlation plot series',
                data: json.data
            }
            chart.addSeries(series);

            // set axis titles
            //chart.yAxis[0].setTitle({ text: json.series[1].variable_name + ' (' + y_units+')' });
            //chart.xAxis[0].setTitle({text: json.series[0].variable_name + ' (' + x_units+')'});


            chart.setTitle({ text: 'Rsquared: ' + json.stats[0].rsquared });

            chart.legend.group.hide();

            finishloading();

            $(window).resize();//This fixes an error where the grid lines are misdrawn when legend layout is set to vertical
            return;

            // add the row to the statistics table
            var number2 = 0;
            number = 0;
            for (i = 0; i < json.series.length; i++) {
                //new table
                metadata = json.series[i];
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

                number = i
                number2 = number2 + 1
                var boxplot_count = number2

                var boxplot = metadata.boxplot

                if(site_name==null){
                    site_name = "N/A"
                }
                if(variable_name==null){
                    variable_name= "N/A"
                }
                if(organization==null){
                    organization= "N/A"
                }
                if(quality==null){
                    quality= "N/A"
                }
                if(method==null){
                    method= "N/A"
                }
                if(datatype==null){
                    datatype= "N/A"
                }
                if(valuetype==null){
                    valuetype= "N/A"
                }
                if(unit==null){
                    unit= "N/A"
                }
                if(timesupport==null){
                    timesupport= "N/A"
                }
                if(timeunit==null){
                    timeunit= "N/A"
                }
                if(sourcedescription==null){
                    sourcedescription= "N/A"
                }
                if(samplemedium==null){
                    samplemedium= "N/A"
                }

                var series_color = '#7cb5ec';

                var legend = "<td style='text-align:center' bgcolor = "+series_color+"><input id ="+number
                    + " type='checkbox' STYLE ='color:"+series_color+"' onClick ='myFunc(this.id);'checked = 'checked'>" + "</td>"
                var dataset = {legend:legend,organization:organization,name:site_name,variable:variable_name,unit:unit,samplemedium:samplemedium,count:count,
                    quality:quality,method:method,datatype:datatype,valuetype:valuetype, timesupport:timesupport,timeunit:timeunit,
                    sourcedescription:sourcedescription,
                    mean:mean,median:median,stdev:stdev,boxplot:boxplot,boxplot_count:boxplot_count}
                var table = $('#example').DataTable();
                table.row.add(dataset).draw();

                //end new table
            }

            finishloading();

            $(window).resize();//This fixes an error where the grid lines are misdrawn when legend layout is set to vertical
        },
        error: function() {
            show_error("Error loading time series from " + res_id);
        }
    });
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

    // this function is responsible for adding the series
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

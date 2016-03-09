from django.http import JsonResponse
from django.http import HttpResponse
from django.shortcuts import render
from wsgiref.util import FileWrapper
import os
import correlation
import utilities
import waterml


# -- coding: utf-8--

# helper controller for fetching the WaterML file
def temp_waterml(request, id):
    base_path = utilities.get_workspace()
    file_path = base_path + "/" +id
    response = HttpResponse(FileWrapper(open(file_path)), content_type='application/xml')
    return response


# formats the time series for highcharts
def chart_data(request, res_ids):
    print"chart data"
    print res_ids
    # checks if there is two resource IDs
    resources = res_ids.split("_")

    data_for_chart = {'series':[None, None]}
    if len(resources) == 2:

        # checks if we already have an unzipped xml file
        file_path = utilities.waterml_file_path(resources[0])
        # if we don't have the xml file, downloads and unzips it
        if not os.path.exists(file_path):
            utilities.unzip_waterml(request, resources[0])
        # returns an error message if the unzip_waterml failed
        if not os.path.exists(file_path):
            series0 = {'status': 'Resource file not found'}
        else:
            # parses the WaterML to a chart data object
            series0 = waterml.parse(file_path)

        # checks if we already have an unzipped xml file
        file_path = utilities.waterml_file_path(resources[1])
        # if we don't have the xml file, downloads and unzips it
        if not os.path.exists(file_path):
            utilities.unzip_waterml(request, resources[1])
        # returns an error message if the unzip_waterml failed
        if not os.path.exists(file_path):
            series1 = {'status': 'Resource file not found'}
        else:
            # parses the WaterML to a chart data object
            series1 = waterml.parse(file_path)

        # runs the correlation analysis
        if series0['status'] == 'success' and series1['status'] == 'success':
            xy = correlation.correlation_analysis(series0['for_highchart'], series1['for_highchart'])
        else:
            xy = {'status': 'error reading one of the time series', 'data': None}
        series0['for_highchart'] = None
        series1['for_highchart'] = None

        data_for_chart = {'series':[series0, series1], 'xy':xy}

    else:
        data_for_chart = {'series':[{'status':'error loading data. expecting 2 res_id values.'}, None]}

    return JsonResponse(data_for_chart)


# home page controller
def home(request):
    context = {}
    return render(request, 'correlation_tool/home.html', context)
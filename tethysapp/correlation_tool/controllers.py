from django.http import JsonResponse
from django.http import HttpResponse
from django.shortcuts import render

from wsgiref.util import FileWrapper
import os
import correlation
import requests
import utilities
import waterml
import wps_utilities


# -- coding: utf-8--

# helper controller for fetching the WaterML file
def temp_waterml(request, id):
    base_path = utilities.get_workspace()
    file_path = base_path + "/" +id
    response = HttpResponse(FileWrapper(open(file_path)), content_type='application/xml')
    return response


# formats the time series metadata for highcharts and data table
def chart_metadata(request, res_ids):

    print"chart metadata"
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
            series_X = {'status': 'Resource file not found'}
        else:
            # parses the WaterML to a chart data object
            series_X = waterml.parse(file_path, True)

        # checks if we already have an unzipped xml file
        file_path = utilities.waterml_file_path(resources[1])
        # if we don't have the xml file, downloads and unzips it
        if not os.path.exists(file_path):
            utilities.unzip_waterml(request, resources[1])
        # returns an error message if the unzip_waterml failed
        if not os.path.exists(file_path):
            series_Y = {'status': 'Resource file not found'}
        else:
            # parses the WaterML to a chart data object
            series_Y = waterml.parse(file_path, True)

        # retrieves the metadata
        if series_X['status'] == 'success' and series_X['status'] == 'success':
            series_X['for_highchart'] = None
            series_Y['for_highchart'] = None
            metadata = {'status': 'success', 'x': series_X, 'y': series_Y}
        else:
            metadata = {'status': 'error reading one of the time series', 'x': None, 'y': None}
    else:
        metadata = {'status': 'error loading data, expecting 2 time series, found' + str(len(resources)), 'x': None, 'y': None}

    return JsonResponse(metadata)


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
            series1 = waterml.parse(file_path, False)

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


# wps controller
def wps(request, res_ids):
    return wps_utilities.run_wps(request, res_ids)

# R script controller
def r_script(request, res_ids):

    resources = res_ids.split("_")

    wps_url = 'http://appsdev.hydroshare.org:8282/wps/'
    script_url = wps_url + 'R/scripts/' + 'regression_analysis_01.R'
    output_data = requests.get(script_url)
    output_text = output_data.content

    # replace the resource_IDs in the script
    output_text = output_text.replace('cuahsi-wdc-2016-03-18-65414769', resources[0])
    output_text = output_text.replace('cuahsi-wdc-2016-03-18-65423687', resources[1])

    resp = HttpResponse(output_text, content_type="text/plain; charset=utf-8")
    return resp


# home page controller
def home(request):
    context = {}
    return render(request, 'correlation_tool/home.html', context)
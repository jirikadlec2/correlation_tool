from django.http import JsonResponse
from django.http import HttpResponse
from django.shortcuts import render
from app import CorrelationPlot

from wsgiref.util import FileWrapper
import os
import requests
import utilities
import waterml
import wps_utilities


# -- coding: utf-8--


# data table metadata controller
def chart_metadata(request, res_ids):

    print "running chart_metadata " + res_ids

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
            series_x = {'status': 'Resource file not found'}
        else:
            # parses the WaterML to a chart data object
            series_x = waterml.parse(file_path, True)

        # checks if we already have an unzipped xml file
        file_path = utilities.waterml_file_path(resources[1])
        # if we don't have the xml file, downloads and unzips it
        if not os.path.exists(file_path):
            utilities.unzip_waterml(request, resources[1])
        # returns an error message if the unzip_waterml failed
        if not os.path.exists(file_path):
            series_y = {'status': 'Resource file not found'}
        else:
            # parses the WaterML to a chart data object
            series_y = waterml.parse(file_path, True)

        # retrieves the metadata
        if series_x['status'] == 'success' and series_x['status'] == 'success':
            # series_x['for_highchart'] = None
            # series_y['for_highchart'] = None
            metadata = {'status': 'success', 'x': series_x, 'y': series_y}
        else:
            metadata = {'status': 'error reading one of the time series', 'x': None, 'y': None}
    else:
        metadata = {'status': 'error loading data, expecting 2 time series, found ' + str(len(resources)), 'x': None, 'y': None}

    return JsonResponse(metadata)


# WPS Web Processing Service controller
def wps(request, res_ids):
    return wps_utilities.run_wps(res_ids)


# R script controller
def r_script(request, res_ids):

    # needs error handling if number of resource IDs is not equal to two
    resources = res_ids.split("_")

    wps_url = CorrelationPlot.wps_url
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
import requests
from django.http import JsonResponse
from django.http import HttpResponse
from owslib.etree import etree
from owslib.wps import WebProcessingService
from owslib.wps import monitorExecution
from owslib.wps import WPSExecution

def run_wps(request, res_ids):
    print"launch wps"
    print res_ids
    # checks if there is two resource IDs
    resources = res_ids.split("_")
    process_id = 'org.n52.wps.server.r.linear_regression'
    process_input = [('x_resource_id',str(resources[0])),('y_resource_id',str(resources[1]))]

    #setting the WPS URL: local or appsdev
    #url_wps = 'http://127.0.0.1:8282/wps/WebProcessingService'
    url_wps = 'http://appsdev.hydroshare.org:8282/wps/WebProcessingService'

    my_engine = WebProcessingService(url_wps, verbose=False, skip_caps=True)
    my_process = my_engine.describeprocess(process_id)

    #executing the process..
    # build execution
    execution = WPSExecution(version=my_engine.version, url=my_engine.url, username=my_engine.username,
                             password=my_engine.password, verbose=my_engine.verbose)
    requestElement = execution.buildRequest(process_id, process_input, 'output')
    request = etree.tostring(requestElement)
    #set store executeresponse to false
    request = request.replace('storeExecuteResponse="true"', 'storeExecuteResponse="false"')
    print request

    execution = my_engine.execute(process_id, process_input, 'output', request)

    monitorExecution(execution)
    status = execution.status
    print status

    # if the status is successful...
    if status == 'ProcessSucceeded':
        outputs = execution.processOutputs
        output0 = outputs[0]
        reference0 = output0.reference

        # retrieve the data from the reference
        output_data = requests.get(reference0)
        resp = HttpResponse(output_data, content_type="application/json")
        return resp

        # return JsonResponse({'status': 'success', 'data_url': reference0})
    else:
        return JsonResponse({'status': 'wps request failed'})
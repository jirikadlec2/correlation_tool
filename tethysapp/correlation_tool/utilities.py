import requests

from .app import CorrelationPlot
import zipfile
import StringIO
import time
import zipfile
import os


def get_app_base_uri(request):
    base_url = request.build_absolute_uri()
    if "?" in base_url:
        base_url = base_url.split("?")[0]
    return base_url


def get_workspace():
    return CorrelationPlot.get_app_workspace().path


def getResourceIDs(page_request):
    resource_string = page_request.GET['res_id']  # retrieves IDs from url
    resource_IDs = resource_string.split(',')  # splits IDs by commma
    return resource_IDs


def findZippedUrl(page_request, res_id):
    base_url = page_request.build_absolute_uri()
    if "?" in base_url:
        base_url = base_url.split("?")[0]
        zipped_url = base_url + "temp_waterml/" + res_id + ".xml"
        return zipped_url


def unzip_waterml(request, res_id):
    print "create water ml"
    # this is where we'll unzip the waterML file to
    temp_dir = get_workspace()
    print temp_dir
    # get the URL of the remote zipped WaterML resource
    src = 'test'

    if 'cuahsi-wdc'in res_id:
        url_zip = 'http://bcc-hiswebclient.azurewebsites.net/CUAHSI/HydroClient/WaterOneFlowArchive/'+res_id+'/zip'

    else:
        url_zip = 'http://' + request.META['HTTP_HOST'] + '/apps/data-cart/showfile/'+res_id


    r = requests.get(url_zip, verify=False)
    try:
        z = zipfile.ZipFile(StringIO.StringIO(r.content))
        file_list = z.namelist()

        try:
            for file in file_list:
                file_data = z.read(file)
                file_temp_name = temp_dir + '/' + res_id + '.xml'
                file_temp = open(file_temp_name, 'wb')
                file_temp.write(file_data)
                file_temp.close()
                # getting the URL of the zip file
                base_url = request.build_absolute_uri()
                if "?" in base_url:
                    base_url = base_url.split("?")[0]
                waterml_url = base_url + "temp_waterml/cuahsi/" + res_id + '.xml'

        # error handling

        # checks to see if Url is valid
        except ValueError, e:
            print "Error:invalid Url"
            return False

        # checks to see if xml is formatted correctly
        except TypeError, e:
            print "Error:string indices must be integers not str"
            return False

    # check if the zip file is valid
    except zipfile.BadZipfile as e:
            error_message = "Bad Zip File"
            print "Bad Zip file"
            return False

    # finally we return the waterml_url
    return waterml_url


# finds the waterML file path in the workspace folder
def waterml_file_path(res_id):
    base_path = get_workspace()
    file_path = base_path + "/" + res_id
    if not file_path.endswith('.xml'):
        file_path += '.xml'
    return file_path


def file_unzipper(url_cuashi):
    #this function is for unzipping files
    r = requests.get(url_cuashi)
    z = zipfile.ZipFile(StringIO.StringIO(r.content))

    file_list = z.namelist()
    for  file in file_list:
        z.read(file)
    return file_list

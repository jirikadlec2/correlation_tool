###################################################
# About
#
# This R script runs linear regression analysis of
# two time serie from the CUAHSI Water Data Center
###################################################

###################################################
# define metadata, resources, inputs and outputs

#wps.des: id = linear_regression, title = Linear Regression,
# abstract = run linear regression of two time series;

#wps.in: id = x_resource_id, type = string, title = X axis time series resource,
# abstract = CUAHSI resource ID of the first time series,
# minOccurs = 1, maxOccurs = 1;

#wps.in: id = y_resource_id, type = string, title = Y axis time series resource,
# abstract = CUAHSI resource ID of the second time series,
# minOccurs = 1, maxOccurs = 1;

#wps.out: id = output, type = text, title = regression scatter plot values,
# abstract = regression scatter plot values with the regression coefficients;

######################################
# R Correlation Plot Test!           #
######################################
library(httr)
library(WaterML)
library(jsonlite)

#wps.off;
x_resource_id = "cuahsi-wdc-2016-06-28-76101213"
y_resource_id = "cuahsi-wdc-2016-06-28-76101213"
#wps.on;
  
cuahsi_url = 'http://qa-webclient-solr.azurewebsites.net/CUAHSI/HydroClient/WaterOneFlowArchive/'
url1 = paste0(cuahsi_url, x_resource_id, "/zip")
url2 = paste0(cuahsi_url, y_resource_id, "/zip")

# unzip, download and parse the first file
temp1 = tempfile()
tempdir1 = tempdir()
temp_unzip = tempfile()
GET(url1, write_disk(temp1, overwrite=TRUE))
waterml1 = unzip(temp1, exdir=tempdir1)
values1 = GetValues(waterml1)
plot(DataValue~time, data=values1, type="l")
unlink(temp1)
unlink(waterml1)
unlink(tempdir1)

# unzip, download and parse the second file
temp2 = tempfile()
tempdir2 = tempdir()
temp_unzip2 = tempfile()
GET(url2, write_disk(temp2, overwrite=TRUE))
waterml2 = unzip(temp2, exdir=tempdir2)
values2 = GetValues(waterml2)
lines(DataValue~time, data=values2, type="l", col="red")

# merge the two time series
merged = merge(values1, values2, by="time")

# make regression model
m = lm(DataValue.y~DataValue.x, data=merged)

# get the intercept, slope and Rsquared from the model
intercept = m$coefficients[1]
slope = m$coefficients[2]
rsquared <- round(summary(m)$r.squared, digits=4)

# make scatterplot with regression line
#wps.off;
plot(DataValue.y~DataValue.x, data=merged)
abline(m, col="red")
#wps.on;

# write output data in JSON format
output1 = data.frame(x=merged$DataValue.x, y=merged$DataValue.y)

# remove 'no data' values from the output data
output_valid = output1[complete.cases(output1),]

# name of output data file
output = "output_data.json"
output_json = toJSON(list(stats=data.frame(rsquared=rsquared, intercept=intercept, slope=slope), 
                          data=setNames(output_valid, NULL)))
write(output_json, output)
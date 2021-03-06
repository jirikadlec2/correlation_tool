from tethys_sdk.base import TethysAppBase, url_map_maker


class CorrelationPlot(TethysAppBase):
    """
    Tethys app class for Correlation Plot.
    """

    name = 'Correlation Plot'
    index = 'correlation_tool:home'
    icon = 'correlation_tool/images/corelation_2.gif'
    package = 'correlation_tool'
    root_url = 'correlation-tool'
    color = '#e67e22'
    description = 'Create a scatter plot of two time series'
    enable_feedback = False
    feedback_emails = []

    # setting for the WPS URL
    wps_url = 'http://appsdev.hydroshare.org:8282/wps/'

        
    def url_maps(self):
        """
        Add controllers
        """
        UrlMap = url_map_maker(self.root_url)

        url_maps = (UrlMap(name='home',
                           url='correlation-tool',
                           controller='correlation_tool.controllers.home'),

                    UrlMap(name='chart_metadata',
                           url='chart_metadata/{res_ids}',
                           controller='correlation_tool.controllers.chart_metadata'),

                    UrlMap(name='wps',
                           url='wps/{res_ids}',
                           controller='correlation_tool.controllers.wps'),

                    UrlMap(name='r-script',
                           url='r-script/{res_ids}/correlation-tool.R',
                           controller='correlation_tool.controllers.r_script'),
        )

        return url_maps
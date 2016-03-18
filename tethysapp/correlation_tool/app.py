from tethys_sdk.base import TethysAppBase, url_map_maker


class CorrelationPlot(TethysAppBase):
    """
    Tethys app class for Correlation Plot.
    """

    name = 'Correlation Plot'
    index = 'correlation_tool:home'
    icon = 'correlation_tool/images/icon.gif'
    package = 'correlation_tool'
    root_url = 'correlation-tool'
    color = '#e67e22'
    description = 'Create a scatter plot of two time series'
    enable_feedback = False
    feedback_emails = []

        
    def url_maps(self):
        """
        Add controllers
        """
        UrlMap = url_map_maker(self.root_url)

        url_maps = (UrlMap(name='home',
                           url='correlation-tool',
                           controller='correlation_tool.controllers.home'),

                    UrlMap(name='temp_waterml',
                           url='temp_waterml/{id}',
                           controller='correlation_tool.controllers.temp_waterml'),

                    UrlMap(name='chart_data',
                           url='chart_data/{res_ids}',
                           controller='correlation_tool.controllers.chart_data'),

                    UrlMap(name='wps',
                           url='wps/{res_ids}',
                           controller='correlation_tool.controllers.wps')
        )

        return url_maps
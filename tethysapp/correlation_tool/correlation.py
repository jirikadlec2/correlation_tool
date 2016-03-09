import numpy

def correlation_analysis(data_x, data_y):

    print 'x data length %d' % len(data_x)
    print 'y data length %d' % len(data_y)

    x_data_length = len(data_x)
    y_data_length = len(data_y)

    # simple case: same number of values for x, y
    if (x_data_length == y_data_length):
        plot_values = []
        for i in range(0, x_data_length):
            x_val = data_x[i]
            y_val = data_y[i]
            if x_val[1] is not None and y_val[1] is not None:
                plot_values.append([x_val[1], y_val[1]])
        return {'status': 'success', 'data':plot_values}
    else:
        return {'status': 'unequal number of values in the two series', 'data':None}

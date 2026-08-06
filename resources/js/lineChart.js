import { mergedOptionsWithJsonConfig } from './helpers'

const lineChart = () => {
    // Deliberately a closure variable rather than a property on the returned object.
    // Anything on that object lives in Alpine's reactive graph, which on a Livewire root
    // also carries $wire, and $wire is a Proxy whose unknown properties become server side
    // method calls. An ApexCharts instance in there gets its config serialised, the
    // serialiser reaches $wire, asks it for toJSON, and Livewire sends the browser off to
    // call a toJSON() method that no component has.
    let chart = null

    return {
        init() {
            setTimeout(() => {
                this.drawChart()
            }, 0)
        },

        drawChart() {
            const component = this.$wire

            if (chart) {
                chart.destroy()
            }

            const title = component.get('lineChartModel.title');
            const animated = component.get('lineChartModel.animated') || false;
            const dataLabels = component.get('lineChartModel.dataLabels') || {};
            const data = component.get('lineChartModel.data');
            const onPointClickEventName = component.get('lineChartModel.onPointClickEventName');
            const sparkline = component.get('lineChartModel.sparkline');
            const jsonConfig = component.get('lineChartModel.jsonConfig');

            const series = [{
                name: title,
                data: data.map(item => item.value),
            }]

            const categories = component.get('lineChartModel.xAxis.categories').length > 0
                ? component.get('lineChartModel.xAxis.categories')
                : data.map(item => item.title)

            const options = {
                series: series,

                chart: {
                    type: 'line',
                    height: '100%',

                    ...sparkline,

                    zoom: { enabled: false },

                    toolbar: { show: false },

                    animations: { enabled: animated },

                    events: {
                        markerClick: function(event, chartContext, { dataPointIndex }) {
                            if (!onPointClickEventName) {
                                return
                            }

                            const point = data[dataPointIndex]
                            component.call('onPointClick', point)
                        }
                    }
                },

                dataLabels: dataLabels,

                stroke: component.get('lineChartModel.stroke') || {},

                theme: component.get('lineChartModel.theme') || {},

                title: {
                    text: title,
                    align: 'center'
                },

                xaxis: {
                    labels: component.get('lineChartModel.xAxis.labels'),
                    categories: categories,
                },

                yaxis: component.get('lineChartModel.yAxis') || {},

                annotations: {
                    points: component.get('lineChartModel.markers').map(item => {
                            return {
                                x: item.title,
                                y: item.value,
                                marker: {
                                    size: 6,
                                    fillColor: '#fff',
                                    strokeColor: item.strokeColor,
                                    radius: 2,
                                },
                                label: {
                                    offsetY: 0,
                                    style: {
                                        color: item.textColor,
                                        background: item.textBackgroundColor,
                                    },
                                    text: item.text || '',
                                }
                            }
                        }
                    )
                },

                tooltip: {
                    y: {
                        formatter: function(value, series) {
                            return data[series.dataPointIndex].extras.tooltip || value;
                        }
                    }
                },
            };

            chart = new ApexCharts(this.$refs.container, mergedOptionsWithJsonConfig(options, jsonConfig));
            chart.render();
        }
    }
}


export default lineChart

import { mergedOptionsWithJsonConfig } from './helpers'

const areaChart = () => {
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

            const title = component.get('areaChartModel.title');
            const animated = component.get('areaChartModel.animated') || false;
            const dataLabels = component.get('areaChartModel.dataLabels') || {};
            const onPointClickEventName = component.get('areaChartModel.onPointClickEventName')
            const data = component.get('areaChartModel.data');
            const sparkline = component.get('areaChartModel.sparkline');
            const jsonConfig = component.get('areaChartModel.jsonConfig');

            const categories = component.get('areaChartModel.xAxis.categories').length > 0
                ? component.get('areaChartModel.xAxis.categories')
                : data.map(item => item.title)
            ;

            var options = {
                series: [{
                    name: title,
                    data: data.map(item => item.value)
                }],
                chart: {
                    type: 'area',
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

                colors: [component.get('areaChartModel.color') || '#2E93fA'],

                stroke: component.get('areaChartModel.stroke') || {},

                title: {
                    text: title,
                    align: 'center'
                },

                labels: data.map(item => item.title),

                xaxis: {
                    labels: component.get('areaChartModel.xAxis.labels'),
                    categories: categories,
                },

                yaxis: component.get('areaChartModel.yAxis') || {},

                grid: {
                    padding: {
                        left: 0,
                        top: 0,
                        right: 0,
                        bottom: 0,
                    }
                },

                theme: component.get('areaChartModel.theme') || {},

            };

            chart = new ApexCharts(this.$refs.container, mergedOptionsWithJsonConfig(options, jsonConfig));
            chart.render();
        }
    }
}

export default areaChart

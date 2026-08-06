import {mergedOptionsWithJsonConfig} from './helpers'

const pieChart = () => {
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

            const title = component.get('pieChartModel.title');
            const animated = component.get('pieChartModel.animated') || false
            const dataLabels = component.get('pieChartModel.dataLabels') || {}
            const onSliceClickEventName = component.get('pieChartModel.onSliceClickEventName')
            const data = component.get('pieChartModel.data')
            const sparkline = component.get('pieChartModel.sparkline')
            const type = component.get('pieChartModel.type')
            const jsonConfig = component.get('pieChartModel.jsonConfig');

            const options = {
                // ApexCharts draws nothing at all for an empty series, and a pie or donut has no
                // axes to fall back on, so the card renders as blank white space with only its
                // title. Say so instead.
                noData: {
                    text: 'No data available',
                    align: 'center',
                    verticalAlign: 'middle',
                },

                series: data.map(item => item.value),

                chart: {
                    height: '100%',
                    type: type,

                    ...sparkline,

                    animations: { enabled: animated },

                    events: {
                        dataPointSelection: function(event, chartContext, config) {
                            if (!onSliceClickEventName) {
                                return
                            }

                            const { dataPointIndex } = config
                            const slice = data[dataPointIndex]
                            component.call('onSliceClick', slice)
                        },
                    }
                },

                labels: data.map(item => item.title),

                dataLabels: dataLabels,

                colors: data.map(item => item.color),

                fill: {
                    opacity: component.get('pieChartModel.opacity'),
                },

                title: {
                    text: title,
                    align: 'center',
                },

                responsive: [
                    {
                        breakpoint: 600,
                        options: {
                            legend: {
                                position: 'bottom'
                            }
                        }
                    }
                ],

                legend: component.get('pieChartModel.legend') || {},

                theme: component.get('pieChartModel.theme') || {},

                tooltip: {
                    y: {
                        formatter: function(value, series) {
                            return data[series.dataPointIndex].extras.tooltip || value;
                        }
                    }
                },
            };

            const colors = component.get('pieChartModel.colors');

            if (colors && colors.length > 0) {
                options['colors'] = colors
            }

            chart = new ApexCharts(this.$refs.container, mergedOptionsWithJsonConfig(options, jsonConfig));
            chart.render();
        }
    }
}

export default pieChart

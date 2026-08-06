import { mergedOptionsWithJsonConfig } from './helpers'

const columnChart = () => {
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

            const title = component.get('columnChartModel.title')
            const animated = component.get('columnChartModel.animated') || false;
            const onColumnClickEventName = component.get('columnChartModel.onColumnClickEventName')
            const dataLabels = component.get('columnChartModel.dataLabels') || {};
            const sparkline = component.get('columnChartModel.sparkline');
            const legend = component.get('columnChartModel.legend')
            const grid = component.get('columnChartModel.grid');
            const columnWidth = component.get('columnChartModel.columnWidth');
            const horizontal = component.get('columnChartModel.horizontal');
            const jsonConfig = component.get('columnChartModel.jsonConfig');

            const data = component.get('columnChartModel.data');
            const series = [{
                name: title,
                data: data.map(item => item.value)
            }]

            const options = {
                // ApexCharts draws nothing at all for an empty series, and a pie or donut has no
                // axes to fall back on, so the card renders as blank white space with only its
                // title. Say so instead.
                noData: {
                    text: 'No data available',
                    align: 'center',
                    verticalAlign: 'middle',
                },

                series: series,

                chart: {
                    type: 'bar',
                    height: '100%',

                    ...sparkline,

                    toolbar: { show: false },

                    animations: { enabled: animated },

                    events: {
                        dataPointSelection: function(event, chartContext, config) {
                            if (!onColumnClickEventName) {
                                return
                            }

                            const { dataPointIndex } = config
                            const column = data[dataPointIndex]
                            component.call('onColumnClick', column)
                        },
                    }
                },

                colors: data.map(item => item.color),

                labels: {
                    style: {
                        colors: data.map(item => item.color),
                    },
                },

                legend: legend,

                grid: grid,

                plotOptions: {
                    bar: {
                        horizontal: horizontal,
                        columnWidth: `${columnWidth}%`,
                        distributed: true,
                    },
                },

                dataLabels: dataLabels,

                xaxis: {
                    categories: data.map(item => item.title),
                },

                yaxis: {
                    title: {
                        text: title,
                    }
                },

                fill: {
                    opacity: component.get('columnChartModel.opacity') || 0.5
                },

                theme: component.get('columnChartModel.theme') || {},

                tooltip: {
                    y: {
                        formatter: function(value, series) {
                            return data[series.dataPointIndex].extras.tooltip || value;
                        }
                    }
                },

            };

            const colors = component.get('columnChartModel.colors');

            if (colors && colors.length > 0) {
                options['colors'] = colors
            }

            chart = new ApexCharts(this.$refs.container, mergedOptionsWithJsonConfig(options, jsonConfig));
            chart.render();
        }
    }
}

export default columnChart

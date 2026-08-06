import { mergedOptionsWithJsonConfig } from './helpers'

const multiColumnChart = () => {
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
            const stacked = component.get('columnChartModel.isStacked');
            const animated = component.get('columnChartModel.animated');
            const onColumnClickEventName = component.get('columnChartModel.onColumnClickEventName')
            const dataLabels = component.get('columnChartModel.dataLabels');
            const sparkline = component.get('columnChartModel.sparkline');
            const legend = component.get('columnChartModel.legend')
            const grid = component.get('columnChartModel.grid');
            const columnWidth = component.get('columnChartModel.columnWidth');
            const horizontal = component.get('columnChartModel.horizontal');
            const jsonConfig = component.get('columnChartModel.jsonConfig');

            const data = component.get('columnChartModel.data');
            const series = Object.keys(data)
                .map(seriesName => ({
                    name: seriesName,
                    data: data[seriesName].map(item => item.value)
                }))

            const categories = component.get('columnChartModel.xAxis.categories').length > 0
                ? component.get('columnChartModel.xAxis.categories')
                : data[series[0].name].map(item => item.title)
            ;

            const options = {
                series: series,

                chart: {
                    type: 'bar',
                    height: '100%',
                    stacked: stacked,

                    ...sparkline,

                    toolbar: { show: false },

                    animations: { enabled: animated },

                    events: {
                        dataPointSelection: function(event, chartContext, {seriesIndex, dataPointIndex}) {
                            if (!onColumnClickEventName) {
                                return
                            }

                            const column = data[series[seriesIndex].name][dataPointIndex]
                            component.call('onColumnClick', column)
                        },
                    }
                },

                legend: legend,

                grid: grid,

                plotOptions: {
                    bar: {
                        horizontal: horizontal,
                        columnWidth: `${columnWidth}%`,
                    },
                },

                dataLabels: dataLabels,

                xaxis: {
                    categories: categories,
                },

                yaxis: {
                    title: {
                        text: title,
                    }
                },

                fill: {
                    opacity: component.get('columnChartModel.opacity'),
                },

                theme: component.get('columnChartModel.theme') || {},

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

export default multiColumnChart

import { mergedOptionsWithJsonConfig } from './helpers'

const radarChart = () => {
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

            const title = component.get('radarChartModel.title');
            const animated = component.get('radarChartModel.animated');
            const onPointClickEventName = component.get('areaChartModel.onPointClickEventName');
            const dataLabels = component.get('radarChartModel.dataLabels');
            const data = component.get('radarChartModel.data');
            const sparkline = component.get('radarChartModel.sparkline');
            const colors = component.get('radarChartModel.colors');
            const jsonConfig = component.get('radarChartModel.jsonConfig');

            const series = Object.keys(data)
                .map(seriesName => ({
                    name: seriesName,
                    data: data[seriesName].map(item => item.value)
                }))

            const categories = component.get('radarChartModel.xAxis.categories').length > 0
                ? component.get('radarChartModel.xAxis.categories')
                : data[series[0].name].map(item => item.title)
            ;

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
                    type: 'radar',
                    height: '100%',

                    ...sparkline,

                    toolbar: {show: false},

                    animations: {enabled: animated},

                    events: {
                        markerClick: function(event, chartContext, {seriesIndex, dataPointIndex}) {
                            if (!onPointClickEventName) {
                                return
                            }

                            const point = data[series[seriesIndex].name][dataPointIndex]

                            component.call('onPointClick', point)
                        },
                    }
                },

                legend: component.get('radarChartModel.legend'),

                plotOptions: {
                    bar: {
                        horizontal: false,
                        columnWidth: '50%',
                    },
                },

                dataLabels: dataLabels,

                xaxis: {
                    categories: categories,
                },

                title: { text: title },

                fill: {
                    opacity: component.get('radarChartModel.opacity'),
                },

                colors: colors,

                markers: {
                    size: 4
                },

            };

            chart = new ApexCharts(this.$refs.container, mergedOptionsWithJsonConfig(options, jsonConfig));
            chart.render();
        }
    }
}

export default radarChart

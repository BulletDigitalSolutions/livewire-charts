import { mergedOptionsWithJsonConfig } from './helpers'

const treeMapChart = () => {
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

            const title = component.get('treeMapChartModel.title');
            const animated = component.get('treeMapChartModel.animated');
            const distributed = component.get('treeMapChartModel.distributed');
            const onBlockClickEventName = component.get('treeMapChartModel.onBlockClickEventName');
            const data = component.get('treeMapChartModel.data');
            const colors = component.get('treeMapChartModel.colors');
            const enableShades = component.get('treeMapChartModel.enableShades');
            const jsonConfig = component.get('treeMapChartModel.jsonConfig');

            const series = Object.keys(data)
                .map(seriesName => ({
                    name: seriesName,
                    data: data[seriesName].map(item => ({
                        x: item.title,
                        y: item.value,
                    }))
                }))

            const options = {
                series: series,

                legend: { show: false },

                title: { text: title },

                chart: {
                    height: '100%',
                    type: 'treemap',

                    toolbar: {show: false},

                    animations: {enabled: animated},

                    events: {
                        click: function(event, chartContext, {seriesIndex, dataPointIndex}) {
                            if (!onBlockClickEventName) {
                                return
                            }

                            const block = data[series[seriesIndex].name][dataPointIndex]

                            component.call('onBlockClick', block)
                        },
                    }
                },

                plotOptions: {
                    treemap: {
                        distributed: distributed,
                        enableShades: enableShades,
                    }
                },

                colors: colors,
            };

            chart = new ApexCharts(this.$refs.container, mergedOptionsWithJsonConfig(options, jsonConfig));
            chart.render();
        }
    }
}

export default treeMapChart

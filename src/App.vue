<template>
  <div id="app">
    <div class="container-fluid" id="dashboard">
      <div class="row">
        <div class="col-md-10">
          <div>
            <h1 id="appTitle">
              Visualization Dashboard - COVID-19
            </h1>
          </div>
          <div class="row">
            <div class="col">
              <div class="choropleth-map" id="choropleth-map">
                <!--<ChoroplethMap/>-->
                {choroplethmap}
              </div>
              <div class="scatter-plot" id="scatter-plot">
                <!--<ScatterPlot/>-->
                {scatterplot}
              </div>
            </div>
            <div class="col">
              <div class="multiple-line-chart" id="multiple-line-chart">
                <!--<MultipleLineChart/>-->
                {multiplelinechart}
              </div>
              <div class="line-chart" id="line-chart">
                <!--<LineChart/>-->
                {linechart}
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-2">
          <div class="right-column" id="control-board">
            <!--<ControlBoard/>-->
            {controlboard}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/*import ChoroplethMap from './components/ChoroplethMap.vue';
import MultipleLineChart from './components/MultipleLineChart.vue';
import ScatterPlot from './components/Scatterplot.vue';
import LineChart from './components/LineChart.vue';
*/
export default {
  name: 'App',
  components: {
    //ChoroplethMap, MultipleLineChart, ScatterPlot, LineChart
  },
  mounted() {
    this.$store.dispatch('loadData');
  },
}
</script>

<style>

#appTitle {
  text-align: start;
  text-anchor: start;
  font-weight: bold;
  font-family: Baskerville;
  font-size: 24px;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 20px;
}

#choropleth-map {
  background-color: rgb(255, 136, 136);
}

#multiple-line-chart {
  background-color: rgb(134, 134, 255);
}

#scatter-plot {
  background-color: rgb(139, 255, 139);
}

#line-chart {
  background-color: rgb(255, 212, 133);
}

#control-board {
  background-color: rgb(128, 128, 128);
}

</style>

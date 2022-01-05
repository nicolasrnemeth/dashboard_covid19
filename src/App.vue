<template>
  <div id="app" ref="app_">
    <div class="container-fluid" id="dashboard">
      <div class="row">
        <div class="col-md-10">
          <div class="app-title">
            {title}
          </div>
          <div class="row">
            <div class="col">
              <ChoroplethMap/>
              <div class="scatter-plot">
                <!--<ScatterPlot/>-->
                {scatterplot}
              </div>
            </div>
            <div class="col">
              <div class="multiple-line-chart">
                <!--<MultipleLineChart/>-->
                {multiplelinechart}
              </div>
              <div class="line-chart">
                <!--<LineChart/>-->
                {linechart}
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-2">
          <div class="control-board">
            <!--<ControlBoard/>-->
            {controlboard}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ChoroplethMap from './components/ChoroplethMap.vue';
/*import MultipleLineChart from './components/MultipleLineChart.vue';
import ScatterPlot from './components/Scatterplot.vue';
import LineChart from './components/LineChart.vue';
*/
export default {
  name: 'App',
  components: {
    ChoroplethMap
    //MultipleLineChart, ScatterPlot, LineChart
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
  margin-top: 0px;
}

.row {
  padding: 0px !important;
}

.col {
  padding: 0px !important;
}

.col-md-2, .col-md-10 {
  padding: 0px;
}

.app-title {
  margin-right: -15px;
  margin-left: -15px;
  background-color: rosybrown;
}

.multiple-line-chart {
  background-color: rgb(134, 134, 255);
}

.scatter-plot {
  background-color: rgb(139, 255, 139);
}

.line-chart {
  background-color: rgb(255, 212, 133);
}

.control-board {
  margin-left: -15px;
  margin-right: -15px;
  background-color: rgb(128, 128, 128);
}

</style>

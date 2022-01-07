<template>
  <div id="app" ref="app_">
    <div class="container-fluid" id="dashboard">
      <div class="row">
        <div class="col-md-10">
          <div class="app-title">
            Visualization Dashboard - Covid-19 Pandemic
          </div>
          <div class="row">
            <div class="col">
              <ChoroplethMap/>
              <ScatterPlot/>
            </div>
            <div class="col">
              <MultipleLineChart/>
              <LineChart/>
            </div>
          </div>
        </div>
        <div class="col-md-2">
          <ControlBoard/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

//import * as d3 from 'd3';

import ChoroplethMap from './components/ChoroplethMap.vue';
import MultipleLineChart from './components/MultipleLineChart.vue';
import ScatterPlot from './components/Scatterplot.vue';
import LineChart from './components/LineChart.vue';
import ControlBoard from './components/ControlBoard.vue';

export default {
  name: 'App',
  components: {
    ChoroplethMap, ScatterPlot, LineChart, MultipleLineChart, ControlBoard
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
  border: 1px solid #000000;
}

.container-fluid {
  margin: 0px !important;
  padding: 0px !important;
}

.row {
  margin: 0px !important;
  padding: 0px !important;
}

.col {
  margin: 0px !important;
  padding: 0px !important;
}

.col-md-2, .col-md-10 {
  margin: 0px !important;
  padding: 0px !important;
}

.app-title {
  background-color: rosybrown;
  border: 1px solid #000000;
  width: calc(83vw + 1.5px);
  height: 3.9vh;
}

</style>

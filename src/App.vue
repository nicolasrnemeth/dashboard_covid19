<template>
  <div id="app" ref="app_">
    <div id="loader_" class="align-items-center">
      <div id="loadingText"><strong>Preparing data, please wait a moment ...</strong></div>
      <div class="spinner-border text-primary" role="status"></div>
    </div>
    <div v-if="$store.state.dataIsReady" class="container-fluid" id="dashboard">
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
    ChoroplethMap, MultipleLineChart, ScatterPlot, LineChart, ControlBoard
  },
  mounted() {
    this.$store.dispatch('loadNPrepData');
  },
}
</script>

<style>
body {
  overflow: hidden !important;
}

#loadingText {
  margin-left: 1vw;
  margin-top: 30vh;
}

.spinner-border {
  margin: 2vh 50vw 0vh 50vw;
  display: block !important;
}

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
}

.container-fluid {
  margin: 0px !important;
  padding: 0px !important;
  border: 1px solid #000000;
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
  vertical-align: middle; 
  line-height: 3.9vh;
}

</style>

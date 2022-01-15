<template>
  <div id="app" ref="app_">
    <div id="loader_" class="align-items-center">
      <div id="loadingText"><strong>Preparing data, please wait a moment ...</strong></div>
      <div class="spinner-border text-primary" role="status"></div>
    </div>
    <div v-if="$store.state.dataIsReady" class="container-fluid" id="dashboard">
      <div class="row">
        <div class="col-left">
          <div id="app-title" class="title_">
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
        <div class="col-right">
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

.title_ {
  font-weight: bold;
  font-family: Baskerville;
  font-size: calc((2.1vh + 2.1vw)/2);
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.ToolTip {
  position: absolute;
  z-index: 2;
  background-color: lightgray;
  border-radius: 5px;
  border: 1px solid #000000;
  font-size: calc((1.8vh + 1vw)/2);
  font-family: Baskerville;
  text-align: left !important;
  text-anchor: start !important;
  opacity: 0;
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

.col-left {
  position: relative;
  width: 100%;
  margin: 0px;
  padding: 0px;
  -ms-flex: 0 0 83%;
  flex: 0 0 83%;
  max-width: 83%;
}

.col-right {
  position: relative;
  width: 100%;
  margin: 0px;
  padding: 0px;
  -ms-flex: 0 0 17%;
  flex: 0 0 17%;
  max-width: 17%;
}

#app-title {
  background-color: lightskyblue;
  width: calc(83vw - 1px);
  height: 3.9vh;
  vertical-align: middle; 
  line-height: 3.9vh;
  border-radius: 5px;
  margin: 1px 1px 0px 1px;
  border: 1px solid #000000;
}

.axis {
  font-family: Baskerville;
  font-size: 13px;
}

.hideAxisLine .domain {
  stroke-width: 0px;
}

</style>

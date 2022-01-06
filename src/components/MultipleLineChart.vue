<template>
  <div class="view-B" ref="viewB">
    <svg class="svg-B" :width="svgWidth" :height="svgHeight" ref="svgB">
      <g class="multiple-line-chart" ref="multipleLineChart">
        <g class="axis axis-x" ref="xAxis"></g>
        <g class="axis axis-y" ref="yAxis"></g>
        <g class="line" ref="Line"></g>
        <g class="point-group" ref="pointGroup"></g>
        <rect id="toolTip-B"></rect>
      </g>
      <!--<g></g>
      <g></g>
      <g></g>-->
    </svg>
  </div>
</template>


<script>

//import * as d3 from 'd3';

export default {
  name: 'MultipleLineChart',
  props: {
  },
  data() {
    return {
      svgWidth: 500,
      svgHeight: 500,
      svgPadding: {
        top: 10, right: 10, bottom: 30, left: 45,
      },
      processed_data: [],
    }
  },
  mounted() {
    this.createChart();
  },
  methods: {
    createChart() {
      if (this.$refs.viewB) {
        this.svgWidth = document.body.clientWidth*0.41666667;
        this.svgHeight = document.body.clientHeight*0.475;
      }

    },
  },
  computed: {
    
  },
  watch: {
    
  }
}

</script>

<style>

.view-B {
  width: 41.666667vw;
  height: 47.5vh;
  background-color: rgb(211, 255, 215);
  border: 1px solid #000000;
}

</style>
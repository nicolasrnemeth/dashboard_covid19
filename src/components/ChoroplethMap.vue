<template>
  <div class="view-A" ref="viewA">
    <svg class="svg-A" :width="svgWidth" :height="svgHeight" ref="svgA">
        <rect id="empty-area" ref="emptyArea"></rect>
        <g id="choropleth-map" ref="choroplethMap"></g>
        <rect id="toolTip-A"></rect>
    </svg>
  </div>
</template>

<script>

import mapWorld from '@/assets/world-geo.json';
import * as d3 from 'd3';

export default {
  name: 'ChoroplethMap',
  props: {
  },
  data() {
    return {
      svgWidth: 500,
      svgHeight: 500,
      svgPadding: {
        top: 0, right: 0, bottom: 0, left: 0,
      },
    }
  },
  mounted() {
    this.createMap();
    this.createEmptyArea();
  },
  methods: {
    // Draw World Map
    createMap() {
      if (this.$refs.viewA) {
        this.svgWidth = window.innerWidth*0.41666667;
        this.svgHeight = window.innerHeight*0.475;
      }
      let projection = d3.geoMercator()
                         .scale(this.svgWidth*0.16)
                         .translate([this.svgWidth/2,this.svgHeight/1.6]);
      let path_generator = d3.geoPath().projection(projection);
      let worldMap = d3.select(this.$refs.choroplethMap)
      
      worldMap.selectAll('path')
            .data(mapWorld.features)
            .join('path')
            .attr('class', 'paths')
            .attr('d', path_generator)
            .attr('id', d => d.properties.iso_a3.replaceAll(" ", "")+"_path")
            //.on("click", (_, d) => this.handleStateClick(d.properties.name))
            .style('fill', 'white')
            .style('stroke', 'black')
            .style('stroke-width', 1.1)
            //.style('cursor', 'pointer')
      
      //this.updateColor();
    },
    // Add color scheme to states based on selected bivariate color scheme
    updateColor() {
      return;
    },
    // increase the intensity of the color
    increaseColorSaturation(color, k=1.25) {
      const {l, c, h} = d3.lch(color);
      return d3.lch(l, c + 18 * k, h).formatHex();
    },
    // Draw the empty area behind the usa map
    createEmptyArea() {
      let emptyArea = d3.select(this.$refs.emptyArea);
      emptyArea.attr("height", this.svgHeight)
               .attr("width", this.svgWidth)
               //.on("click", this.handleEmptyAreaClick)
               //.style('cursor', "pointer")
    },
    // Deselect all selected states and therefore remove highlighting in scatterplot
    handleEmptyAreaClick() {
      return;
    },
  },
  computed: {
    selectedCountries: {
      get() {
        return 0;
      }
    },
  },
  watch: {
    selectedCountries: {
      handler() {
        return;
      },
      deep: true,
      immediate: true,
    }
  },
}

</script>

<style>

#empty-area {
  fill: rgb(250, 250, 250);
}

</style>

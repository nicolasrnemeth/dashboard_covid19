<template>
  <div class="vis-component" ref="chart">
    <svg class="main-svg" :width="svgWidth" :height="svgHeight" ref="mainSvg">
      <rect id="empty-area" ref="emptyArea"></rect>
      <g id="choropleth-map" ref="choroplethMap"></g>
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
        top: 20, right: 20, bottom: 20, left: 20,
      },
    }
  },
  mounted() {
    // Use the following map geoJSON object ("mapStatesUSA") for your projection
    //console.log(mapWorld);
  },
  methods: {
    // Draw USA Map
    createMap() {
      if (this.$refs.chart) {
        this.svgWidth = this.$refs.chart.clientWidth;
        //this.svgHeight = this.scatterPlotHeight;
      }
      let projection = d3.geoAlbersUsa()
                         .scale(this.svgWidth*1.2)
                         .translate([this.svgWidth/2*1.07,this.svgHeight/2]);
      let path_generator = d3.geoPath().projection(projection);
      let usaMap = d3.select(this.$refs.choroplethMap)
      
      usaMap.selectAll('path')
            .data(mapStatesUSA.features)
            .join('path')
            .attr('class', 'paths')
            .attr('d', path_generator)
            .attr('id', d => d.properties.name.replaceAll(" ", "")+"_path")
            .on("click", (_, d) => this.handleStateClick(d.properties.name))
            .style('fill', 'white')
            .style('stroke', 'black')
            .style('stroke-width', 1.1)
            .style('cursor', 'pointer')
            // Add tooltips displaying state name
            .append('title')
            .attr('class', 'tooltip-map')
            .text(d => "hightlight " + d.properties.name);
      
      this.updateColor();
    },
    // Pass information of selected states forward to store
    handleStateClick(stateId) {
      this.$store.commit("changeSelectedState", stateId.replaceAll(" ", ""));
    },
    // Add color scheme to states based on selected bivariate color scheme
    updateColor() {
      for (let state of this.stateColorIndexPairs) {
        d3.select("#"+state.id)
          .style("fill", this.paletteColor[state.colorIndex]);
      }
    },
    // increase the intensity of the color
    increaseColorSaturation(color, k=1.25) {
      const {l, c, h} = d3.lch(color);
      return d3.lch(l, c + 18 * k, h).formatHex();
    },
    // Draw the empty area behind the usa map
    createEmptyArea() {
      let emptyArea = d3.select(this.$refs.emptyArea);
      emptyArea.attr("height", (this.svgHeight - this.svgPadding.top - this.svgPadding.bottom)+2)
               .attr("width", this.svgWidth)
               .attr('y', this.svgPadding.top+1)
               .on("click", this.handleEmptyAreaClick)
               .style('cursor', "pointer")
               .append('title')
               .attr('class', 'tooltip-map')
               .text("undo highlighting");
    },
    // Deselect all selected states and therefore remove highlighting in scatterplot
    handleEmptyAreaClick() {
      this.$store.commit("clearSelectedState");
    },
    // Define function to update brush highlight when data changes
    updateBrushHighlight() {
      d3.selectAll('.paths').style("fill", "black").style("fill-opacity", 0.75);
      for (let stateId of this.brushedStates) {
        d3.select('#'+stateId)
          .style("fill", this.paletteColor[this.stateColorIndexPairs.find(d => d.id == stateId).colorIndex]);
      }
    },
  },
  computed: {
    selectedStates: {
      get() {
        return this.$store.getters.selectedStates;
      }
    },
    // Individual properties are combined using template literals for
    // only having to watch one computed property instead of 4
    paletteColor_stateColorIndexPairs_brushedStates: {
      get() {
        return `${this.paletteColor},${this.stateColorIndexPairs},${this.brushedStates},${this.scatterPlotIsBrushed}`;
      }
    },
  },
  watch: {
    // If any of the data changes update highlightings or remove them accordingly
    paletteColor_stateColorIndexPairs_brushedStates: {
      handler() {
        if(this.brushedStates.length > 0) {
          this.updateBrushHighlight();
        } else {
          if(this.scatterPlotIsBrushed) {
            d3.selectAll('.paths').style("fill", "black").style("fill-opacity", 0.75);
          } else {
              this.updateColor();
            }
        }
      },
      deep: true,
      immediate: true,
    }
  },
}

</script>

<style>
</style>

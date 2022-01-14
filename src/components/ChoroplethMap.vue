<template>
  <div class="view-A" ref="viewA">
    <svg id="svg-A" ref="svgA" v-show="viewBoxIsSet" preserveAspectRatio="xMidYMid meet">
        <g id="choropleth-map" ref="choroplethMap"></g>
    </svg>
    <div id="toolTip-A" class="ToolTip"></div>
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
      colorSteps: [
        "#fef0d9", "#fdcc8a", "#fc8d59", "#e34a33", "#b30000"
      ],
      viewBoxIsSet: false,
      currentFeatureSelection: "human_development_index",
      svgWidth: 100,
      svgHeight: 100,
      svgPadding: {
        top: 0, right: 0, bottom: 0, left: 0,
      },
    }
  },
  mounted() {
    this.createMap();
    this.colorCountries(this.currentFeatureSelection);
    this.setUpMouseEvents();
    this.setUpToolTipA();
  },
  methods: {
    // Format feature variable text
    formatFeatureText(text) {
      let formattedText = text.split("_");
      for (let idx=0; idx < formattedText.length; idx++)
         formattedText[idx] = formattedText[idx].charAt(0).toUpperCase() 
                              + formattedText[idx].substring(1);
      return formattedText.join(" ");
    },
    // Define Mouse functions
    handleMouseOver() {
      d3.select("#toolTip-A")
        .style("opacity", 1);
    },
    setUpToolTipA() {
      // Define that toolTip does not disappear should user move mouse faster
      // than the tooltip moves should that the invisible rect does not trigger
      // anymore the mouse events
      d3.select("#toolTip-A")
        .on("mousemove", this.handleMouseMove)
        .on("mouseleave", this.handleMouseLeave)
        .on("mouseover", this.handleMouseOver)
    },
    handleMouseMove(event, d) {
      // Update content and position of toolTipA
      const domElem = d3.select(this.$refs.viewA).node();
      let [x, y] = d3.pointer(event, domElem);
      let [oDivWidth, oDivHeight] = [domElem.clientWidth, domElem.clientHeight];

      let toolTipContent = `<strong>${d.properties.name}</strong><br/>`;
      toolTipContent += `${this.formatFeatureText(this.currentFeatureSelection)}: `
      if (this.covidData[d.properties.iso_a3][this.currentFeatureSelection])
        toolTipContent += `${this.covidData[d.properties.iso_a3][this.currentFeatureSelection]}`;
      else
        toolTipContent += null;

      let tTA = d3.select("#toolTip-A")
                  .html(`${toolTipContent}`);
      let [tTw, tTh] = [tTA.node().clientWidth, tTA.node().clientHeight];

      // Ensure that toolTip does not cross boundary of parent container
      if (x <= oDivWidth/2 && y <= oDivHeight/2) {
        tTA.style("left", `${x+20}px`)
           .style("top", `${y}px`);
      }
      if (x > oDivWidth/2 && y > oDivHeight/2) {
        tTA.style("left", `${x-tTw-20}px`)
           .style("top", `${y-tTh}px`);
      }
      if (x < oDivWidth/2 && y > oDivHeight/2) {
        tTA.style("left", `${x+20}px`)
           .style("top", `${y-tTh}px`);
      }
      if (x > oDivWidth/2 && y < oDivHeight/2) {
        tTA.style("left", `${x-tTw-20}px`)
           .style("top", `${y}px`);
      }
    },
    handleMouseLeave() {
      d3.select("#toolTip-A")
        .style("opacity", 0);
    },
    // Set up Mouse events
    setUpMouseEvents() {
      let worldMapCountries = d3.select(this.$refs.choroplethMap).selectAll("path");

      worldMapCountries.on("mouseover", this.handleMouseOver)
                       .on("mouseleave", this.handleMouseLeave)
                       .on("mousemove", this.handleMouseMove);
    },
    // Draw World Map
    createMap() {
      if (this.$refs.viewA) {
        this.svgWidth = this.$refs.viewA.clientWidth-this.svgPadding.left-this.svgPadding.right;
        this.svgHeight = this.$refs.viewA.clientHeight-this.svgPadding.top-this.svgPadding.bottom;
        // Set viewBox of svg and only then display it
        document.getElementById("svg-A").setAttribute("viewBox", `0 0 ${this.svgWidth} ${this.svgHeight}`);
        this.viewBoxIsSet = true;
      }
      let projection = d3.geoMercator()
                         .fitSize([this.svgWidth, this.svgHeight], mapWorld);
      let path_generator = d3.geoPath().projection(projection);
      let worldMap = d3.select(this.$refs.choroplethMap)
      
      worldMap.selectAll('path')
              .data(mapWorld.features)
              .join('path')
              .attr('d', path_generator)
              .attr('id', d => d.properties.iso_a3.replaceAll(" ", "")+"_pathA")
              .style('fill', 'lightgrey')
              .style('stroke', 'black')
              .style('stroke-width', 0.2);
      
      // Enable zooming for the map
      let zoom = d3.zoom()
                   .scaleExtent([1, 8])
                   .translateExtent([[-10, -10], [this.svgWidth+10, this.svgHeight+10]])
                   .on('zoom', function(event) {
                     d3.select("#choropleth-map").selectAll("path")
                       .attr('transform', event.transform)
                   });
      d3.select(this.$refs.svgA).call(zoom);
    },
    getColorIndex(value, minVal, maxVal) {
      let idx = Math.trunc((value - minVal) / ((maxVal - minVal)*0.2));
      if (idx == 5)
        return 4;
      return idx;
    },
    // Add color scheme to states based on selected bivariate color scheme
    colorCountries(selection) {
      let filtered_data = [];
      for (let country of Object.keys(this.$store.state.covidData))
        if (country.length == 3) 
          filtered_data.push(this.$store.state.covidData[country][selection]);

      let [minVal, maxVal] = d3.extent(filtered_data);

      for (let country of Object.keys(this.$store.state.covidData)) {
        if (country.length != 3) continue;
        if (!(selection in this.$store.state.covidData[country]) || this.$store.state.covidData[country] == undefined) {
          d3.select("#"+country+"_pathA").style('fill', "#cccccc");
          continue;
        }
        let colIdx = this.getColorIndex(this.$store.state.covidData[country][selection], minVal, maxVal);
        d3.select("#"+country+"_pathA").style('fill', this.colorSteps[colIdx]);
      }
    },
  },
  computed: {
    covidData: {
      get() {
        return this.$store.getters.covidData;
      }
    },
  },
  watch: {
    
  }
}

</script>

<style>

.view-A {
  position: relative;
  width: calc(41.5vw - 2px);
  height: calc(48.05vh - 2px);
  border: 1px solid #000000;
  border-radius: 5px;
  box-shadow: 0 0 4px black;
  margin: 1px;
}

#svg-A {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}

</style>

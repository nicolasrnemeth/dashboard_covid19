<template>
  <div class="view-A" ref="viewA">
    <svg id="svg-A" ref="svgA" v-show="viewBoxIsSet">
        <!--<rect id="empty-area" ref="emptyArea"></rect>-->
        <g id="choropleth-map" ref="choroplethMap"></g>
        <!--<rect id="toolTip-A"></rect>-->
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
      colorSteps: [
        "#fef0d9", "#fdcc8a", "#fc8d59", "#e34a33", "#b30000"
      ],
      viewBoxIsSet: false,
      svgWidth: 100,
      svgHeight: 100,
      svgPadding: {
        top: 0, right: 0, bottom: 0, left: 0,
      },
    }
  },
  mounted() {
    this.createMap();
    //this.createEmptyArea();
    this.colorCountries("human_development_index");
  },
  methods: {
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
                         //.translate([this.svgWidth/2, this.svgHeight/1.5])
                         //.scale((this.svgWidth-1)/2/Math.PI);
      let path_generator = d3.geoPath().projection(projection);
      let worldMap = d3.select(this.$refs.choroplethMap)
      
      worldMap.selectAll('path')
              .data(mapWorld.features)
              .join('path')
              .attr('d', path_generator)
              .attr('id', d => d.properties.iso_a3.replaceAll(" ", "")+"_pathA")
              //.on("click", (_, d) => this.handleStateClick(d.properties.name))
              .style('fill', 'white')
              .style('stroke', 'black')
              .style('stroke-width', 0.2)
              //.style('cursor', 'pointer')
      
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
    
  },
  watch: {
    
  }
}

</script>

<style>

.view-A {
  position: relative;
  width: 41.5vw;
  height: 47.8vh;
  background-color: rgb(245, 245, 245);
  border: 1px solid #000000;
}

#svg-A {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}

#empty-area {
  fill: white;
}

</style>

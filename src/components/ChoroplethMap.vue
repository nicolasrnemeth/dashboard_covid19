<template>
  <div id="ViewA_" class="view-A" ref="viewA" style="cursor: grab;">
    <svg id="svg-A" ref="svgA" v-show="viewBoxIsSet" preserveAspectRatio="xMidYMid meet">
        <g id="choropleth-map" ref="choroplethMap" style="cursor: default;"></g>
    </svg>
    <div id="colorPaletteViewA"></div>
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
    this.setUpColorPalette();
    this.colorCountries();
    this.setUpMouseEvents();
    this.setUpToolTipAAndDiv();
  },
  methods: {
    setUpColorPalette() {
      let colorPaletteContent = `<span style="color: black;">LOW-</span>`;
      for (let color_ of this.colorSteps) {
        colorPaletteContent += `<svg><rect style="fill: ${color_}; stroke-wdith: 1px; stroke: black; width: 2vw; height: 2.2vh;"></rect></svg>`;
      }
      colorPaletteContent += `<span style="color: black;">-HIGH</span>`;

      d3.select("#colorPaletteViewA").html(colorPaletteContent);
    },
    // Format feature variable text
    formatFeatureText(text) {
      let formattedText = text.split("_");
      for (let idx=0; idx < formattedText.length; idx++)
         formattedText[idx] = formattedText[idx].charAt(0).toUpperCase() 
                              + formattedText[idx].substring(1);
      return formattedText.join(" ");
    },
    // Define Mouse functions
    handleMouseOver(d) {
      d3.select("#toolTip-A")
        .style("opacity", 1);
      
      if (d) {
        d3.select(`#${d.properties.iso_a3.replaceAll(" ", "")}_pathA`)
          .style("stroke-width", 0.7);
      }
    },
    setUpToolTipAAndDiv() {
      // Define that toolTip does not disappear should user move mouse faster
      // than the tooltip moves should that the invisible rect does not trigger
      // anymore the mouse events
      d3.select("#toolTip-A")
        .on("mousemove", this.handleMouseMove)
        .on("mouseover", (_, d) => this.handleMouseLeave(d));
      d3.select(this.$refs.viewA)
        .on("mousemove", this.handleMouseMoveDiv);
    },
    handleMouseMoveDiv(event) {
      // Update position of toolTipA
      const domElem = d3.select(this.$refs.viewA).node();
      let [x, y] = d3.pointer(event, domElem);
      let [oDivWidth, oDivHeight] = [domElem.clientWidth, domElem.clientHeight];
      let tTA = d3.select("#toolTip-A");
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
    handleMouseMove(event, d) {
      // Update content and position of toolTipA
      const domElem = d3.select(this.$refs.viewA).node();
      let [x, y] = d3.pointer(event, domElem);
      let [oDivWidth, oDivHeight] = [domElem.clientWidth, domElem.clientHeight];

      let toolTipContent = null;
      let foundByDate = false;
      if (d) {
        toolTipContent = `<strong>${d.properties.name}</strong><br/>`;
        toolTipContent += `${this.formatFeatureText(this.currentFeatureSelection)}: `;
        let found = false;
        if (d.properties.iso_a3 in this.covidData && this.currentFeatureSelection in this.covidData[d.properties.iso_a3]) {
          found = true;
          toolTipContent += `${this.covidData[d.properties.iso_a3][this.currentFeatureSelection]}`;
        }
        
        if (! found) {
          if (d.properties.iso_a3 in this.covidData)
            for (let idx_=this.covidData[d.properties.iso_a3].data.length-1; idx_ >= 0; idx_--) {
              if (this.currentFeatureSelection in this.covidData[d.properties.iso_a3].data[idx_]) {
                if (this.covidData[d.properties.iso_a3].data[idx_][this.currentFeatureSelection] < 0)
                  continue;
                foundByDate = true;
                toolTipContent += `${this.covidData[d.properties.iso_a3].data[idx_][this.currentFeatureSelection]}`;
                break;
              }
            }
        }
        if (! found && ! foundByDate)
          toolTipContent += null;
      }

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
    handleMouseLeave(d) {
      d3.select("#toolTip-A")
        .style("opacity", 0);

      if (d) {
        d3.select(`#${d.properties.iso_a3.replaceAll(" ", "")}_pathA`)
          .style("stroke-width", 0.2);
      }
    },
    // Set up Mouse events
    setUpMouseEvents() {
      let worldMapCountries = d3.select(this.$refs.choroplethMap).selectAll("path");

      worldMapCountries.on("mouseover", (_, d) => this.handleMouseOver(d))
                       .on("mouseleave", (_, d) => this.handleMouseLeave(d))
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
    // Add colors to countries based on selected color palette and values
    colorCountries() {
      let filtered_data = [];
      for (let country in this.covidData)
        if (country.length == 3) {
          if (this.currentFeatureSelection in this.covidData[country]) {
            filtered_data.push(this.covidData[country][this.currentFeatureSelection]);
          }
          else {
            for (let idx_ = this.covidData[country].data.length-1; idx_ >= 0; idx_--) {
              if (this.currentFeatureSelection in this.covidData[country].data[idx_]) {
                if (this.covidData[country].data[idx_][this.currentFeatureSelection] < 0)
                  continue;
                filtered_data.push(this.covidData[country].data[idx_][this.currentFeatureSelection]);
                break;
              }
            }
          }
        }

      let [minVal, maxVal] = d3.extent(filtered_data);
      
      for (let country in this.covidData) {
        if (country.length != 3) continue;
        if (this.currentFeatureSelection in this.covidData[country]) {
          let colIdx = this.getColorIndex(this.covidData[country][this.currentFeatureSelection], minVal, maxVal);
          d3.select("#"+country+"_pathA").style("fill", this.colorSteps[colIdx]);
          continue;
        }
        else {
          let foundByDate = false;
          for (let idx_=this.covidData[country].data.length-1; idx_ >= 0; idx_--) {
            if (this.currentFeatureSelection in this.covidData[country].data[idx_]) {
              foundByDate = true;
              let colIdx = this.getColorIndex(this.covidData[country].data[idx_][this.currentFeatureSelection], minVal, maxVal);
              d3.select("#"+country+"_pathA").style("fill", this.colorSteps[colIdx]);
              break;
            }
          }
          if (foundByDate)
            continue;
        }
        d3.select("#"+country+"_pathA").style('fill', "#cccccc");
      }
    },
  },
  computed: {
    covidData: {
      get() {
        return this.$store.getters.covidData;
      }
    },
    controlA: {
      get() {
        return this.$store.getters.controlA;
      }
    },
  },
  watch: {
    controlA: {
      handler: function() {
        this.currentFeatureSelection = this.controlA;
        this.colorCountries();
      },
      deep: true,
    }
  }
}

</script>

<style>

.view-A {
  position: relative;
  width: calc(40.75vw - 2px);
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

#colorPaletteViewA {
  position: absolute;
  top: 2px;
  left: 1%;
  background-color: white;
  z-index: 1;
  font-size: calc((1.6vh + 0.8vw)/2);
  font-family: Baskerville;
  font-weight: bold;
  display: flex;
  width: 10vw;
  height: 2.2vh;
  line-height: 2.2vh;
  vertical-align: middle;
}

</style>

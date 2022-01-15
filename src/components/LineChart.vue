<template>
  <div class="view-D" ref="viewD">
    <svg id="svg-D" ref="svgD" v-show="viewBoxIsSet" preserveAspectRatio="none">
      <g class="line-chart" ref="lineChart">
        <g class="axis axis-x hideAxisLine" ref="xAxis"></g>
        <g class="axis axis-y hideAxisLine" ref="yAxis"></g>
        <rect id="mousearea_viewD"></rect>
        <g class="line-group" ref="lineGroup"></g>
      </g>
    </svg>
    <div id="toolTip-D" class="ToolTip"></div>
  </div>
</template>

<script>

import * as d3 from 'd3';

export default {
  name: 'LineChart',
  props: {
  },
  data() {
    return {
      colorPalette: [
        "#1f78b4", "#33a02c", "#e31a1c", "#ff7f00", "#6a3d9a", "#b15928",
        "#a6cee3", "#b2df8a", "#fb9a99", "#fdbf6f", "#cab2d6", "#ffff99"
      ],
      selectedCountries: [],
      mapCountryColorIdx: {},
      currentFeatureSelection: "new_deaths_smoothed_per_million",
      viewBoxIsSet: false,
      svgWidth: 100,
      svgHeight: 100,
      svgPadding: {
        top: 5, right: 15, bottom: 36, left: 52,
      },
    }
  },
  mounted() {
    this.setUpToolTipAndDiv();
    this.setInitialSelectedCountries();
    this.createChart();
    this.createXAxisLabel("Date (month / year)");
    this.createYAxisLabel(this.formatFeatureText(this.currentFeatureSelection));
  },
  methods: {
    setUpToolTipAndDiv() {

    },
    formatFeatureText(text) {
      let formattedText = text.split("_");
      for (let idx=0; idx < formattedText.length; idx++)
         formattedText[idx] = formattedText[idx].charAt(0).toUpperCase() 
                              + formattedText[idx].substring(1);
      return formattedText.join(" ");
    },
    setInitialSelectedCountries() {
      this.selectedCountries = this.$store.getters.initialCountriesD;
    },
    createChart() {
      if (this.$refs.viewD) {
        this.svgWidth = this.$refs.viewD.clientWidth;
        this.svgHeight = this.$refs.viewD.clientHeight;
        // Set viewBox of svg and only then display it
        document.getElementById("svg-D").setAttribute("viewBox", `0 0 ${this.svgWidth} ${this.svgHeight}`);
        this.viewBoxIsSet = true;
      }

      d3.select(this.$refs.lineChart)
        .attr("transform", `translate(${this.svgPadding.left}, ${this.svgPadding.top})`);
      d3.select("#mousearea_viewD")
        .attr("width", this.svgWidth-this.svgPadding.left-this.svgPadding.right)
        .attr("height", this.svgHeight-this.svgPadding.top-this.svgPadding.bottom)
        .on("click", this.handleChartClick)
        .style("fill", "white")
        .style("opacity", 0);

      this.createXAxis();
      this.createYAxis();
      this.createLines();
    },
    createXAxis() {
      let XAxis = d3.select(this.$refs.xAxis);
      //let tickValues = "";
      XAxis.attr('transform', `translate(0, ${this.svgHeight - this.svgPadding.top - this.svgPadding.bottom})`)
           .call(d3.axisBottom(this.xScale).tickFormat(d3.timeFormat("%m/%y"))
           .tickSize(3)/*.tickValues(tickValues)*/);
    },
    createYAxis() {
      let YAxis = d3.select(this.$refs.yAxis);
      YAxis.call(d3.axisLeft(this.yScale).tickSize(3)/*.tickFormat(d => (d3.format(".1f")(d/1e03) + " k"))*/);
    },
    handleMouseOver(d) {
      if (d3.selectAll(".alreadyClicked").empty())
        d3.selectAll(`.linesD:not(#${d[0]}_lineD)`).style("stroke", "grey").style("opacity", 0.4);
      else {
        if (! document.getElementById(`${d[0]}_lineD`).classList.contains("alreadyClicked"))
          d3.select(`#${d[0]}_lineD`).style("stroke", this.colorPalette[this.mapCountryColorIdx[d[0]]])
                                     .style("opacity", 1);
      }
    },
    handleMouseLeave(d) {
      if (d3.selectAll(".alreadyClicked").empty())
        d3.selectAll(`.linesD`).style("stroke", d => this.colorPalette[this.mapCountryColorIdx[d[0]]]).style("opacity", 1);
      else {
        if (! document.getElementById(`${d[0]}_lineD`).classList.contains("alreadyClicked"))
          d3.select(`#${d[0]}_lineD`).style("stroke", "grey").style("opacity", 0.4);
      }
    },
    handleMouseMove(event, d) {
      event;d;
    },
    handleLineClick(d) {
      if (d3.selectAll(".alreadyClicked").empty())
        d3.selectAll(`.linesD:not(#${d[0]}_lineD)`).style("stroke", "grey").style("opacity", 0.4);
      
      d3.select(`#${d[0]}_lineD`).classed("alreadyClicked", true);

      if (d3.selectAll(".alreadyClicked").size() == this.selectedCountries.length)
        d3.selectAll(".alreadyClicked").classed("alreadyClicked", false);
      else {
        d3.select(`#${d[0]}_lineD`).style("stroke", this.colorPalette[this.mapCountryColorIdx[d[0]]]).style("opacity", 1);
      }
    },
    handleChartClick() {
      d3.selectAll(".linesD")
        .style("stroke", d => this.colorPalette[this.mapCountryColorIdx[d[0]]])
        .style("opacity", 1);
      d3.selectAll(".alreadyClicked").classed("alreadyClicked", false);
    },
    createLines() {
      // Group entries by iso_code
      let grouped_data = d3.group(this.data_, d => d.iso_code);

      // Specify line
      let line = d3.line().curve(d3.curveBasis).x(d => this.xScale(d.x)).y(d => this.yScale(d.y));
      // Plot lines
      const lineGroup = d3.select(this.$refs.lineGroup)

      for (let colIdx=0; colIdx < this.selectedCountries.length; colIdx++)
        this.mapCountryColorIdx[this.selectedCountries[colIdx].slice()] = colIdx;
 
      lineGroup.selectAll("lines")
               .data(grouped_data)
               .enter()
               .append("path")
               .attr("id", d => `${d[0]}_lineD`)
               .attr("class", "linesD")
               .attr("d", (d) => line(d[1]))
               .on("click", (_, d) => this.handleLineClick(d))
               .on("mousemove", this.handleMouseMove)
               .on("mouseover", (_, d) => this.handleMouseOver(d))
               .on("mouseleave", (_, d) => this.handleMouseLeave(d))
               .style("fill", "none")
               .style("stroke", d => this.colorPalette[this.mapCountryColorIdx[d[0]]])
               .style("stroke-width", 1.8)
               .style("cursor", "pointer");
    },
    createXAxisLabel(labelText) {
      let translateX = this.svgWidth - this.svgPadding.left - this.svgPadding.right;
      if (document.getElementById("xLabelD"))
        document.getElementById("xLabelD").remove();

      d3.select(this.$refs.xAxis)
        .append('text')
        .text(labelText)
        .attr('x', 0.5*translateX)
        .attr('y', '2.35em')
        .attr("id", "xLabelD")
        .style('fill', 'black')
        .style('text-anchor', 'middle')
        .style('font-weight', 'bold')
    },
    createYAxisLabel(labelText) {
      let translateY = this.svgHeight - this.svgPadding.top - this.svgPadding.bottom;
      if (document.getElementById("yLabelD"))
        document.getElementById("yLabelD").remove();

      d3.select(this.$refs.yAxis)
        .append('text')
        .text(labelText)
        .attr('transform', 'rotate(-90)')
        .attr('y', '-2.98em')
        .attr('x', -0.5*translateY)
        .attr("id", "yLabelD")
        .style('text-anchor', 'middle')
        .style('fill', 'black')
        .style('font-weight', 'bold');
    },
    toTime(dateString) {
      return d3.timeParse("%Y-%m-%d")(dateString);
    },
    dataExtent(feature) {
      return d3.extent(this.data_, d => d[feature]);
    },
    addSpacing(minVal, maxVal, down=0.02, up=1.07) {
      return [minVal-down*maxVal, up*maxVal];
    }
  },
  computed: {
    data_: {
      get() {
        return this.$store.getters.dataViewD;
      }
    },
    xScale() {
      let [minVal, maxVal] = this.dataExtent("x");
      return d3.scaleTime()
               .domain([minVal, maxVal])
               .range([0, this.svgWidth - this.svgPadding.left - this.svgPadding.right]);
    },
    yScale() {
      let [minVal, maxVal] = this.addSpacing(...this.dataExtent("y"))
      return d3.scaleLinear()
               .domain([minVal, maxVal])
               .range([this.svgHeight - this.svgPadding.top - this.svgPadding.bottom, 0]);
    }
  },
  watch: {
    
  },
}

</script>

<style>

.view-D {
  position: relative;
  width: calc(41.5vw - 2px);
  height: calc(48.05vh - 2px);
  /*background-color: rgb(255, 209, 255)*/;
  border: 1px solid #000000;
  border-radius: 5px;
  box-shadow: 0 0 4px black;
  margin: 1px; 
}

#svg-D {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}

</style>

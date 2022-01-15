<template>
  <div class="view-D" ref="viewD">
    <svg id="svg-D" ref="svgD" v-show="viewBoxIsSet" preserveAspectRatio="none">
      <g class="line-chart" ref="lineChart">
        <g class="axis axis-x hideAxisLine" ref="xAxis"></g>
        <g class="axis axis-y hideAxisLine" ref="yAxis"></g>
        <g class="line-group" ref="lineGroup"></g>
        <g class="point-group" ref="pointGroup"></g>
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
      selectedCountries: [],
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
    this.setInitialSelectedCountries();
    this.createChart();
    this.createXAxisLabel("Date (month / year)");
    this.createYAxisLabel(this.formatFeatureText(this.currentFeatureSelection));
  },
  methods: {
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

    createLines() {
      // Group entries by iso_code
      let grouped_data = d3.group(this.data_, d => d.iso_code);

      // Specify line
      let line = d3.line().x(d => this.xScale(d.x)).y(d => this.yScale(d.y));
   
      // Plot lines
      const lineGroup = d3.select(this.$refs.lineGroup)
 
      lineGroup.selectAll("lines")
               .data(grouped_data)
               .enter()
               .append("path")
               //.attr("class", "lines")
               .attr("d", (d) => line(d[1]))
               .style("fill", "none")
               .style("stroke", "blue")
               .style("stroke-width", 1.5)
               //.attr("transform", "translate(0,10)")
               //.on("click", lineClick)
               //.on("mouseover", lineOver)
               //.on("mouseout", lineOut)
               //.style("cursor", "pointer");
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
    addSpacing(minVal, maxVal, down=0.02, up=1.02) {
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

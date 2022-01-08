<template>
  <div class="view-D" ref="viewD">
    <svg class="svg-D" :width="svgWidth" :height="svgHeight" ref="svgD">
      <g class="line-chart" ref="lineChart">
        <g class="axis axis-x" ref="xAxis"></g>
        <g class="axis axis-y" ref="yAxis"></g>
        <g class="line-group" ref="lineGroup"></g>
        <g class="point-group" ref="pointGroup"></g>
        <rect id="toolTip-D"></rect>
      </g>
    </svg>
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
      svgWidth: 100,
      svgHeight: 100,
      svgPadding: {
        top: 10, right: 15, bottom: 30, left: 45,
      },
    }
  },
  mounted() {
    this.createChart();
    this.createAxesLabels();
  },
  methods: {
    createChart() {
      if (this.$refs.viewD) {
        this.svgWidth = document.body.clientWidth*0.415 //- this.svgPadding.left - this.svgPadding.right;
        this.svgHeight = document.body.clientHeight*0.478 //- this.svgPadding.top - this.svgPadding.bottom;
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
           .call(d3.axisBottom(this.xScale).tickFormat(d3.timeFormat("%m-%d-%y"))/*.tickValues(tickValues)*/);
    },
    createYAxis() {
      let YAxis = d3.select(this.$refs.yAxis);
      YAxis.call(d3.axisLeft(this.yScale)/*.tickFormat(d => (d3.format(".1f")(d/1e03) + " k"))*/);
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
    createAxesLabels() {
      let translateX = this.svgWidth - this.svgPadding.left - this.svgPadding.right;
      let translateY = this.svgHeight - this.svgPadding.top - this.svgPadding.bottom;

      d3.select(this.$refs.yAxis)
        .append('text')
        .text("y-axis-label")
        .attr('transform', 'rotate(-90)')
        .attr('y', '-3.5em')
        .attr('x', -0.5*translateY)
        .style('text-anchor', 'middle')
        .style('fill', 'black')
        .style('font-weight', 'bold');
    
      d3.select(this.$refs.xAxis)
        .append('text')
        .text("x-axis-label")
        .attr('x', 0.5*translateX)
        .attr('y', '2.8em')
        .style('fill', 'black')
        .style('text-anchor', 'middle')
        .style('font-weight', 'bold')
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
  width: 41.5vw;
  height: 47.8vh;
  /*background-color: rgb(255, 209, 255)*/;
  border: 1px solid #000000;
}

</style>

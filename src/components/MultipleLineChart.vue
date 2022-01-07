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

import * as d3 from 'd3';

export default {
  name: 'MultipleLineChart',
  props: {
  },
  data() {
    return {
      svgWidth: 100,
      svgHeight: 100,
      svgPadding: {
        top: 10, right: 5, bottom: 30, left: 45,
      },
      processed_data: [],
    }
  },
  mounted() {
    this.process_data("new_cases_smoothed");
    this.createChart();
    this.createAxesLabels();
  },
  methods: {
    createChart() {
      if (this.$refs.viewB) {
        this.svgWidth = document.body.clientWidth*0.415 //- this.svgPadding.left - this.svgPadding.right;
        this.svgHeight = document.body.clientHeight*0.478 //- this.svgPadding.top - this.svgPadding.bottom;
      }

      d3.select(this.$refs.multipleLineChart)
        .attr("transform", `translate(${this.svgPadding.left}, ${this.svgPadding.top})`);
      this.createXAxis();
      this.createYAxis();
      this.createLines();
    },
    createXAxis() {
      let XAxis = d3.select(this.$refs.xAxis)
      XAxis.attr('transform', `translate(0, ${this.svgHeight - this.svgPadding.top - this.svgPadding.bottom})`)
           .call(d3.axisBottom(this.xScale)/*.tickFormat(d => d)*/);
    },
    createYAxis() {
      let YAxis = d3.select(this.$refs.yAxis);
      YAxis.call(d3.axisLeft(this.yScale)/*.tickFormat(d => (d3.format(".1f")(d/1e03) + " k"))*/);
    },

    createLines() {
      // Define the area under the line
      let area = d3.area()
                   .x(d => this.xScale(d.date))
                   .y0(this.svgHeight - this.svgPadding.top - this.svgPadding.bottom)
                   .y1(d =>  this.yScale(d.feature));

      // Specify line
      let line = d3.line().x(d => this.xScale(d.date)).y(d => this.yScale(d.feature));

      // Plot lines
      const Line = d3.select(this.$refs.Line);

      Line.append("path")
          .datum(this.processed_data)
          //.attr("class", "lines")
          .attr("d", line)
          .style("fill", "none")
          .style("stroke", "black")
          .style("stroke-width", 1.2)
          //.attr("transform", "translate(0,10)")
          //.on("click", lineClick)
          //.on("mouseover", lineOver)
          //.on("mouseout", lineOut)
          //.style("cursor", "pointer");
      
      // Add the area
      Line.append("path")
          .datum(this.processed_data)
          .attr("class", "area")
          .attr("d", area);
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
      return d3.extent(this.processed_data, d => d[feature]);
    },
    process_data(feature) {
      // Preprocess data
      let processed_data = [];
      for (let day of this.$store.state.covidData["AUT"].data) {
        if (feature in day && day[feature] != undefined) {
          processed_data.push({
            date: this.toTime(day.date),
            feature: day[feature],
          });
        }
      }
      this.processed_data = processed_data;
    },
  },

  computed: {
    xScale() {
      return d3.scaleTime()
               .domain(this.dataExtent("date"))
               .range([0, this.svgWidth - this.svgPadding.left - this.svgPadding.right]);
    },
    yScale() {
      return d3.scaleLinear()
               .domain(this.dataExtent("feature"))
               .range([this.svgHeight - this.svgPadding.top - this.svgPadding.bottom, 0]);
    }
  },
  watch: {
    
  },
}

</script>

<style>

.view-B {
  width: 41.5vw;
  height: 47.8vh;
  background-color: rgb(211, 255, 215);
  border: 1px solid #000000;
}

.area {
  fill: purple;
}

</style>
<template>
  <div class="view-B" ref="viewB">
    <!--<rect id="toolTip-B"></rect>-->
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
      currentCharts: {},
      country: "",
      feature: "",
      chartData: [],
      yExtent: [],
      xExtent: [],
      svgHeight: 100,
      svgWidth: 100,
      svgPadding: {
        top: 10, right: 5, bottom: 5, left: 40,
      },
    }
  },
  mounted() {
    for (let d_ of this.data_)
      this.addNewChart(d_.country, d_.feature, d_.data);
    setTimeout(() => {
      this.removeChart("AUT", "new_cases_smoothed");
    }, 3000)
    setTimeout(() => {
      this.addNewChart("AUT", "new_cases_smoothed", this.data_[0].data);
    }, 6000)
  },
  methods: {
    removeChart(country, feature) {
      document.getElementById(`div${country}${feature}`).remove();
      for (let chart in this.currentCharts)
        if (chart == `${this.county}${this.feature}`)
          delete this.currentCharts[chart];
      // Get size of single div in view B
      this.svgWidth = document.getElementsByClassName(`.singleDiv`)[0].clientWidth; 
      this.svgHeight = document.getElementsByClassName(`.singleDiv`)[0].clientHeight;

      this.updateYAxes();
    },
    addNewChart(country, feature, chartData) {
      // Set info for next chart creation
      this.country = country;
      this.feature = feature;
      this.chartData = chartData;
      
      this.createChart();
      this.updateYAxes();
    },
    updateYAxes() {
      for (let chart in this.currentCharts) {
        if (chart != `${this.country}${this.feature}`) {
          let chart;
          console.log(chart)
        }
      }
    },
    setUpHtml() {
      let newSubView = d3.select(this.$refs.viewB)
                    .append("div")
                    .attr("class", "singleDiv")
                    .attr("id", `div${this.country}${this.feature}`);
      newSubView.html(`
        <svg id="svg${this.country}${this.feature}" class="singleSvg" preserveAspectRatio="none">
          <g class="chart_">
            <g class="axis axis-x"></g>
            <g class="axis axis-y"></g>
            <g class="line_"></g>
            <g class="pointsGroup"></g>
          </g>
        </svg>
      `);
    },
    createChart() {
      // Set up html skeleton for next chart
      this.setUpHtml();
      // Get size of added div
      this.svgWidth = document.getElementById(`div${this.country}${this.feature}`).clientWidth; 
      this.svgHeight = document.getElementById(`div${this.country}${this.feature}`).clientHeight;
      // Set the viewbox for svg
      document.getElementById(`svg${this.country}${this.feature}`)
              .setAttribute("viewBox", `0 0 ${this.svgWidth} ${this.svgHeight}`);

      // Get y- and x-extent of data
      this.yExtent = d3.extent(this.chartData, d => d.y);
      this.xExtent = d3.extent(this.chartData, d => d.x);

      // Add info about yExtent to currentCharts array
      this.currentCharts[`${this.country}${this.feature}`] = [...this.yExtent];

      d3.select(`#svg${this.country}${this.feature} .chart_`)
        .attr("transform", `translate(${this.svgPadding.left}, ${this.svgPadding.top})`);
      
      this.createXAxis();
      this.createYAxis();
      this.createLines();
    },
    createXAxis() {
      let XAxis = d3.select(`#svg${this.country}${this.feature} .axis-x`);
      XAxis.attr('transform', `translate(0, ${this.svgHeight - this.svgPadding.top - this.svgPadding.bottom})`)
           .call(d3.axisBottom(this.xScale)/*.tickFormat(d3.timeFormat("%m-%d-%y"))*/.tickValues([]).tickSize(0));
    },
    createYAxis() {
      let YAxis = d3.select(`#svg${this.country}${this.feature} .axis-y`);
      YAxis.call(d3.axisLeft(this.yScale).tickValues([...this.yExtent]));
      /*.tickFormat(d => (d3.format(".1f")(d/1e03) + " k"))*/
    },

    createLines() {
      // Define the area under the line
      let area = d3.area()
                   .x(d => this.xScale(d.x))
                   .y0(this.svgHeight - this.svgPadding.top - this.svgPadding.bottom)
                   .y1(d =>  this.yScale(d.y));

      // Specify line
      let line = d3.line()
                   .x(d => this.xScale(d.x))
                   .y(d => this.yScale(d.y));

      // Plot lines
      const Line = d3.select(`#svg${this.country}${this.feature} .line_`);

      Line.append("path")
          .datum(this.chartData)
          //.attr("class", "lines")
          .attr("d", line)
          .style("fill", "none")
          .style("stroke", "black")
          .style("stroke-width", 1.2)
          //.on("click", lineClick)
          //.on("mouseover", lineOver)
          //.on("mouseout", lineOut)
          //.style("cursor", "pointer");
      
      // Add the area
      Line.append("path")
          .datum(this.chartData)
          .attr("class", "area_")
          .attr("d", area);
    },
    createYAxisLabel(label) {
      d3.select(`svg${this.country}${this.feature} .axis-y`)
        .append('text')
        .text(label)
        .attr("class", "yLabel")
        .attr('transform', 'rotate(-90)')
        .attr('y', "-3.5em")
        .attr('x', -0.5*(this.svgHeight - this.svgPadding.top - this.svgPadding.bottom))
        .style('text-anchor', 'middle')
        .style('fill', 'black')
        .style('font-weight', 'bold');
    },
    createXAxisLabel(label) {
      d3.select(`div${this.country}${this.feature}`)
        .append('text')
        .text(label)
        .attr("class", "xLabel")
        .attr('y', document.getElementById("view-B").clientHeight-25)
        .attr('x', document.getElementById("view-B").clientWidth/2)
        .style('text-anchor', 'middle')
        .style('fill', 'black')
        .style('font-weight', 'bold');
    },
    toTime(dateString) {
      return d3.timeParse("%Y-%m-%d")(dateString);
    },
  },
  computed: {
    yScale() {
      return d3.scaleLinear()
               .domain(this.yExtent)
               .range([this.svgHeight - this.svgPadding.top - this.svgPadding.bottom, 0]);
    },
    xScale() {
      return d3.scaleTime()
               .domain(this.xExtent)
               .range([0, this.svgWidth - this.svgPadding.left - this.svgPadding.right]);
    },
    data_: {
      get() {
        return this.$store.getters.dataViewB;
      }
    },
  },
  watch: {
    
  },
}

</script>

<style>

.view-B {
  display: flex;
  flex-direction: column;
  width: 41.5vw;
  height: 48.05vh;
  border: 1px solid #000000;
}

.singleSvg {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}

.singleDiv {
  position: relative;
  height: 100%;
}

.area_ {
  fill: purple;
}

</style>
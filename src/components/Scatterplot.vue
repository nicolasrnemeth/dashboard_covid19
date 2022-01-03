<template>
  <div class="vis-component" id="scatterPlot" ref="chart">
    <svg class="main-svg" :width="svgWidth" :height="svgHeight" ref="mainSvg">
      <g class="chart-group" ref="chartGroup">
        <g class="axis axis-x" ref="xAxis"></g>
        <g class="axis axis-y" ref="yAxis"></g>
        <g class="points-group" ref="pointsGroup"></g>
        <rect id="toolTip"></rect>
      </g>
    </svg>
  </div>
</template>

<script>

import * as d3 from 'd3';

export default {
  name: 'Scatterplot',
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
     if (this.$refs.chart) {
        this.svgWidth = this.$refs.chart.clientWidth;
    }
    this.createChart();
    // Create axes labels only once to avoid overlaying multiple texts
    // when year selections are changed
    this.createAxesLabels();
    this.colorCountries();
  },
  methods: {
    // Draw scatterplot including axes points and bivariate color scheme
    createChart() {
      d3.select(this.$refs.chartGroup)
        .attr("transform", `translate(${this.svgPadding.left}, ${this.svgPadding.top})`);
      this.createXAxis();
      this.createYAxis();
      this.createPoints();
      this.createPalette();
    },
    createXAxis() {
      let XAxis = d3.select(this.$refs.xAxis)
      XAxis.attr('transform', `translate(0, ${this.svgHeight - this.svgPadding.top - this.svgPadding.bottom})`)
           .call(d3.axisBottom(this.xScale).tickFormat(d => d));
    },
    createYAxis() {
      let YAxis = d3.select(this.$refs.yAxis)
      YAxis.call(d3.axisLeft(this.yScale).tickFormat(d => (d3.format(".1f")(d/1e03) + " k")))
    },
    createAxesLabels() {
      let translateLabel = this.svgWidth - this.svgPadding.left - this.svgPadding.right;
      d3.select(this.$refs.yAxis)
        .append('text')
        .text("Average Yearly Personal Income (in $)")
        .attr('transform', 'rotate(-90)')
        .attr('y', '-5em')
        .attr('x', -0.5*translateLabel)
        .style('text-anchor', 'middle')
        .style('fill', 'black')
        .style('font-weight', 'bold');
    
      d3.select(this.$refs.xAxis)
        .append('text')
        .text("Educational Attainment: Bachelor's Degree or Higher (in %)")
        .attr('x', 0.5*translateLabel)
        .attr('y', '3.5em')
        .style('fill', 'black')
        .style('text-anchor', 'middle')
        .style('font-weight', 'bold');
    },
    createPoints() {
      const pointsGroup = d3.select(this.$refs.pointsGroup)
      pointsGroup.selectAll('.points')
                 .data(this.allData)
                 .join('circle')
                 .attr('class', 'points')
                 .attr('id', d => d.state.replaceAll(" ", "")+"_point")
                 .attr('cx', d => this.xScale(d.eduRate))
                 .attr('cy', d => this.yScale(d.income))
                 .attr('r', 4.5)
                 .style('fill-opacity', 0)
                 .style('stroke', 'black')
                 .style('stroke-width', 1.8);
      
      d3.selectAll('title:not(.tooltip-map)').remove();
      d3.selectAll('.points')
        .append('title')
        .text(d => {
              return (
                `${d.state}\n\nEducation: ${d.eduRate} %\nIncome: ${d.income} $`
              );
        });
    },
    // Round the values of the axes at both ends to multiples of in my case 5
    roundUpToMultipleOfX(value, x, factor=1.05) {
      return Math.ceil( (factor * value) / x) * x;
    },
    // see above --> done to have more consistent axes when years are changed
    roundDownToMultipleOfX(value, x, factor=0.95) {
      return Math.floor( (factor * value) / x) * x;
    },
    // update the colors of the states in the map
    colorCountries() {

    },
    // the function increaseColorSaturation was inspired by: https://observablehq.com/@d3/working-with-color
    increaseColorSaturation(color, k=1.25) {
      const {l, c, h} = d3.lch(color);
      return d3.lch(l, c + 18 * k, h).formatHex();
    },
  },
  computed: {
    allData: {
      get() {
        return this.$store.getters.allData;
      },
    },
    selectedStates: {
      get() {
        return this.$store.getters.selectedStates;
      }
    },
    dataMax_income() {
      return d3.max(this.allData, d => d.income);
    },
    dataMin_income() {
      return d3.min(this.allData, d => d.income);
    },
    xScale() {
      return d3.scaleLinear()
               .domain([this.roundDownToMultipleOfX(this.dataMin_eduRate, 5), 
                        this.roundUpToMultipleOfX(this.dataMax_eduRate, 5)])
               .range([0, this.svgWidth - this.svgPadding.left - this.svgPadding.right]);
    },
    yScale() {
      return d3.scaleLinear()
               .domain([this.roundDownToMultipleOfX(this.dataMin_income, 5*1e03), 
                        this.roundUpToMultipleOfX(this.dataMax_income, 5*1e03)])
               .range([this.svgHeight - this.svgPadding.top - this.svgPadding.bottom, 0]);
    },
  },
  watch: {
    allData: {
      handler() {
        this.createChart();
      },
      deep: true,
      immediate: true,
    },
    selectedStates: {
      handler() {
        if (this.selectedStates.length > 0) {
          this.highlightSelectedStates();
        } else {
          this.removeHightlighting();
        }
      },
      deep: true,
      immediate: true,
    },
  },
}

</script>

<style>
</style>

<template>
  <div class="view-C" ref="viewC">
    <svg class="svg-C" :width="svgWidth" :height="svgHeight" ref="svgC">
      <g class="scatter-plot" ref="scatterPlot">
        <g class="axis axis-x" ref="xAxis"></g>
        <g class="axis axis-y" ref="yAxis"></g>
        <g class="points-group" ref="pointsGroup"></g>
        <rect id="toolTip-C"></rect>
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
        top: 10, right: 10, bottom: 30, left: 45,
      },
    }
  },
  mounted() {
    this.createChart();
    // Create axes labels only once to avoid overlaying multiple texts
    this.createAxesLabels();
  },
  methods: {
    // Draw scatterplot including axes points and bivariate color scheme
    createChart() {
      if (this.$refs.viewC) {
        this.svgWidth = document.body.clientWidth*0.415;
        this.svgHeight = document.body.clientHeight*0.475;
      }

      d3.select(this.$refs.scatterPlot)
        .attr("transform", `translate(${this.svgPadding.left}, ${this.svgPadding.top})`);
      this.createXAxis();
      this.createYAxis();
      this.createPoints();
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
    createPoints() {
      const pointsGroup = d3.select(this.$refs.pointsGroup);
      
      pointsGroup.selectAll('.points')
                 .data(this.data_)
                 .join('circle')
                 .attr('class', 'points')
                 //.attr('id', d => d..replaceAll(" ", "")+"_point")
                 .attr('cx', d => this.xScale(d.gdp))
                 .attr('cy', d => this.yScale(d.cardiovasc))
                 .attr('r', 2)
                 //.style('fill-opacity', 0)
                 .style('fill', 'red')
                 //.style('stroke', 'black')
                 //.style('stroke-width', 1.2);
    },
    // Round the values of the axes at both ends to multiples of x
    roundUpToMultipleOfX(value, x, factor=1) {
      return Math.ceil( (factor * value) / x) * x;
    },
    // see above --> done to have more consistent axes
    roundDownToMultipleOfX(value, x, factor=1) {
      return Math.floor( (factor * value) / x) * x;
    },
    // update colors of the countries on the map
    colorCountries() {

    },
    dataExtent(feature) {
      return d3.extent(this.data_, d => d[feature]);
    },
  },
  computed: {
    selectedCountries: {
      get() {
        return this.$store.getters.selectedCountries;
      }
    },
    data_: {
      get() {
        let _data_ = [];
        let count = 0;
        for (let elem of Object.values(this.$store.state.covidData)) {
          if (isNaN(elem.gdp_per_capita) || isNaN(elem.cardiovasc_death_rate)) continue;
          if (count == 30) break;
          _data_.push(
            {
              gdp: elem.gdp_per_capita,
              cardiovasc: elem.cardiovasc_death_rate
            }
          );
          count++;
        }
        return _data_;
      }
    },
    xScale() {
      //let roundFactor = (maxVal+1e-06).toString().indexOf('.')/100;
      return d3.scaleLinear()
               .domain(this.dataExtent("gdp"))
               .range([0, this.svgWidth - this.svgPadding.left - this.svgPadding.right]);
    },
    yScale() {
      // Evaluate rounding factor depending on the magnitude of the input numbers
      //let roundFactor = (maxVal+1e-06).toString().indexOf('.')/100;
      return d3.scaleLinear()
               .domain(this.dataExtent("cardiovasc"))
               .range([this.svgHeight - this.svgPadding.top - this.svgPadding.bottom, 0]);
    },
  },
  watch: {

  }
}

</script>

<style>

.view-C {
  width: 41.5vw;
  height: 47.8vh;
  background-color: rgb(231, 249, 255);
  border: 1px solid #000000;
}

</style>

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
      country: "",
      feature: "",
      chartData: [],
      yExtent: [],
      xExtent: [],
      svgHeight: 100,
      svgWidth: 100,
      svgPadding: {
        top: 10, right: 15, bottom: 5, left: 45,
      },
    }
  },
  mounted() {
    
    //setTimeout(() => {
      
    //}, 3000)
  },
  methods: {
    setUpHtml() {
      let newSubView = d3.select(this.$refs.viewB)
                    .append("div")
                    .attr("class", "singleDiv")
                    .attr("id", `div${this.country}${this.feature}`);
      newSubView.html(`
        <svg id="svg${this.country}${this.feature}" class="singleSvg" preserveAspectRatio="none">
          <g class="axis axis-x"></g>
          <g class="axis axis-y"></g>
          <g class="area_"></g>
          <g class="line_"></g>
          <g class="pointsGroup"></g>
        </svg>
      `);
    },
    addNewChart() {
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

      d3.select(`#${this.country}${this.feature}`)
        .attr("transform", `translate(${this.svgPadding.left}, ${this.svgPadding.top})`);
      this.createXAxis();
      this.createYAxis();
      this.createLines();
    },
    createXAxis() {
      let XAxis = d3.select(`#svg${this.country}${this.feature}.axis-x`);
      XAxis.attr('transform', `translate(0, ${this.svgHeight - this.svgPadding.top - this.svgPadding.bottom})`)
           .call(d3.axisBottom(this.xScale(...this.xExtent))/*.tickFormat(d3.timeFormat("%m-%d-%y"))*/.tickValues([]));
    },
    createYAxis() {
      let YAxis = d3.select(`#svg${this.country}${this.feature}.axis-y`);
      YAxis.call(d3.axisLeft(this.yScale(...this.yExtent)).tickValues([...this.yExtent, this.yExtent[1]/2]));
      /*.tickFormat(d => (d3.format(".1f")(d/1e03) + " k"))*/
    },

    createLines() {
      // Define the area under the line
      let area = d3.area()
                   .x(d => this.xScale(...this.xExtent)(d.date))
                   .y0(this.svgHeight - this.svgPadding.top - this.svgPadding.bottom)
                   .y1(d =>  this.yScale(...this.yExtent)(d.feature));

      // Specify line
      let line = d3.line()
                   .x(d => this.xScale(...this.xExtent)(d.date))
                   .y(d => this.yScale(...this.yExtent)(d.feature));

      // Plot lines
      const Line = d3.select(`#svg${this.country}${this.feature}.line_`);

      Line.append("path")
          .datum(this.chartData)
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
          .attr("id", "area_")
          .attr("d", area);
    },
    createAxesLabels() {
      //let translateX = this.svgWidth - this.svgPadding.left - this.svgPadding.right;
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
    
      /*d3.select(this.$refs.xAxis)
        .append('text')
        .text("x-axis-label")
        .attr('x', 0.5*translateX)
        .attr('y', '2.8em')
        .style('fill', 'black')
        .style('text-anchor', 'middle')
        .style('font-weight', 'bold')*/
    },
    toTime(dateString) {
      return d3.timeParse("%Y-%m-%d")(dateString);
    },
    yScale(minVal, maxVal) {
      return d3.scaleLinear()
               .domain([minVal, maxVal])
               .range([this.svgHeight - this.svgPadding.top - this.svgPadding.bottom, 0]);
    },
    xScale(minVal, maxVal) {
      return d3.scaleTime()
               .domain([minVal, maxVal])
               .range([0, this.svgWidth - this.svgPadding.left - this.svgPadding.right]);
    }
  },
  computed: {
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
  height: 47.8vh;
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

#area_ {
  fill: #8b8000;
}

</style>
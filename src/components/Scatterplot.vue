<template>
  <div class="view-C" ref="viewC">
    <svg id="svg-C" ref="svgC" v-show="viewBoxIsSet" preserveAspectRatio="none">
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
      viewBoxIsSet: false,
      selectedCountries: [],
      colorChannelFeature: "people_fully_vaccinated_per_hundred",
      sizeChannelFeature: "total_deaths_per_million",
      svgWidth: 100,
      svgHeight: 100,
      svgPadding: {
        top: 10, right: 5, bottom: 30, left: 45,
      },
    }
  },
  mounted() {
    this.createChart();
    // Create axes labels only once to avoid overlaying multiple texts
    this.createAxesLabels();
    this.resizePoints();
  },
  methods: {
    // Draw scatterplot including axes points and bivariate color scheme
    createChart() {
      if (this.$refs.viewC) {
        this.svgWidth = this.$refs.viewC.clientWidth;
        this.svgHeight = this.$refs.viewC.clientHeight;
        // Set viewBox of svg and only then display it
        document.getElementById("svg-C").setAttribute("viewBox", `0 0 ${this.svgWidth} ${this.svgHeight}`);
        this.viewBoxIsSet = true;
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
                 .attr('id', d => d.iso_code.replaceAll(" ", "")+"_point")
                 .attr('cx', d => this.xScale(d.x))
                 .attr('cy', d => this.yScale(d.y))
                 .attr('r', 2)
                 .style('fill', '#00ff15')
                 .style('stroke', 'black')
                 .style('stroke-width', 0.7);

      pointsGroup.selectAll("text")
                .data(this.data_)
                .enter()
                .append("text")
                .text(d => d.iso_code)
                .attr("x", d => this.xScale(d.x)+7)
                .attr("y", d => this.yScale(d.y))
                .style("font-size", "8px")
                .style("text-anchor", "start");
    },
    // Add space between marks and plot borders
    addSpacing(minVal, maxVal, down=0.1, up=1.1) {
      return [minVal-down*maxVal, up*maxVal];
    },
    // Apply color channel
    colorPoints() {

    },
    // Apply size channel
    resizePoints() {
      for (let country of this.data_) {
        let sizeVal = null;
        if (this.sizeChannelFeature in this.covidData[country.iso_code])
          sizeVal = this.covidData[country.iso_code][this.sizeChannelFeature];
        else {
          if ("data" in this.covidData[country.iso_code]) {
            for (let idx=this.covidData[country.iso_code].data.length-1; idx >= 0; idx--)
              if (this.sizeChannelFeature in this.covidData[country.iso_code].data[idx]) {
                sizeVal = this.covidData[country.iso_code].data[idx][this.sizeChannelFeature];
                break;
              }
          }
        }
        if (sizeVal)
          d3.select(`#${country.iso_code}_point`)
            .attr("r", ((sizeVal*0.05)/Math.PI)**0.5);
        else
          d3.select(`#${country.iso_code}_point`)
            .attr("r", 0);
      }
    },
    dataExtent(feature) {
      return d3.extent(this.data_, d => d[feature]);
    },
  },
  computed: {
    covidData: {
      get() {
        return this.$store.getters.covidData;
      }
    },
    data_: {
      get() {
        return this.$store.getters.dataViewC;
      }
    },
    xScale() {
      let [minVal, maxVal] = this.addSpacing(...this.dataExtent("x"));
      return d3.scaleLinear()
               .domain([minVal, maxVal])
               .range([0, this.svgWidth - this.svgPadding.left - this.svgPadding.right]);
    },
    yScale() {
      let [minVal, maxVal] = this.addSpacing(...this.dataExtent("y"));
      return d3.scaleLinear()
               .domain([minVal, maxVal])
               .range([this.svgHeight - this.svgPadding.top - this.svgPadding.bottom, 0]);
    },
  },
  watch: {
    data_: {
      
    }
  }
}

</script>

<style>

.view-C {
  position: relative;
  width: calc(41.5vw - 2px);
  height: calc(48.05vh - 2px);
  /*background-color: rgb(231, 249, 255);*/
  border: 1px solid #000000;
  border-radius: 5px;
  box-shadow: 0 0 4px black;
  margin: 1px;
}

#svg-C {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}

</style>

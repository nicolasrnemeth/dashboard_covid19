<template>
  <div class="vis-component" id="linePlot" ref="chart">
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

<!--
// Reshape data for line plotting
   let data_reshaped = new Array();
   data.forEach(d => {
      years.forEach(y => {
         data_reshaped.push({
            Year: toTime(y),
            Gdp: +d[y],
            State: d.State 
         });
      });
   });
   // Group entries by state
   let data_grouped = d3.group(data_reshaped, d => d.State);

   // Get maximum value of GDP
   let maxGdp = d3.max(data_reshaped, d => d.Gdp);

   // Scales
   let scaleX = d3.scaleTime()
                  .range([margin, width-250])
                  .domain(year_extent);
   let scaleY = d3.scaleLinear()
                  .domain([0, maxGdp+4.5e05])
                  .range([0.7*height-margin+20, 0]);
   // Axes
   let axisX = d3.axisBottom()
                 .scale(scaleX);
   let axisY = d3.axisLeft()
                 .scale(scaleY)
                 .tickFormat(d => ("$ " + d3.format(".1f")(d/1e06)));
   
   let axes = svg.append("g")
                 .attr("class", "axes")
                 .attr("transform", "translate(0,"+10+")");
   // x-axis
   axes.append("g")
       .call(axisX)
       .attr("class", "axes")
       .attr("id", "axisX")
       .attr("transform", "translate(0,"+(0.7*height-margin+20)+")");
   // y-axis
   axes.append("g").call(axisY).attr("transform", "translate("+margin+",0)")
                               .attr("class", "axes");

   // Labels
   // x-axis
   svg.append("g")
      .append("text")
      .attr("class", "label")
      .text("Years")
      .attr("x", "50%")
      .attr("transform", "translate(0,"+(0.7*height-margin+80)+")")
   // y-axis
   svg.append("g")
      .append("text")
      .attr("class", "label")
      .text("Nominal GDP (Trillions of current dollars)")
      .attr("transform", "rotate(-90) translate(-190,35)")

   // Specify line
   let line = d3.line().x(d => scaleX(d.Year)).y(d => scaleY(d.Gdp));

   // Plot lines 
   svg.selectAll("lines")
      .data(data_grouped)
      .enter()
      .append("path")
      .attr("class", "lines_")
      .attr("d", (d) => line(d[1]))
      .attr("transform", "translate(0,10)")
      .on("click", lineClick)
      .on("mouseover", lineOver)
      .on("mouseout", lineOut)
      .style("cursor", "pointer")

   // Define events
   let selections = new Array(); // array to keep track of selected elements

   function lineDblclick(event, d) {
      let id_text = "#"+d[0].replaceAll(" ", "")+"_click";
      d3.select(id_text).remove();

      d3.select(this)
        .on("dblclick", null)
        .on("click", lineClick)
        .on("mouseover", lineOver)
        .on("mouseout", lineOut)
        .style("stroke", "blue");

      let index = selections.map(x => x.id).indexOf(id_text);
      selections.splice(index, 1);
   }

   function lineClick(event, d) {
      d3.select("#"+d[0].replaceAll(" ", "")).remove();

      d3.select(this)
        .on("mouseover", null)
        .on("mouseout", null)
        .on("click", null)
        .on("dblclick", lineDblclick)
        .style("stroke", "red");
      
      selections.push({
         id: "#"+d[0].replaceAll(" ", "")+"_click",
         line: this,
         gdps: d[1].map(d => d.Gdp)
      })

      svg.append("text")
         .attr("class", "state_names_click")
         .attr("id", d[0].replaceAll(" ", "")+"_click")
         .attr("y", get_position(selections.at(-1))+10)
         .attr("x", width-2*margin-30)
         .text(d[0]);
   }

   function lineOver(event, d) {
      d3.select(this).style("stroke", "red")

      svg.append("text")
         .attr("class", "state_names")
         .attr("id", d[0].replaceAll(" ", ""))
         .attr("y", get_position({gdps: d[1].map(d => d.Gdp)})+10)
         .attr("x", width-2*margin-30)
         .text(d[0]);
   }

   function lineOut(event, d) {
      d3.select(this).style("stroke", "blue");

      d3.select("#"+d[0].replaceAll(" ", "")).remove();
   }
-->

<script>

import * as d3 from 'd3';

export default {
  name: 'BarChart',
  props: {
  },
  data() {
    return {
      svgWidth: 0,
      svgHeight: 500,
      svgPadding: {
        top: 25, right: 20, bottom: 70, left: 40,
      },
    }
  },
  mounted() {
    this.drawChart();
  },
  methods: {
    drawChart() {
      if (this.$refs.chart) this.svgWidth = this.$refs.chart.clientWidth;

    },
  },
  computed: {
    educationRates: {
      get() {
        return this.$store.getters.educationRates;
      }
    },
    dataMax() {
      return d3.max(this.educationRates, (d) => d.value);
    },
    dataMin() {
      return d3.min(this.educationRates, (d) => d.value);
    },
    xScale() {
      return d3.scaleBand()
        .rangeRound([0, this.svgWidth - this.svgPadding.left - this.svgPadding.right]).padding(0.1)
        .domain(this.educationRates.map((d) => d.state));
    },
    yScale() {
      return d3.scaleLinear()
        .rangeRound([this.svgHeight - this.svgPadding.top - this.svgPadding.bottom, 0])
        .domain([this.dataMin > 0 ? 0 : this.dataMin, this.dataMax]);
    },
  },
  watch: {
    educationRates: {
      handler() {
        this.drawChart();
      },
      deep: true,
    },
  },
}

</script>

<style>

</style>

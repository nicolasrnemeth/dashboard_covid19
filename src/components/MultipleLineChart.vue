<template>
  <div id="ViewB_" class="view-B" ref="viewB">
    <div id="mouse-line"></div>
    <div id="toolTip-B"></div>
    <div class="chart-container" ref="chartContainer">
      <div id="feature_title" class="singleDiv">
        <span id="x_label"></span>
      </div>
    </div>
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
      labelXByFeature: true,
      currentCharts: {},
      country: "",
      feature: "",
      chartData: [],
      yExtent: [],
      svgHeight: 100,
      svgWidth: 100,
      svgPadding: {
        top: 3, right: 5, bottom: 3, left: 30,
      },
    }
  },
  mounted() {
    this.setUpToolTipB();
    this.addChartsAndAddXTitle();
  },
  methods: {
    formatFeatureText(text) {
      let formattedText = text.split("_");
      for (let idx=0; idx < formattedText.length; idx++)
         formattedText[idx] = formattedText[idx].charAt(0).toUpperCase() 
                              + formattedText[idx].substring(1);
      return formattedText;
    },
    addChartsAndAddXTitle() {
      for (let d_ of this.data_)
        this.addNewChart(d_.country, d_.feature, d_.data);
      
      if (this.labelXByFeature) {
        let formattedXLabel = this.formatFeatureText(Object.values(this.currentCharts)[0].feature);
        d3.select("#x_label").html(formattedXLabel.join(" "));
      }
      else
        d3.select("#x_label").html(this.data_[0].country);
    },
    setUpToolTipB() {
      // Define that toolTip does not disappear should user move mouse faster
      // than the tooltip moves should that the invisible rect does not trigger
      // anymore the mouse events
      d3.select("#toolTip-B")
        .on("mousemove", this.rectMouseMove)
        .on("mouseleave", this.rectMouseLeave)
        .on("mouseover", this.rectMouseOver)
    },
    rectMouseOver() {
      d3.select("#toolTip-B")
        .style("opacity", 1);
      d3.select("#mouse-line")
        .style("display", "initial");
    },
    rectMouseMove(event) {
      // Get values for content of toolTipB
      let yValues = [];
      let dateFormat = d3.timeFormat("%Y-%m-%d")( this.xScale.invert(d3.pointer(event)[0]) );
      let date = d3.timeParse("%Y-%m-%d")(dateFormat);
      for (let obj of Object.values(this.currentCharts)) {
        let idx = d3.bisectRight(d3.map(obj.data, d => d.x), date);
        if (idx == 0) {
          yValues.push(null);
          continue;
        }
        if (obj.data[idx-1].x == date) {
          yValues.push(obj.data[idx-1].y);
          continue;
        }
        yValues.push(obj.data[idx].y);
      }
      // Format and prep content for tool tip
      let toolTipContent = "Date: " + d3.timeFormat("%d/%m/%y")(date) + "<br/><br/>";
      let idxY = 0;
      for (let chartObj of Object.values(this.currentCharts)) {
        if (this.labelXByFeature) {
          toolTipContent += `${chartObj.country}: ${yValues[idxY]}`;
          if (idxY < yValues.length-1)
            toolTipContent += "<br/>";
        }
        else {
          toolTipContent += `${this.formatFeatureText(chartObj.feature)}:  ${yValues[idxY]}`;
        }
        idxY++;
      } 
      // Update content and position of toolTipB
      const domElem = d3.select("#ViewB_").node();
      let [x, y] = d3.pointer(event, domElem);
      let [oDivWidth, oDivHeight] = [domElem.clientWidth, domElem.clientHeight];
      let tTB = d3.select("#toolTip-B")
                  .html(`${toolTipContent}`);
      let [tTw, tTh] = [tTB.node().clientWidth, tTB.node().clientHeight];
      if (x <= oDivWidth/2 && y <= oDivHeight/2) {
        tTB.style("left", `${x+20}px`)
           .style("top", `${y}px`);
      }
      if (x > oDivWidth/2 && y > oDivHeight/2) {
        tTB.style("left", `${x-tTw-20}px`)
           .style("top", `${y-tTh}px`);
      }
      if (x < oDivWidth/2 && y > oDivHeight/2) {
        tTB.style("left", `${x+20}px`)
           .style("top", `${y-tTh}px`);
      }
      if (x > oDivWidth/2 && y < oDivHeight/2) {
        tTB.style("left", `${x-tTw-20}px`)
           .style("top", `${y}px`);
      }

      d3.select("#mouse-line")
        .style("left", `${x}px`);
    },
    rectMouseLeave() {
      d3.select("#toolTip-B")
        .style("opacity", 0);
      d3.select("#mouse-line")
        .style("display", "none");
    },
    removeChart(country, feature) {
      document.getElementById(`div${country}${feature}`).remove();
      for (let chartID in this.currentCharts)
        if (chartID == `${country}${feature}`)
          delete this.currentCharts[chartID];
    },
    addNewChart(country, feature, chartData) {
      // Set info for next chart creation
      this.country = country;
      this.feature = feature;
      this.chartData = chartData;
      
      this.createChart();
    },
    setUpHtml() {
      let newSubView = d3.select(this.$refs.chartContainer)
                         .append("div")
                         .attr("class", "singleDiv")
                         .attr("id", `div${this.country}${this.feature}`);
      newSubView.html(`
        <svg id="svg${this.country}${this.feature}" class="singleSvg" preserveAspectRatio="none">
          <g class="chart_">
            <g class="axis axis-x"></g>
            <g class="line_"></g>
          </g>
          <rect class="mouse-area"></rect>
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

      // Add id to collection of current chart ids
      this.currentCharts[`${this.country}${this.feature}`] = {
        country: this.country,
        feature: this.feature,
        data: [...this.chartData],
      };

      d3.select(`#svg${this.country}${this.feature} .chart_`)
        .attr("transform", `translate(${this.svgPadding.left}, ${this.svgPadding.top})`);

      // Define actions of mouse area
      d3.select(`#svg${this.country}${this.feature} .mouse-area`)
        .attr("transform", `translate(${this.svgPadding.left}, 0)`)
        .attr("width", this.svgWidth-this.svgPadding.left-this.svgPadding.right)
        .attr("height", this.svgHeight)
        .attr("fill", "white")
        .attr("opacity", 0)
        .on("mouseover", this.rectMouseOver)
        .on("mousemove", this.rectMouseMove)
        .on("mouseleave", this.rectMouseLeave);
      
      this.createXAxis();
      this.createYAxisLabel(`${this.country}${this.feature}`, this.country);
      this.createLines();
    },
    createXAxis() {
      let XAxis = d3.select(`#svg${this.country}${this.feature} .axis-x`);
      XAxis.attr('transform', `translate(0, ${this.svgHeight - this.svgPadding.top - this.svgPadding.bottom})`)
           .call(d3.axisBottom(this.xScale)/*.tickFormat(d3.timeFormat("%m-%d-%y"))*/.tickValues([]).tickSize(0));
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
    createYAxisLabel(chartID, label) {
      //let h = document.getElementById(`div${chartID}`).clientHeight;
      d3.select(`#div${chartID}`)
        .append("span")
        .attr("class", "yLabels")
        .append('text')
        .text(label);
    },
    createXAxisLabel(label, x, y) {
      d3.select(`div${this.country}${this.feature}`)
        .append('text')
        .text(label)
        .attr("class", "xLabel")
        .attr('y', y)
        .attr('x', x)
        .style('text-anchor', 'middle')
        .style('fill', 'black')
        .style('font-weight', 'bold');
    },
    toTime(dateString) {
      return d3.timeParse("%Y-%m-%d")(dateString);
    },
  },
  computed: {
    minmaxDateRange: {
      get() {
        return this.$store.getters.extentDatesViewB;
      }
    },
    yScale() {
      return d3.scaleLinear()
               .domain(this.yExtent)
               .range([this.svgHeight - this.svgPadding.top - this.svgPadding.bottom, 0]);
    },
    xScale() {
      return d3.scaleTime()
               .domain(this.minmaxDateRange)
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
  width: calc(41.5vw - 2px);
  height: calc(48.05vh - 2px);
  border: 1px solid #000000;
  border-radius: 5px;
  box-shadow: 0 0 4px black;
  margin: 1px;
  overflow: hidden !important;
}

.chart-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
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
  font-size: calc((1.8vh + 1vw)/2);
}

.yLabels {
  display: inline-block;
  transform: rotate(-90deg);
  top: 50%;
  left: -48%;
  position: relative;
  font-weight: bold;
}

.area_ {
  fill: purple;
}

#toolTip-B {
  position: absolute;
  z-index: 2;
  background-color: lightgray;
  border-radius: 5px;
  border: 1px solid #000000;
  font-size: calc((1.8vh + 1vw)/2);
  font-family: Baskerville;
  text-align: left !important;
  text-anchor: start !important;
}

#feature_title{
  height: 10vh !important;
  font-weight: bold;
}

#x_label {
  left: 5.86%;
  position: relative;
}

#mouse-line {
  position: absolute;
  top: 3%;
  width: 0px;
  height: 46.5%;
  border: 1px solid rgba(0,0,0,0.4);
  z-index: 1;
  display: none;
}

</style>
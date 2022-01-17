<template>
  <div id="ViewC_" class="view-C" ref="viewC">
    <svg id="svg-C" ref="svgC" v-show="viewBoxIsSet" preserveAspectRatio="none">
      <g class="scatter-plot" ref="scatterPlot">
        <g class="axis axis-x hideAxisLine" ref="xAxis"></g>
        <g class="axis axis-y hideAxisLine" ref="yAxis"></g>
        <rect id="mousearea_viewC"></rect>
        <g class="points-group" ref="pointsGroup"></g>
      </g>
    </svg>
    <div id="colorPaletteViewC"></div>
    <div id="toolTip-C" class="ToolTip"></div>
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
      colorSteps: [
        //"#d01c8b", "#f1b6da", "#f7f7f7", "#b8e186", "#4dac26" diverging
        "#ffffcc", "#c2e699", "#78c679", "#31a354", "#006837" //sequential
      ],
      data_: [],
      viewBoxIsSet: false,
      selectedCountries: [],
      colorChannelFeature: "people_fully_vaccinated_per_hundred",
      sizeChannelFeature: "total_deaths_per_million",
      xFeature: "gdp_per_capita",
      yFeature: "cardiovasc_death_rate",
      svgWidth: 100,
      svgHeight: 100,
      svgPadding: {
        top: 5, right: 15, bottom: 36, left: 52,
      },
    }
  },
  mounted() {
    this.setInitialData();
    this.setInitialSelectedCountries();
    this.setUpToolTipCAndDiv();
    this.createChart();
    this.setUpColorPalette();
    this.createXAxisLabel(this.formatFeatureText(this.xFeature));
    this.createYAxisLabel(this.formatFeatureText(this.yFeature));
    this.resizePoints();
    this.colorPoints();
  },
  methods: {
    setUpColorPalette() {
      let colorPaletteContent = `<span style="color: black;">LOW-</span>`;
      for (let color_ of this.colorSteps) {
        colorPaletteContent += `<svg><rect style="fill: ${color_}; stroke-wdith: 1px; stroke: black; width: 2vw; height: 2.2vh;"></rect></svg>`;
      }
      colorPaletteContent += `<span style="color: black;">-HIGH</span>`;

      d3.select("#colorPaletteViewC").html(colorPaletteContent);
    },
    setInitialData() {
      this.data_ = this.initialData;
    },
    formatFeatureText(text) {
      let formattedText = text.split("_");
      for (let idx=0; idx < formattedText.length; idx++)
         formattedText[idx] = formattedText[idx].charAt(0).toUpperCase() 
                              + formattedText[idx].substring(1);
      return formattedText.join(" ");
    },
    setInitialSelectedCountries() {
      this.selectedCountries = this.$store.getters.initialCountriesC;
    },
    // Define Mouse Events
    setUpToolTipCAndDiv() {
      // Define that toolTip does not disappear should user move mouse faster
      // than the tooltip moves such that the invisible rect does not trigger
      // anymore the mouse events
      d3.select("#toolTip-C")
        .on("mousemove", this.handleMouseMove)
        .on("mouseover", (_, d) => this.handleMouseLeave(d));
      d3.select(this.$refs.viewC)
        .on("mousemove", this.handleMouseMoveDiv);
    },
    handleMouseMoveDiv(event) {
      // Update position of toolTipC
      const domElem = d3.select(this.$refs.viewC).node();
      let [x, y] = d3.pointer(event, domElem);
      let [oDivWidth, oDivHeight] = [domElem.clientWidth, domElem.clientHeight];
      let tTC = d3.select("#toolTip-C");
      let [tTw, tTh] = [tTC.node().clientWidth, tTC.node().clientHeight];

      // Ensure that toolTip does not cross boundary of parent container
      if (x <= oDivWidth/2 && y <= oDivHeight/2) {
        tTC.style("left", `${x+20}px`)
           .style("top", `${y}px`);
      }
      if (x > oDivWidth/2 && y > oDivHeight/2) {
        tTC.style("left", `${x-tTw-20}px`)
           .style("top", `${y-tTh}px`);
      }
      if (x < oDivWidth/2 && y > oDivHeight/2) {
        tTC.style("left", `${x+20}px`)
           .style("top", `${y-tTh}px`);
      }
      if (x > oDivWidth/2 && y < oDivHeight/2) {
        tTC.style("left", `${x-tTw-20}px`)
           .style("top", `${y}px`);
      }
    },
    handleMouseLeave(d) {
      d3.select("#toolTip-C")
        .style("opacity", 0);

      if (d) {
        if (d3.selectAll(".alreadyClickedPoint").empty()) {
          d3.selectAll(`.pointsC`).style("opacity", 1).style("stroke-width", 0.7);
          d3.selectAll(`.points-labelC`).style("opacity", 1).style("font-weight", "normal");
        }
        else {
          if (! document.getElementById(`${d.iso_code.replaceAll(" ", "")}_point`).classList.contains("alreadyClickedPoint")) {
            d3.select(`#${d.iso_code.replaceAll(" ", "")}_point`).style("stroke-width", 0.7).style("opacity", 0.4);
            d3.select(`#${d.iso_code.replaceAll(" ", "")}_pointlabel`).style("font-weight", "normal").style("opacity", 0.4);
          }
        }
      }
    },
    handleMouseMove(event, d) {
      // Update content and position of toolTipB
      const domElem = d3.select(this.$refs.viewC).node();
      let [x, y] = d3.pointer(event, domElem);
      let [oDivWidth, oDivHeight] = [domElem.clientWidth, domElem.clientHeight];
      
      let toolTipContent = "";
      if (d) {
        let foundByDate = false;
        toolTipContent = `<strong>${this.mapIsoCodeName[d.iso_code]}</strong><br/>`;
        // Add feature X name and value
        toolTipContent += `${this.formatFeatureText(this.xFeature)}: `
        if (this.xFeature in this.covidData[d.iso_code])
          toolTipContent += `${this.covidData[d.iso_code][this.xFeature]}<br/>`;
        else {
          for (let idx=this.covidData[d.iso_code].data.length-1; idx >= 0; idx--) {
            if (this.xFeature in this.covidData[d.iso_code].data[idx]) {
              toolTipContent += `${this.covidData[d.iso_code].data[idx][this.xFeature]}<br/>`;
              foundByDate = true;
              break;
            }
          }
          if (! foundByDate)
            toolTipContent += `${null}</br>`;
        }
        
        // Add feature Y name and value
        foundByDate = false;
        toolTipContent += `${this.formatFeatureText(this.yFeature)}: `
        if (this.yFeature in this.covidData[d.iso_code])
          toolTipContent += `${this.covidData[d.iso_code][this.yFeature]}</br>`;
        else {
          for (let idx=this.covidData[d.iso_code].data.length-1; idx >= 0; idx--) {
            if (this.yFeature in this.covidData[d.iso_code].data[idx]) {
              toolTipContent += `${this.covidData[d.iso_code].data[idx][this.yFeature]}</br>`;
              foundByDate = true;
              break;
            }
          }
          if (! foundByDate)
            toolTipContent += `${null}</br>`;
        }

        // Add colorChannelFeature name and value
        foundByDate = false;
        toolTipContent += `${this.formatFeatureText(this.colorChannelFeature)}: `
        if (this.colorChannelFeature in this.covidData[d.iso_code])
          toolTipContent += `${this.covidData[d.iso_code][this.colorChannelFeature]}</br>`;
        else {
          for (let idx=this.covidData[d.iso_code].data.length-1; idx >= 0; idx--) {
            if (this.colorChannelFeature in this.covidData[d.iso_code].data[idx]) {
              toolTipContent += `${this.covidData[d.iso_code].data[idx][this.colorChannelFeature]}</br>`;
              foundByDate = true;
              break;
            }
          }
          if (! foundByDate)
            toolTipContent += `${null}</br>`;
        }

        // Add sizeChannelFeature name and value
        foundByDate = false;
        toolTipContent += `${this.formatFeatureText(this.sizeChannelFeature)}: `
        if (this.sizeChannelFeature in this.covidData[d.iso_code])
          toolTipContent += `${this.covidData[d.iso_code][this.sizeChannelFeature]}</br>`;
        else {
          for (let idx=this.covidData[d.iso_code].data.length-1; idx >= 0; idx--) {
            if (this.sizeChannelFeature in this.covidData[d.iso_code].data[idx]) {
              toolTipContent += `${this.covidData[d.iso_code].data[idx][this.sizeChannelFeature]}</br>`;
              foundByDate = true;
              break;
            }
          }
          if (! foundByDate)
            toolTipContent += `${null}</br>`;
        }  
      }
          

      let tTC = d3.select("#toolTip-C")
                  .html(`${toolTipContent}`);
      let [tTw, tTh] = [tTC.node().clientWidth, tTC.node().clientHeight];

      // Ensure that toolTip does not cross boundary of parent container
      if (x <= oDivWidth/2 && y <= oDivHeight/2) {
        tTC.style("left", `${x+20}px`)
           .style("top", `${y}px`);
      }
      if (x > oDivWidth/2 && y > oDivHeight/2) {
        tTC.style("left", `${x-tTw-20}px`)
           .style("top", `${y-tTh}px`);
      }
      if (x < oDivWidth/2 && y > oDivHeight/2) {
        tTC.style("left", `${x+20}px`)
           .style("top", `${y-tTh}px`);
      }
      if (x > oDivWidth/2 && y < oDivHeight/2) {
        tTC.style("left", `${x-tTw-20}px`)
           .style("top", `${y}px`);
      }
    },
    handleMouseOver(d) {
      d3.select("#toolTip-C")
        .style("opacity", 1);

      if (d) {
        let id = d.iso_code.replaceAll(" ", "");

        if (d3.selectAll(".alreadyClickedPoint").empty()) {
          d3.selectAll(`.pointsC:not(#${id}_point)`).style("opacity", 0.4).style("stroke-width", 0.7);
          d3.selectAll(`.points-labelC:not(#${id}_pointlabel)`).style("opacity", 0.4).style("font-weight", "normal");
        }
        else {
          if (! document.getElementById(`${id}_point`).classList.contains("alreadyClickedPoint")) {
            d3.select(`#${id}_point`).style("opacity", 1).style("stroke-width", 1.5);
            d3.select(`#${id}_pointlabel`).style("opacity", 1).style("font-weight", "bold"); 
          }
        }
      }
    },
    handlePointClick(d) {
      if (d3.selectAll(".alreadyClickedPoint").empty()) {
        d3.selectAll(`.pointsC:not(#${d.iso_code}_point)`).style("opacity", 0.4).style("stroke-width", 0.7);
        d3.selectAll(`.points-labelC:not(#${d.iso_code}_pointlabel)`).style("opacity", 0.4).style("font-weight", "normal");
      }
      
      d3.select(`#${d.iso_code}_point`).classed("alreadyClickedPoint", true);

      if (d3.selectAll(".alreadyClickedPoint").size() == this.selectedCountries.length) {
        d3.selectAll(".alreadyClickedPoint").classed("alreadyClickedPoint", false);
      }
      else {
        d3.select(`#${d.iso_code}_point`).style("opacity", 1).style("stroke-width", 1.5);
        d3.select(`#${d.iso_code}_pointlabel`).style("opacity", 1).style("font-weight", "bold");
      }
    },
    handleChartClick() {
      d3.selectAll(".pointsC")
        .style("opacity", 1).style("stroke-width", 0.7);
      d3.selectAll(".points-labelC").style("opacity", 1).style("font-weight", "normal");
      d3.selectAll(".alreadyClickedPoint").classed("alreadyClickedPoint", false);
    },
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
       d3.select("#mousearea_viewC")
        .attr("width", this.svgWidth-this.svgPadding.left-this.svgPadding.right)
        .attr("height", this.svgHeight-this.svgPadding.top-this.svgPadding.bottom)
        .on("click", this.handleChartClick)
        .style("fill", "white")
        .style("opacity", 0);
      
      this.createXAxis();
      this.createYAxis();
      this.createPoints();
    },
    createXAxis() {
      let XAxis = d3.select(this.$refs.xAxis)
      XAxis.attr('transform', `translate(0, ${this.svgHeight - this.svgPadding.top - this.svgPadding.bottom})`)
           .call(d3.axisBottom(this.xScale).tickSize(3)/*.tickFormat(d => d)*/);
    },
    createYAxis() {
      let YAxis = d3.select(this.$refs.yAxis);
      YAxis.call(d3.axisLeft(this.yScale).tickSize(3)/*.tickFormat(d => (d3.format(".1f")(d/1e03) + " k"))*/);
    },
    createXAxisLabel(labelText) {
      let translateX = this.svgWidth - this.svgPadding.left - this.svgPadding.right;

      d3.select(this.$refs.xAxis)
        .append('text')
        .text(labelText)
        .attr('x', 0.5*translateX)
        .attr('y', '2.35em')
        .attr("id", "xLabelC")
        .style('fill', 'black')
        .style('text-anchor', 'middle')
        .style('font-weight', 'bold')
    },
    createYAxisLabel(labelText) {
      let translateY = this.svgHeight - this.svgPadding.top - this.svgPadding.bottom;

      d3.select(this.$refs.yAxis)
        .append('text')
        .text(labelText)
        .attr('transform', 'rotate(-90)')
        .attr('y', '-2.98em')
        .attr('x', -0.5*translateY)
        .attr("id", "yLabelC")
        .style('text-anchor', 'middle')
        .style('fill', 'black')
        .style('font-weight', 'bold');
    },
    createPoints() {
      const pointsGroup = d3.select(this.$refs.pointsGroup);
      
      pointsGroup.selectAll('.points')
                 .data(this.data_)
                 .join('circle')
                 .attr('class', 'pointsC')
                 .attr('id', d => d.iso_code.replaceAll(" ", "")+"_point")
                 .attr('cx', d => this.xScale(d.x))
                 .attr('cy', d => this.yScale(d.y))
                 .attr('r', 4)
                 .on("mouseover", (_, d) => this.handleMouseOver(d))
                 .on("mouseleave", (_, d) => this.handleMouseLeave(d))
                 .on("mousemove", this.handleMouseMove)
                 .on("click", (_, d) => this.handlePointClick(d))
                 .style('fill', '#00ff15')
                 .style('stroke', 'black')
                 .style('stroke-width', 0.7)
                 .style("cursor", "pointer");

      pointsGroup.selectAll("text")
                .data(this.data_)
                .enter()
                .append("text")
                .text(d => d.iso_code)
                .attr("class", "points-labelC")
                .attr("id", d => d.iso_code+"_pointlabel")
                .on("mouseover", (_, d) => this.handleMouseOver(d))
                .on("mouseleave", (_, d) => this.handleMouseLeave(d))
                .on("click", (_, d) => this.handlePointClick(d))
                .on("mousemove", this.handleMouseMove)
                .style("text-anchor", "start")
                .style("cursor", "pointer");

      //let pointRadius = d3.select(".points").attr("r");
      let elem = document.getElementsByClassName('points-labelC')[0];
      let style = window.getComputedStyle(elem, null).getPropertyValue('font-size');
      let fontSize = parseFloat(style); 
      pointsGroup.selectAll("text")
                 .attr("x", d => this.xScale(d.x)+6)
                 .attr("y", d => this.yScale(d.y)+fontSize/2);
    },
    // Add space between marks and plot borders
    addSpacing(minVal, maxVal, down=0.1, up=1.1) {
      return [minVal-down*maxVal, up*maxVal];
    },
    getColorIndex(value, minVal, maxVal) {
      let idx = Math.trunc((value - minVal) / ((maxVal - minVal)*0.2));
      if (idx == 5)
        return 4;
      return idx;
    },
    // Apply color channel
    colorPoints() {
      let filtered_data = [];
      for (let country of this.selectedCountries) {
        if (country in this.covidData) {
          if (this.colorChannelFeature in this.covidData[country]) {
            filtered_data.push(this.covidData[country][this.colorChannelFeature]);
            continue;
          }
          else {
            let foundByDate = false;
            if ("data" in this.covidData[country]) {
              for (let idx=this.covidData[country].data.length-1; idx >= 0; idx--) {
                if (this.colorChannelFeature in this.covidData[country].data[idx]) {
                  foundByDate = true;
                  filtered_data.push(this.covidData[country].data[idx][this.colorChannelFeature]);
                  break;
                }
              }
            }
            if (foundByDate)
              continue;
          }
        }
        filtered_data.push(undefined);
      }
      let [minVal, maxVal] = d3.extent(filtered_data);
      
      let colIdx = undefined;
      for (let country of this.selectedCountries) {
        if (country in this.covidData) {
          if (this.colorChannelFeature in this.covidData[country]) {
            let colVal = this.covidData[country][this.colorChannelFeature];
            colIdx = this.getColorIndex(colVal, minVal, maxVal);
            d3.select("#"+country+"_point").style('fill', this.colorSteps[colIdx]);
            continue;
          }
          if ("data" in this.covidData[country]) {
            let foundByDate = false;
            for (let idx_=this.covidData[country].data.length-1; idx_ >= 0; idx_--) {
              if (this.colorChannelFeature in this.covidData[country].data[idx_]) {
                foundByDate = true;
                let colVal = this.covidData[country].data[idx_][this.colorChannelFeature];
                colIdx = this.getColorIndex(colVal, minVal, maxVal);
                d3.select("#"+country+"_point").style('fill', this.colorSteps[colIdx]);
                break;
              }
            }
            if (foundByDate)
              continue;
          }
        }
        d3.select("#"+country+"_point").style('fill', "#cccccc");
      }
    },
    // Apply size channel
    resizePoints() {
      let values = {};
      for (let country of this.data_) {
        if (this.sizeChannelFeature in this.covidData[country.iso_code])
          values[country] = this.covidData[country.iso_code][this.sizeChannelFeature];
        else {
          if ("data" in this.covidData[country.iso_code]) {
            for (let idx=this.covidData[country.iso_code].data.length-1; idx >= 0; idx--)
              if (this.sizeChannelFeature in this.covidData[country.iso_code].data[idx]) {
                values[country] = this.covidData[country.iso_code].data[idx][this.sizeChannelFeature];
                break;
              }
          }
        }
      }
      // Rescale all values such that the radius of the point with the largest value is X
      // where X depends on the number of total points in the plot
      let reScalingFactor = (4*4*Math.PI) / d3.max(Object.values(values));
      if (Object.keys(values).length >= 10)
        reScalingFactor = (8*8*Math.PI) / d3.max(Object.values(values));
      if (Object.keys(values).length >= 20)
        reScalingFactor = (12*12*Math.PI) / d3.max(Object.values(values));

      for (let country of this.data_) {
        if (country in values) {
          let radius = ((values[country]*reScalingFactor)/Math.PI)**0.5;
          d3.select(`#${country.iso_code}_point`)
            .attr("r", radius);
          d3.select(`#${country.iso_code}_pointlabel`)
            .attr("x", this.xScale(country.x) + radius + 2)
            .style("text-anchor", "start");
        }
        else {
          d3.select(`#${country.iso_code}_point`)
            .attr("r", 0);
          d3.select(`#${country.iso_code}_pointlabel`)
            .attr("x", this.xScale(country.x))
            .style("text-anchor", "middle");
        }
      }
    },
    dataExtent(feature) {
      return d3.extent(this.data_, d => d[feature]);
    },
  },
  computed: {
    mapIsoCodeName: {
      get() {
        return this.$store.getters.mapIsoCodeName;
      }
    },
    covidData: {
      get() {
        return this.$store.getters.covidData;
      }
    },
    initialData: {
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
  font-size: calc((1.4vh + 0.8vw)/2);
}

#svg-C {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}

.points-labelC {
  text-anchor: start;
  font-family: Baskerville;
  font-size: 11px;
}

#colorPaletteViewC {
  position: absolute;
  top: 2px;
  left: 72%;
  background-color: white;
  z-index: 1;
  font-size: calc((1.6vh + 0.8vw)/2);
  font-family: Baskerville;
  font-weight: bold;
  display: flex;
  width: 10vw;
  height: 2.2vh;
  line-height: 2.2vh;
  vertical-align: middle;
}

</style>

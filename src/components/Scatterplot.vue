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
    this.createXAxisLabel(this.formatFeatureText(this.xFeature) + ((this.percentageValues.includes(this.xFeature)) ? " %" : ""));
    this.createYAxisLabel(this.formatFeatureText(this.yFeature) + ((this.percentageValues.includes(this.yFeature)) ? " %" : ""));
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
      let XAxis = d3.select(this.$refs.xAxis);
      let factor = parseInt( ((this.xScale.domain()[1] + 1e-06).toString().indexOf('.')-1) / 3);
      let suffix = "";
      if (factor == 1)
        suffix = " k";
      if (factor == 2)
        suffix = " M";
      if (factor == 3)
        suffix = " B";

      XAxis.attr('transform', `translate(0, ${this.svgHeight - this.svgPadding.top - this.svgPadding.bottom})`)
           .call(d3.axisBottom(this.xScale).tickSize(3).tickFormat(d => d/(10**(3*factor)) + suffix));
    },
    createYAxis() {
      let YAxis = d3.select(this.$refs.yAxis);
      let factor = parseInt( ((this.yScale.domain()[1] + 1e-06).toString().indexOf('.')-1) / 3);
      let suffix = "";
      if (factor == 1)
        suffix = " k";
      if (factor == 2)
        suffix = " M";
      if (factor == 3)
        suffix = " B";

      YAxis.call(d3.axisLeft(this.yScale).tickSize(3).tickFormat(d => d/(10**(3*factor)) + suffix));
    },
    createXAxisLabel(labelText) {
      let translateX = this.svgWidth - this.svgPadding.left - this.svgPadding.right;

      if (document.getElementById("xLabelC"))
        document.getElementById("xLabelC").remove();

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
      
      if (document.getElementById("yLabelC"))
        document.getElementById("yLabelC").remove();

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
                 .data(this.data_, d => d.iso_code)
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
                 .style('fill', 'skyblue')
                 .style('stroke', 'black')
                 .style('stroke-width', 0.7)
                 .style("cursor", "pointer");

      pointsGroup.selectAll("text")
                .data(this.data_, d => d.iso_code)
                .join("text")
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
      if (this.colorChannelFeature != "None") {
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
      }
      else {
        d3.selectAll(".pointsC").style("fill", "skyblue");
      }
    },
    // Apply size channel
    resizePoints() {
      if (this.sizeChannelFeature != "None") {
        let values = {};
        for (let country of this.data_) {
          if (this.sizeChannelFeature in this.covidData[country.iso_code])
            values[country.iso_code] = this.covidData[country.iso_code][this.sizeChannelFeature];
          else {
            if ("data" in this.covidData[country.iso_code]) {
              for (let idx=this.covidData[country.iso_code].data.length-1; idx >= 0; idx--)
                if (this.sizeChannelFeature in this.covidData[country.iso_code].data[idx]) {
                  if (this.covidData[country.iso_code].data[idx][this.sizeChannelFeature] < 0)
                    continue;
                  values[country.iso_code] = this.covidData[country.iso_code].data[idx][this.sizeChannelFeature];
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
          if (country.iso_code in values) {
            let radius = ((values[country.iso_code]*reScalingFactor)/Math.PI)**0.5;
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
      }
      else {
        d3.selectAll(".pointsC").attr("r", 4);
        d3.selectAll(".points-labelC").attr("x", d => this.xScale(d.x)+6);
      }
    },
    dataExtent(feature) {
      return d3.extent(this.data_, d => d[feature]);
    },
    removeLabelsNPoints() {
      if (! d3.selectAll(".pointsC").empty())
        document.querySelectorAll(".pointsC").forEach(p => p.remove());
      if (! d3.selectAll(".points-labelC").empty())
        document.querySelectorAll(".points-labelC").forEach(l => l.remove());
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
    controlCfeatX: {
      get() {
        return this.$store.getters.controlCfeatX;
      }
    },
    controlCfeatY: {
      get() {
        return this.$store.getters.controlCfeatY;
      }
    },
    controlCcolor: {
      get() {
        return this.$store.getters.controlCcolor;
      }
    },
    controlCsize: {
      get() {
        return this.$store.getters.controlCsize;
      }
    },
    controlCcountry: {
      get() {
        return this.$store.getters.controlCcountry;
      }
    },
    controlCchecked: {
      get() {
        return this.$store.getters.controlCchecked;
      }
    },
    controlCtarget: {
      get() {
        return this.$store.getters.controlCtarget;
      }
    },
    percentageValues: {
      get() {
        return this.$store.getters.percentageValues;
      }
    },
  },
  watch: {
    controlCfeatX: {
      handler: function() {
        this.xFeature = this.controlCfeatX;
        for (let dataIdx=0; dataIdx < this.data_.length; dataIdx++) {
          if (this.xFeature in this.covidData[this.data_[dataIdx].iso_code])
            this.data_[dataIdx].x = this.covidData[this.data_[dataIdx].iso_code][this.xFeature];
          else {
            let foundByDate = false;
            for (let idx_=this.covidData[this.data_[dataIdx].iso_code].data.length-1; idx_ >= 0; idx_--) {
              if (this.xFeature in this.covidData[this.data_[dataIdx].iso_code].data[idx_]) {
                if (this.covidData[this.data_[dataIdx].iso_code].data[idx_][this.xFeature] < 0)
                  continue;
                this.data_[dataIdx].x = this.covidData[this.data_[dataIdx].iso_code].data[idx_][this.xFeature];
                foundByDate = true;
                break;
              }
            }
            if (! foundByDate)
              this.data_[dataIdx].x == null;
          }
        }
        // Remove countries where x contains a null value and therefore cannot be visualized
        let remove_countries = [];
        let new_list = [];
        let data_copy = [...this.data_];
        for (let idx_=0; idx_ < this.data_.length; idx_++) {
          if (this.data_[idx_].x == null)
            remove_countries.push(this.data_[idx_].iso_code.slice());
          else
            new_list.push(this.data_[idx_]);
        }
        let divC = document.querySelector('#checkboxes_viewC');
        let checkboxesViewC = divC.querySelectorAll('input[type="checkbox"]');
        for (let checkbox of checkboxesViewC) {
          if (checkbox.value in remove_countries) {
            checkbox.checked = false;
            checkbox.disabled = true;
          }
        }

        this.data_ = new_list;
        this.selectedCountries.filter(iso_code => ! (iso_code in remove_countries));

        
        if (! (this.data_.length == 0)) {
          this.removeLabelsNPoints();
  
          this.createChart();
          this.createXAxisLabel(this.formatFeatureText(this.xFeature) + ((this.percentageValues.includes(this.xFeature)) ? " %" : ""));
          this.createYAxisLabel(this.formatFeatureText(this.yFeature) + ((this.percentageValues.includes(this.yFeature)) ? " %" : ""));
          if (this.sizeChannelFeature != "None")
            this.resizePoints();
          if (this.colorChannelFeature != "None")
            this.colorPoints();
        }
        else {
          this.data_ = data_copy;
          alert(`The data could not be plotted, because for the selected
                 feature no selected country contains a value that is not null.
                 Or because you do not have any countries selected.`);
        }
      },
      deep: true,
    },
    controlCfeatY: {
      handler: function() {
        this.yFeature = this.controlCfeatY;
        for (let dataIdx=0; dataIdx < this.data_.length; dataIdx++) {
          if (this.yFeature in this.covidData[this.data_[dataIdx].iso_code])
            this.data_[dataIdx].y = this.covidData[this.data_[dataIdx].iso_code][this.yFeature];
          else {
            let foundByDate = false;
            for (let idx_=this.covidData[this.data_[dataIdx].iso_code].data.length-1; idx_ >= 0; idx_--) {
              if (this.yFeature in this.covidData[this.data_[dataIdx].iso_code].data[idx_]) {
                if (this.covidData[this.data_[dataIdx].iso_code].data[idx_][this.yFeature] < 0)
                  continue;
                this.data_[dataIdx].y = this.covidData[this.data_[dataIdx].iso_code].data[idx_][this.yFeature];
                foundByDate = true;
                break;
              }
            }
            if (! foundByDate)
              this.data_[dataIdx].y == null;
          }
        }
        // Remove countries where x contains a null value and therefore cannot be visualized
        let remove_countries = [];
        let new_list = [];
        let data_copy = [...this.data_];
        for (let idx_=0; idx_ < this.data_.length; idx_++) {
          if (this.data_[idx_].x == null)
            remove_countries.push(this.data_[idx_].iso_code.slice());
          else
            new_list.push(this.data_[idx_]);
        }
        let divC = document.querySelector('#checkboxes_viewC');
        let checkboxesViewC = divC.querySelectorAll('input[type="checkbox"]');
        for (let checkbox of checkboxesViewC) {
          if (checkbox.value in remove_countries) {
            checkbox.checked = false;
            checkbox.disabled = true;
          }
        }

        this.data_ = new_list;
        this.selectedCountries.filter(iso_code => ! (iso_code in remove_countries));

        if (! (this.data_.length == 0)) {
          this.removeLabelsNPoints();
  
          this.createChart();
          this.createXAxisLabel(this.formatFeatureText(this.xFeature) + ((this.percentageValues.includes(this.xFeature)) ? " %" : ""));
          this.createYAxisLabel(this.formatFeatureText(this.yFeature) + ((this.percentageValues.includes(this.yFeature)) ? " %" : ""));
          if (this.sizeChannelFeature != "None")
            this.resizePoints();
          if (this.colorChannelFeature != "None")
            this.colorPoints();
        }
        else {
          this.data_ = data_copy;
          alert(`The data could not be plotted, because for the selected
                 feature no selected country contains a value that is not null.
                 Or because you do not have any countries selected.`);
        }
      },
      deep: true,
    },
    controlCcolor: {
      handler: function() {
        this.colorChannelFeature = this.controlCcolor;
        this.colorPoints();
      },
      deep: true,
    },
    controlCsize: {
      handler: function() {
        this.sizeChannelFeature = this.controlCsize;
        this.resizePoints();
      },
      deep: true,
    },
    controlCcountry: {
      handler: function() {
        let controlCcountry_ = this.controlCcountry.slice(0, 3);

        if (this.controlCchecked) {
          let xValue = undefined;
          let yValue = undefined;

          if (this.yFeature in this.covidData[controlCcountry_])
            yValue = this.covidData[controlCcountry_][this.yFeature];
          else {
            for (let idx_=this.covidData[controlCcountry_].data.length-1; idx_ >= 0; idx_--) {
              if (this.yFeature in this.covidData[controlCcountry_].data[idx_]) {
                if (this.covidData[controlCcountry_].data[idx_][this.yFeature] < 0)
                  continue;
                yValue = this.covidData[controlCcountry_].data[idx_][this.yFeature];
                break;
              }
            }
          }
          if (this.xFeature in this.covidData[controlCcountry_])
            xValue = this.covidData[controlCcountry_][this.xFeature];
          else {
            for (let idx_=this.covidData[controlCcountry_].data.length-1; idx_ >= 0; idx_--) {
              if (this.xFeature in this.covidData[controlCcountry_].data[idx_]) {
                if (this.covidData[controlCcountry_].data[idx_][this.xFeature] < 0)
                  continue;
                xValue = this.covidData[controlCcountry_].data[idx_][this.xFeature];
                break;
              }
            }
          }

          let countryObj = {
            iso_code: controlCcountry_,
            x: xValue,
            y: yValue,
          };

          if(countryObj.x != undefined && countryObj.y != undefined) {
            this.data_.push(countryObj);
            this.selectedCountries.push(countryObj.iso_code.slice());

            this.removeLabelsNPoints();

            this.createChart();
            if (this.sizeChannelFeature != "None")
              this.resizePoints();
            if (this.colorChannelFeature != "None")
              this.colorPoints();
          }
          else {
            this.controlCtarget.disabled = true;
            this.controlCtarget.checked = false;
            if (countryObj.x == undefined)
              alert(`Country could not be added, because its x-value is null. 
                     Countries for which a certain feature is undefined will be disabled,
                     until respective another feature for the x-axis encoding is selected.`);
            else
              alert(`Country could not be added, because its y-value is null. 
                     Countries for which a certain feature is undefined will be disabled,
                     until another feature for the y-axis encoding is selected.`);
          }
        }
        if (!this.controlCchecked) {
          this.data_ = this.data_.filter(d => d.iso_code != controlCcountry_);
          this.selectedCountries = d3.map(this.data_, d => d.iso_code);
        }
      },
      deep: true,
    }
  }
}

</script>

<style>

.view-C {
  position: relative;
  width: calc(40.75vw - 2px);
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

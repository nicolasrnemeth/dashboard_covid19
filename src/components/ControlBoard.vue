<template>
  <div class="view-E" ref="viewE">
    <div id="control-title" class="title_">
      Control Board
    </div>
    <div id="wrapper_controls">
      <div id="view-A-control" class="control-panel_">
        <!--<svg><rect class="overlayRect"></rect></svg>-->
      </div>
      <div id="view-B-control" class="control-panel_">
        <!--<svg><rect class="overlayRect"></rect></svg>-->
      </div>
      <div id="view-C-control" class="control-panel_">
        <!--<svg><rect class="overlayRect"></rect></svg>-->
      </div>
      <div id="view-D-control" class="control-panel_">
        <!--<svg><rect class="overlayRect"></rect></svg>-->
      </div>
    </div>
  </div> 
</template>



<script>

import * as d3 from 'd3';

export default {
  name: 'ControlBoard',
  props: {
  },
  data() {
    return {
      
    }
  },
  mounted() {
    this.setUpHoverEvents();
  },
  methods: {
    handleMouseOver(event) {
      if (event.target.id == "view-A-control")
        d3.select("#ViewA_").style("border-width", "2px");
      if (event.target.id == "view-B-control")
        d3.select("#ViewB_").style("border-width", "2px");
      if (event.target.id == "view-C-control")
        d3.select("#ViewC_").style("border-width", "2px");
      if (event.target.id == "view-D-control")
        d3.select("#ViewD_").style("border-width", "2px");
    },
    handleMouseLeave(event) {
      if (event.target.id == "view-A-control")
        d3.select("#ViewA_").style("border-width", "1px");
      if (event.target.id == "view-B-control")
        d3.select("#ViewB_").style("border-width", "1px");
      if (event.target.id == "view-C-control")
        d3.select("#ViewC_").style("border-width", "1px");
      if (event.target.id == "view-D-control")
        d3.select("#ViewD_").style("border-width", "1px");
    },
    setUpHoverEvents() {
      d3.select("#view-A-control")
        .on("mouseover", this.handleMouseOver)
        .on("mouseleave", this.handleMouseLeave);
      d3.select("#view-B-control")
        .on("mouseover", this.handleMouseOver)
        .on("mouseleave", this.handleMouseLeave);
      d3.select("#view-C-control")
        .on("mouseover", this.handleMouseOver)
        .on("mouseleave", this.handleMouseLeave);
      d3.select("#view-D-control")
        .on("mouseover", this.handleMouseOver)
        .on("mouseleave", this.handleMouseLeave);
    },
  },
  computed: {
    covidData: {
      get() {
        return this.$store.getters.covidData;
      }
    }
  },
  watch: {

  },
}

</script>

<style>

#control-title {
  transform: translateY(-10%);
  height: 3.9vh;
}

.view-E {
  width: calc(17vw - 2px);
  height: calc(100vh - 2px);
  background-color: rgb(195, 206, 255);
  border-radius: 5px;
  margin: 1px;
  border: 1px solid #000000;
}

#view-A-control {
  margin: 1px 1px 0px 1px;
}

#view-B-control {
  margin: 1px 1px 0px 1px;
}

#view-C-control {
  margin: 1px 1px 0px 1px;
}

#view-D-control {
  margin: 1px 1px 0px 1px;
}

.control-panel_ {
  width: 16.5vw;
  height: 23.75vh;
  border-radius: 8px;
  border: 1px solid black;
}

.control-panel_:hover {
  border-width: 2px;
}

/*.overlayRect {
  fill: gold;
  border-radius: 8px;
  height: calc(23.75vh - 4px);
  width: calc(16.5vw - 4px)
}*/

#wrapper_controls {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
}

</style>
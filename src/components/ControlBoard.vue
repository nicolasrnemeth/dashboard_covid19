<template>
  <div class="view-E" ref="viewE">
    <div id="control-title" class="title_">
      Control Board
    </div>
    <div id="wrapper_controls">
      <div id="view-A-control" class="control-panel_">
  
      </div>
      <div id="view-B-control" class="control-panel_">
  
      </div>
      <div id="view-C-control" class="control-panel_">
  
      </div>
      <div id="view-D-control" class="control-panel_">
  
      </div>
    </div>
  </div> 
</template>



<script>

export default {
  name: 'ControlBoard',
  props: {
  },
  data() {
    return {
      divPadding: {
        top: 0, right: 0, bottom: 30, left: 0,
      },
    }
  },
  mounted() {
    if (this.$refs.svgE) {
      this.svgWidth = this.$refs.viewE.clientWidth;
        this.svgHeight = this.$refs.viewE.clientHeight;
    }
  },
  methods: {
  },
  computed: {
    selectedYear: {
      get() {
        return this.$store.getters.selectedYear;
      },
      set(val) {
        this.$store.commit('changeSelectedYear', val);
      },
    },
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
  border: 2px solid darkgreen;
}

#wrapper_controls {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
}

</style>
<template>
  <div class="view-E" ref="viewE">
    Control Board
    <!--<svg class="svg-E" :width="svgWidth" :height="svgHeight" ref="svgE">-->
      <!-- placeholder -->
    <!--</svg>-->
  </div> 
</template>



<script>

export default {
  name: 'ControlBoard',
  props: {
  },
  data() {
    return {
      svgWidth: 500,
      svgHeight: 500,
      svgPadding: {
        top: 0, right: 0, bottom: 30, left: 0,
      },
    }
  },
  mounted() {
    if (this.$refs.svgE) {
      this.svgWidth = document.body.clientWidth*0.16666667;
      this.svgHeight = document.body.clientHeight;
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

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.view-E {
  width: 16.666667vw;
  height: calc(100vh - 7px);
  background-color: rgb(128, 128, 128);
  border: 1px solid #000000;
  border-left: 1.5px solid #000000;
}

</style>
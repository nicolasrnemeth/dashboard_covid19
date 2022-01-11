<template>
  <div class="view-E" ref="viewE">
    <div id="control-title" class="title_">
      <strong>Control Board</strong>
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

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.view-E {
  width: 17vw;
  height: 100vh;
  background-color: rgb(128, 128, 128);
  border: 2px solid #000000;
}

</style>
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

<style>

.view-E {
  width: calc(17vw - 2px);
  height: calc(100vh - 3px);
  background-color: lightskyblue;
  border-radius: 5px;
  margin: 1px;
}

</style>
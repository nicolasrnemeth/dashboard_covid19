<template>
  <div>
    <!--<label for="range-year">Year Selection</label>-->
    <b-form-input id="range-year" v-model="selectedYear" type="range" min="2006" max="2019"></b-form-input>
  </div>
</template>

<script>
export default {
  name: 'YearSlider',
  props: {
  },
  data() {
    return {
    }
  },
  mounted() {
  },
  methods: {
  },
  computed: {
  },
  watch: {
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

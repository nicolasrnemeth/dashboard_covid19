import Vue from 'vue';
import Vuex from 'vuex';
import * as d3 from 'd3';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    covidData: [],
    pageWidth: 500,
    pageHeight: 500,
  },
  mutations: {

  },
  getters: {
    educationRates (state) {
      let result = [];
      for (let i = 0; i < state.educationRates.length; i++) {
        if (state.selectedYear in state.educationRates[i]) {
          result.push({
            state: state.educationRates[i].State,
            value: +state.educationRates[i][state.selectedYear]
          })
        }
      }
      return result;
    },
  },
  actions: {
    loadData({state}) {
      d3.json('https://covid.ourworldindata.org/data/owid-covid-data.json').then((data) => { 
        state.covidData = data;
        console.log("hello");
      })
    },
  }
})

export default store;
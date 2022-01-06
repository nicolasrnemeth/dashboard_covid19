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
    
  },
  actions: {
    loadData({state}) {
      d3.json('https://covid.ourworldindata.org/data/owid-covid-data.json').then((data) => { 
        state.covidData = data;
      })
    },
  }
})

export default store;
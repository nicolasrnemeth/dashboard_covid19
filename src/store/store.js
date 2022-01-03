import Vue from 'vue';
import Vuex from 'vuex';
import * as d3 from 'd3';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    
  },
  mutations: {
    changeSelectedYear (state, year) {
      state.selectedYear = year;
    },  
  },
  getters: {
    selectedYear: (state) => state.selectedYear,
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
      d3.csv('./usa_ba-degree-or-higher_2006-2019.csv').then((data) => { 
        state.educationRates = data;
      })
    },
  }
})

export default store;
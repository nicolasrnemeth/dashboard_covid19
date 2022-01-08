import Vue from 'vue';
import Vuex from 'vuex';
import * as d3 from 'd3';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    dataIsReady: false,
    covidData: [],
    dataViewA: [],
    dataViewB: [],
    dataViewC: [],
    dataViewD: [],
    dataViewE: [],
    selectionA: {
      date: "",
      features: [],
    },
    selectionB: {
      x: ["", ""],
      ys: [],
      countries: [],
    },
    selectionC: {
      dateRange: ["", ""],
      x: "",
      y: "",
      colorChannel: "",
      sizeChannel: "",
      countries: [],
    },
    selectionD: {
      x: ["", ""],
      y: "",
      countries: [],
    },
    selectionE: {

    },
    pageWidth: 500,
    pageHeight: 500,
  },
  mutations: {
    prepDataViewC(state, feature) {
      let _data_ = [];
      for (let elem of Object.values(state.covidData)) {
        if (!(feature.x in elem) || !(feature.y in elem)) continue;
        _data_.push(
          {
            x: elem[feature.x],
            y: elem[feature.y],
          }
        );
      }
      state.view_C = _data_;
    },
  },
  getters: {
    dataViewC: (state) => state.view_C,
  },
  actions: {
    loadData(context) {
      //https://covid.ourworldindata.org/data/owid-covid-data.json
      d3.json('./owid-covid-data.json').then((data) => {
        context.state.covidData = data;
        //context.commit("prepDataViewC", context.state.)
        d3.select("#loader_").remove();
      })
    },
    prepDataViewC(context, feature) {
      context.commit("prepDataViewC", feature);
    },
  }
})

export default store;
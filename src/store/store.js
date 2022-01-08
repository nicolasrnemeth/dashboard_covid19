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
      features: ["human_development_index"],
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
    /*prepDataViewA(state, selection) {
      let _data_ = [];
      if (selection.features.length > 0) {
        for (let elem of Object.values(state.covidData)) {
          if (selection.features.length == 1) {
            _data_.push({

            })
          }
        }
        state.view_A = _data_;
      }
    },*/
    //prepDataViewB(state, selection) {

    //},
    prepDataViewC(state, feature) {
      let _data_ = [];
      for (let elem of Object.values(state.covidData)) {
        if (!(feature.x in elem) || !(feature.y in elem)) continue;
        _data_.push({
            x: elem[feature.x],
            y: elem[feature.y],
        });
      }
      state.view_C = _data_;
    },
    /*prepDataViewD(state, selection) {

    },
    prepDataViewE(state, selection) {

    },*/
  },
  getters: {
    dataViewA: state => state.view_A,
    dataViewB: state => state.view_B,
    dataViewC: state => state.view_C,
    dataViewD: state => state.view_D,
    dataViewE: state => state.view_E,
  },
  actions: {
    loadNPrepData(context) {
      //https://covid.ourworldindata.org/data/owid-covid-data.json
      d3.json('./owid-covid-data_small.json').then((data) => {
        // Parse entire dataset
        context.state.covidData = data;
        // Prepare data for intial state of each view
        //context.commit("prepDataViewA", context.state.selectionA)
        // Allow dom elements to be rendered only when data for each view is prepped
        context.state.dataIsReady = true;
        // Remove loading sign
        d3.select("#loader_").remove();
      })
    },
  }
})

export default store;
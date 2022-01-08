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
      x: "gdp_per_capita",
      y: "cardiovasc_death_rate",
      colorChannel: "",
      sizeChannel: "",
      countries: [],
      continent: "Europe",
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
    prepDataViewC(state, selection) {
      let nullIDs = [];
      let _data_ = [];
      for (let country of Object.keys(state.covidData)) {
        // Filter by continent if continent is specified
        if (selection.continent != "" && state.covidData[country].continent != selection.continent)
          continue;
        // Filter by countries if continent not specified
        if (selection.continent == "" && !(country in selection.countries))
          continue;
        // Track and omit null values
        if (state.covidData[country][selection.x] == undefined ||
            state.covidData[country][selection.y] == undefined) {
          nullIDs.push(country);
          continue;
        }
        _data_.push({
          iso_code: country,
          x: state.covidData[country][selection.x],
          y: state.covidData[country][selection.y],
          colChannel: "",
          sizeChannel: "",
        });
      }
      // Set the state of view C
      state.view_C = _data_;
    },
    prepDataViewD(state, selection) {
      
    },
    /*prepDataViewE(state, selection) {

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
      d3.json('./owid-covid-data.json').then((data) => {
        // Parse entire dataset
        context.state.covidData = data; 
        // Prepare data for intial state of each view
        context.commit("prepDataViewC", context.state.selectionC);
        context.commit("prepDataViewD", context.state.selectionD);
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
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
      x: [],
      ys: ["AUT", "DEU", "FRA", "IRL"],
      country: false,
      feature: "new_cases_smoothed",
    },
    selectionC: {
      dateRange: [],
      x: "gdp_per_capita",
      y: "cardiovasc_death_rate",
      colorChannel: "",
      sizeChannel: "",
      countries: [],
      continent: "Europe",
    },
    selectionD: {
      x: [],
      y: "people_fully_vaccinated",
      countries: [],
      continent: "Europe",
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
        state.dataViewA = _data_;
      }
    },*/
    prepDataViewB(state, selection) {
      //let nullIDs = [];
      if (selection.x.length == 2) {
        var left_date = d3.timeParse("%Y-%m-%d")(selection.x[0]);
        var right_date = d3.timeParse("%Y-%m-%d")(selection.x[1]);
      }
      let check = true;
      state.dataViewB = [];
      
      if (selection.feature) {
        check = false;
        for (let country of selection.ys) {
          let obj = {
            country: "", 
            feature: "", 
            data: [],
          };
          obj.country = country;
          obj.feature = selection.feature;

          for (let day of state.covidData[country].data) {
            // Omit null values
            if (day[selection.feature] == undefined) continue;
            let date = d3.timeParse("%Y-%m-%d")(day.date);
            if (!date) continue;
            if (selection.x.length == 2) {
              if (date < left_date) continue;
              if (date > right_date) break;
            }
            obj.data.push({
              x: date,
              y: day[selection.feature],
            })
          }
          state.dataViewB.push(obj);
        }
      }
      if (check && selection.country) {
        for (let feat of selection.ys) {
          state.dataViewB.push({
            country: selection.country,
            feature: feat,
            data: [],
          })
        }
        for (let day of state.covidData[selection.country]) {
          let date = d3.timeParse("%Y-%m-%d")(day.date);
          if (!date) continue;
          if (selection.x.length == 2) {
            if (date < left_date) continue;
            if (date > right_date) break;
          }
          let idx = 0;
          for (let feature of selection.ys) {
            if (day[feature] == undefined) continue;
            state.dataViewB[idx].data.push({
              x: date,
              y: day[feature],
            })
            idx++;
          }
        }
      }
    },
    prepDataViewC(state, selection) {
      let nullIDs = [];
      let _data_ = [];
      
      for (let country in state.covidData) {
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
      state.dataViewC = _data_;
    },
    prepDataViewD(state, selection) {
      //let nullIDs = [];
      let count = 0;
      if (selection.x.length == 2) {
        var left_date = d3.timeParse("%Y-%m-%d")(selection.x[0]);
        var right_date = d3.timeParse("%Y-%m-%d")(selection.x[1]);
      }
      let _data_ = [];
      for (let country in state.covidData) {
        if (count == 10) break;
        // Filter by continent if continent is specified
        if (selection.continent != "" && state.covidData[country].continent != selection.continent)
          continue;
        // Filter by countries if continent not specified
        if (selection.continent == "" && !(country in selection.countries))
          continue;
  
        for (let day of state.covidData[country].data) {
          // Track and omit null values
          if (day[selection.y] == undefined) {
            //nullIDs.push(country);
            continue
          }
          let date = d3.timeParse("%Y-%m-%d")(day.date);
          // Continue or break respectively when out of the input date range
          if (! date) continue;
          if (selection.x.length == 2) {
            if (date < left_date) continue;
            if (date > right_date) break;
          }
          _data_.push({
            iso_code: country,
            x: date,
            y: day[selection.y],
          });
        }
        count++;
      }
      // Set the state of view D
      state.dataViewD = _data_;
    },
    /*prepDataViewE(state, selection) {

    },*/
  },
  getters: {
    dataViewA: state => state.dataViewA,
    dataViewB: state => state.dataViewB,
    dataViewC: state => state.dataViewC,
    dataViewD: state => state.dataViewD,
    dataViewE: state => state.dataViewE,
  },
  actions: {
    loadNPrepData(context) {
      d3.json('./owid-covid-data_preprocessed.json').then((data) => {
        // Parse entire dataset
        context.state.covidData = data;
        // Prepare data for intial state of each view
        context.commit("prepDataViewB", context.state.selectionB);
        context.commit("prepDataViewC", context.state.selectionC);
        context.commit("prepDataViewD", context.state.selectionD);
        // Allow DOM elements to be rendered only after data for each view is prepped
        context.state.dataIsReady = true;
        // Remove loading sign
        document.getElementById("loader_").remove();
      })
    },
  }
})

export default store;
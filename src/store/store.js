import Vue from 'vue';
import Vuex from 'vuex';
import * as d3 from 'd3';
import mapWorld from '@/assets/world-geo.json';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    percentageValues: [
      "aged_65_older", "aged_70_older", "extreme_poverty", "diabetes_prevalence",
      "female_smokers", "male_smokers", "handwashing_facilities"
    ],
    mapIsoCodeName: {},
    mapNameIsoCode: {},
    checkboxContent: "",
    extentDates: [],
    dataIsReady: false,
    allCountries: {
      Europe: [],
      Africa: [],
      Asia: [],
      "North America": [],
      "South America": [],
      Oceania: [],
    },
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
      ys: ["AUT", "DEU", "FRA", "IRL"],
      country: false,
      feature: "new_cases_smoothed_per_million",
    },
    selectionC: {
      x: "gdp_per_capita",
      y: "cardiovasc_death_rate",
      countries: ["AUT", "DEU", "FRA", "IRL"],
    },
    selectionD: {
      y: "new_deaths_smoothed_per_million",
      countries: ["AUT", "DEU", "FRA", "IRL"],
    },
    selectionE: {

    },
    pageWidth: 500,
    pageHeight: 500,
    controlA: "",
    controlB: {
      feature: "",
      country: "",
      ckecked: undefined,
      target: undefined,
    },
    controlC: {
      featX: "",
      featY: "",
      featCol: "",
      featSize: "",
      country: "",
      checked: undefined,
      target: undefined,
    },
    controlD: {
      feature: "",
      country: "",
      checked: undefined,
      target: undefined,
    },
  },
  mutations: {
    changeControlA(state, feature) {
      state.controlA = feature;
    },
    setDateRange(state) {
      let firstIteration = true;
      let minDate = undefined;
      let maxDate = undefined;

      for (let country of Object.values(state.covidData)) {
        if (firstIteration) {
          firstIteration = false;
          [minDate, maxDate] = d3.extent(country.data, d => d3.timeParse("%Y-%m-%d")(d.date));
          continue;
        }
        let [left_date, right_date] = d3.extent(country.data, d => d3.timeParse("%Y-%m-%d")(d.date));
        if (left_date < minDate)
          minDate = left_date;
        if (right_date > maxDate)
          maxDate = right_date;
      }
      state.extentDates = [minDate, maxDate];
    },
    prepDataViewB(state, selection) {
      //let nullIDs = [];
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
      //let nullIDs = [];
      let _data_ = [];
      
      for (let country of selection.countries) {
        // Track and omit null values
        if (state.covidData[country][selection.x] == undefined ||
            state.covidData[country][selection.y] == undefined) {
          //nullIDs.push(country);
          continue;
        }
        _data_.push({
          iso_code: country,
          x: state.covidData[country][selection.x],
          y: state.covidData[country][selection.y],
        });
      }
      // Set the state of view C
      state.dataViewC = _data_;
    },
    prepDataViewD(state, selection) {
      //let nullIDs = [];
      let _data_ = [];
      for (let country of selection.countries) 
        for (let day of state.covidData[country].data) {
          // Track and omit null values
          if (day[selection.y] == undefined) {
            //nullIDs.push(country);
            continue
          }
          let date = d3.timeParse("%Y-%m-%d")(day.date);
          // Continue or break respectively when out of the input date range
          if (! date) continue;

          _data_.push({
            iso_code: country,
            x: date,
            y: day[selection.y],
          });
        }
      // Set the state of view D
      state.dataViewD = _data_;
    },
    setUpMapIsoCodeName(state) {
      for (let feature of mapWorld.features) {
        if ("iso_a3" in feature.properties && "name" in feature.properties) {
          state.mapIsoCodeName[feature.properties.iso_a3] = feature.properties.name;
          state.mapNameIsoCode[feature.properties.name] = feature.properties.iso_a3;
        }
      }
      for (let iso_code in state.covidData) {
        if (iso_code.length == 3 && iso_code in state.mapIsoCodeName && "continent" in state.covidData[iso_code])
          state.allCountries[state.covidData[iso_code].continent].push(state.mapIsoCodeName[iso_code].slice());
      }
      state.allCountries.Europe.sort();
      state.allCountries.Africa.sort();
      state.allCountries.Asia.sort();
      state.allCountries['North America'].sort();
      state.allCountries['South America'].sort();
      state.allCountries.Oceania.sort();
    },
    setUpCheckBoxContent(state) {
      for (let continent in state.allCountries) {
        state.checkboxContent += `<span class="continent_section"> ${continent.toUpperCase()} </span>`;
        for (let countryName of state.allCountries[continent]) {
          state.checkboxContent += `<label><input type="checkbox" value="${state.mapNameIsoCode[countryName]}"`;
          if (["Austria", "Germany", "France", "Ireland"].includes(countryName))
            state.checkboxContent += " checked";
          state.checkboxContent += `/> ${countryName} </label></br>`;
        }
      }
    },
    changeControlCfeatX(state, val) {
      state.controlC.featX = val;
    },
    changeControlCfeatY(state, val) {
      state.controlC.featY = val;
    },
    changeControlCcolor(state, val) {
      state.controlC.featCol = val;
    },
    changeControlCsize(state, val) {
      state.controlC.featSize = val;
    },
    changeControlCcountry(state, val) {
      state.controlC.country = val.iso_code;
      state.controlC.checked = val.checked;
      state.controlC.target = val.target;
    },
    changeControlBcountry(state, val) {
      state.controlB.country = val.iso_code;
      state.controlB.checked = val.checked;
      state.controlB.target = val.target;
    },
    changeControlDcountry(state, val) {
      state.controlC.country = val.iso_code;
      state.controlC.checked = val.checked;
      state.controlC.target = val.target;
    },
    changeControlB(state, val) {
      state.controlB.feature = val;
    },
    changeControlD(state, val) {
      state.controlD.feature = val;
    },
  },
  getters: {
    dataViewA: state => state.dataViewA,
    dataViewB: state => state.dataViewB,
    dataViewC: state => state.dataViewC,
    dataViewD: state => state.dataViewD,
    dataViewE: state => state.dataViewE,
    extentDatesViewB: state => state.extentDates,
    covidData: state => state.covidData,
    mapIsoCodeName: state => state.mapIsoCodeName,
    initialCountriesC: state => state.selectionC.countries,
    initialCountriesD: state => state.selectionD.countries,
    allCountries: state => state.allCountries,
    percentageValues: state => state.percentageValues,
    checkboxContent: state => state.checkboxContent,
    // Control changes
    // A
    controlA: state => state.controlA,
    // B
    controlBfeature: state => state.controlB.feature,
    controlBtarget: state => state.controlB.target,
    controlBchecked: state => state.controlB.checked,
    controlBcountry: state => state.controlB.country,
    // C
    controlCfeatX: state => state.controlC.featX,
    controlCfeatY: state => state.controlC.featY,
    controlCcolor: state => state.controlC.featCol,
    controlCsize: state => state.controlC.featSize,
    controlCcountry: state => state.controlC.country,
    controlCchecked: state => state.controlC.checked,
    controlCtarget: state => state.controlC.target,
    // D
    controlDfeature: state => state.controlD.feature,
    controlDtarget: state => state.controlD.target,
    controlDchecked: state => state.controlD.checked,
    controlDcountry: state => state.controlD.country,
  },
  actions: {
    loadNPrepData(context) {
      d3.json('./owid-covid-data.json').then((data) => {
        // Freeze the data object, since values only need to be read
        // 1) decrease memory usage and 2) speed up initial loading times
        Object.freeze(data);
        // Add entire dataset to state of Vuex store
        context.state.covidData = data;
        // Set up map between Iso code and full country name
        context.commit("setUpMapIsoCodeName");
        // Create Html content for country selections on control board
        context.commit("setUpCheckBoxContent");
        // Set the date Range for viewB to minimum and maximum considering the entire dataset
        context.commit("setDateRange");
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
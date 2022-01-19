<template>
  <div class="view-E" ref="viewE">
    <div id="control-title" class="title_" style="height: 3.9vh; line-height: 3.9vh; vertical-align: middle;">
      Control Board
    </div>
    <div id="wrapper_controls">
      <div id="view-A-control" class="control-panel_">
        <strong>Choropleth Map</strong>
        <div class="wrapper_viewA">
          Select feature:
          <select id="viewA_selection" class="form-control" onchange='this.size=1; this.blur();'></select>
        </div>
      </div>
      <div id="view-B-control" class="control-panel_">
        <strong>Multiple Line Chart</strong>
        <br/>
        <!--<label class="switch">
          Compare by country/feature:
          <input type="checkbox" id="toggleElem">
        </label>-->
        <div class="wrapper_viewB">
          Select feature:
          <select id="viewB_selection" class="form-control" onchange='this.size=1; this.blur();'></select>
          Select countries:
          <div id="checkboxes_viewB" class="country-selection"></div>
        </div>
      </div>
      <div id="view-C-control" class="control-panel_">
        <strong>Scatter Chart</strong>
        <div class="wrapper_viewC">
          Encode on x-axis:
          <select id="viewC_x" class="form-control" onchange='this.size=1; this.blur();'></select>
          Encode on y-axis:
          <select id="viewC_y" class="form-control" onchange='this.size=1; this.blur();'></select>
          Encode by color:
          <select id="viewC_color" class="form-control" onchange='this.size=1; this.blur();'></select>
          Encode by size:
          <select id="viewC_size" class="form-control" onchange='this.size=1; this.blur();'></select>
          Select countries:
          <div id="checkboxes_viewC" class="country-selection"></div>
        </div>
      </div>
      <div id="view-D-control" class="control-panel_">
        <!--<svg><rect class="overlayRect"></rect></svg>-->
        <strong>Line Chart</strong>
        <div class="wrapper_viewD">
          Select feature:
          <select id="viewD_selection" class="form-control" onchange='this.size=1; this.blur();'></select>
          Select countries:
          <div id="checkboxes_viewD" class="country-selection"></div>
        </div>
      </div>
    </div>
  </div> 
</template>


<script>

import * as d3 from 'd3';

export default {
  name: 'ControlBoard',
  props: {
  },
  data() {
    return {
      viewA_features: [
        "total_cases_per_million", "new_cases_per_million", "total_deaths_per_million", "new_deaths_per_million",
        "icu_patients_per_million", "hosp_patients_per_million", "weekly_icu_admissions_per_million", "weekly_hosp_admissions_per_million",
        "stringency_index", "reproduction_rate", "total_tests_per_thousand", "new_tests_per_thousand", "positive_rate", "tests_per_case",
        "total_vaccinations_per_hundred", "people_vaccinated_per_hundred", "people_fully_vaccinated_per_hundred", "total_boosters_per_hundred",
        "median_age", "aged_65_older", "aged_70_older", "gdp_per_capita", "extreme_poverty", "cardiovasc_death_rate", "diabetes_prevalence",
        "female_smokers", "male_smokers", "handwashing_facilities", "life_expectancy", "human_development_index", "hospital_beds_per_thousand",
        "population_density"
      ],
      viewB_features: [
        "total_cases_per_million", "new_cases_per_million", "new_cases_smoothed_per_million", "total_deaths_per_million", "new_deaths_per_million",
        "icu_patients_per_million", "hosp_patients_per_million", "weekly_icu_admissions_per_million", "weekly_hosp_admissions_per_million",
        "stringency_index", "reproduction_rate", "total_tests_per_thousand", "new_tests_per_thousand", "positive_rate", "tests_per_case",
        "total_vaccinations_per_hundred", "people_vaccinated_per_hundred", "people_fully_vaccinated_per_hundred", "total_boosters_per_hundred",
        "new_deaths_smoothed_per_million"
      ],
      viewC_features: [
        "total_cases_per_million", "total_deaths_per_million",
        "icu_patients_per_million", "hosp_patients_per_million", "weekly_icu_admissions_per_million", "weekly_hosp_admissions_per_million",
        "stringency_index", "reproduction_rate", "total_tests_per_thousand", "positive_rate",
        "people_vaccinated_per_hundred", "people_fully_vaccinated_per_hundred", "total_boosters_per_hundred",
        "median_age", "aged_65_older", "aged_70_older", "gdp_per_capita", "extreme_poverty", "cardiovasc_death_rate", "diabetes_prevalence",
        "female_smokers", "male_smokers", "handwashing_facilities", "life_expectancy", "human_development_index", "hospital_beds_per_thousand",
        "population_density"
      ],
      viewD_features: [
        "total_cases_per_million", "new_cases_per_million", "total_deaths_per_million", "new_deaths_per_million",
        "icu_patients_per_million", "hosp_patients_per_million", "weekly_icu_admissions_per_million", "weekly_hosp_admissions_per_million",
        "stringency_index", "reproduction_rate", "total_tests_per_thousand", "new_tests_per_thousand", "positive_rate", "tests_per_case",
        "total_vaccinations_per_hundred", "people_vaccinated_per_hundred", "people_fully_vaccinated_per_hundred", "total_boosters_per_hundred",
        "total_cases", "new_cases", "new_cases_smoothed", "total_deaths", "new_deaths", "new_deaths_smoothed", "excess_mortality", "excess_mortality_cumulative_absolute",
        "icu_patients", "hosp_patients", "weekly_icu_admissions", "weekly_hosp_admissions", "total_tests", "new_tests", "new_tests_smoothed",
        "total_vaccinations", "people_vaccinated", "people_fully_vaccinated", "total_boosters",
        "new_cases_smoothed_per_million", "new_deaths_smoothed_per_million"
      ],
      initiallySelectedCountries: [
        "Austria", "Germany", "France", "Ireland"
      ],
      viewB: {
        features: [],
      },
      viewC: {
        featureX: [],
        featureY: [],
        sizeFeature: [],
        colorFeature: [],
      },
      viewD: {
        features: [],
      },
    }
  },
  mounted() {
    this.viewA_features.sort();
    this.viewB_features.sort();
    this.viewC_features.sort();
    this.viewD_features.sort();
    this.setUpHoverEvents();
    this.setUpSelectionViewA();
    this.setUpSelectionViewB();
    this.setUpSelectionViewC();
    this.setUpSelectionViewD();
    this.setUpCheckboxes();
    this.setUpListeners();
  },
  methods: {
    setUpListeners() {
      // Control A
      d3.select("#viewA_selection").on("change", this.handleControlA);
      // Control B
      d3.select("#viewB_selection").on("change", this.handleControlB);
      // Country list
      let divB = document.querySelector('#checkboxes_viewB');
      let checkboxesViewB = divB.querySelectorAll('input[type="checkbox"]');
      checkboxesViewB.forEach(checkbox => checkbox.addEventListener("change", this.handleCheckboxesB));
      // Control C
      d3.select("#viewC_x").on("change", this.handleXC);
      d3.select("#viewC_y").on("change", this.handleYC);
      d3.select("#viewC_color").on("change", this.handleColorC);
      d3.select("#viewC_size").on("change", this.handleSizeC);
      // Country list
      let divC = document.querySelector('#checkboxes_viewC');
      let checkboxesViewC = divC.querySelectorAll('input[type="checkbox"]');
      checkboxesViewC.forEach(checkbox => checkbox.addEventListener("change", this.handleCheckboxesC));
      // Control D
      d3.select("#viewD_selection").on("change", this.handleControlD);
      // Country list
      let divD = document.querySelector('#checkboxes_viewD');
      let checkboxesViewD = divD.querySelectorAll('input[type="checkbox"]');
      checkboxesViewD.forEach(checkbox => checkbox.addEventListener("change", this.handleCheckboxesD));
    },
    handleCheckboxesB(event) {
      let divB = document.querySelector('#checkboxes_viewB');
      let checkboxesViewB = divB.querySelectorAll('input[type="checkbox"]:checked');
      if (checkboxesViewB.length >= 9) {
        event.target.checked = false;
        let uncheckedBoxesViewB = divB.querySelectorAll('input[type="checkbox"]:not(:checked)');
        for (let checkbox of uncheckedBoxesViewB) {
          checkbox.disabled = true;
        }
        alert("Please note that you can select up to 8 countries.");
      }
      else {
        let uncheckedBoxesViewB = divB.querySelectorAll('input[type="checkbox"]:not(:checked)');
        for (let checkbox of uncheckedBoxesViewB) {
          checkbox.disabled = false;
        }
      }

      if (event.target.checked) {
        this.$store.commit("changeControlBcountry", {
          iso_code: event.target.value,
          checked: true,
          target: event.target,
        });
      }
      else {
        this.$store.commit("changeControlBcountry", {
          iso_code: event.target.value,
          checked: false,
          target: event.target,
        });
      }
    },
    handleCheckboxesC(event) {
      if (event.target.checked) {
        this.$store.commit("changeControlCcountry", {
          iso_code: event.target.value,
          checked: true,
          target: event.target,
        });
      }
      else {
        if (document.getElementById(`${event.target.value}_point`)) {
          document.getElementById(`${event.target.value}_point`).remove();
          document.getElementById(`${event.target.value}_pointlabel`).remove();
          this.$store.commit("changeControlCcountry", {
            iso_code: event.target.value,
            checked: false,
            target: event.target,
          });
        }
      }
    },
    handleCheckboxesD(event) {
      // Disable further country selection when currently 12 countries are selected
      // because this is the maximum number of countries I decided to encode simultaneously by colors
      // More than 12 countries could not be encoded easily anymore without decreasing distinguishability
      // between them
      let divD = document.querySelector('#checkboxes_viewD');
      let checkboxesViewD = divD.querySelectorAll('input[type="checkbox"]:checked');
      if (checkboxesViewD.length >= 13) {
        event.target.checked = false;
        let uncheckedBoxesViewD = divD.querySelectorAll('input[type="checkbox"]:not(:checked)');
        for (let checkbox of uncheckedBoxesViewD) {
          checkbox.disabled = true;
        }
        alert("To maintain overview in the chart, please note that you can only select up to 12 countries.");
      }
      else {
        let uncheckedBoxesViewD = divD.querySelectorAll('input[type="checkbox"]:not(:checked)');
        for (let checkbox of uncheckedBoxesViewD) {
          checkbox.disabled = false;
        }
      }

      if (event.target.checked) {
        this.$store.commit("changeControlDcountry", {
          iso_code: event.target.value,
          checked: true,
          target: event.target,
        });
      }
      else {
        if (document.getElementById(`${event.target.value}_lineD`)) {
          document.getElementById(`${event.target.value}_lineD`).remove();
          this.$store.commit("changeControlDcountry", {
            iso_code: event.target.value,
            checked: false,
            target: event.target,
          });
        }
      }
    },
    handleControlA(event) {
     this.$store.commit("changeControlA", event.target.value);
    },
    handleControlB(event) {
      this.$store.commit("changeControlB", event.target.value);
    },
    handleControlD(event) {
      this.$store.commit("changeControlD", event.target.value);
    },
    handleXC(event) {
      let divC = document.querySelector('#checkboxes_viewC');
      let checkboxesViewC = divC.querySelectorAll('input[type="checkbox"]');
      checkboxesViewC.forEach(d => d.disabled=false);

      this.$store.commit("changeControlCfeatX", event.target.value);
    },
    handleYC(event) {
      let divC = document.querySelector('#checkboxes_viewC');
      let checkboxesViewC = divC.querySelectorAll('input[type="checkbox"]');
      checkboxesViewC.forEach(d => d.disabled=false);
      
      this.$store.commit("changeControlCfeatY", event.target.value);
    },
    handleColorC(event) {
      this.$store.commit("changeControlCcolor", event.target.value);
    },
    handleSizeC(event) {
      this.$store.commit("changeControlCsize", event.target.value);
    },
    setUpSelectionViewA() {
      let selectionContent = "";
      for (let feature of this.viewA_features) {
        selectionContent += `<option value="${feature}"`;
        if (feature == "human_development_index")
          selectionContent += ` selected="selected"`;
        selectionContent += `>${this.formatFeatureText(feature)}</option>`;
      }
      
      d3.select("#viewA_selection").html(selectionContent);
    },
    setUpSelectionViewB() {
      let selectionContent = "";
      for (let feature of this.viewB_features) {
        selectionContent += `<option value="${feature}"`;
        if (feature == "new_cases_smoothed_per_million")
          selectionContent += ` selected="selected"`;
        selectionContent += `>${this.formatFeatureText(feature)}</option>`;
      }
      
      d3.select("#viewB_selection").html(selectionContent);
    },
    setUpSelectionViewC() {
      let selectX = "";
      let selectY = "";
      let selectColor = `<option value="None" style="font-weight: bold;">None</option>`;
      let selectSize = `<option value="None" style="font-weight: bold;">None</option>`;
      for (let feature of this.viewC_features) {
        selectX += `<option value="${feature}"`;
        selectY += `<option value="${feature}"`;
        selectColor += `<option value="${feature}"`;
        selectSize += `<option value="${feature}"`;
        if (feature == "gdp_per_capita")
          selectX += ` selected="selected"`;
        if (feature == "cardiovasc_death_rate")
          selectY += ` selected="selected"`;
        if (feature == "people_fully_vaccinated_per_hundred")
          selectColor += ` selected="selected"`;
        if (feature == "total_deaths_per_million")
          selectSize += ` selected="selected"`;
        selectX += `>${this.formatFeatureText(feature)}</option>`;
        selectY += `>${this.formatFeatureText(feature)}</option>`;
        selectColor += `>${this.formatFeatureText(feature)}</option>`;
        selectSize += `>${this.formatFeatureText(feature)}</option>`;
      }
      
      d3.select("#viewC_x").html(selectX);
      d3.select("#viewC_y").html(selectY);
      d3.select("#viewC_color").html(selectColor);
      d3.select("#viewC_size").html(selectSize);
    },
    setUpSelectionViewD() {
      let selectionContent = "";
      for (let feature of this.viewD_features) {
        selectionContent += `<option value="${feature}"`;
        if (feature == "new_deaths_smoothed_per_million")
          selectionContent += ` selected="selected"`;
        selectionContent += `>${this.formatFeatureText(feature)}</option>`;
      }
      
      d3.select("#viewD_selection").html(selectionContent);
    },
    setUpCheckboxes() {
      d3.select("#checkboxes_viewB").html(this.checkboxContent);
      d3.select("#checkboxes_viewC").html(this.checkboxContent);
      d3.select("#checkboxes_viewD").html(this.checkboxContent);
    },
    formatFeatureText(text) {
      let formattedText = text.split("_");
      for (let idx=0; idx < formattedText.length; idx++)
         formattedText[idx] = formattedText[idx].charAt(0).toUpperCase() 
                              + formattedText[idx].substring(1);
      return formattedText.join(" ");
    },
    handleMouseOver(event) {
      if (event.target.id == "view-A-control")
        d3.select("#ViewA_").style("border-width", "2px");
      if (event.target.id == "view-B-control")
        d3.select("#ViewB_").style("border-width", "2px");
      if (event.target.id == "view-C-control")
        d3.select("#ViewC_").style("border-width", "2px");
      if (event.target.id == "view-D-control")
        d3.select("#ViewD_").style("border-width", "2px");
    },
    handleMouseLeave(event) {
      if (event.target.id == "view-A-control")
        d3.select("#ViewA_").style("border-width", "1px");
      if (event.target.id == "view-B-control")
        d3.select("#ViewB_").style("border-width", "1px");
      if (event.target.id == "view-C-control")
        d3.select("#ViewC_").style("border-width", "1px");
      if (event.target.id == "view-D-control")
        d3.select("#ViewD_").style("border-width", "1px");
    },
    setUpHoverEvents() {
      d3.select("#view-A-control")
        .on("mouseover", this.handleMouseOver)
        .on("mouseleave", this.handleMouseLeave);
      d3.select("#view-B-control")
        .on("mouseover", this.handleMouseOver)
        .on("mouseleave", this.handleMouseLeave);
      d3.select("#view-C-control")
        .on("mouseover", this.handleMouseOver)
        .on("mouseleave", this.handleMouseLeave);
      d3.select("#view-D-control")
        .on("mouseover", this.handleMouseOver)
        .on("mouseleave", this.handleMouseLeave);
    },
  },
  computed: {
    covidData: {
      get() {
        return this.$store.getters.covidData;
      }
    },
    countryList: {
      get() {
        return this.$store.getters.allCountries;
      }
    },
    checkboxContent: {
      get() {
        return this.$store.getters.checkboxContent;
      }
    }
  },
  watch: {

  },
}

</script>

<style>

#control-title {
  transform: translateY(-10%);
  height: 3.9vh;
}

.view-E {
  width: calc(18.5vw - 2px);
  height: calc(100vh - 2px);
  background-color: rgb(195, 206, 255);
  border-radius: 5px;
  margin: 1px;
  margin-left: -1.4vw;
  border: 1px solid #000000;
  overflow-y: scroll;
  overflow-x: hidden;
}

.country-selection {
  text-anchor: start;
  text-align: left;
  overflow: auto;
  width: 98%;
  margin: 0 auto;
  border: 1px solid black;
  border-radius: 8px;
  margin-bottom: 4px;
  background-color: white;
  height: 35vh;
}

.country-selection label {
  margin: 0;
  margin-left: 1vw;
}

.country-selection input {
  margin-right: 1vw;
}

#view-A-control {
  margin: 1px 1px 0px 1px;
}

#view-B-control {
  margin: 10px 1px 0px 1px;
}

#view-C-control {
  margin: 10px 1px 0px 1px;
}

#view-D-control {
  margin: 10px 1px 0px 1px;
}

.control-panel_ {
  width: 99%;
  border-radius: 8px;
  border: 1px solid black;
  background-color: lightgrey;
}

.control-panel_:hover {
  border-width: 2px;
}

#wrapper_controls {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  font-family: Baskerville;
  font-size: calc((1.8vh + 1.4vw)/2);
}

.wrapper_viewA {
  margin-top: 0.2vh;
}

.wrapper_viewC {
  margin-top: 0px;
}

.switch {
  margin-bottom: 0px !important;
}

.form-control {
  box-shadow: none !important;
  border-radius: 8px !important;
  width: 99% !important;
  height: 100% !important;
  margin: 0 auto !important;
  font-size: 1em !important;
}

.continent_section {
  display: table;
  margin: 0 auto;
  margin-bottom: 3px;
  margin-top: 3px;
  font-weight: bold;
}

</style>
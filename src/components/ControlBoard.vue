<template>
  <div class="view-E" ref="viewE">
    <div id="control-title" class="title_" style="height: 3.9vh; line-height: 3.9vh; vertical-align: middle;">
      Control Board
    </div>
    <div id="wrapper_controls">
      <div id="view-A-control" class="control-panel_">
        <!--<svg><rect class="overlayRect"></rect></svg>-->
        Choropleth Map
        <div class="wrapper_viewA">
          <select id="viewA_selection" class="form-control" onfocus='this.size=5;' onblur='this.size=1;' onchange='this.size=1; this.blur();'>
          </select>
        </div>
      </div>
      <div id="view-B-control" class="control-panel_">
        <!--<svg><rect class="overlayRect"></rect></svg>-->
        Multiple Line Chart
      </div>
      <div id="view-C-control" class="control-panel_">
        <!--<svg><rect class="overlayRect"></rect></svg>-->
        Scatter Chart
      </div>
      <div id="view-D-control" class="control-panel_">
        <!--<svg><rect class="overlayRect"></rect></svg>-->
        Line Chart
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
      percentageValues: [
         "aged_65_older", "aged_70_older", "extreme_poverty", "diabetes_prevalence",
        "female_smokers", "male_smokers", "handwashing_facilities"
      ],
      viewA_features: [
        "total_cases_per_million", "new_cases_per_million", "total_deaths_per_million", "new_deaths_per_million",
        "icu_patients_per_million", "hosp_patients_per_million", "weekly_icu_admissions_per_million", "weekly_hosp_admissions_per_million",
        "stringency_index", "reproduction_rate", "total_tests_per_thousand", "new_tests_per_thousand", "positive_rate", "tests_per_case",
        "total_vaccinations_per_hundred", "people_vaccinated_per_hundred", "people_fully_vaccinated_per_hundred", "total_boosters_per_hundred",
        "median_age", "aged_65_older", "aged_70_older", "gdp_per_capita", "extreme_poverty", "cardiovasc_death_rate", "diabetes_prevalence",
        "female_smokers", "male_smokers", "handwashing_facilities", "life_expectancy", "human_development_index", "hospital_beds_per_thousand",
        "population_density"
      ],
      viewB: {
        countries: [],
        features: [],
      },
      viewC: {
        countries: [],
        featureX: [],
        featureY: [],
        sizeFeature: [],
        colorFeature: [],
      },
      viewD: {
        countries: [],
        features: [],
      },
    }
  },
  mounted() {
    this.percentageValues.sort();
    this.viewA_features.sort();
    this.setUpHoverEvents();
    this.setUpSelectionViewA();
  },
  methods: {
    setUpSelectionViewA() {
      //<option value="">One</option>
      let selectionContent = "";
      for (let feature of this.viewA_features) {
        selectionContent += `<option value="${feature}">${this.formatFeatureText(feature)}</option>`;
      }
      
      d3.select("#viewA_selection").html(selectionContent);
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
  width: calc(17vw - 2px);
  height: calc(100vh - 2px);
  background-color: rgb(195, 206, 255);
  border-radius: 5px;
  margin: 1px;
  border: 1px solid #000000;
}

#view-A-control {
  margin: 1px 1px 0px 1px;
}

#view-B-control {
  margin: 1px 1px 0px 1px;
}

#view-C-control {
  margin: 1px 1px 0px 1px;
}

#view-D-control {
  margin: 1px 1px 0px 1px;
}

.control-panel_ {
  width: 16.5vw;
  height: 23.75vh;
  border-radius: 8px;
  border: 1px solid black;
}

.control-panel_:hover {
  border-width: 2px;
}

/*.overlayRect {
  fill: gold;
  border-radius: 8px;
  height: calc(23.75vh - 4px);
  width: calc(16.5vw - 4px)
}*/

#wrapper_controls {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  font-family: Baskerville;
}

.wrapper_viewA {
  margin-top: 2px;
}

.form-control {
  box-shadow: none !important;
  border-radius: 8px !important;
  width: 99% !important;
  margin: 0 auto !important;
  font-size: 12px !important;
  overflow-x: scroll !important;
}

</style>
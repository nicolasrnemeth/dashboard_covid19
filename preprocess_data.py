import sys
import json

program, file_path = sys.argv

# Parse input data
with open(file_path, 'r') as ifile:
    owid_covidData = json.load(ifile)
    
# Preprocess input data by removing redundant information
for key in owid_covidData.keys():
    if "data" not in owid_covidData[key]:
        continue
    for idx in range(len(owid_covidData[key]["data"])):
        # Remove total_cases_per_million, new_cases_per_million and new_cases_smoothed_per_million
        if "total_cases_per_million" in owid_covidData[key]["data"][idx]:
            del owid_covidData[key]["data"][idx]["total_cases_per_million"]
        if "new_cases_per_million" in owid_covidData[key]["data"][idx]:
            del owid_covidData[key]["data"][idx]["new_cases_per_million"]
        if "new_cases_smoothed_per_million" in owid_covidData[key]["data"][idx]:
            del owid_covidData[key]["data"][idx]["new_cases_smoothed_per_million"]
        
        # Remove total_deaths_per_million, new_deaths_per_million and new_deaths_smoothed_per_million
        if "total_deaths_per_million" in owid_covidData[key]["data"][idx]:
            del owid_covidData[key]["data"][idx]["total_deaths_per_million"]
        if "new_deaths_per_million" in owid_covidData[key]["data"][idx]:
            del owid_covidData[key]["data"][idx]["new_deaths_per_million"]
        if "new_deaths_smoothed_per_million" in owid_covidData[key]["data"][idx]:
            del owid_covidData[key]["data"][idx]["new_deaths_smoothed_per_million"]
            
        # Remove icu_patients_per_million, hosp_patients_per_million,
        # weekly_icu_admissions_per_million and weekly_hosp_admissions_per_million
        if "icu_patients_per_million" in owid_covidData[key]["data"][idx]:
            del owid_covidData[key]["data"][idx]["icu_patients_per_million"]
        if "hosp_patients_per_million" in owid_covidData[key]["data"][idx]:
            del owid_covidData[key]["data"][idx]["hosp_patients_per_million"]
        if "weekly_icu_admissions_per_million" in owid_covidData[key]["data"][idx]:
            del owid_covidData[key]["data"][idx]["weekly_icu_admissions_per_million"]
        if "weekly_hosp_admissions_per_million" in owid_covidData[key]["data"][idx]:
            del owid_covidData[key]["data"][idx]["weekly_hosp_admissions_per_million"]
        
        # Remove total_tests_per_thousand, new_tests_per_thousand, 
        # new_tests_smoothed_per_thousand, 
        if "total_tests_per_thousand" in owid_covidData[key]["data"][idx]:
            del owid_covidData[key]["data"][idx]["total_tests_per_thousand"]
        if "new_tests_per_thousand" in owid_covidData[key]["data"][idx]:
            del owid_covidData[key]["data"][idx]["new_tests_per_thousand"]
        if "new_tests_smoothed_per_thousand" in owid_covidData[key]["data"][idx]:
            del owid_covidData[key]["data"][idx]["new_tests_smoothed_per_thousand"]
        
        # Remove total_vaccinations_per_hundred, people_vaccinated_per_hundred
        # people_fully_vaccinated_per_hundred, total_boosters_per_hundred 
        # new_vaccinations_smoothed_per_million, new_people_vaccinated_smoothed_per_hundred
        if "total_vaccinations_per_hundred" in owid_covidData[key]["data"][idx]:
            del owid_covidData[key]["data"][idx]["total_vaccinations_per_hundred"]
        if "people_vaccinated_per_hundred" in owid_covidData[key]["data"][idx]:
            del owid_covidData[key]["data"][idx]["people_vaccinated_per_hundred"]
        if "people_fully_vaccinated_per_hundred" in owid_covidData[key]["data"][idx]:
            del owid_covidData[key]["data"][idx]["people_fully_vaccinated_per_hundred"]
        if "total_boosters_per_hundred" in owid_covidData[key]["data"][idx]:
            del owid_covidData[key]["data"][idx]["total_boosters_per_hundred"]
        if "new_vaccinations_smoothed_per_million" in owid_covidData[key]["data"][idx]:
            del owid_covidData[key]["data"][idx]["new_vaccinations_smoothed_per_million"]
        if "new_people_vaccinated_smoothed_per_hundred" in owid_covidData[key]["data"][idx]:
            del owid_covidData[key]["data"][idx]["new_people_vaccinated_smoothed_per_hundred"]
            
        # Remove tests_units, positive_rate
        if "tests_units" in owid_covidData[key]["data"][idx]:
            del owid_covidData[key]["data"][idx]["tests_units"]
        if "positive_rate" in owid_covidData[key]["data"][idx]:
            del owid_covidData[key]["data"][idx]["positive_rate"]

# Write preprocessed data object to file
output_filename = file_path.split("/")[-1]
output_filename = file_path.split(".")[0]
with open(output_filename+"_preprocessed.json", 'w') as ofile:
    json_string = json.dumps(owid_covidData)
    ofile.write(json_string)
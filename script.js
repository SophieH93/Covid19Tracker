window.onload = () => {
    getCountriesData();
    getHistoricalData();
    getWorldCoronaData();    
}

let map;
let infoWindow;
let coronaGlobalyData;
let mapCircles = [];
const worldwideSelection = {
    name: 'Worldwide',
    value: 'www',
    selected: true
}

var casesTypeColours = {
    cases: '#ad7e31',
    active: '#9d80fe',
    recovered: '#7dd71d',
    deaths: '#fb4443'
}

const mapCenter = {
    lat: 34.80746,
    lng: -40.4796
}

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: mapCenter,
        zoom: 2.5,
        styles: mapStyle
    });
    infoWindow = new google.maps.InfoWindow();
}

const changeDataSelection = (elem, casesType) => {
    clearTheMap();
    showDataOnMap(coronaGlobalyData, casesType);
    setActiveTab(elem);
}

const setActiveTab = (elem) => {
    const activeElement = document.querySelector('.card.active');
    activeElement.classList.remove('active');
    elem.classList.add("active");
}

const clearTheMap = () => {
    // Clears the markers on the map
    for(let circle of mapCircles) {
        circle.setMap(null);
    }
}

const setMapCenter = (lat, long, zoom) => {
    // Changes the center of the map
    map.setZoom(zoom);
    map.panTo({
        lat: lat,
        lng: long
    });
}


const initDropdown = (searchList) => {
    $('.ui.dropdown').dropdown({
        values: searchList,
        onChange: function(value, text) {
            if(value !== worldwideSelection.value){
                getCountryData(value);               
            } else {
                getWorldCoronaData();
            }           
        }
    });
}

const setSearchList = (data) => {
    // Function to select all countries from dropdown
    let searchList = [];
    searchList.push(worldwideSelection);
    data.forEach((countryData)=>{
        searchList.push({
            name: countryData.country,
            value: countryData.countryInfo.iso3
        })
    })
    initDropdown(searchList);
}

const getCountriesData = () => {
    // Fetch data from Covid API
    fetch("http://localhost:3000/countries")
    .then((response)=>{
        return response.json()
    }).then((data)=>{
        coronaGlobalyData = data;
        setSearchList(data);
        showDataOnMap(data);
        showDataInTable(data);     
    })
}

const getCountryData = (countryIso) => {
    const url = "https://disease.sh/v3/covid-19/countries/" + countryIso;
    fetch(url)
    .then((response)=>{
        return response.json()
    }).then((data)=>{
        setMapCenter(data.countryInfo.lat, data.countryInfo.long, 3);
        setStatsData(data);
    })
}

const getHistoricalData = () => {
    fetch("https://disease.sh/v3/covid-19/historical/all?lastdays=30")
    .then((response)=>{
        return response.json()
    }).then((data)=>{
      let chartData = buildChartData(data);
      buildChart(chartData);
    })
}

const getWorldCoronaData = () =>{
    fetch("https://disease.sh/v3/covid-19/all")
    .then((response)=>{
        return response.json()
    }).then((data)=>{
        buildPieChart(data);
        setStatsData(data);
        setMapCenter(mapCenter.lat, mapCenter.long, 2);

    })
}



const setStatsData = (data) => {
    let addedCases = numeral(data.todayCases).format('+0,0');
    let addedRecovered = numeral(data.todayRecovered).format('+0,0');
    let addedDeaths = numeral(data.todayDeaths).format('+0,0');

    let totalCases = numeral(data.cases).format('0.0a');
    let totalDeaths= numeral(data.deaths).format('0.0a');
    let totalVaccine= numeral(data.vaccine).format('0.0a');
    let totalRecovered = numeral(data.recovered).format('0.0a');
    document.querySelector('.total-number').innerHTML = addedCases;  
    document.querySelector('.recovered-number').innerHTML = addedRecovered;
    document.querySelector('.deaths-number').innerHTML = addedDeaths;
    document.querySelector('.cases-total').innerHTML = `${totalCases} Total`;
    document.querySelector('.recovered-total').innerHTML = `${totalRecovered} Total`;
    document.querySelector('.deaths-total').innerHTML = `${totalDeaths} Total`;
    document.querySelector('.vaccine-total').innerHTML = `${totalVaccine} Total`;

}

const showDataOnMap = (data, casesType="cases") => {
    // Show data on map
    data.map((country)=> {
        let countryCenter = {
            lat: country.countryInfo.lat,
            lng: country.countryInfo.long
        }

        let countryCircle = new google.maps.Circle({
            strokeColor: casesTypeColours[casesType],
            strokeOpacity: 0.8,
            strokeWeight: 1,
            fillColor: casesTypeColours[casesType],
            fillOpacity: 0.20,
            map: map,
            center: countryCenter,
            radius: country[casesType]
          });  

          mapCircles.push(countryCircle);

          let html = `
            <div class="info-container">
                <div class="info-flag" style="background-image: url(${country.countryInfo.flag});">                    
                </div>
                <div class="info-name">
                    ${country.country}
                </div>
                <div class="info-confirmed">
                Total: ${country.cases}
                </div>
                <div class="info-recovered">
                   Recovered:  ${country.recovered}
                </div>
                <div class="info-deaths">
                 Deaths: ${country.deaths}
                </div>
                
            </div>          
          `

          let infoWindow = new google.maps.InfoWindow({
            content: html,
            position: countryCircle.center
          });
          google.maps.event.addListener(countryCircle, 'mouseover', function() {
            infoWindow.open(map);
        });

        google.maps.event.addListener(countryCircle, 'mouseout', function(){
            infoWindow.close();
        })

    })    
}

const showDataInTable = (data) => {
    // Displays table data
    var html = '';
    data.forEach((country)=>{
        html += `
            <tr>
            <th class="table-heading"><img src="${
                country.countryInfo.flag
              }" /> ${country.country}</th>                            
              <td>${numeral(country.cases).format('0,0')}</td>
                
            </tr>        
        `
    })
    document.getElementById('table-data').innerHTML = html;
    
    
}

// Toggle switch for dark mode
document.addEventListener("DOMContentLoaded", function(event) {
    document.documentElement.setAttribute("data-theme", "light");
    var themeSwitcher = document.getElementById("theme-switcher");
    themeSwitcher.onclick = function() {
      var currentTheme = document.documentElement.getAttribute("data-theme");
      var switchToTheme = currentTheme === "dark" ? "light" : "dark"
      document.documentElement.setAttribute("data-theme", switchToTheme);
    }
});
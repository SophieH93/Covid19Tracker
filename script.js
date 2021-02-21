window.onload = () => {
    getCountryData();
    getHistoricalData();
    getWorldCoronaData();
    
}

let map;
let infoWindow;
let coronaGlobalyData;
let mapCircles = [];
var casesTypeColours = {
    cases: '#1d2c4d',
    active: '#9d80fe',
    recovered: '#7dd71d',
    deaths: '#fb4443'
}


function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: {lat: 53.350140, lng: -6.266155},
        zoom: 2,
        styles: mapStyle
    });
    infoWindow = new google.maps.InfoWindow();
}

const changeDataSelection = (casesType) => {
    clearTheMap();
    showDataOnMap(coronaGlobalyData, casesType);
}

const clearTheMap = () => {
    // Clears the markers on the map
    for(let circle of mapCircles) {
        circle.setMap(null);
    }
}

const getCountryData = () => {
    // Fetch data from Covid API
    fetch("http://localhost:3000/countries")
    .then((response)=>{
        return response.json()
    }).then((data)=>{
        coronaGlobalyData = data;
        showDataOnMap(data);
        showDataInTable(data);       
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
    })
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
            strokeWeight: 2,
            fillColor: casesTypeColours[casesType],
            fillOpacity: 0.35,
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
    let html = '';
    data.forEach((country)=>{
        html += `
            <tr>
                <td>${country.country}</td>
                <td>${country.cases}</td>
                <td>${country.recovered}</td>
                <td>${country.deaths}</td>
            </tr>        
        `
    })
    document.getElementById('table-data').innerHTML = html;
}
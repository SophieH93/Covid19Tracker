

window.onload = () => {
    getCountryData();
    buildChart();
    getHistoricalData();
}

let map;
let infoWindow;

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: {lat: 53.350140, lng: -6.266155},
        zoom: 2,
        styles: mapStyle
    });
    infoWindow = new google.maps.InfoWindow();
}


const getCountryData = () => {
    // Fetch data from Covid API
    fetch("https://disease.sh/v3/covid-19/countries")
    .then((response)=>{
        return response.json()
    }).then((data)=>{
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

const buildChartData = (data) => {
    let chartData = [];
    for(let date in data.cases){
        let newDataPoint = {
            x: date,
            y: data.cases[date]
        }
        chartData.push(newDataPoint);
    }
    return chartData;
}

const buildChart = (chartData) => {
    var timeFormat = 'MM/DD/YY';
    var ctx = document.getElementById('myChart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Total Cases',
                backgroundColor: '#1d2c4d',
                borderColor: '#1d2c4d',
                data: chartData
            }]
        },

        options: {
            tooltips: {
                mode: 'index',
                intersect: false,
            },
            scales:     {
                xAxes: [{
                    type: "time",
                    time: {
                        format: timeFormat,
                        tooltipFormat: 'll' 
                    },
                    scaleLabel: {
                        display: true,
                        lableString: 'Date'
                    }
                }],
                yAxes: [{
                    ticks: {
                        callback: function(value, index, values) {
                            return numeral(value).format('0a');
                        }
                    }              
                }]
            }
        }
    });
}

const showDataOnMap = (data) => {
    // Show data on map

    data.map((country)=> {
        let countryCenter = {
            lat: country.countryInfo.lat,
            lng: country.countryInfo.long
        }

        let countryCircle = new google.maps.Circle({
            strokeColor: "#FF0000",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#FF0000",
            fillOpacity: 0.35,
            map: map,
            center: countryCenter,
            radius: country.casesPerOneMillion * 15,
          });  

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

const buildChartData = (data) => {
    let chartData = [];
    let lastDataPoint;
    for(let date in data.cases){
        if(lastDataPoint){
            let newDataPoint = {
                x: date,
                y: data.cases[date] - lastDataPoint
          }   
           chartData.push(newDataPoint);        
        }        
        lastDataPoint = data.cases[date];
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
                backgroundColor: '#f15572',
                borderColor: '#cc1034',
                data: chartData
            }]
        },
        options: {
            maintainAspectRatio: false,
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
                }],
                yAxes: [{
                    gridLines: {
                        display: false
                    },
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

const buildPieChart = (data) => {
    var ctx = document.getElementById('myPieChart').getContext('2d');
    var myPieChart = new Chart(ctx, {
        type: 'pie',
        data:  {
            datasets: [{
                data: [
                    data.active,
                    data.recovered, 
                    data.deaths
                ],
                backgroundColor: [
                    '#9d80fe',
                    '#7dd71d',
                    'fb4443'                   
                ]
            }],
            labels: [
                'Active',
                'Recovered',
                'Deaths'
            ]
        },      
        options: {
            maintainAspectRatio: false,
        }  
    });
}
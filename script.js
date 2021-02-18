

window.onload = () => {
    getCountryData();
}

let map;
function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: {lat: -34.397, lng: 150.644},
        zoom: 8,
    });
}

const getCountryData = () => {
    // Fetch data from Covid API
    fetch("https://disease.sh/v3/covid-19/countries")
    .then((response)=>{
        return response.json()
    }).then((data)=>{
        console.log(data);
    })
}
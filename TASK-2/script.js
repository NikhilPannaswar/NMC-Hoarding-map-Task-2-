var map;
var markers = [];
var myLocationMarker = null;
var myLocationCircle = null;
var filteredMarkers = [];

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 21.1458, lng: 79.0882 },
        zoom: 13
    });

    populateSurveyDates();
    addMarkers();

    map.addListener('dblclick', function (e) {
        setMyLocation(e.latLng);
    });

    // Add change listeners to all checkboxes
    document.querySelectorAll('input[name="category"]').forEach(input => {
        input.addEventListener('change', filterMarkers);
    });

    document.getElementById('survey-date').addEventListener('change', filterMarkers);

    // "Show All" Button event listener
    document.getElementById('showAll').addEventListener('click', showAllMarkers);
}

function addMarkers() {
    locations.forEach(function (location) {
        var markerColor = getMarkerColorByCategory(location.category);
        var marker = new google.maps.Marker({
            position: { lat: location.latitude, lng: location.longitude },
            map: map,
            title: location.fileNumber.toString(),
            icon: `http://maps.google.com/mapfiles/ms/icons/${markerColor}-dot.png`
        });

        var infoWindow = new google.maps.InfoWindow({
            content: `
                <div style="width: 250px;">
                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRbcrj53mGyk-u4JwrIb6z1RBAeCpxR78gfQ&s" 
                         alt="Image" style="width: 100%; height: auto;">
                    <p><strong>File Number:</strong> ${location.fileNumber}</p>
                    <p><strong>Date of Survey:</strong> ${location.dateOfSurvey}</p>
                    <p><strong>Address:</strong> ${location.address}</p>
                    <p><strong>Category:</strong> ${location.category}</p>
                </div>`
        });

        marker.addListener('click', function () {
            infoWindow.open(map, marker);
        });

        markers.push(marker);
    });
}

function getMarkerColorByCategory(category) {
    switch (category) {
        case 'A': return 'blue';
        case 'B': return 'red';
        case 'C': return 'green';
        default: return 'red';
    }
}

function populateSurveyDates() {
    var surveyDates = [...new Set(locations.map(loc => loc.dateOfSurvey))];
    var surveyDateDropdown = document.getElementById('survey-date');
    surveyDates.forEach(function (date) {
        var option = document.createElement('option');
        option.value = date;
        option.textContent = date;
        surveyDateDropdown.appendChild(option);
    });
}

function filterMarkers() {
    var selectedCategories = Array.from(document.querySelectorAll('input[name="category"]:checked')).map(checkbox => checkbox.value);
    var selectedDate = document.getElementById('survey-date').value;

    markers.forEach(marker => marker.setVisible(false));

    filteredMarkers = markers.filter(function (marker, index) {
        var location = locations[index];

        var categoryMatches = selectedCategories.includes('all') || selectedCategories.includes(location.category);
        var dateMatches = selectedDate === 'all' || location.dateOfSurvey === selectedDate;

        return categoryMatches && dateMatches;
    });

    filteredMarkers.forEach(marker => marker.setVisible(true));
}

function setMyLocation(latLng) {
    if (myLocationMarker) myLocationMarker.setMap(null);
    if (myLocationCircle) myLocationCircle.setMap(null);

    myLocationMarker = new google.maps.Marker({
        position: latLng,
        map: map,
        title: "My Location",
        icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
    });

    myLocationCircle = new google.maps.Circle({
        map: map,
        radius: 200,
        fillColor: '#00AAFF',
        strokeColor: '#0000FF',
        strokeOpacity: 0.35,
        fillOpacity: 0.2,
        center: latLng
    });

    hideMarkersOutsideRadius(latLng);
}

function hideMarkersOutsideRadius(latLng) {
    filteredMarkers.forEach(function (marker) {
        var distance = google.maps.geometry.spherical.computeDistanceBetween(marker.getPosition(), latLng);
        marker.setVisible(distance <= 200);
    });
}

function showAllMarkers() {
    markers.forEach(function (marker) {
        marker.setVisible(true);
    });

    if (myLocationMarker) myLocationMarker.setMap(null);
    if (myLocationCircle) myLocationCircle.setMap(null);

    document.getElementById('survey-date').value = 'all';
    document.querySelectorAll('input[name="category"]').forEach(checkbox => checkbox.checked = false);
    document.querySelector('input[name="category"][value="all"]').checked = true;
}

var map,
	infowindow,
	markers = [];

function initMap() {
  var location = new google.maps.LatLng(37.769, -122.446);	
  map = new google.maps.Map(document.getElementById('map'), {
    center: location,
    zoom: 18
  });
  infowindow = new google.maps.InfoWindow();
  var request = {
  	location: location,
  	radius: 55
  };
  service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, callback);

  google.maps.event.addDomListener(window, 'load', render);
}

function callback(results, status) {
	if (status === google.maps.places.PlacesServiceStatus.OK) {
		for (var i = 0, len = results.length; i < len; i++) { 
			//markers.push(results[i]);
			createMarker(results[i]);
		}
		// render();
	}
}

function createMarker(place) {
	var mark = new google.maps.Marker({
		map: map,
		position: place.geometry.location,
		title: place.name
	});
	google.maps.event.addListener(mark, 'click', function() {
		infowindow.setContent(this.getTitle());
		infowindow.open(map, this);
	});
	markers.push(mark);
}

function render() {
	var viewModel = {
		markers: ko.observableArray(markers),
		moveMarkerCenter: function(marker) {
			map.panTo(marker.getPosition());
			infowindow.setContent(marker.getTitle());
			infowindow.open(map, marker);
		}		
	};

	ko.applyBindings(viewModel);
}
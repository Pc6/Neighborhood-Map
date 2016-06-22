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

  	// use nearbySearch to find the neighborhood location
  	service.nearbySearch(request, callback); 

  	// After loading the map, the render() function will run
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
		loadData(this);
		map.panTo(this.getPosition());
	});
	markers.push(mark);
}

function render() {
	function ViewModel() {
		var self = this; 
		self.markers = ko.observableArray(markers);
		self.filterText = ko.observable('');
		self.moveMarkerCenter = function(marker) {
			loadData(marker);
			map.panTo(marker.getPosition());
			// infowindow.setContent(marker.getTitle());
			// infowindow.open(map, marker);
		};
		self.filterMarker = ko.computed(function() {
			var searchVal = self.filterText().toLowerCase();
			if (!searchVal) {
				return self.markers();
			} else {
				return self.markers().filter(function(item) {
					return stringStartsWith(item.getTitle().toLowerCase(), searchVal);
				});
			}
		}, this);
		self.filterClicked = function() {
			self.markers().forEach(function(ele) {
				ele.setMap(null);
			});
			self.filterMarker().forEach(function(ele) {
				ele.setMap(map);
			});
			self.moveMarkerCenter(self.filterMarker()[0]);
		};
	}

	ko.applyBindings(new ViewModel());
}

function stringStartsWith(string, prefix) {
	return string.slice(0, prefix.length) === prefix;
}

function loadData(marker) {
	var url = 'https://en.wikipedia.org/w/api.php?action=opensearch&format=json&'
		+ 'search=' + marker.getTitle(),
		t = setTimeout(function() {
			marker.setAnimation(null);
			infowindow.setContent('Content fails to load');
			infowindow.open(map, marker);
		}, 4000);
	marker.setAnimation(google.maps.Animation.BOUNCE);
	$.ajax(url, {
		dataType: 'jsonp'
	}).done(function(data) {
		// console.log(data);
		clearTimeout(t);
		var str = '<h4>' + data[0] + '</h4>';
		str += '<p>' + (data[2][0] || data[2][1] || 'No wikipedia entry found.')
			+ '</p>';
		marker.setAnimation(null);
		infowindow.setContent(str);
		infowindow.open(map, marker);
	});
}

// deal with the error when map fails to load
function googleError() {
	var mapNode = document.getElementById('map');
	mapNode.innerHTML = '<h2>Sorry to tell you that ' 
		+ 'Google Map fails to load:(</h2>';
}
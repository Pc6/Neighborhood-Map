var map,
	infowindow,
	viewModel,
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
  	// google.maps.event.addDomListener(window, 'load', render);
}

function callback(results, status) {
	if (status === google.maps.places.PlacesServiceStatus.OK) {
		for (var i = 0, len = results.length; i < len; i++) { 
			//markers.push(results[i]);
			createMarker(results[i]);
		}
		viewModel.markers(markers);
	} else {
		alert('Sorry to you that you live alone:(');
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
		self.drawerState = ko.observable(false);
		self.markers = ko.observableArray();
		self.filterText = ko.observable('');
		self.toggleDrawer = function() {
			self.drawerState(!self.drawerState());
		};
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
	viewModel = new ViewModel();
	ko.applyBindings(viewModel);
}

function stringStartsWith(string, prefix) {
	return string.indexOf(prefix) >= 0;
}

function loadData(marker) {
	
	function nonce_generate() {
	  	return (Math.floor(Math.random() * 1e12).toString());
	}

	var yelp_url = 'https://api.yelp.com/v2/search',

		t = setTimeout(function() {
			marker.setAnimation(null);
			infowindow.setContent('Content fails to load');
			infowindow.open(map, marker);
		}, 4000),

	    parameters = {
	      	oauth_consumer_key: 'NoKY8ZU-ErLq0F6doFKDGQ',
	      	oauth_token: 'O5GKx4O67xP-4osKQj33sl2cIGHjLh6E',
	      	oauth_nonce: nonce_generate(),
	      	oauth_timestamp: Math.floor(Date.now()/1000),
	      	oauth_signature_method: 'HMAC-SHA1',
	      	oauth_version : '1.0',
	      	callback: 'cb',
	      	location: 'San Francisco',
	      	term: marker.getTitle(),
	      	limit: 1   
	    };

	encodedSignature = oauthSignature.generate('GET',yelp_url, parameters, 
		'v0Bz4eq9up_BIU6macAL7K_plKQ', 'UwK27MA-UsQiQVXjzhqV596MD-4');
	parameters.oauth_signature = encodedSignature;

	var settings = {
	    url: yelp_url,
	    data: parameters,
	    cache: true,       
	    dataType: 'jsonp',
	    success: function(data) {
	        console.log(data);
	        clearTimeout(t);
	        var str = '';
	        if (data.businesses.length) {
	        	var business = data.businesses[0];
	        	str += '<h4>' + business.name + '</h4><p>'
	        		+ business.snippet_text + '</p>';
	        } else {
	        	str += '<h4>' + marker.getTitle() + '</h4><p>'
	        		+ 'No Yelp entry found:(</p>'; 
	        }	        
	        marker.setAnimation(null);
	        infowindow.setContent(str);
	        infowindow.open(map, marker);
	      }
	    };

	marker.setAnimation(google.maps.Animation.BOUNCE); // set the animation

	// Send AJAX query via jQuery library.
	$.ajax(settings);
}

// deal with the error when map fails to load
function googleError() {
	var mapNode = document.getElementById('map');
	mapNode.innerHTML = '<h2>Sorry to tell you that ' 
		+ 'Google Map fails to load:(</h2>';
}

// render the app
render();
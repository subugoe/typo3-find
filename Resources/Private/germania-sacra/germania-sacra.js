/*
 * JavaScript for Germania Sacra display.
 *
 * 2013 Sven-S. Porst, SUB Göttingen <porst@sub.uni-goettingen.de>
 */
var germaniaSacra = (function () {
	var klosterID = undefined;
	var standorte = undefined;


	var initialise = function (config) {
		klosterID = config.ID;
		standorte = config.standorte;
		loadScript();
	};


	var mapsReady = function () {
		google.maps.visualRefresh = true;
		var mapOptions = {
			'mapTypeId': google.maps.MapTypeId.ROADMAP,
			'streetViewControl': false,
			'scrollwheel': false
		};

		var mapContainer = document.getElementById('c-' + klosterID + '-map');
		var map = new google.maps.Map(mapContainer, mapOptions);
		var containingBounds = new google.maps.LatLngBounds();
		var institutionengenau = false;
		for (var standortIndex in standorte) {
			var standort = standorte[standortIndex];
			var koordinaten = standort.koordinaten.split(',');
			if (koordinaten.length === 2) {
				var lat = parseFloat(koordinaten[0]);
				var long = parseFloat(koordinaten[1]);
				if (lat !== NaN && long !== NaN) {
					var point = new google.maps.LatLng(lat, long);
					new google.maps.Marker({
						'map': map,
						'position': point,
						'title': standort.titel,
						'zIndex': 100
					});
					containingBounds.extend(point);
					addNearby(map, standort.queryURL);
				}
			}
			institutionengenau |= standort.institutionengenau;
		}

		addBistumsgrenzen(map);

		var NE = containingBounds.getNorthEast();
		var SW = containingBounds.getSouthWest();
		var center = containingBounds.getCenter();
		var width = Math.abs(NE.lng() - SW.lng());
		var minimumWidth = 0.01 * (institutionengenau ? 1 : 10);
		if (width < minimumWidth) {
			containingBounds = new google.maps.LatLngBounds(
				new google.maps.LatLng(SW.lat(), center.lng() - minimumWidth/2),
				new google.maps.LatLng(NE.lat(), center.lng() + minimumWidth/2)
			);
		}
		map.fitBounds(containingBounds);
	};


	var addNearby = function (map, queryURL) {
		jQuery.getJSON(queryURL, function (data) {
			var results = data.response.docs;
			for (var docIndex in results) {
				var result = results[docIndex];
				if (result.id !== klosterID) {
					var points = result.koordinaten;
					for (var pointIndex in points) {
						var coordinateStrings = points[pointIndex].split(',');
						var lat = parseFloat(coordinateStrings[0]);
						var long = parseFloat(coordinateStrings[1]);
						var point = new google.maps.LatLng(lat,long);
						var title = result.kloster;
						var marker = new google.maps.Marker({
							'map': map,
							'position': point,
							'title': title,
							'icon': 'http://maps.google.com/mapfiles/kml/paddle/red-circle-lv.png',
							'zIndex': 50
						});
					}
				}
			}
		});
	};


	var addBistumsgrenzen = function (map) {
		var baseURL = 'http://vlib.sub.uni-goettingen.de/test/typo3conf/ext/solr_frontend/Resources/Private/germania-sacra/Bistumsgrenzen/';
		new google.maps.KmlLayer({
			'map': map,
			'preserveViewport': true,
			'url': baseURL + 'Bistumsgrenzen.kml'
		});
	};


	var loadScript = function () {
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&callback=germaniaSacra.mapsReady';
		document.body.appendChild(script);
	};


	return {
		initialise: initialise,
		mapsReady: mapsReady
	};
	
})();
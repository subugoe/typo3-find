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
		var iconForStandort = function (standortInfo, ordenInfos) {
			var icon = 'http://maps.google.com/mapfiles/kml/paddle/red-circle-lv.png';

			var matchingOrden = [];
			for (var ordenIndex in ordenInfos) {
				var ordenInfo = ordenInfos[ordenIndex];
				if (standortInfo.von < ordenInfo.bis && ordenInfo.von < standortInfo.bis) {
					matchingOrden.push(ordenInfo);
				}
			}
			if (matchingOrden.length === 1 && matchingOrden[0].graphik !== '') {
				// Unique orden with an icon: use it.
				var fileName = matchingOrden[0].graphik;
				var iconURL = 'http://vlib.sub.uni-goettingen.de/test/typo3conf/ext/find/Projects/germania-sacra/Resources/Ordenssymbole/' + fileName + '.png';
				var size = new google.maps.Size(20, 30);
				var origin = new google.maps.Point(0,0);
				var anchor = new google.maps.Point(10, 30);
				icon = new google.maps.MarkerImage(iconURL, size, origin, anchor);
			}

			return icon;
		};

		jQuery.getJSON(queryURL, function (data) {
			var results = data.response.docs;
			for (var docIndex in results) {
				var result = results[docIndex];
				if (result.id !== klosterID) {
					var standorte = [];
					var points = result.koordinaten;

					if (points) {
						for (var pointIndex in points) {
							var coordinateStrings = points[pointIndex].split(',');
							var lat = parseFloat(coordinateStrings[0]);
							var long = parseFloat(coordinateStrings[1]);

							standorte.push({
								'lat': lat,
								'long': long,
								'von': result.standort_von_von[pointIndex],
								'bis': result.standort_bis_bis[pointIndex],
								'ort': result.ort[pointIndex]
							});
						}
					}

					var ordenInfos = [];
					var orden = result.orden;
					if (orden) {
						for (var ordenIndex in orden) {
							var graphik;
							if (result.orden_graphik) {
								graphik = result.orden_graphik[ordenIndex];
							}
							ordenInfos.push({
								'orden': orden[ordenIndex],
								'von': result.orden_von_von[ordenIndex],
								'bis': result.orden_bis_bis[ordenIndex],
								'graphik': graphik
							});
						}
					}

					for (var standortIndex in standorte) {
						var standort = standorte[standortIndex];
						var point = new google.maps.LatLng(standort.lat, standort.long);
						var title = result.kloster;
						var icon = iconForStandort(standort, ordenInfos);

						var marker = new google.maps.Marker({
							'map': map,
							'position': point,
							'title': title,
							'icon': icon,
							'zIndex': 50
						});
					}
				}
			}
		});
	};


	var addBistumsgrenzen = function (map) {
		var baseURL = 'http://vlib.sub.uni-goettingen.de/test/typo3conf/ext/find/Projects/germania-sacra/Resources/Bistumsgrenzen/';
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
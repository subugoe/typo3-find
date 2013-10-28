/*
 * JavaScript for Germania Sacra display.
 *
 * 2013 Sven-S. Porst, SUB Göttingen <porst@sub.uni-goettingen.de>
 */
var germaniaSacra = (function () {
	var config = {};
	var baseURL = 'http://vlib.sub.uni-goettingen.de/test/typo3conf/ext/find/Projects/germania-sacra/Resources/';
	var originalPositions;
	var mapInfo;
	var openInfoWindow;

	var boundsChangedListener;
	var boundsForFetch;
	var dataFetchRequest;
	var markers = {};

	var zoomDuration = 300;

	var init = function () {
		if (config.ID) {
			// Single item view.
			tx_find.googleMapsLoader.load();
			jQuery(document).bind('tx_find.mapsLoaded', mapsReady);
		}
		else if (jQuery('.facet-type-Map').length > 0) {
			// Search result view.
			var jH1 = jQuery('.facet-type-Map h1');
			jH1.wrapInner(document.createElement('a'));

			var extraTextSmall = document.createElement('span');
			extraTextSmall.setAttribute('class', 'extraText small');
			extraTextSmall.appendChild(document.createTextNode('groß anzeigen'));

			var extraTextLarge = document.createElement('span');
			extraTextLarge.setAttribute('class', 'extraText large hidden');
			extraTextLarge.appendChild(document.createTextNode('verkleinern und Liste anzeigen'));
			
			var jLink = jQuery('a', jH1);
			jLink.addClass('largeMap icon-resize-full no-change');
			jLink.attr('href', '#');
			jLink.click(largeMap);
			jLink.append(extraTextSmall);
			jLink.append(extraTextLarge);

			if (tx_find_facetMap.map) {
				addBistumsgrenzen(tx_find_facetMap.map);
			}
			else {
				jQuery('.mapContainer').bind('tx_find.facetMapLoaded', function () {
					addBistumsgrenzen(tx_find_facetMap.map);
				});
			}
  		}
	};

	var storeMapInfo = function (direction) {
		mapInfo = {
			'map': tx_find_facetMap.map,
			'center': tx_find_facetMap.map.getCenter(),
			'zoom': tx_find_facetMap.map.getZoom(),
			'direction': direction
		};
	};

	var largeMap = function () {
		startListeningToFacetMap();

		var jMap = jQuery('.mapContainer');
		var mapPosition = jMap.position();

		var jHeading = jQuery('.facet-type-Map h1');
		var headingPosition = jHeading.position();

		// Store previous positioning information.
		originalPositions = {
			'map': {
				'top': mapPosition.top,
				'left': mapPosition.left,
				'height': jMap.height()
			},
			'heading': {
				'top': headingPosition.top,
				'left': headingPosition.left
			}
		};

		storeMapInfo('up');

		// Add absolute positioning.
		jHeading.css({
			'position': 'absolute',
			'top': headingPosition.top,
			'right': 0,
			'left': headingPosition.left
		});

		jMap.css({
			'position':'absolute',
			'top': mapPosition.top,
			'right': 0,
			'left': mapPosition.left,
			'height': jMap.height()
		});

		// Move elements around.
		jQuery('.tx_find .results').css({'min-height': '850px'});

		var right = '225px';

		jMap.animate(
			{
				'left': 0,
				'right': right,
				'height': '700px'
			},
			{
				'duration': zoomDuration,
				'progress': updateMapForProgress
			}
		);

		jHeading.animate(
			{'left': 0, 'right': right},
			{'duration': zoomDuration}
		);

		jQuery('.extraText.small', jHeading).fadeOut({
			'duration': zoomDuration/2,
			'done': function() {
				jQuery('.extraText.large', jHeading).fadeIn(zoomDuration/2);
			}
		});

		jQuery('.resultList, .navigation').fadeOut(zoomDuration);

		// Switch link to shrink.
		var jResizeLink = jQuery('a', jHeading);
		jResizeLink.removeClass('icon-resize-full').addClass('icon-resize-small');
		jResizeLink.unbind('click').click(smallMap);

		// Remove the original tx_find_facetMap markers.
		for (var markerIndex in tx_find_facetMap.markers) {
			tx_find_facetMap.markers[markerIndex].setMap(null);
		}

		jQuery('.tx_find .results').addClass('largeMap');
		tx_find.changeURLParameterForPage('largeMap', 1);

		return false;
	};

	var smallMap = function () {
		stopListeningToFacetMap();

		var jMap = jQuery('.mapContainer');
		var mapPosition = jMap.position();

		var jHeading = jQuery('.facet-type-Map h1');
		var headingPosition = jHeading.position();

		storeMapInfo('down');

		// Move elements around.
		jMap.animate(
			{
				'left': originalPositions.map.left,
				'right': 0,
				'height': originalPositions.map.height
			},
			{
				'duration': zoomDuration,
				'progress': updateMapForProgress,
				'done': function () {
					jMap.css({'position': 'static'});
					jHeading.css({'position': 'static'});
					jQuery('.tx_find .results').css({'min-height': ''});
				}
			}
		);

		jHeading.animate(
			{'left': originalPositions.heading.left, 'right': 0},
			{'duration': zoomDuration}
		);

		jQuery('.extraText.large', jHeading).fadeOut({
			'duration': zoomDuration/2,
			'done': function () {
				jQuery('.extraText.small', jHeading).fadeIn(zoomDuration/2);
			}
		});

		jQuery('.resultList, .navigation').fadeIn(zoomDuration);

		// Switch link to full.
		var jResizeLink = jQuery('a', jHeading);
		jResizeLink.removeClass('icon-resize-small').addClass('icon-resize-full');
		jResizeLink.unbind('click').click(largeMap);

		// Re-add the original tx_find_facetMap markers.
		for (var markerIndex in tx_find_facetMap.markers) {
			tx_find_facetMap.markers[markerIndex].setMap(tx_find_facetMap.map);
		}

		// Remove our own markers.
		for (var markerIndex in markers) {
			markers[markerIndex].setMap(null);
		}

		jQuery('.tx_find .results').removeClass('largeMap');
		tx_find.changeURLParameterForPage('largeMap');

		return false;
	};

	var solrURLForQuery = function (solrQuery, dataFields) {
		var escapedQuery = encodeURIComponent(solrQuery);
		var queryURL = config.queryURLTemplate.replace('%23%23%23TERM%23%23%23', escapedQuery);
		if (dataFields) {
			queryURL += '&' + encodeURIComponent('tx_find_find[data-fields]') + '=' + encodeURIComponent(dataFields);
		}
		return queryURL;
	};

	var runDataQuery = function () {
		if (boundsForFetch && !dataFetchRequest) {
			var solrQuery = 'koordinaten:[';
			var southWest = boundsForFetch.getSouthWest();
			solrQuery += southWest.lat() + ',' + southWest.lng();
			solrQuery += ' TO ';
			var northEast = boundsForFetch.getNorthEast();
			solrQuery += northEast.lat() + ',' + northEast.lng();
			solrQuery += '] AND typ:standort-orden';
			addMarkersForQuery(tx_find_facetMap.map, solrQuery);
			boundsForFetch = null;
		}
	};

	var boundsChangedCallback = function () {
		boundsForFetch = this.getBounds();
		runDataQuery();
	};

	var startListeningToFacetMap = function () {
		boundsChangedListener = google.maps.event.addListener(tx_find_facetMap.map, 'bounds_changed', boundsChangedCallback);
	};

	var stopListeningToFacetMap = function () {
		google.maps.event.removeListener(boundsChangedListener);
	};


	var updateMapForProgress = function (promise, progress, remaining) {
		google.maps.event.trigger(mapInfo.map, 'resize');
		mapInfo.map.setCenter(mapInfo.center);
		var newZoomLevel = mapInfo.zoom;
		if (progress > 0.2) {
			if (mapInfo.direction === 'up') {
				newZoomLevel = mapInfo.zoom + 2;
			}
			else if (mapInfo.direction === 'down') {
				newZoomLevel = mapInfo.zoom - 2;
			}
		}
		mapInfo.map.setZoom(newZoomLevel);
	};


	var mapsReady = function () {
		google.maps.visualRefresh = true;
		var mapOptions = {
			'mapTypeId': google.maps.MapTypeId.ROADMAP,
			'streetViewControl': false,
			'scrollwheel': false
		};

		var mapContainer = document.getElementById('c-' + config.ID + '-map');
		var map = new google.maps.Map(mapContainer, mapOptions);
		var containingBounds = new google.maps.LatLngBounds();
		var institutionengenau = false;
		for (var standortIndex in config.standorte) {
			var standort = config.standorte[standortIndex];
			var koordinaten = standort.koordinaten.split(',');
			if (koordinaten.length === 2) {
				var lat = parseFloat(koordinaten[0]);
				var long = parseFloat(koordinaten[1]);
				if (lat !== NaN && long !== NaN) {
					var point = new google.maps.LatLng(lat, long);

					var markerOptions = {
						'map': map,
						'position': point,
						'title': standort.titel,
						'zIndex': 100
					};
					if (standort.icon) {
						markerOptions['icon'] = {
							'url': baseURL + 'Ordenssymbole/' + standort.icon + '.png',
							'scaledSize': new google.maps.Size(30, 45),
							'origin': new google.maps.Point(0, 0),
							'anchor': new google.maps.Point(15, 45)
						};
					}
					new google.maps.Marker(markerOptions);

					containingBounds.extend(point);
					addNearby(map, standort);
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


	var pageIDURL = function (id) {
		return config.IDURLTemplate.replace('%23%23%23ID%23%23%23', encodeURIComponent(id));
	};


	var addMarkersForQuery = function (map, solrQuery) {
		var addMarkersForData = function (data) {
			var locationsForDocs = function (docs) {
				var locations = {};
				for (var docIndex in docs) {
					var doc = docs[docIndex];
					var key = doc.koordinaten[0];
					if (!markers[key]) {
						if (!locations[key]) {
							locations[key] = {};
						}
						if (!locations[key][doc.kloster_id]) {
							locations[key][doc.kloster_id] = [];
						}
						locations[key][doc.kloster_id].push(doc);
					}
				}

				return locations;
			};

			var addMarkerForLocation = function (location) {
				var iconForOrdenImages= function (ordenImages) {
					var fileName = 'Kloster_allgemein.png';

					if (Object.keys(ordenImages).length === 1) {
						fileName = Object.keys(ordenImages)[0] + '.png';
					}

					var iconURL = baseURL + 'Ordenssymbole/' + fileName;
					var icon = {
						'url': iconURL,
						'scaledSize': new google.maps.Size(20, 30),
						'origin': new google.maps.Point(0, 0),
						'anchor': new google.maps.Point(10, 30)
					};

					return icon;
				};

				var infoWindowContent = function () {
					var div = document.createElement('div');
					div.setAttribute('class', 'infoWindow');

					for (var klosterID in location) {
						var kloster = location[klosterID];
						if (kloster.length > 0) {
							var article = document.createElement('article');
							div.appendChild(article);
							article.setAttribute('class', 'kloster');

							var h1 = document.createElement('h1');
							article.appendChild(h1);

							var a = document.createElement('a');
							h1.appendChild(a);
							a.setAttribute('class', 'internal no-change');
							a.href = pageIDURL(klosterID);
							var headingText = '';
							if (kloster[0].kloster) {
								headingText += kloster[0].kloster;
							}
							if (kloster[0].ort && kloster[0].ort[0] && !headingText.match(kloster[0].ort[0])) {
								headingText += ' (' + kloster[0].ort[0] + ')';
							}
							a.appendChild(document.createTextNode(headingText));

							var ul = document.createElement('ul');
							article.appendChild(ul);

							for (var ordenIndex in kloster) {
								var standort_orden = kloster[ordenIndex];
								var li = document.createElement('li');
								ul.appendChild(li);

								var spanZeitraum = document.createElement('span');
								li.appendChild(spanZeitraum);
								spanZeitraum.setAttribute('class', 'zeitraum');
								var zeitraum = standort_orden.orden_von_verbal + '-' + standort_orden.orden_bis_verbal;
								spanZeitraum.appendChild(document.createTextNode(zeitraum));

								var spanOrden = document.createElement('span');
								li.appendChild(spanOrden);
								spanOrden.appendChild(document.createTextNode(standort_orden.orden));
							}
						}
 					}

					return div;
				};


				var ordenImages = {};
				var names = {};
				for (var klosterID in location) {
					var kloster = location[klosterID];
					for (var ordenIndex in kloster) {
						var standort_orden = kloster[ordenIndex];
						ordenImages[standort_orden.orden_graphik] = true;
						names[standort_orden.kloster] = true;
					}
				}

				var marker = new google.maps.Marker({
					'map': map,
					'position': solrCoordinateStringToGoogleLatLong(coordinateString),
					'title': Object.keys(names).join('; '),
					'icon': iconForOrdenImages(ordenImages),
					'zIndex': 50
				});

				var infoWindow = new google.maps.InfoWindow({
					'content': infoWindowContent()
				});

				google.maps.event.addListener(marker, 'click', function() {
					if (openInfoWindow) {
						openInfoWindow.close();
					}
					infoWindow.setOptions({'maxWidth':200});
					infoWindow.open(map,marker);
					openInfoWindow = infoWindow;
				});

				markers[coordinateString] = marker;
			};

			console.log(data);
			if (data.response.numFound === data.response.docs.length) {
				var locations = locationsForDocs(data.response.docs);

				for (var coordinateString in locations) {
					var location = locations[coordinateString];
					addMarkerForLocation(location);
				}
			}
			else {
			}

			// Clear the stored fetchRequest and trigger a new one if necessary.
			dataFetchRequest = null;
			runDataQuery();
		};

		var dataFields = 'id,kloster_id,koordinaten,kloster,ort,orden,orden_graphik,orden_bis_verbal,orden_von_verbal';
		var queryURL = solrURLForQuery(solrQuery, dataFields);

		dataFetchRequest = jQuery.getJSON(queryURL, addMarkersForData);
	};


	var addNearby = function (map, standort) {
		var solrQuery = '_query_:"{!geofilt pt=' + standort.koordinaten + ' sfield=koordinaten d=100}" AND typ:standort-orden';
		addMarkersForQuery(map, solrQuery);
	};


	var solrCoordinateStringToGoogleLatLong = function (coordinateString) {
		var coordinateStrings = coordinateString.split(',');
		var latLng = new google.maps.LatLng(parseFloat(coordinateStrings[0]), parseFloat(coordinateStrings[1]));
		return latLng;
	};


	var addBistumsgrenzen = function (map) {
		if (map) {
			new google.maps.KmlLayer({
				'map': map,
				'preserveViewport': true,
				'url': baseURL + 'Bistumsgrenzen/Bistumsgrenzen.kml'
			});
		}
	};


	return {
		'init': init,
		'config': config
	};
	
})();

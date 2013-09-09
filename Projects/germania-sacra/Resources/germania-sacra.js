/*
 * JavaScript for Germania Sacra display.
 *
 * 2013 Sven-S. Porst, SUB Göttingen <porst@sub.uni-goettingen.de>
 */
var germaniaSacra = (function () {
	var baseURL = 'http://vlib.sub.uni-goettingen.de/test/typo3conf/ext/find/Projects/germania-sacra/Resources/';
	var klosterID;
	var standorte;
	var originalPositions;
	var mapInfo;
	var zoomDuration = 300;

	var initialise = function (config) {
		if (config && config.ID) {
			// Single item view.
			klosterID = config.ID;
			standorte = config.standorte;
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
			jLink.addClass('largeMap icon-resize-full');
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
		jQuery('.resultList, .navigation').fadeTo(zoomDuration, 0);

		// Switch link to shrink.
		var jResizeLink = jQuery('a', jHeading);
		jResizeLink.removeClass('icon-resize-full').addClass('icon-resize-small');
		jResizeLink.unbind('click').click(smallMap);

		jQuery('.tx_find .reults').addClass('largeMap');
		tx_find.changeURLParameterForPage('largeMap', 1);

		return false;
	};

	var smallMap = function () {
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
		jQuery('.resultList, .navigation').fadeTo(zoomDuration, 1);

		// Switch link to full.
		var jResizeLink = jQuery('a', jHeading);
		jResizeLink.removeClass('icon-resize-small').addClass('icon-resize-full');
		jResizeLink.unbind('click').click(largeMap);

		jQuery('.tx_find .reults').removeClass('largeMap');
		tx_find.changeURLParameterForPage('largeMap');

		return false;
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
		var iconsForStandort = function (standortInfo, ordenInfos) {
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
				var iconURL = baseURL + 'Ordenssymbole/' + fileName + '.png';
				var origin = new google.maps.Point(0,0);
				var anchor = new google.maps.Point(10, 30);
				icon = new google.maps.MarkerImage(iconURL, undefined, origin, anchor, imageSize);
			}

			var shadowURL = baseURL + 'Ordenssymbole/shadow.png';
			var shadowSize = new google.maps.Size(35, 30);
			var shadow = new google.maps.MarkerImage(shadowURL, undefined, origin, anchor, shadowSize);

			return [icon, shadow];
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
						var icons = iconsForStandort(standort, ordenInfos);

						var marker = new google.maps.Marker({
							'map': map,
							'position': point,
							'title': title,
							'icon': icons[0],
							'shadow': icons[1],
							'zIndex': 50
						});
					}
				}
			}
		});
	};


	var addBistumsgrenzen = function (map) {
		if (map) {
			var baseURL = 'http://vlib.sub.uni-goettingen.de/test/typo3conf/ext/find/Projects/germania-sacra/Resources/Bistumsgrenzen/';
			new google.maps.KmlLayer({
				'map': map,
				'preserveViewport': true,
				'url': baseURL + 'Bistumsgrenzen.kml'
			});
		}
	};


	return {
		'initialise': initialise
	};
	
})();

jQuery(germaniaSacra.initialise);

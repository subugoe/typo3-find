/*
 * JavaScript for Edfu data display.
 *
 * 2013 Sven-S. Porst, SUB Göttingen <porst@sub.uni-goettingen.de>
 */
var edfu = (function () {
	var szeneQueryURLTemplate;
	var szeneLinkURLTemplate;
	var szenenInfo = {};

	var onSlide = function (event, ui) {
		var filterStrings = [];
		jQuery('.ui-slider').each( function () {
			var value = jQuery(this).slider('value');
			filterStrings.push(this.id.split('-')[1] + '(' + value + '%)');
		});
		var filterString = filterStrings.join(' ');

		var jFotorama = jQuery('.fotorama__stage__shaft, .powerzoomer .inner');
		jFotorama.css({'filter': filterString, '-webkit-filter': filterString});
	};


	jQuery.fn.fotoramaListAdapter = function () {
		this.each(function () {
			var html = '';

			jQuery('> li', this).each(function () {
				html += jQuery(this).html();
			});

			jQuery(this).html(html);
		});

		return this;
	};


	var setupZoom = function (jFrame) {
		var jImage = jQuery('.fotorama__img', jFrame);
		var jNewWindowLink = jQuery('.new-window');

		if (jImage && jImage.length > 0) {
			jImage.addpowerzoom({
				defaultpower: 2,
				powerrange: [1.5, 7],
				largeimage: null,
				magnifiersize: [200,200]
			});
			jImage.mousemove();

			jNewWindowLink.attr('href', jImage.attr('src')).show();
		}
		else {
			ddpowerzoomer.activeimage = undefined;
			jQuery('.powerzoomer').hide();

			jNewWindowLink.removeAttr('href').hide();
		}
	};


	var chassinatVolumePage = function (volume, page) {
		var pageCounts = {5:421, 6:362, 7:355, 8:170};
		var romanNumeral = {1:'I', 2:'II', 3:'III', 4:'IV', 5:'V', 6:'VI', 7:'VII', 8:'VIII'};

		jPageViewer = jQuery('.chassinatPageViewer');

		// Remove old image.
		jQuery('img.chassinatPage').fadeOut(200, function () {
			jQuery(this).remove();
		});

		// Insert new image.
		var img = document.createElement('img');
		img.setAttribute('class', 'chassinatPage');
		img.setAttribute('alt', 'Chassinat ' + romanNumeral[volume] + ', ' + page);
		var paddedPageNumber = '000' + page;
		paddedPageNumber = paddedPageNumber.substring(paddedPageNumber.length - 3);
		var imagePath = 'fileadmin/edfu-data/Chassinat/' + volume + '_' + paddedPageNumber + '.jpg';
		img.setAttribute('src', imagePath);
		jQuery('.imageContainer', jPageViewer).append(img);

		// Update label.
		jQuery('.currentPage a', jPageViewer)
			.text(romanNumeral[volume] + ', ' + paddedPageNumber)
			.attr('href', imagePath);


		// Update previous/next actions.
		var jPrevious = jQuery('.previous', jPageViewer);
		if (page > 1) {
			jPrevious.unbind().click(function () {return chassinatVolumePage(volume, page - 1);});
			jPrevious.attr('href', '#');
		}
		else {
			jPrevious.unbind();
			jPrevious.removeAttr('href');
		}

		var jNext= jQuery('.next', jPageViewer);
		if (page < pageCounts[volume]) {
			jNext.unbind().click(function () {return chassinatVolumePage(volume, page + 1);});
			jNext.attr('href', '#');
		}
		else {
			jNext.unbind();
			jNext.removeAttr('href');
		}

		return false;
	};


	var tempelSzeneIn = function (event) {
		var jDetails = jQuery('section.map .detailsContainer');
		var parsedObject = jQuery.parseJSON(event.currentTarget.getAttribute('data-marker'));
		if (parsedObject) {
			var markerData = {
				bild_name: parsedObject.bild_name,
				bild_dateiname: parsedObject.bild_dateiname,
				bild_breite: parsedObject.bild_breite,
				bild_hoehe: parsedObject.bild_hoehe,
				bild_offset_x: parsedObject.bild_offset_x,
				bild_offset_y: parsedObject.bild_offset_y,
				highlightedIDs: {}
			};

			if (jDetails.data('bild_dateiname') !== markerData.bild_dateiname) {
				jDetails.empty();

				var heading = document.createElement('h2');
				heading.appendChild(document.createTextNode(markerData.bild_name));
				jDetails.append(heading);

				var imageContainer = document.createElement('div');
				jDetails.append(imageContainer);
				imageContainer.setAttribute('class', 'imageContainer');
				var scaleFactor = Math.min(jDetails.width()/markerData.bild_breite, (jDetails.height() - 100) / markerData.bild_hoehe , 1);
				var width = Math.ceil(markerData.bild_breite * scaleFactor);
				var height = Math.ceil(markerData.bild_hoehe * scaleFactor);
				imageContainer.setAttribute('style',
					'width:' + width + 'px;' +
					'height:' + height + 'px;');

				var image = document.createElement('img');
				imageContainer.appendChild(image);
				var imagePath = 'typo3conf/ext/find/Projects/edfu/Resources/tempel/' + markerData.bild_dateiname;
				image.setAttribute('src', imagePath);
				image.setAttribute('alt', 'Detailansicht des relevanten Tempelausschnitts.'); // TODO: Localise

				var marginTop = Math.max((jDetails.height() - 100 - height) / 2, 0);
				jDetails.css({'margin-top': marginTop + 'px'});

				// Get all markers for the current image file and highlight their locations on the detail map.
				jQuery('a[data-bild_dateiname="' + markerData.bild_dateiname + '"]').each( function() {
					var szeneID = this.id.replace('szene-', 'szene-id-');
					markerData.highlightedIDs[szeneID] = true;
				});

				markerData.scaleFactor = scaleFactor;
				jDetails.removeData();
				jDetails.data(markerData);
				addSzenenToDetail();
			}
			else {
				jQuery('.szeneMarker').removeClass('active', jDetails);
				jQuery('#szene-id-' + parsedObject.uid, jDetails).addClass('active');
			}
		}
	};



	var loadSzeneRects = function () {
		var fileNames = {};
		jQuery('section.map .szene').each( function () {
			fileNames[this.getAttribute('data-bild_dateiname')] = true;
		});

		for (var fileName in fileNames) {
			var query = encodeURIComponent('szene_bild_dateiname:' + fileName + ' AND typ:szene');
			var datafields = 'szene_uid,szene_bild_rect,szene_beschreibung,szene_prozent_z';
			var queryURL = szeneQueryURLTemplate.replace('%23%23%23TERM%23%23%23', query).replace('%23%23%23DATAFIELDS%23%23%23', datafields);
			jQuery.getJSON(queryURL, function (data) {
				szenenInfo[fileName] = data;
				addSzenenToDetail();
			});
		}
	};

	var addSzenenToDetail = function () {
		var jDetails = jQuery('section.map .szene');
		var fileName = jDetails.data('bild_dateiname');
		if (szenenInfo[fileName] && !jDetails.data('rects_added')) {
			for (var szenenIndex in szenenInfo[fileName]) {
				var szeneInfo = szenenInfo[fileName][szenenIndex];
				addSzeneRectToDetail(szeneInfo);
			}
			jDetails.data('rects_added', true);
		}
	};


	var addSzeneRectToDetail = function (szeneInfo) {
		if (szeneInfo.szene_uid && szeneInfo.szene_uid.length > 0
				&& szeneInfo.szene_bild_rect && szeneInfo.szene_bild_rect.length > 0
				&& szeneInfo.szene_prozent_z && szeneInfo.szene_prozent_z.length > 0
				&& szeneInfo.szene_beschreibung && szeneInfo.szene_beschreibung.length > 0) {

			var koordinaten = szeneInfo.szene_bild_rect[0].split(',');
			if (koordinaten.length === 4) {
				var uid = szeneInfo.szene_uid[0];
				var beschreibung = szeneInfo.szene_beschreibung[0]
				var prozent_z = szeneInfo.szene_prozent_z[0];

				var jDetails = jQuery('section.map .detailsContainer');
				var data = jDetails.data();

				var szeneMarker = document.createElement('a');
				var jSzeneMarker = jQuery(szeneMarker);
				szeneMarker.id = 'szene-id-' + uid;
				jSzeneMarker.data('uid', uid);
				szeneMarker.setAttribute('class', 'szeneMarker');

				jSzeneMarker.css({
					'left': (koordinaten[0] - data.bild_offset_x) * data.scaleFactor + 'px',
					'top': (koordinaten[1] - data.bild_offset_y) * data.scaleFactor + 'px',
					'width': (parseFloat(koordinaten[2]) - parseFloat(koordinaten[0])) * data.scaleFactor + 'px',
					'height': (parseFloat(koordinaten[3]) - parseFloat(koordinaten[1])) * data.scaleFactor + 'px',
					'background-color': 'hsl(' + (-Math.round(prozent_z)) + ', 100%, 50%)',
				});
				if (data.highlightedIDs[szeneMarker.id]) {
					jSzeneMarker.addClass('highlighted')
				}

				szeneMarker.setAttribute('href', szeneLinkForID(uid));
				szeneMarker.setAttribute('title', beschreibung);

				var jImageContainer = jQuery('.imageContainer', jDetails);
				jImageContainer.append(szeneMarker);
			}
		}
	};


	var szeneLinkForID = function (id) {
		return szeneLinkURLTemplate.replace('%23%23%23TERM%23%23%23', id);
	};




	// TODO: implement & add dictionary
	var localise = function (term) {
		return term;
	};


	var init = function (config) {
		szeneQueryURLTemplate = config.szeneQueryURL;
		szeneLinkURLTemplate = config.szeneLinkURL;

		jQuery(function () {
			if (jQuery().fotorama) {
				// Initialise fotorama slideshow.
				var jFotorama = jQuery('.fotorama');

				// Show the first non-blank image.
				var jFirstImageLink = jQuery('a:has(img):first', jFotorama);
				if (jFirstImageLink.length === 1) {
					var firstImageID = jFirstImageLink[0].id;
					jFotorama.attr('data-startindex', firstImageID);
				}

				// Catch image changes to set up the zoom. Follows:
				// https://github.com/artpolikarpov/fotorama/issues/26#issuecomment-21238688
				jFotorama.on('fotorama:showend', function (event, fotorama) {
					var jFrame = fotorama.activeFrame.$stageFrame;

					if (!jFrame.data('state')) {
						jFrame.on('f:load', function () {
							setupZoom(jFrame);
						});
					} else {
						setupZoom(jFrame);
					}

					for (var imageIndex in fotorama.data) {
						var imageData = fotorama.data[imageIndex];
						var thumb = imageData['$navThumbFrame'][0];
						var caption = document.createElement('div');
						caption.setAttribute('class', 'fotorama__caption');
						caption.appendChild(document.createTextNode(imageData.caption));
						thumb.appendChild(caption);
					}
				});

				// Initialise fotorama.
				jFotorama.fotoramaListAdapter().fotorama();

				// Initialise slider for image settings.
				jQuery('.slider').slider({
					min: 0,
					max: 200,
					value: 100,
					slide: onSlide
				});
			}

			jQuery('section.map .szene').mouseenter(tempelSzeneIn);
			jQuery('section.map .szene:first').mouseenter();
			loadSzeneRects();
		});
	};


	return {
		init: init,
		chassinatVolumePage: chassinatVolumePage
	};

})();
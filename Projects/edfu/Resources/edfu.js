/*
 * JavaScript for Edfu data display.
 *
 * 2013 Sven-S. Porst, SUB Göttingen <porst@sub.uni-goettingen.de>
 */
var edfu = (function () {
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
		var markerData = jQuery.parseJSON(event.currentTarget.getAttribute('data-marker'));
		if (markerData) {
			var addSzeneHighlight = function (marker) {
				var data = jQuery.parseJSON(marker.getAttribute('data-marker'));

				var koordinaten = data.bild_rect.split(',');
				if (koordinaten.length === 4) {
					var szeneMarker = document.createElement('a');

					var styleString =
						'left:' + (koordinaten[0] - data.bild_offset_x) * scaleFactor + 'px;' +
						'top:' + (koordinaten[1] - data.bild_offset_y) * scaleFactor + 'px;' +
						'width:' + (parseFloat(koordinaten[2]) - parseFloat(koordinaten[0])) * scaleFactor + 'px;' +
						'height:' + (parseFloat(koordinaten[3]) - parseFloat(koordinaten[1])) * scaleFactor + 'px;' +
						'background-color:hsl(-' + data.prozent_z + ', 100%, 50%);';
					
					szeneMarker.setAttribute('style', styleString);
					szeneMarker.setAttribute('class', 'szeneMarker');
					szeneMarker.setAttribute('href', marker.getAttribute('href'));
					szeneMarker.setAttribute('title', marker.getAttribute('title'));
					szeneMarker.data_uid = data.uid;
					imageContainer.appendChild(szeneMarker);
				}
			};
		
			var jDetails = jQuery('section.map .detailsContainer');
			if (jDetails.attr('data-bild_dateiname') !== markerData.bild_dateiname) {
				jDetails.empty();
				jDetails.attr('data-bild_dateiname', markerData.bild_dateiname);

				var heading = document.createElement('h2');
				heading.appendChild(document.createTextNode(markerData.bild_name));
				jDetails.append(heading);

				var imageContainer = document.createElement('div');
				jDetails.append(imageContainer);
				imageContainer.setAttribute('class', 'imageContainer');
				var scaleFactor = Math.min(jDetails.width()/markerData.bild_breite, (jDetails.height() - 100) / markerData.bild_hoehe , 1);
				var width = jDetails.width();
				var height = jDetails.height();
				imageContainer.setAttribute('style',
					'width:' + Math.ceil(markerData.bild_breite * scaleFactor) + 'px;' +
					'height:' + Math.ceil(markerData.bild_hoehe * scaleFactor) + 'px;');

				var image = document.createElement('img');
				imageContainer.appendChild(image);
				var imagePath = 'typo3conf/ext/find/Projects/edfu/Resources/tempel/' + markerData.bild_dateiname;
				image.setAttribute('src', imagePath);
				image.setAttribute('alt', 'Detailansicht des relevanten Tempelausschnitts.'); // TODO: Localise

				// Get all markers for the current image file and highlight their locations on the detail map.
				jQuery('a[data-bild_dateiname="' + markerData.bild_dateiname + '"]').each( function() {
					addSzeneHighlight(this);
				});
			}
			else {
				jQuery('.szeneMarker').css('opacity', function (index, value) {
					if (this.data_uid === markerData.uid) {
						return 1;
					}
					else {
						return 0.6;
					}
				});
			}
		}
	};

	var tempelSzeneOut = function (event) {	};


	// TODO: implement & add dictionary
	var localise = function (term) {
		return term;
	};


	jQuery(function () {
		if (jQuery().fotorama) {
			// Initialise fotorama slideshow.
    	    var jFotorama = jQuery('.fotorama');

			// Show the first non-blank image.
			var jFirstImageLink = jQuery('a:has(img):first', jFotorama);
			if (jFirstImageLink.length === 1) {
				var firstImageID = jFirstImageLink[0].id;
				jFotorama.attr('data-initialid', firstImageID);
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

		jQuery('section.map .szene').hover(tempelSzeneIn, tempelSzeneOut);
		jQuery('section.map .szene:first').mouseenter();
	});

	return {
		chassinatVolumePage: chassinatVolumePage
	};

})();
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
			var jDetails = jQuery('section.map .imageDetail');
			var image = document.createElement('img');
			var imagePath = 'typo3conf/ext/find/Projects/edfu/Resources/tempel/' + markerData.bild_name + '.gif';
			image.setAttribute('src', imagePath);
			image.setAttribute('alt', 'Genaue Lage der Szene auf der Tempelwand'); // TODO: Localise
			jDetails.empty().show().append(image);
			var szeneMarker = document.createElement('div');
			var koordinaten = markerData.bild_rect.split(',');
			if (koordinaten.length === 4) {
				szeneMarker.setAttribute('style',
					'left:' + koordinaten[0] + 'px;' +
					'top:' + koordinaten[1] + 'px;' +
					'width:' + (parseFloat(koordinaten[2]) - parseFloat(koordinaten[0])) + 'px;' +
					'height:' + (parseFloat(koordinaten[3]) - parseFloat(koordinaten[1])) + 'px;'
				);
				jDetails.append(szeneMarker);
				szeneMarker.setAttribute('class', 'szeneMarker');
				jDetails.append(szeneMarker);
			}
		}
	};

	var tempelSzeneOut = function (event) {
		var jDetails = jQuery('section.map .imageDetail');
		jDetails.hide();
	};


	// TODO: implement & add dictionary
	var localise = function (term) {
		return term;
	};


	jQuery(function () {
		if (jQuery().fotorama) {
			// Initialise fotorama slideshow.
    	    var jFotorama = jQuery('.fotorama');

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
	});

	return {
		chassinatVolumePage: chassinatVolumePage
	};

})();
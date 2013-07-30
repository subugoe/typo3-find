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
		var jImage = jQuery('.fotorama__img', jFrame)
		if (jImage && jImage.length > 0) {
			jImage.addpowerzoom({
				defaultpower: 2,
				powerrange: [1.5, 7],
				largeimage: null,
				magnifiersize: [200,200]
			});
			jImage.mousemove();
		}
		else {
			ddpowerzoomer.activeimage = undefined;
			jQuery('.powerzoomer').hide();
		}
	};


	jQuery(function () {
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
		})

		jFotorama.fotoramaListAdapter().fotorama();

		// Initialise slider for image settings.
		jQuery('.slider').slider({
			min: 0,
			max: 200,
			value: 100,
			slide: onSlide
		});
	});

	return {
	};

})();
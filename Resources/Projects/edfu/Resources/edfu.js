/*
 * JavaScript for Edfu data display.
 *
 * 2013 Sven-S. Porst, SUB Göttingen <porst@sub.uni-goettingen.de>
 */
var germaniaSacra = (function () {
    var onSlide = function (event, ui) {
        var filterStrings = [];
        jQuery('.ui-slider').each( function () {
            var value = $(this).slider('value');
            filterStrings.push(this.id.split('-')[1] + '(' + value + '%)');
        });
        var filterString = filterStrings.join(' ');

        var jFotorama = jQuery('.fotorama__stage__shaft');
        jFotorama.css({'filter': filterString, '-webkit-filter': filterString});
    };


    jQuery.fn.fotoramaListAdapter = function () {
        this.each( function () {
            var html = '';

            jQuery('> li', this).each(function () {
                html += jQuery(this).html();
            });

            jQuery(this).html(html);
        });

        return this;
    };



    jQuery(function () {
        // Initialise fotorama slideshow.
        jQuery('ul.fotorama')
            .fotoramaListAdapter()
            .fotorama();

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
/**
 * JavaScript for the TYPO3 find extension.
 *
 * Handles:
 *  * passing underlying query information using POST to enable result paging
 *  * toggling extended search
 *  * autocomplete initialisation
 *  * histogram facet selection
 *  * showing facet overflow items
 *
 * 2013-2019 Sven-S. Porst <ssp-web@earthlingsoft.net>
 */
var tx_find = (function () {

  var URLParameterPrefix = 'tx_find_find';
  var container;

  /**
   * Initialise. Set up:
   * * container element variable
   * * autocomplete for form fields
   * * autocomplete for facets
   * * event handlers
   */
  var initialise = function () {
    jQuery(function () {
      container = jQuery('.tx_find');

      if (jQuery.ui && jQuery.ui.autocomplete) {
        // Set up jQuery UI Autocomplete search fields with the autocompleteURL attribute.
        jQuery('.fieldContainer input[autocompleteURL!=""]', container).autocomplete({
          source: function (request, returnSuggestions) {
            var autocompleteURL = this.element.attr('autocompleteURL');
            if (autocompleteURL) {
              autocompleteURL = autocompleteURL.replace('%25%25%25%25', request.term.toLowerCase());
              jQuery.getJSON(autocompleteURL, function (data) {
                returnSuggestions(data);
              });
            }
          }
        });

        // Set up jQuery chosen for facet lists with a .facetSearch input.
        jQuery('.facetSearch', container).each(function () {
          jQuery(this).chosen({width: "100%;"}).bind('change', facetChosenSelect);
        });
      }

      jQuery('a.extendedSearch', container).click(toggleExtendedSearch);

      jQuery('.position .resultPosition', container).click(onClickRecordNumber);

      initializeHistogramFacets();
    });
  };


// Localisation function. Currently not implemented.
  var localise = function (term) {
    return term;
  };


  var googleMapsLoader = (function () {
    var load = function () {
      if (!window.google || !window.google.maps) {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&callback=tx_find.googleMapsLoader.mapsCallback';
        document.body.appendChild(script);
      }
    };

    var mapsCallback = function () {
      jQuery(document).trigger('tx_find.mapsLoaded');
    };

    return {
      'load': load,
      'mapsCallback': mapsCallback
    };

  })();


  /**
   * Handles selection in jquery.chosen menu for facets:
   * Get link of the selected facet and follow it.
   *
   * @param {Event} event
   * @param {object} data
   * @returns {undefined}
   */
  var facetChosenSelect = function (event, data) {
    var term = data.selected;
    var jArticle = jQuery(this).parents('article');
    var jLI = jQuery("li[value='" + term + "']");
    if (jLI.length === 1) {
      jQuery('a', jLI)[0].click();
    }
  };


  /**
   * Slides in the hidden items of a facet.
   *
   * @param {Event} myEvent click event
   * @returns {Boolean} false
   */
  var showAllFacetsOfType = function (myEvent) {
    var jLink = jQuery(myEvent.target);
    var containingList = jLink.parents('ol')[0];
    var linkShowAll = jQuery('.facetShowAll', containingList);
    var linkHideHidden = jQuery('.facetHideHidden', containingList);
    // Fade in the hidden elemens and hide the Show All link.
    jQuery('.hidden', containingList).slideToggle(500);
    // Check links to show all or hide previously hidden elements and toggle css style attribute 'display'
    if ($(linkShowAll).is(":hidden")) {
      jQuery(linkShowAll).show();
      jQuery(linkHideHidden).hide();
    } else {
      jQuery(linkShowAll).hide();
      jQuery(linkHideHidden).show();
    }
    return false;
  };


  /**
   * Finds all histogram facets and draws them.
   */
  var initializeHistogramFacets = function () {
    jQuery('.facetHistogram-container .histogram').each(function () {
      createHistogramForTermsInContainer(this);
    });
  };


  /**
   * Uses jQuery.flot to create a histogram in »container« using the
   * configuration provided by the data-facet-config attribute.
   *
   * @param {DOMElement} histogramContainer
   */
  var createHistogramForTermsInContainer = function (histogramContainer) {
    var jGraphDiv = jQuery(histogramContainer);
    var facetConfig = jGraphDiv.data('facet-config');
    var selectedHistogramFacets = facetConfig.activeFacets[facetConfig.id] || {};

    var graphWidth = jGraphDiv.parents('.facets').width();
    var canvasHeight = 150;
    jGraphDiv.css({'width': graphWidth + 'px', 'height': canvasHeight + 'px', 'position': 'relative'});

    var terms = facetConfig.data;
    var graphData = [];
    for (var yearName in terms) {
      var year = parseInt(yearName, 10);
      if (year) {
        graphData.push([year, terms[yearName]]);
      }
    }

    /**
     * Set up xaxis with two labelled ticks, one at each end.
     * Dodgy: Use whitespace to approximately position the labels in a way that they don’t
     * extend beyond the end of the graph (by default they are centered at the point of
     * their axis, thus extending beyond the width of the graph on one site.
     *
     * @param {object} axis
     * @returns {array}
     */
    var xaxisTicks = function (axis) {
      return [[axis.datamin, '      ' + axis.datamin], [axis.datamax, axis.datamax + '      ']];
    };

    // Use the colour of term list titles for the histogram.
    var graphColour = jQuery('.facetAdd', container).css('color');
    var selectionColour = jQuery('.facet h1', container).css('color');

    var graphOptions = {
      'series': {
        'bars': {
          'show': true,
          'fill': true,
          'lineWidth': 0,
          'barWidth': facetConfig.barWidth,
          // 'fillColor': graphColour
          'fillColor': 'grey'
        }
      },
      'xaxis': {
        'tickDecimals': 0,
        'ticks': xaxisTicks,
        'autoscaleMargin': null
      },
      'yaxis': {
        'position': 'right',
        'tickDecimals': 0,
        'tickFormatter': function (val, axis) {
          return (val != 0) ? (val) : ('');
        },
        'labelWidth': 30
      },
      'grid': {
        'borderWidth': 0,
        'hoverable': true
      },
      'selection': {
        'mode': 'x',
        'color': selectionColour,
        'minSize': 0
      }
    };

    // Create plot.
    var plot = jQuery.plot(jGraphDiv, [{'data': graphData, 'color': graphColour}], graphOptions);

    // Create tooltip.
    var jTooltip = jQuery('#tx_find-histogram-tooltip');
    if (jTooltip.length === 0) {
      var tooltipDiv = document.createElement('div');
      tooltipDiv.setAttribute('id', 'tx_find-histogram-tooltip');
      jTooltip = jQuery(tooltipDiv).appendTo(document.body);
    }

    for (var term in selectedHistogramFacets) {
      var matches = term.match(/RANGE (.*) TO (.*)/);
      if (matches) {
        var selection = {
          from: parseInt(matches[1], 10),
          to: parseInt(matches[2], 10) + 1
        };
        plot.setSelection({'xaxis': selection});
      }
    }


    /**
     * Rounds the passed range to the next multiple of facetConfig.barWidth
     * below and above.
     *
     * @param {object} range
     * @returns {object}
     */
    var roundedRange = function (range) {
      var fromFloor = range.from - (range.from % facetConfig.barWidth);
      var toCeil = range.to + facetConfig.barWidth - (range.to % facetConfig.barWidth)
      return {
        from: fromFloor,
        to: toCeil
      };
    };

    var startSearchWithNewFacet = function (event, range) {
      var jHistogram = $(event.target).closest('.histogram');
      var linkTemplate = jHistogram.data('link');

      var activeFacetValues = Object.keys(selectedHistogramFacets);
      var facetQueryString = 'RANGE ' + range.from + ' TO ' + (range.to - 1);
      
      // Only change the location if the facet selection has changed.
      if (!(facetQueryString in activeFacetValues)) {
        var facetLink = linkTemplate.replace('%25%25%25%25', escape(facetQueryString));
        window.location.href = facetLink;
      }
    };

    var hideTooltip = jTooltip.hide;

    /**
     * Rounds the xaxis range of the passed ranges, selects the resulting
     * range in the histogram and starts a new search.
     *
     * @param {object} ranges
     */
    var selectRanges = function (event, ranges) {
      var newRange = roundedRange(ranges.xaxis);
      plot.setSelection({'xaxis': newRange}, true);
      hideTooltip();
      startSearchWithNewFacet(event, newRange);
    };

    jGraphDiv.bind('plotclick', function (event, pos, item) {
      return true;
    });

    jGraphDiv.one('plotselected', function (event, ranges) {
      selectRanges(event, ranges);
    });

    jGraphDiv.bind('plotunselected', function () {
      return false;
    });


    /**
     * Updates the tooltip visiblity, position and text.
     *
     * @param {event} event
     * @param {object} ranges with property »xaxis«
     * @param {float} pageX current x coordinate of the mouse
     */
    var updateTooltip = function (event, ranges, pageX) {
      var showTooltip = function (x, y, contents) {
        jTooltip.text(contents);
        if (x) {
          jTooltip.css({
            'top': y - 20,
            'left': x + 5
          });
        }
        jTooltip.show();
      };

      var tooltipY = jGraphDiv.offset().top + canvasHeight - 20;
      var displayString;

      if (ranges) {
        if (histogramContainer.currentSelection && histogramContainer.currentSelection.xaxis) {
          var range = roundedRange(ranges.xaxis);
          displayString = range.from.toString() + '-' + (range.to - 1).toString();
        } else {
          var year = Math.floor(ranges.xaxis.from);
          year = year - (year % facetConfig.barWidth);
          if (terms[year]) {
            var hitCount = terms[year];
            var displayString = year.toString() + ': ' + hitCount + ' ' + localise('Treffer');
          }
        }
      }

      if (displayString) {
        showTooltip(pageX, tooltipY, displayString);
      } else {
        hideTooltip();
      }
    };

    jGraphDiv.bind('plothover', function (event, ranges, item) {
      updateTooltip(event, {'xaxis': {'from': ranges.x, 'to': ranges.x}}, ranges.pageX);
    });

    jGraphDiv.bind('plotselecting', function (event, info) {
      histogramContainer.currentSelection = info;
      updateTooltip(event, info);
    });

    jGraphDiv.mouseout(hideTooltip);
  };


  /**
   * Called by links to detail view pages for which result paging is required.
   *    * passes the detail page information in GET parameters (for good URLs)
   *    * passes the query information in POST parameters
   *    * the server can then render the details page while still having information
   *        about the original query for paging
   *
   * @param {DOMElement} element receiver of the click event
   * @param {int} position number of the result to go to [optional]
   * @returns Boolean false when the POST request was submitted, true otherwise
   */
  var detailViewWithPaging = function (element, position) {

    /**
     * Recursively creates input elements with values for the content of the passed object.
     * e.g. use the object { 'top' : {'a': 'b'}, 'second': 2} to create
     * <input name="prefix[top][a]" value="b"/>
     * <input name="prefix[second]" value="2"/>
     *
     * @param {string} prefix name attribute prefix
     * @param {object} object data to build the <input> elements from
     * @returns array of DOMElements
     */
    var inputsWithPrefixForObject = function (prefix, object) {
      var inputs = [];
      for (var key in object) {
        var prefixWithKey = prefix + '[' + key + ']';
        var value = object[key];
        if (typeof (value) === 'object') {
          inputs = inputs.concat(inputsWithPrefixForObject(prefixWithKey, value));
        } else {
          inputs.push(inputWithNameAndValue(prefixWithKey, value));
        }
      }
      return inputs;
    };


    /**
     * Creates an <input> element for the given name and value.
     *
     * @param {string} name for name property of the <input> element
     * @param {string} value for value property of the <input> element
     * @returns DOMElement <input> element
     */
    var inputWithNameAndValue = function (name, value) {
      var input = document.createElement('input');
      input.name = name;
      input.value = value;
      input.type = 'hidden';
      return input;
    };


    if (underlyingQuery) {
      // Try to determine position if it is not set explicitly (we should be in the main result list).
      var jLI = jQuery(element).parents('li');
      var jOL = jLI.parents('ol');
      if (position) {
        underlyingQuery.position = position;
      } else if (jOL) {
        underlyingQuery.position = parseInt(jOL.attr('start'), 10) + parseInt(jLI.index(), 10);
      }

      var form = document.createElement('form');
      var linkURL = element.getAttribute('href');
      form.action = linkURL;
      form.method = 'POST';
      form.style = 'display:none;';
      document.body.appendChild(form);

      var inputs = inputsWithPrefixForObject(URLParameterPrefix + '[underlyingQuery]', underlyingQuery);
      for (var inputIndex in inputs) {
        form.appendChild(inputs[inputIndex]);
      }
      ;

      if (jQuery('.searchForm.search-extended', container).length > 0) {
        form.appendChild(inputWithNameAndValue(URLParameterPrefix + '[extended]', '1'));
      }

      result = form.submit();
      return false;
    }

    return true;
  };


  /**
   * Toggles extended search: shows/hides additional fields
   * and changes location URL to reflect the state.
   *
   * @returns {boolean}
   */
  var toggleExtendedSearch = function () {
    var parameterName = URLParameterPrefix + '[extended]';

    // Change URL in address bar.
    var jForm = jQuery('.searchForm', container);
    var jThis = jQuery(this);
    var makeExtended = !jForm.hasClass('search-extended');
    if (makeExtended) {
      jThis.text(this.getAttribute('extendedstring'));
      jQuery('.field-mode-extended', jForm).slideDown('fast');
      changeURLParameterForPage('extended', 1);
    } else {
      jThis.text(this.getAttribute('simplestring'));
      jQuery('.field-mode-extended', jForm).slideUp('fast');
      changeURLParameterForPage('extended');
    }
    jForm.toggleClass('search-simple').toggleClass('search-extended');

    return false;
  };


  var changeURLParameterForPage = function (name, value) {
    var parameterName = URLParameterPrefix + '[' + name + ']';

    // Change the URL in the location bar.
    var newURL = removeURLParameter(location.href, parameterName);
    if (value !== undefined) {
      newURL = addURLParameter(newURL, parameterName, value);
    }
    changeURL(newURL);

    // Change other link URLs on the page.
    jQuery('a:not(.no-change)', container).each(function () {
      if (value !== undefined) {
        this.href = addURLParameter(this.href, parameterName, value);
      } else {
        this.href = removeURLParameter(this.href, parameterName);
      }
    });

    // De/activate hidden input »extended« in the form.
    jQuery('input.' + parameterName, container).each(function () {
      if (value !== undefined) {
        this.setAttribute('name', URLParameterPrefix + '[' + parameterName + ']');
      } else {
        this.setAttribute('name', '');
      }
    });
  };


  var addURLParameter = function (url, name, value) {
    var nameEscaped = encodeURIComponent(name);
    var valueEscaped = encodeURIComponent(value);
    var urlParts = url.split('#');
    urlParts[0] += (urlParts[0].match(/\?/) ? '&' : '?') + nameEscaped + '=' + valueEscaped;
    return urlParts.join('#');
  };

  var removeURLParameter = function (url, name) {
    var nameEscaped = encodeURIComponent(name);
    var re = new RegExp('&?' + nameEscaped + '=[^&]*');
    var newURL = url.replace(re, '').replace(/\?$/, '');
    return newURL;
  };


  /**
   * Pushes newURL to the history state.
   *
   * @param {string} newURL
   */
  var changeURL = function (newURL) {
    if (history.pushState !== undefined) {
      history.pushState(null, null, newURL);
    }
  };


  var onClickRecordNumber = function (myEvent) {

  };


  initialise();

  return {
    'showAllFacetsOfType': showAllFacetsOfType,
    'detailViewWithPaging': detailViewWithPaging,
    'toggleExtendedSearch': toggleExtendedSearch,
    'googleMapsLoader': googleMapsLoader,
    'changeURLParameterForPage': changeURLParameterForPage,
    'addURLParameter': addURLParameter,
    'removeURLParameter': removeURLParameter,
    'changeURL': changeURL,
    'URLParameterPrefix': URLParameterPrefix
  };

})();


/**
 * Object to set up the map in a facet.
 *
 * @type {object}
 */
var tx_find_facetMap = (function () {
  var interface = {};
  var config;
  var map;
  var markers = {};
  interface.markers = markers;

  var init = function (parameters) {
    config = parameters;
    interface.config = config;
    if (document.google !== undefined && google.maps) {
      mapsLoadedCallback();
    } else {
      jQuery(document).bind('tx_find.mapsLoaded', mapsLoadedCallback);
      tx_find.googleMapsLoader.load();
    }
  };
  interface.init = init;

  var mapsLoadedCallback = function () {
    // Extract information from facet data.
    // The facet term needs begin with the zero-padded zoom level,
    // a dash and the geohash. The facet needs to be sorted by index.
    var zoomInfo = {};
    var lastZoomLevel = 0;
    for (var facetIndex in config.facetData) {
      var indexParts = facetIndex.split('-');
      if (indexParts.length === 2) {
        var geohashScale = parseInt(indexParts[0], 10);
        lastZoomLevel = geohashScale;

        if (!zoomInfo[geohashScale]) {
          zoomInfo[geohashScale] = {};
        }
        zoomInfo[geohashScale][indexParts[1]] = config.facetData[facetIndex];
      }
    }

    var lastZoomLevelIsComplete = (Object.keys(config.facetData).length < config.facetFetchMaximum);
    if (!lastZoomLevelIsComplete) {
      lastZoomLevel--;
    }

    // Create map.
    var mapOptions = {
      'mapTypeId': google.maps.MapTypeId.ROADMAP,
      'mapTypeControl': false,
      'streetViewControl': false,
      'scrollwheel': false
    };

    map = new google.maps.Map(config.container, mapOptions);
    interface.map = map;

    // Use the last complete level of geo information to determine the bounding box.
    var containingBounds = new google.maps.LatLngBounds();
    var zoomLevelInfo = zoomInfo[lastZoomLevel];
    for (var geohashString in zoomLevelInfo) {
      var geohashBounds = geohash.bbox(geohashString);
      var bounds = new google.maps.LatLngBounds(
          new google.maps.LatLng(geohashBounds.s, geohashBounds.w),
          new google.maps.LatLng(geohashBounds.n, geohashBounds.e)
      );
      containingBounds.union(bounds);
    }

    // Shrink the bounding box a little to compensate for Google’s generous margins.
    var containingSpan = containingBounds.toSpan();
    var shrinkFactor = 0.2;
    var shrunkBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(
            containingBounds.getSouthWest().lat() + containingSpan.lat() * shrinkFactor,
            containingBounds.getSouthWest().lng() + containingSpan.lng() * shrinkFactor
        ),
        new google.maps.LatLng(
            containingBounds.getNorthEast().lat() - containingSpan.lat() * shrinkFactor,
            containingBounds.getNorthEast().lng() - containingSpan.lng() * shrinkFactor
        )
    );

    var centre = shrunkBounds.getCenter();
    var bounds = shrunkBounds.extend(
        new google.maps.LatLng(centre.lat() - 0.01, centre.lng() - 0.01)
    ).extend(
        new google.maps.LatLng(centre.lat() + 0.01, centre.lng() + 0.01)
    );

    map.fitBounds(shrunkBounds);

    // Determine which zoom level to take the data from.
    var geohashScaleForMarkers = 0;
    for (var zoomLevel = 1; zoomLevel <= lastZoomLevel; zoomLevel++) {
      if (Object.keys(zoomInfo[zoomLevel]).length < 100) {
        geohashScaleForMarkers = zoomLevel;
      }
    }

    zoomLevelInfo = zoomInfo[geohashScaleForMarkers];
    for (var geohashString in zoomLevelInfo) {
      var geohashPoint = geohash.decode_exactly(geohashString);
      var point = new google.maps.LatLng(geohashPoint[0], geohashPoint[1]);
      var resultCount = zoomLevelInfo[geohashString];
      var marker = new google.maps.Marker({
        'map': map,
        'position': point,
        'title': resultCount.toString(),
        'icon': {
          'path': google.maps.SymbolPath.CIRCLE,
          'strokeColor': 'e33',
          'fillColor': 'f33',
          'fillOpacity': 1,
          'scale': 0.5 + Math.min(Math.sqrt(resultCount), 5)
        }
      });
      markers[geohashString] = marker;
    }

    jQuery(config.container).trigger('tx_find.facetMapLoaded');
  };

  return interface;

})();


// Add object property counting for old browsers.
if (!Object.keys) {
  Object.keys = function (obj) {
    var keys = [],
        k;
    for (k in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, k)) {
        keys.push(k);
      }
    }
    return keys;
  };
}

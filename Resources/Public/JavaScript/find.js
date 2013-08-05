var tx_find = (function() {

var URLParameterPrefix = 'tx_find_find';
var container;


var initialise = function () {
	jQuery(document).ready(function() {
		container = jQuery('.tx_find');

		if (jQuery.ui && jQuery.ui.autocomplete) {
			// Set up jQuery UI Autocomplete search fields with the autocompleteURL attribute.
			jQuery('.fieldContainer input[autocompleteURL!=""]', container).autocomplete({
				source: function(request, returnSuggestions) {
					var autocompleteURL = this.element.attr('autocompleteURL');
					if (autocompleteURL) {
						autocompleteURL = autocompleteURL.replace('%25%25%25%25', request.term);
						jQuery.getJSON(autocompleteURL, function (data) {
							returnSuggestions(data);
						});
					}
				}
			});

			// Set up jQuery chosen for facet lists with a .facetSearch input.
			jQuery('.facetSearch', container).each( function () {
				jQuery(this).chosen({width: "100%;"}).bind('change', facetChosenSelect);
			});
		}

		jQuery('a.extendedSearch', container).click(toggleExtendedSearch);

		jQuery('.position .resultPosition', container).click(onClickRecordNumber);

	});
};



// Localisation function. Currently not implemented.
var localise = function (term) {
	return term;
};



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
	var jLink = jQuery(myEvent.toElement);
	var containingList = jLink.parents('ol')[0];
	// Fade in the hidden elemens and hide the Show All link.
	jQuery('.hidden', containingList).slideDown(300);
	jLink.parent().fadeOut(200);
	return false;
};



/**
 *  Uses jQuery.flot to create a histogram for »terms« with configuration »config«
 *  in »container.
 *
 * @param {object} terms (keys: year numbers, values: result counts)
 * @param {DOMElement} histogramContainer
 * @param {object} config
 */
var createHistogramForTermsInContainer = function (terms, histogramContainer, config) {
	var jGraphDiv = jQuery(histogramContainer);
	var graphWidth = jGraphDiv.parents('.facets').width();
	var canvasHeight = 150;
	jGraphDiv.css({'width': graphWidth + 'px', 'height': canvasHeight + 'px', 'position': 'relative'});

	var startSearchWithNewFacet = function (range) {
		var facetQueryString = 'RANGE ' + range.from + '%20TO%20' + range.to;
		var facetLink = config.linkTemplate.replace('%25%25%25%25', facetQueryString);
		window.location.href = document.baseURI + facetLink;
	};

	var graphData = [];
	for (var yearName in terms) {
		var year = parseInt(yearName, 10);
		if (year) {
			graphData.push([year, terms[yearName]]);
		}
	}

	/*	Set up xaxis with two labelled ticks, one at each end.
		Dodgy: Use whitespace to approximately position the labels in a way that they don’t
		extend beyond the end of the graph (by default they are centered at the point of
		their axis, thus extending beyond the width of the graph on one site.
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
				'barWidth': config.barWidth,
				'fillColor': graphColour
			}
		},
		'xaxis':  {
			'tickDecimals': 0,
			'ticks': xaxisTicks,
			'autoscaleMargin': null
		},
		'yaxis': {
			'position': 'right',
			'tickDecimals': 0,
			'tickFormatter': function(val, axis) {return (val != 0) ? (val) : ('');},
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
	var plot = jQuery.plot(jGraphDiv , [{'data': graphData, 'color': graphColour}], graphOptions);

	// Create tooltip.
	tooltipDiv = document.createElement('div');
	tooltipDiv.setAttribute('id', 'tx_find-histogram-tooltip');
	var jTooltip = jQuery(tooltipDiv).appendTo(document.body);


	for (var termIndex in config.activeFacets) {
		var term = config.activeFacets[termIndex];
		var matches = term.match(/RANGE (.*) TO (.*)/);
		if (matches) {
			var selection = {};
			selection.from = parseInt(matches[1]);
			selection.to = parseInt(matches[2]);
			plot.setSelection({'xaxis': selection});
		}
	}

	var roundedRange = function (range) {
		var outputRange = {};

		var from = Math.floor(range.from);
		outputRange.from = from - (from % config.barWidth);

		var to = Math.ceil(range.to);
		outputRange.to = to - (to % config.barWidth) + config.barWidth;
		return outputRange;
	};

	var selectRanges = function (ranges) {
		var newRange = roundedRange(ranges.xaxis);
		plot.setSelection({'xaxis': newRange}, true);
		hideTooltip();
		startSearchWithNewFacet(newRange);
	};

	jGraphDiv.bind('plotclick', function (event, pos, item) {
		return true;
	});

	jGraphDiv.bind('plotunselected', function() {
		return false;
	});

	jGraphDiv.bind('plotselected', function(event, ranges) {
		selectRanges(ranges);
	});

	var hideTooltip = function () {
		jTooltip.hide();
	}

	var updateTooltip = function (ranges) {
		var showTooltip = function(x, y, contents) {
			jTooltip.text(contents);
			jTooltip.css( {
				'top': y - 20,
				'left': x + 5
			});
			jTooltip.show();
		};

		var tooltipY = jGraphDiv.offset().top + canvasHeight - 20;
		var displayString;

		if (histogramContainer.currentSelection && histogramContainer.currentSelection.xaxis) {
			var range = roundedRange(ranges.xaxis);
			displayString = range.from.toString() + '-' + range.to.toString();
		}
		else {
			var year = Math.floor(ranges.xaxis.from);
			year = year - (year % config.barWidth);
			if (terms[year]) {
				var hitCount = terms[year];
				var displayString = year.toString() + ': ' + hitCount + ' ' + localise('Treffer');
			}
		}

		if (displayString) {
			showTooltip(event.x, tooltipY, displayString);
		}
		else {
			hideTooltip();
		}
	};

	jGraphDiv.bind('plothover', function(event, ranges, item) {
		updateTooltip({'xaxis': {'from': ranges.x, 'to': ranges.x}});
	});

	jGraphDiv.bind('plotselecting', function (event, info) {
		histogramContainer.currentSelection = info;
		updateTooltip(info);
	});

	jGraphDiv.mouseout(hideTooltip);
};



/**
 * Called by links to detail view pages for which result paging is required.
 *	* passes the detail page information in GET parameters (for good URLs)
 *	* passes the query information in POST parameters
 *	* the server can then render the details page while still having information
 *		about the original query for paging
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
			if (typeof(value) === 'object') {
				inputs = inputs.concat(inputsWithPrefixForObject(prefixWithKey, value));
			}
			else {
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
		}
		else if (jOL) {
			underlyingQuery.position = parseInt(jOL.attr('start')) + parseInt(jLI.index());
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
		};

		result = form.submit();
		return false;
	}

	return true;
};



var toggleExtendedSearch = function () {
	var jForm = jQuery('.searchForm', container);
	var jThis = jQuery(this);

	var parameterEscaped = encodeURIComponent(URLParameterPrefix + '[extended]');
	var newSearch = location.search.replace(parameterEscaped, '').replace(/[&?]=[01]/, '');
	var makeExtended = !jForm.hasClass('search-extended');
	if (makeExtended) {
		jThis.text(this.getAttribute('extendedstring'));
		jQuery('.field-mode-extended', jForm).slideDown('fast');

		newSearch += (newSearch.match(/\?/) ? '&' : '?') + parameterEscaped + '=1';
	}
	else {
		jThis.text(this.getAttribute('simplestring'));
		jQuery('.field-mode-extended', jForm).slideUp('fast');
	}
	jForm.toggleClass('search-simple').toggleClass('search-extended');
	newLocation = location.origin + location.pathname + newSearch + location.hash;
	changeURL(newLocation);

	return false;
};


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
	'createHistogramForTermsInContainer': createHistogramForTermsInContainer,
	'detailViewWithPaging': detailViewWithPaging,
	'toggleExtendedSearch': toggleExtendedSearch
};

})();
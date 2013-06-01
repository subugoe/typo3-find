jQuery(document).ready(function() {
	// autocomplete
	jQuery('.tx_solr_frontend .field-default input').autocomplete(
		{
			source: function(request, add) {
				var autocompleteUrl = updateQueryStringParameter(currentUrl(), "type", 1369315139);
				var autocompleteUrl = updateQueryStringParameter(autocompleteUrl, "term", request.term);

				jQuery.getJSON(autocompleteUrl, function (data) {
					var suggestions = [];
					if (data.spellcheck.suggestions.length !== 0) {
						add(data.spellcheck.suggestions[1].suggestion);
					}
				});
			}
		}
	);
});

// add parameters correctly to an url
var updateQueryStringParameter = function(uri, key, value) {
	var re = new RegExp("([?|&])" + key + "=.*?(&|$)", "i");
	separator = uri.indexOf('?') !== -1 ? "&" : "?";
	if (uri.match(re)) {
		return uri.replace(re, '$1' + key + "=" + value + '$2');
	}
	else {
		return uri + separator + key + "=" + value;
	}
};

var localise = function (term) {
	return term;
};

var currentUrl = function() {
	return window.location.href;
};

var createHistogram = function (terms) {
	var jGraphDiv = jQuery('div.histogram'); // TODO: more precise selection to allow multiple histograms
	var graphWidth = jQuery('div.facets').width(); // TODO: use parent() in selection
	var canvasHeight = 150;
	jGraphDiv.css({'width': graphWidth + 'px', 'height': canvasHeight + 'px', 'position': 'relative'});

	var startSearchWithNewFacet = function (range) {
		var facetQueryString = '[' + range.from + '%20TO%20' + range.to + ']';
		console.log(facetQueryString);
		var facetLink = facetLinkTemplate.replace('%22%25%25%25%25%22', facetQueryString);
		window.location.href = document.baseURI + facetLink;
	};


	var graphData = [];
	for (var termIndex in terms) {
		var year = parseInt(terms[termIndex].name, 10);
		if (year) {
			graphData.push([year, terms[termIndex].freq]);
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
	var graphColour = jQuery('.tx_solr_frontend .facetAdd').css('color');
	var selectionColour = jQuery('.tx_solr_frontend .facet h1').css('color');

	var graphOptions = {
		'series': {
			'bars': {
				'show': true,
				'fill': true,
				'lineWidth': 0,
				'barWidth': barWidth,
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
			'borderWidth': 0
		},
		'selection': {
			'mode': 'x',
			'color': selectionColour,
			'minSize': 0
		}
	};

	var plot = jQuery.plot(jGraphDiv , [{'data': graphData, 'color': graphColour}], graphOptions);

	for (var activeFacetIndex in activeFacets) {
		var activeFacet = activeFacets[activeFacetIndex];
		if (activeFacet.length === 2 && activeFacet[0] === myFacetField) {
			var range = activeFacet[1].replace(/[\[\]]/g, '').split(' TO ');
			if (range.length === 2) {
				var selection = {};
				selection.from = parseInt(range[0]);
				selection.to = parseInt(range[1]);
				plot.setSelection({'xaxis': selection});
			}
		}
	}

	var removeTooltip = function () {
		jQuery("#solr_frontend-histogram-tooltip").remove();
	};

	var selectRanges = function (ranges) {
		var from = Math.floor(ranges.xaxis.from);
		ranges.xaxis.from = from - (from % barWidth);
		var to = Math.ceil(ranges.xaxis.to);
		ranges.xaxis.to = to - (to % barWidth);
		plot.setSelection(ranges, true);
		removeTooltip();
		startSearchWithNewFacet(ranges.xaxis);
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

	jGraphDiv.bind('plothover', function(event, ranges, item) {
		var showTooltip = function(x, y, contents) {
			var tooltipDiv = document.createElement('div');
			tooltipDiv.setAttribute('id', 'solr_frontend-histogram-tooltip');
			tooltipDiv.appendChild(document.createTextNode(contents));
			jQuery(tooltipDiv).css( {
				'position': 'absolute',
				'display': 'none',
				'top': y - 20,
				'left': x + 5,
				'background': '#fff'
			}).appendTo('body').fadeIn(200);
		};

		removeTooltip();
		var year = Math.floor(ranges.x);
		year = year - (year % barWidth);
		for (termIndex in terms) {
			var term = terms[termIndex].name;
			if (term === year) {
				var hitCount = terms[termIndex].freq;
				var displayString = year + ': ' + hitCount + ' ' + localise('Treffer');
				tooltipY = jGraphDiv.offset().top + canvasHeight - 20;
				showTooltip(ranges.pageX, tooltipY, displayString);
			}
		}
	});

	jGraphDiv.mouseout(removeTooltip);

};

var detailViewWithPaging = function (event, position) {
	var inputWithNameAndValue = function (name, value) {
		var input = document.createElement('input');
		input.name = 'tx_solrfrontend_solrfrontend[underlyingQuery][' + name + ']';
		input.type = 'hidden';
		input.value = value;
		return input;
	};

	if (underlyingQuery) {
		var form = document.createElement('form');
		var linkURL = event.target.getAttribute('href');
		form.action = linkURL;
		form.method = 'POST';
		form.appendChild(inputWithNameAndValue('query', underlyingQuery.query));
		var jLI = jQuery(event.target).parents('li');
		var jOL = jLI.parents('ol');
		if (!position) {
			position = parseInt(jOL.attr('start')) + parseInt(jLI.index());
		}
		form.appendChild(inputWithNameAndValue('position', position));
		result = form.submit();
		return false;
	}

	return true;
};

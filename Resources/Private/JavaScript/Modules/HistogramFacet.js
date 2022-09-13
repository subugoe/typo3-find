import $ from 'jquery';
import Utility from './Utility';

class HistogramFacet {
  static canvasHeight = 150;

  bindEvents() {
    this.initializeHistogramFacets();
  }

  static showTooltip(x, y, contents, toolTip) {
    toolTip.text(contents);
    if (x) {
      toolTip.css({
        top: y - 20,
        left: x + 5,
      });
    }
    toolTip.show();
  }

  /**
   * Updates the tooltip visiblity, position and text.
   *
   * @param {Event} event
   * @param {object} ranges with property »xaxis«
   * @param {float} pageX current x coordinate of the mouse
   * @param {HTMLElement} toolTip Tooltip element
   * @param {HTMLElement} histogramContainer Container for graph element
   * @param {Array} terms
   */
  updateTooltip(event, ranges, pageX, toolTip, histogramContainer, terms) {
    const tooltipY = $(histogramContainer).offset().top + HistogramFacet.canvasHeight - 20;
    let displayString;
    if (ranges) {
      if (histogramContainer.currentSelection && histogramContainer.currentSelection.xaxis) {
        const range = this.roundedRange(ranges.xaxis);
        displayString = `${range.from.toString()}-${(range.to - 1).toString()}`;
      } else {
        let year = Math.floor(ranges.xaxis.from);
        year -= (year % this.facetConfig.barWidth);
        if (terms[year]) {
          const hitCount = terms[year];
          displayString = `${year.toString()}: ${hitCount} ${Utility.localise('Treffer')}`;
        }
      }
    }

    if (displayString) {
      HistogramFacet.showTooltip(pageX, tooltipY, displayString, toolTip);
    } else {
      HistogramFacet.hideTooltip();
    }
  }

  static hideTooltip() {
    document.getElementById('tx_find-histogram-tooltip').style.display = 'none';
  }

  static startSearchWithNewFacet(event, range, selectedHistogramFacets) {
    const jHistogram = $(event.target).closest('.histogram');
    const linkTemplate = jHistogram.data('link');

    const activeFacetValues = Object.keys(selectedHistogramFacets);
    const facetQueryString = `RANGE ${range.from} TO ${range.to - 1}`;

    // Only change the location if the facet selection has changed.
    if (!(facetQueryString in activeFacetValues)) {
      window.location.href = linkTemplate.replace('%25%25%25%25', escape(facetQueryString));
    }
  }

  /**
   * Rounds the xaxis range of the passed ranges, selects the resulting
   * range in the histogram and starts a new search.
   */
  selectRanges(event, ranges, selectedHistogramFacets, plot) {
    const newRange = this.roundedRange(ranges.xaxis);
    plot.setSelection({ xaxis: newRange }, true);
    HistogramFacet.hideTooltip();
    HistogramFacet.startSearchWithNewFacet(event, newRange, selectedHistogramFacets);
  }

  /**
   * Rounds the passed range to the next multiple of facetConfig.barWidth
   * below and above.
   *
   * @param {object} range
   * @returns {object}
   */
  roundedRange(range) {
    const fromFloor = range.from - (range.from % this.facetConfig.barWidth);
    const toCeil = range.to + this.facetConfig.barWidth - (range.to % this.facetConfig.barWidth);
    return {
      from: fromFloor,
      to: toCeil,
    };
  }

  /**
   * Finds all histogram facets and draws them.
   */
  initializeHistogramFacets() {
    document.querySelectorAll('.facetHistogram-container .histogram').forEach((element) => {
      this.createHistogramForTermsInContainer(element);
    });
  }

  /**
   * Uses jQuery.flot to create a histogram in »container« using the
   * configuration provided by the data-facet-config attribute.
   *
   * @param {HTMLElement} histogramContainer
   */
  createHistogramForTermsInContainer(histogramContainer) {
    const jGraphDiv = histogramContainer;
    this.facetConfig = histogramContainer.dataset.facetConfig;
    const selectedHistogramFacets = this.facetConfig.activeFacets[this.facetConfig.id] || {};

    const graphWidth = $(jGraphDiv).parents('.facets').width();
    $(jGraphDiv).css({ width: `${graphWidth}px`, height: `${HistogramFacet.canvasHeight}px`, position: 'relative' });

    const terms = this.facetConfig.data;
    const graphData = [];
    terms.forEach((yearName) => {
      const year = parseInt(yearName, 10);
      if (year) {
        graphData.push([year, terms[yearName]]);
      }
    });

    /**
     * Set up xaxis with two labelled ticks, one at each end.
     * Dodgy: Use whitespace to approximately position the labels in a way that they don’t
     * extend beyond the end of the graph (by default they are centered at the point of
     * their axis, thus extending beyond the width of the graph on one site.
     *
     * @param {object} axis
     * @returns {array}
     */
    const xaxisTicks = (axis) => [[axis.datamin, `      ${axis.datamin}`], [axis.datamax, `${axis.datamax}      `]];
    // Use the colour of term list titles for the histogram.
    const graphColour = $('.facetAdd', Utility.getContainer()).css('color');
    const selectionColour = $('.facet h1', Utility.getContainer()).css('color');

    const graphOptions = {
      series: {
        bars: {
          show: true,
          fill: true,
          lineWidth: 0,
          barWidth: this.facetConfig.barWidth,
          fillColor: 'grey',
        },
      },
      xaxis: {
        tickDecimals: 0,
        ticks: xaxisTicks,
        autoscaleMargin: null,
      },
      yaxis: {
        position: 'right',
        tickDecimals: 0,
        tickFormatter(val) {
          return (parseInt(val, 10) !== 0) ? val : ('');
        },
        labelWidth: 30,
      },
      grid: {
        borderWidth: 0,
        hoverable: true,
      },
      selection: {
        mode: 'x',
        color: selectionColour,
        minSize: 0,
      },
    };

    // Create plot.
    const plot = $.plot($(jGraphDiv), [{ data: graphData, color: graphColour }], graphOptions);

    // Create tooltip.
    let toolTip = document.getElementById('tx_find-histogram-tooltip');
    if (toolTip.length === 0) {
      const tooltipDiv = document.createElement('div');
      tooltipDiv.setAttribute('id', 'tx_find-histogram-tooltip');
      toolTip = document.body.appendChild(toolTip);
    }

    selectedHistogramFacets.forEach((term) => {
      const matches = term.match(/RANGE (.*) TO (.*)/);
      if (matches) {
        const selection = {
          from: parseInt(matches[1], 10),
          to: parseInt(matches[2], 10) + 1,
        };
        plot.setSelection({ xaxis: selection });
      }
    });

    jGraphDiv.addEventListener('plotclick', () => true);

    jGraphDiv.addEventListener('plotselected', (event, ranges) => {
      HistogramFacet.selectRanges(event, ranges, selectedHistogramFacets, plot);
    }, {
      once: true,
    });

    jGraphDiv.addEventListener('plotunselected', () => false);

    jGraphDiv.addEventListener('plothover', (event, ranges) => {
      this.updateTooltip(
        event,
        { xaxis: { from: ranges.x, to: ranges.x } },
        ranges.pageX,
        toolTip,
        histogramContainer,
        terms,
      );
    });

    jGraphDiv.addEventListener('plotselecting', (event, info) => {
      histogramContainer.currentSelection = info;
      this.updateTooltip(event, info, null, toolTip, histogramContainer, terms);
    });

    jGraphDiv.addEventListener('mouseout', HistogramFacet.hideTooltip);
  }
}

export default HistogramFacet;

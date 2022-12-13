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
import Choices from 'choices.js';
import $ from 'jquery';
import Utility from './Utility';
import HistogramFacet from './HistogramFacet';
import MapFacet from './MapFacet';
import FacetUtility from './FacetUtility';
import Search from './Search';

class Find {
  static bindEvents() {
    Find.initialise();
    const histogramFacet = new HistogramFacet();
    histogramFacet.bindEvents();
  }

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
  static inputsWithPrefixForObject(prefix, object) {
    let inputs = [];

    object.forEach((key) => {
      const prefixWithKey = `${prefix}[${key}]`;
      const value = object[key];
      if (typeof (value) === 'object') {
        inputs = inputs.concat(Find.inputsWithPrefixForObject(prefixWithKey, value));
      } else {
        inputs.push(Find.inputWithNameAndValue(prefixWithKey, value));
      }
    });

    return inputs;
  }

  /**
   * Creates an <input> element for the given name and value.
   *
   * @param {string} name for name property of the <input> element
   * @param {string} value for value property of the <input> element
   * @returns DOMElement <input> element
   */
  static inputWithNameAndValue(name, value) {
    const input = document.createElement('input');
    input.name = name;
    input.value = value;
    input.type = 'hidden';
    return input;
  }

  /**
   * Initialise. Set up:
   * * container element variable
   * * autocomplete for form fields
   * * autocomplete for facets
   * * event handlers
   */
  static initialise() {
    if ($.ui && $.ui.autocomplete) {
      // Set up jQuery UI Autocomplete search fields with the autocompleteURL attribute.
      $('.fieldContainer input[autocompleteURL!=""]', $(Utility.getContainer())).autocomplete({
        source(request, returnSuggestions) {
          let autocompleteURL = this.element.attr('autocompleteURL');
          if (autocompleteURL) {
            autocompleteURL = autocompleteURL.replace('%25%25%25%25', request.term.toLowerCase());
            $.getJSON(autocompleteURL, (data) => {
              returnSuggestions(data);
            });
          }
        },
      });
    }

    // Set up Maps
    const mapContainer = Utility.getContainer().querySelector('.facetMap-container');
    if (mapContainer) {
      // eslint-disable-next-line no-unused-vars
      const mapFacet = new MapFacet();
    }

    // Set up Choices for facet lists with a .facetSearch input.
    Utility.getContainer().querySelectorAll('.facetSearch').forEach((element) => {
      // eslint-disable-next-line no-new
      new Choices(element, { allowHTML: true });
      element.addEventListener('change', FacetUtility.facetChosenSelect);
    });

    const extendedSearchLink = Utility.getContainer().querySelector('a.extendedSearch');
    if (extendedSearchLink) {
      extendedSearchLink.addEventListener('click', Search.toggleExtendedSearch);
    }
    const histogramFacet = new HistogramFacet();
    histogramFacet.initializeHistogramFacets();
  }

  /**
   * Called by links to detail view pages for which result paging is required.
   *    * passes the detail page information in GET parameters (for good URLs)
   *    * passes the query information in POST parameters
   *    * the server can then render the details page while still having information
   *        about the original query for paging
   *
   * @param {DOMImplementation} element receiver of the click event
   * @param {int} position number of the result to go to [optional]
   * @returns Boolean false when the POST request was submitted, true otherwise
   */
  static detailViewWithPaging(element, position) {
    const underlyingQueryContainer = document.querySelector('.underlyingQuery');

    if (underlyingQueryContainer) {
      const { underlyingQuery } = underlyingQueryContainer.dataset;

      // Try to determine position if it is not set explicitly
      // (we should be in the main result list).
      const jLI = $(element).parents('li');
      const jOL = jLI.parents('ol');
      if (position) {
        underlyingQuery.position = position;
      } else if (jOL) {
        underlyingQuery.position = parseInt(jOL.attr('start'), 10) + parseInt(jLI.index(), 10);
      }

      const form = document.createElement('form');
      form.action = element.getAttribute('href');
      form.method = 'POST';
      form.style = 'display:none;';
      document.body.appendChild(form);

      const inputs = Find.inputsWithPrefixForObject(`${Utility.getURLParameterPrefix()}[underlyingQuery]`, underlyingQuery);
      inputs.forEach((inputIndex) => {
        form.appendChild(inputs[inputIndex]);
      });

      if (Utility.getContainer().querySelectorAll('.searchForm.search-extended').length > 0) {
        form.appendChild(Find.inputWithNameAndValue(`${Utility.getURLParameterPrefix()}[extended]`, '1'));
      }

      form.submit();
      return false;
    }

    return true;
  }
}

export default Find;

import $ from 'jquery';
import Utility from './Utility';

class Search {
  /**
   * Toggles extended search: shows/hides additional fields
   * and changes location URL to reflect the state.
   *
   * @returns {boolean}
   */
  static toggleExtendedSearch(event) {
    // Change URL in address bar.
    const jForm = Utility.getContainer().querySelector('.searchForm');
    const jThis = $(event.target);
    const makeExtended = !$(jForm).hasClass('search-extended');
    if (makeExtended) {
      jThis.text(event.target.attr('extendedstring'));
      $('.field-mode-extended', $(jForm)).slideDown('fast');
      Utility.changeURLParameterForPage('extended', 1);
    } else {
      jThis.text(event.target.attr('simplestring'));
      $('.field-mode-extended', $(jForm)).slideUp('fast');
      Utility.changeURLParameterForPage('extended');
    }
    $(jForm).toggleClass('search-simple').toggleClass('search-extended');

    return false;
  }
}

export default Search;

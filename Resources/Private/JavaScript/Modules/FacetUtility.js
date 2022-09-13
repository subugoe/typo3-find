class FacetUtility {
  /**
   * Handles selection in jquery.chosen menu for facets:
   * Get link of the selected facet and follow it.
   *
   * @param {Event} event
   * @param {object} data
   * @returns {undefined}
   */
  static facetChosenSelect(event, data) {
    const term = data.selected;

    const jLI = document.querySelectorAll(`li[value='${term}']`);
    if (jLI.length === 1) {
      jLI.querySelectorAll('a')[0].trigger('click');
    }
  }

  /**
   * Slides in the hidden items of a facet.
   *
   * @param {Event} myEvent click event
   * @returns {Boolean} false
   */
  static showAllFacetsOfType(myEvent) {
    const vanillaLink = myEvent.target;
    const containingList = vanillaLink.closest('ol');
    const linkShowAll = containingList.querySelector('.facetShowAll');
    const linkHideHidden = containingList.querySelector('.facetHideHidden');
    // Fade in the hidden elemens and hide the Show All link.
    containingList.querySelectorAll('.hidden').forEach((element) => {
      const newElement = element;
      const originHeight = '100px';
      newElement.style.transition = 'height 3s';
      const { height } = newElement.ownerDocument.defaultView.getComputedStyle(newElement, null);
      if (parseInt(height, 10) === 0) {
        newElement.style.height = originHeight;
      } else {
        newElement.style.height = '0px';
      }
    });

    // Check links to show all or hide previously hidden elements and toggle css style
    // attribute 'display'
    if (linkShowAll.matches(':hidden')) {
      linkShowAll.style.display = 'block';
      linkHideHidden.style.display = 'none';
    } else {
      linkShowAll.style.display = 'none';
      linkHideHidden.style.display = 'block';
    }
    return false;
  }
}

export default FacetUtility;

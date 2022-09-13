class Utility {
  static getURLParameterPrefix() {
    return 'tx_find_find';
  }

  // Localisation function. Currently not implemented.
  static localise(term) {
    return term;
  }

  /**
   * Pushes newURL to the history state.
   *
   * @param {string} newURL
   */
  static changeURL(newURL) {
    if (window.history.pushState !== undefined) {
      window.history.pushState(null, null, newURL);
    }
  }

  static removeURLParameter(url, name) {
    const nameEscaped = encodeURIComponent(name);
    const re = new RegExp(`&?${nameEscaped}=[^&]*`);
    return url.replace(re, '').replace(/\?$/, '');
  }

  static addURLParameter(url, name, value) {
    const nameEscaped = encodeURIComponent(name);
    const valueEscaped = encodeURIComponent(value);
    const urlParts = url.split('#');
    urlParts[0] += `${(urlParts[0].match(/\?/) ? '&' : '?') + nameEscaped}=${valueEscaped}`;
    return urlParts.join('#');
  }

  static getContainer() {
    return document.querySelector('.tx_find');
  }

  static changeURLParameterForPage(name, value) {
    const parameterName = `${Utility.getURLParameterPrefix()}[${name}]`;

    // Change the URL in the location bar.
    let newURL = Utility.removeURLParameter(window.location.href, parameterName);
    if (value !== undefined) {
      newURL = Utility.addURLParameter(newURL, parameterName, value);
    }
    Utility.changeURL(newURL);

    // Change other link URLs on the page.
    Utility.getContainer().querySelectorAll('a:not(.no-change)').forEach((element) => {
      if (value !== undefined) {
        element.href = Utility.addURLParameter(element.href, parameterName, value);
      } else {
        element.href = Utility.removeURLParameter(element.href, parameterName);
      }
    });

    // De/activate hidden input »extended« in the form.
    Utility.getContainer().querySelectorAll(`input.${parameterName}`).forEach((element) => {
      if (value !== undefined) {
        element.setAttribute('name', `${Utility.getURLParameterPrefix()}[${parameterName}]`);
      } else {
        element.setAttribute('name', '');
      }
    });
  }
}

export default Utility;

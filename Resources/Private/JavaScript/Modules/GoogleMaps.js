class GoogleMaps {
  static load() {
    if (!window.google || !window.google.maps) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&callback=tx_find.googleMapsLoader.mapsCallback';
      document.body.appendChild(script);
    }
  }

  static mapsCallback() {
    if (window.CustomEvent) {
      const event = new CustomEvent('tx_find.mapsLoaded');
    } else {
      const event = document.createEvent('tx_find.mapsLoaded');
    }

    document.dispatchEvent(event);
  }
}

export default GoogleMaps;

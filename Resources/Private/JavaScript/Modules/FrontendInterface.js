import GoogleMaps from './GoogleMaps';
import MapFacet from './MapFacet';

class FrontendInterface {
  frontendInterface = {};

  config;

  map;

  init(parameters) {
    this.config = parameters;
    this.frontendInterface.config = config;
    this.frontendInterface.markers = {};
    const mapFacet = new MapFacet();
    if (document.google !== undefined && google.maps) {
      mapFacet.mapsLoadedCallback();
    } else {
      document.addEventListener('tx_find.mapsLoaded', mapFacet.mapsLoadedCallback);
      GoogleMaps.load();
    }
  }

  get frontendInterface() {
    return this.frontendInterface;
  }
}

export default FrontendInterface;

import Utility from './Utility';
import 'js-geohash/geohash';

class MapFacet {
  config = {};

  constructor() {
    const configContainer = Utility.getContainer().querySelector('.facetMap-container');
    if (configContainer) {
      this.config = configContainer.dataset;
      this.config.facetData = JSON.parse(this.config.facetData);
    }
  }

  mapsLoadedCallback() {
    // Extract information from facet data.
    // The facet term needs begin with the zero-padded zoom level,
    let bounds;
    // a dash and the geohash. The facet needs to be sorted by index.
    const zoomInfo = {};
    let lastZoomLevel = 0;
    this.config.facetData.forEach((facetIndex) => {
      const indexParts = facetIndex.split('-');
      if (indexParts.length === 2) {
        const geohashScale = parseInt(indexParts[0], 10);
        lastZoomLevel = geohashScale;

        if (!zoomInfo[geohashScale]) {
          zoomInfo[geohashScale] = {};
        }
        zoomInfo[geohashScale][indexParts[1]] = this.config.facetData[facetIndex];
      }
    });

    const lastZoomLevelIsComplete = (
      Object.keys(this.config.facetData).length < this.config.facetFetchMaximum
    );
    if (!lastZoomLevelIsComplete) {
      lastZoomLevel -= 1;
    }

    // Create map.
    const mapOptions = {
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      mapTypeControl: false,
      streetViewControl: false,
      scrollwheel: false,
    };

    const map = new window.google.maps.Map(this.config.container, mapOptions);

    // Use the last complete level of geo information to determine the bounding box.
    const containingBounds = new window.google.maps.LatLngBounds();
    let zoomLevelInfo = zoomInfo[lastZoomLevel];
    zoomLevelInfo.forEach((geohashString) => {
      const geohashBounds = window.geohash.bbox(geohashString);
      bounds = new window.google.maps.LatLngBounds(
        new window.google.maps.LatLng(geohashBounds.s, geohashBounds.w),
        new window.google.maps.LatLng(geohashBounds.n, geohashBounds.e),
      );
      containingBounds.union(bounds);
    });

    // Shrink the bounding box a little to compensate for Google’s generous margins.
    const containingSpan = containingBounds.toSpan();
    const shrinkFactor = 0.2;
    const shrunkBounds = new window.google.maps.LatLngBounds(
      new window.google.maps.LatLng(
        containingBounds.getSouthWest().lat() + containingSpan.lat() * shrinkFactor,
        containingBounds.getSouthWest().lng() + containingSpan.lng() * shrinkFactor,
      ),
      new window.google.maps.LatLng(
        containingBounds.getNorthEast().lat() - containingSpan.lat() * shrinkFactor,
        containingBounds.getNorthEast().lng() - containingSpan.lng() * shrinkFactor,
      ),
    );

    const centre = shrunkBounds.getCenter();
    bounds = shrunkBounds.extend(
      new window.google.maps.LatLng(centre.lat() - 0.01, centre.lng() - 0.01),
    ).extend(
      new window.google.maps.LatLng(centre.lat() + 0.01, centre.lng() + 0.01),
    );

    map.fitBounds(shrunkBounds);

    // Determine which zoom level to take the data from.
    let geohashScaleForMarkers = 0;
    for (let zoomLevel = 1; zoomLevel <= lastZoomLevel; zoomLevel += 1) {
      if (Object.keys(zoomInfo[zoomLevel]).length < 100) {
        geohashScaleForMarkers = zoomLevel;
      }
    }

    zoomLevelInfo = zoomInfo[geohashScaleForMarkers];
    zoomLevelInfo.forEach((geohashString) => {
      const geohashPoint = window.geohash.decode_exactly(geohashString);
      const point = new window.google.maps.LatLng(geohashPoint[0], geohashPoint[1]);
      const resultCount = zoomLevelInfo[geohashString];

      [geohashString] = new window.google.maps.Marker({
        map,
        position: point,
        title: resultCount.toString(),
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          strokeColor: 'e33',
          fillColor: 'f33',
          fillOpacity: 1,
          scale: 0.5 + Math.min(Math.sqrt(resultCount), 5),
        },
      });
    });

    document.querySelector(this.config.container).dispatchEvent('tx_find.facetMapLoaded');
  }
}

export default MapFacet;

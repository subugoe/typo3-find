plugin.tx_solrfrontend {
  settings {
    connection {
      host = 127.0.0.1
     # host = vlib.sub.uni-goettingen.de
      port = 8080
      path = /solr/gs
    }
    standardFields {
      title = kloster
      snippet = uebersetzung
    }
    facets {
      10 = bistum
      20 = land
      30 = orden
      40 = band_nummer
      50 = standort_jahr50
      60 = orden_jahr50
    }
    facetDisplayCount {
      land = 10
      standort_jahr50 = 20000
      orden_jahr50 = 20000
    }
    additionalFilters {
      1 = typ:kloster
    }
  }
  view {
    templateRootPath = EXT:solr_frontend/Resources/Private/germania-sacra/Templates/
    partialRootPath = EXT:solr_frontend/Resources/Private/germania-sacra/Partials/
  }
}

plugin.tx_pagebrowse_pi1.enableMorePages = 1
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
      10 = orden
      20 = orden_jahr50
      30 = bistum
      40 = land
    }
    facetDisplayCount {
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
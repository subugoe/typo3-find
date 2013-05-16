plugin.tx_solrfrontend {
  settings {
    connection {
      host = 127.0.0.1
     # host = vlib.sub.uni-goettingen.de
      port = 8080
      path = /solr/germania-sacra
    }
	queryFields {
		10.id = bistum
		15 {
			id = notbistum
			query = NOT bistum:###term###
			type = text
		}
		20 >
		30 >
		40 >
	}
    standardFields {
      title = kloster
      snippet = uebersetzung
    }
    facets {
      10 = orden_facet
      20 = orden_jahr50
      30 = bistum_facet
      40 = land_facet
    }
    facetDisplayCount {
      orden_jahr50 = 20000
    }
    additionalFilters {
      1 = typ:kloster
    }
	CSSPaths.20 = EXT:solr_frontend/Resources/Private/germania-sacra/germania-sacra.css
  }
  view {
    templateRootPath = EXT:solr_frontend/Resources/Private/germania-sacra/Templates/
    partialRootPath = EXT:solr_frontend/Resources/Private/germania-sacra/Partials/
  }
}

plugin.tx_pagebrowse_pi1.enableMorePages = 1

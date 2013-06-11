plugin.tx_solrfrontend {
	settings {
		connection {
			host = 127.0.0.1
			# host = vlib.sub.uni-goettingen.de
			port = 8080
			path = /solr/germania-sacra
		}
		queryFields {
			10 >
			15 >
			20 >
			30 >
			40 >
		}
		sort {
			1 {
				field = ort_sort
				ascending = 1
			}
		}
		standardFields {
			title = kloster
			snippet = uebersetzung
		}
		facets {
			10.field = orden_facet
			20 {
				field = orden_jahr50
				sortOrder = index
				fetchMaximum = 1000
				type = histogram
				barWidth = 50
			}
			25 {
				field = standort_jahr50
				sortOrder = index
				fetchMaximum = 1000
				type = histogram
				barWidth = 50
			}
			30.field = bistum_facet
			40.field = land_facet
		}
		additionalFilters {
			1 = typ:kloster
		}
		CSSPaths.50 = EXT:solr_frontend/Resources/Private/germania-sacra/germania-sacra.css

		languageRootPath = EXT:solr_frontend/Resources/Private/germania-sacra/Language/
	}
	view {
		templateRootPath = EXT:solr_frontend/Resources/Private/germania-sacra/Templates/
		partialRootPath = EXT:solr_frontend/Resources/Private/germania-sacra/Partials/
	}
}

plugin.tx_pagebrowse_pi1.enableMorePages = 1

plugin.tx_solrfrontend {
	settings {
		connection {
			host = 127.0.0.1
			# host = vlib.sub.uni-goettingen.de
			port = 8080
			path = /solr/germania-sacra
		}
		queryFields {
			0 {
				query = {!join from=kloster_id to=id}(###term### AND typ:standort-orden)
			}
			10 {
				extended = 1
				id = bistum
				type = Text
				autocomplete = 1
				autocompleteDictionary = bistum_suggest
			}
			15 {
				id = orden
				type = Text
				autocomplete = 1
				autocompleteDictionary = orden_suggest
			}
			20 >
			30 >
			40 >
		}
		sort {
			1 {
				id = default
				sortCriteria = ort_sort asc,von asc
			}
		}
		standardFields {
			title = kloster
			snippet = uebersetzung
		}
		facets {
			10 {
				id = orden
				field = orden_facet
				query = {!join from=kloster_id to=id}(orden_facet:"###term###" AND typ:standort-orden)
			}
			20 {
				id = jahr50
				field = jahr50
				query = {!join from=kloster_id to=id}(orden_standort_jahr50:###term### AND typ:standort-orden)
				sortOrder = index
				fetchMaximum = 1000
				type = histogram
				barWidth = 50
			}
			30 {
				id = bistum
				field = bistum_facet
				query = {!join from=kloster_id to=id}(bistum_facet:"###term###" AND typ:standort-orden)
			}
			40 {
				id = land
				field = land_facet
				query = {!join from=kloster_id to=id}(land_facet:"###term###" AND typ:standort-orden)
			}
		}
		highlight {
			fields.1 = *
			query = ###term###* OR ###term###
			useQueryTerms = 1
			useFacetTerms = 1
		}
		additionalFilters {
			1 = typ:kloster
		}
		CSSPaths.50 = EXT:solr_frontend/Resources/Private/germania-sacra/germania-sacra.css

		languageRootPath = EXT:solr_frontend/Resources/Private/germania-sacra/Language/
	}
	view {
		templateRootPath = EXT:solr_frontend/Resources/Private/germania-sacra/Templates/
		# partialRootPath = EXT:solr_frontend/Resources/Private/germania-sacra/Partials/
	}
}

plugin.tx_pagebrowse_pi1.enableMorePages = 1

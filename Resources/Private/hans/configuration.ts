plugin.tx_solrfrontend {
	settings {
		connection {
			host = ssgfi1.sub.uni-goettingen.de
			port = 8081
			path = /solr/hans
		}
		queryFields {
			10 {
				extended = 1
				id = title
				type = Text
			}
			20 {
				extended = 1
				id = pers
				type = Text
			}
			30 {
				extended = 1
				id = key
				type = Text
			}
			40 {
				extended = 1
				id = date
				type = Text
			}
		}
		sort {
			1 {
				field = Titel_sort
				ascending = 1
			}

		}
		standardFields {
			title = Gesamttitel
			snippet = Regest
		}
		facets {
			10 {
				id = typ
				field = Satzart
			}
			20 {
				id = lang
				field = Sprache
			}
		}
		highlight {
			fields.1 = *
			query = ###term###
			useQueryTerms = 1
			useFacetTerms = 1
		}
		additionalFilters {
		}

	}
	view {
		templateRootPath = EXT:solr_frontend/Resources/Private/hans/Templates/
		# partialRootPath = EXT:solr_frontend/Resources/Private/germania-sacra/Partials/
	}
}

plugin.tx_pagebrowse_pi1.enableMorePages = 1

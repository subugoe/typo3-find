plugin.tx_solrfrontend {
	settings {
		connection {
			host = ssgfi1.sub.uni-goettingen.de
			port = 8081
			path = /solr/hans
		}
		queryFields {
			0 {
				query = ###term### AND -Satzart:Stamm*
			}
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
				id = default
				sortCriteria = Titel_sort asc
			}
		}
		standardFields {
			title = Titel_disp
			snippet = Regest
		}
		facets {
			10 {
				id = typ
				field = Satzart
			}
			20 {
				id = person
				field = Person_ID
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

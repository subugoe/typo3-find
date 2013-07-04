plugin.tx_find {
	settings {
		connection {
			host = 127.0.0.1
			port = 8080
			path = /solr/edfu
		}
		queryFields {
			10 {
				extended = 1
				id = transliteration
				type = Text
			}
		}
		sort {
		}
		standardFields {
			title = transliteration
			snippet = uebersetzung
		}
		facets {
			10 {
				id = typ
				field = typ
			}
			20 {
				id = band
				field = band
				sortOrder = index
				displayDefault = 8
			}
		}
		highlight {
			fields.1 = *
			query = ###term###* OR ###term###
			useQueryTerms = 1
			useFacetTerms = 1
		}

		CSSPaths.50 = EXT:find/Resources/Projects/edfu/edfu.css

		languageRootPath = EXT:find/Resources/Projects/edfu/Language/
	}
	view {
		templateRootPath = EXT:find/Resources/Projects/edfu/Templates/
	}
}

plugin.tx_pagebrowse_pi1.enableMorePages = 1

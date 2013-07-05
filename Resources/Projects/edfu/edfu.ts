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
		additionalFilters {
			1 = -typ:wb_berlin
			2 = -typ:stelle
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
				excludeOwnFilter = 1
				type = Tabs
				hidden = 1
				facetQuery {
					10 {
						id = formular
						query = typ:formular
					}
					20 {
						id = gott
						query = typ:gott
					}
					30 {
						id = ort
						query = typ:ort
					}
					40 {
						id = wort
						query = typ:wort
					}
					50 {
						id = all
						query = typ:formular OR typ:gott OR typ:ort OR typ:wort
					}
				}
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

		CSSPaths.50 = EXT:find/Resources/Projects/edfu/Resources/edfu.css

		languageRootPath = EXT:find/Resources/Projects/edfu/Language/
	}
	view {
		templateRootPath = EXT:find/Resources/Projects/edfu/Templates/
		partialRootPath = EXT:find/Resources/Projects/edfu/Partials/
	}
}

plugin.tx_pagebrowse_pi1.enableMorePages = 1

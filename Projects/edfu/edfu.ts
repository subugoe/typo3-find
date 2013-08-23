plugin.tx_find {
	settings {
		connection {
			host = 127.0.0.1
			port = 8080
			path = /solr/edfu
		}
		queryFields {
			0 {
				noescape = 1
			}
			10 {
				extended = 1
				id = transliteration_exact
				query = transliteration:###term###
				noescape = 1
				type = Text
			}
			20 {
				extended = 1
				id = transliteration_nosuffix
				noescape = 1
				type = Text
			}
		}
		additionalFilters {
			1 = -typ:wb_berlin
			2 = -typ:stelle
			3 = -typ:gott
			4 = -typ:ort
		}
		sort {
			1 {
				id = default
				sortCriteria = sort asc
			}
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
				selectedByDefault {
					formular = 1
				}
				facetQuery {
					10 {
						id = formular
						query = typ:formular
					}
					20 {
						id = wort
						query = typ:wort
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
			fields {
				1 = transliteration_highlight
				2 = uebersetzung
				4 = texttyp
				5 = literatur
				6 = ortsbeschreibung
				7 = eponym
				8 = beziehung
				9 = funktion
				10 = ort
				11 = weiteres
				12 = anmerkung
				13 = stelle_anmerkung
				14 = lemma
				15 = bandseitezeile_highlight
			}
			useQueryTerms = 0
			useFacetTerms = 0
			alternateFields {
				transliteration = transliteration_highlight
			}
		}

		CSSPaths.50 = EXT:find/Projects/edfu/Resources/edfu.css
		JSPaths.50 = EXT:find/Projects/edfu/Resources/edfu.js

		languageRootPath = EXT:find/Projects/edfu/Language/
	}
	view {
		templateRootPath = EXT:find/Projects/edfu/Templates/
		partialRootPath = EXT:find/Projects/edfu/Partials/
	}
}


[usergroup = 1]
plugin.tx_find.settings {
	facets.10.facetQuery {
		30 {
			id = gott
			query = typ:gott
		}
		40 {
			id = ort
			query = typ:ort
		}
	}
	additionalFilters {
		3 >
		4 >
	}
}
[global]
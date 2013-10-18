plugin.tx_find {
	settings {
		connection {
			host = 127.0.0.1
			port = 8080
			path = /solr/edfu
			timeout = 10
		}
		queryFields {
			0 {
				query = %s -typ:wb_berlin -typ:stelle
				noescape = 1
			}
			10 {
				id = translit
				type = Text
				query = transliteration:%s -typ:wb_berlin -typ:stelle
				queryAlternate.1 = transliteration_nosuffix:%s -typ:wb_berlin -typ:stelle
				noescape = 1
			}
			30 {
				id = szene
				hidden = 1
				query = szene_uid:%s -typ:wb_berlin -typ:stelle
				type = Text
			}
			40 {
				id = texttyp
				hidden = 1
				query = texttyp:%s
				phrase = 1
				type = Text
			}
			50 {
				id = ort
				hidden = 1
				query = ort:%s
				phrase = 1
				type = Text
			}
			50 {
				id = lokalisation
				hidden = 1
				query = lokalisation:%s
				phrase = 1
				type = Text
			}
		}
		queryFieldForDataField {
			texttyp = texttyp
			ort = ort
			lokalisation = lokalisation
		}
		additionalFilters {
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
			30 {
				id = tempel
				field = tempel
				fetchMinimum = 1
			}
		}
		highlight {
			default {
				fields {
					f1 = transliteration_highlight
					f2 = uebersetzung
					f3 = texttyp
					f4 = eponym
					f5 = beziehung
					f6 = ort
					f7 = weiteres
					f8 = anmerkung
				}
				fragsize = 5000
				useQueryTerms = 0
				useFacetTerms = 0
				alternateFields {
					transliteration = transliteration_highlight
					bandseitezeile = bandseitezeile_highlight
				}
			}
			detail {
				f51 = literatur
				f52 = ortsbeschreibung
				f53 = funktion
				f54 = stelle_anmerkung
				f55 = lemma
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


#[usergroup = 1]
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
#[global]
plugin.tx_find {
	settings {
		connection {
			host = 127.0.0.1
			# host = vlib.sub.uni-goettingen.de
			port = 8080
			path = /solr/germania-sacra
		}
		defaultQuery = {!join from=kloster_id to=id}(typ:standort-orden)
		queryFields {
			0 {
				query = {!join from=kloster_id to=id}(%s AND typ:standort-orden)
				noescape = 1
				autocomplete = 1
				autocompleteDictionary = suggest
			}
			1 {
				id = default-nojoin
				type = Text
				query = (%s AND typ:standort-orden)
				noescape = 1
				hidden = 1
			}
			5 {
				id = klostername
				type = Text
				query = {!join from=kloster_id to=id}(kloster:%s AND typ:standort-orden)
				noescape = 1
				extended = 1
				autocomplete = 1
				autocompleteDictionary = klostername_suggest
			}
			6 {
				id = klostername-nojoin
				type = Text
				query = (kloster:%s AND typ:standort-orden)
				hidden = 1
				noescape = 1
				extended = 1
			}
			10 {
				id = bistum
				type = Text
				query = {!join from=kloster_id to=id}(bistum:%s AND typ:standort-orden)
				noescape = 1
				extended = 1
				autocomplete = 1
				autocompleteDictionary = bistum_suggest
			}
			11 {
				id = bistum-nojoin
				type = Text
				query = (bistum:%s AND typ:standort-orden)
				hidden = 1
				noescape = 1
				extended = 1
			}
			20 {
				id = orden
				type = Text
				query = {!join from=kloster_id to=id}(orden:%s AND typ:standort-orden)
				noescape = 1
				extended = 1
				autocomplete = 1
				autocompleteDictionary = orden_suggest
			}
			21 {
				id = orden-nojoin
				type = Text
				query = (orden:%s AND typ:standort-orden)
				hidden = 1
				noescape = 1
				extended = 1
			}
			30 {
				id = ort
				type = Text
				query = {!join from=kloster_id to=id}(ort:%s AND typ:standort-orden)
				noescape = 1
				extended = 1
				autocomplete = 1
				autocompleteDictionary = ort_suggest
			}
			31 {
				id = ort-nojoin
				type = Text
				query = (ort:%s AND typ:standort-orden)
				hidden = 1
				noescape = 1
				extended = 1
			}
			40 {
				id = zeitraum
				type = Range
				query = {!join from=kloster_id to=id}(orden_standort_von:[* TO %2$s] AND orden_standort_bis:[%1$s TO *] AND typ:standort-orden)
				default.0 = *
				default.1 = *
				noescape = 1
				extended = 1
			}
			41 {
				id = zeitraum-nojoin
				type = Range
				query =  (orden_standort_von:[* TO %2$s] AND orden_standort_bis:[%1$s TO *] AND typ:standort-orden)
				default.0 = *
				default.1 = *
				hidden = 1
				noescape = 1
				extended = 1
			}
			50 {
				id = person
				type = Text
				query = ((person_name:%1$s OR person_namensalternativen:%1$s) AND typ:kloster)
				queryAlternate.1 = ((person_name:%1$s~0.5 OR person_namensalternativen:%1$s~0.5) AND typ:kloster)
				noescape = 1
				extended = 1
			}
			51 {
				id = person-nojoin
				type = Text
				query = ((person_name:%1$s OR person_namensalternativen:%1$s) AND typ:kloster)
				queryAlternate.1 = ((person_name:%1$s~0.5 OR person_namensalternativen:%1$s~0.5) AND typ:kloster)
				hidden = 1
				noescape = 1
				extended = 1
			}
			60 {
				id = status
				type = SelectFacet
				facetID = status
				query = {!join from=kloster_id to=id}(status_facet:"%s" AND typ:standort-orden)
				extended = 1
			}
			61 {
				id = status-nojoin
				type = SelectFacet
				facetID = status
				query = (status_facet:"%s" AND typ:standort-orden)
				extended = 1
				hidden = 1
			}
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
				id = map
				field = geohash
				type = Map
				sortOrder = index
				fetchMaximum = 1000
			}
			20 {
				id = orden
				field = orden_facet
				autocomplete = 1
				query = {!join from=kloster_id to=id}(orden_facet:"%s" AND typ:standort-orden)
			}
			30 {
				id = jahr50
				field = jahr50
				type = Histogram
				query = {!join from=kloster_id to=id}(orden_standort_jahr50:%s AND typ:standort-orden)
				sortOrder = index
				fetchMaximum = 1000
				barWidth = 10
			}
			40 {
				id = bistum
				field = bistum_facet
				autocomplete = 1
				query = {!join from=kloster_id to=id}(bistum_facet:"%s" AND typ:standort-orden)
			}
			50 {
				id = band
				field = band_facet
				sortPrefixSeparator = ####
				autocomplete = 1
				query = {!join from=kloster_id to=id}(band_facet:"%s" AND typ:standort-orden)
			}
			100 {
				id = status
				field = status_facet
				hidden = 1
				fetchMinimum = 0
			}
		}
		highlight {
			fields {
				1 = kloster
				2 = patrozinium
				11 = ort
				12 = bistum
				13 = land
				21 = orden
				22 = bemerkung_kloster
				31 = band_nummer
				32 = band_titel
				41 = url
				42 = url_bemerkung
				# 51 = person_name
				# 52 = person_namensalternativen
				# 53 = person_anmerkung
			}
			useQueryTerms = 1
			useFacetTerms = 1
		}
		additionalFilters {
			# 2 = bearbeitungsstatus:Online
		}
		CSSPaths.50 = EXT:find/Projects/germania-sacra/Resources/germania-sacra.css
		JSPaths.50 =  EXT:find/Projects/germania-sacra/Resources/germania-sacra.js

		languageRootPath = EXT:find/Projects/germania-sacra/Language/
	}
	view {
		templateRootPath = EXT:find/Projects/germania-sacra/Templates/
		partialRootPath = EXT:find/Projects/germania-sacra/Partials/
	}
}

tx_find_page_rdf = PAGE
tx_find_page_rdf {
	typeNum = 1378891468
	10 < tt_content.list.20.find_find
	config {
		disableAllHeaderCode = 1
		additionalHeaders = Content-type:application/rdf+xml;charset=utf-8
	}
}

tx_find_page_csv = PAGE
tx_find_page_csv {
	typeNum = 1378902868
	10 < tt_content.list.20.find_find
	config {
		disableAllHeaderCode = 1
		additionalHeaders = Content-type:text/comma-separated-values;charset=utf-8
	}
}

tx_find_page_bna = PAGE
tx_find_page_bna {
	typeNum = 1378914906
	10 < tt_content.list.20.find_find
	config {
		disableAllHeaderCode = 1
		additionalHeaders = Content-type:text/plain;charset=utf-8|Content-Disposition: attachment; filename="Kloester.bna"
	}
}

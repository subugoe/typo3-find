plugin.tx_find {
	settings {
		connection {
			host = 127.0.0.1
			# host = vlib.sub.uni-goettingen.de
			port = 8080
			path = /solr/germania-sacra
		}
		queryFields {
			0 {
				query = {!join from=kloster_id to=id}(%s AND typ:standort-orden)
				noescape = 1
				autocomplete = 1
				autocompleteDictionary = suggest
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
			10 {
				id = bistum
				type = Text
				query = {!join from=kloster_id to=id}(bistum:%s AND typ:standort-orden)
				noescape = 1
				extended = 1
				autocomplete = 1
				autocompleteDictionary = bistum_suggest
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
			30 {
				id = ort
				type = Text
				query = {!join from=kloster_id to=id}(ort:%s AND typ:standort-orden)
				noescape = 1
				extended = 1
				autocomplete = 1
				autocompleteDictionary = ort_suggest
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
			50 {
				id = person
				type = Text
				query = ((person_name_xml:%1$s OR person_namensalternativen_xml:%1$s) AND typ:kloster)
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
			fields.1 = *
			useQueryTerms = 1
			useFacetTerms = 1
		}
		additionalFilters {
			1 = typ:kloster
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

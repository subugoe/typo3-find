plugin.tx_find {
	settings {
		connection {
			host = 127.0.0.1
			# host = vlib.sub.uni-goettingen.de
			port = 8080
			path = /solr/germania-sacra
			timeout = 30
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
			10 {
				id = klostername
				type = Text
				query = {!join from=kloster_id to=id}(kloster:%s AND typ:standort-orden)
				noescape = 1
				extended = 1
				autocomplete = 1
				autocompleteDictionary = klostername_suggest
			}
			11 {
				id = klostername-nojoin
				type = Text
				query = (kloster:%s AND typ:standort-orden)
				hidden = 1
				extended = 1
			}
			20 {
				id = kloster-id
				type = Text
				query = (id:%s)
				extended = 1
			}
			21 {
				id = kloster-id-nojoin
				type = Text
				query = (id:%s)
				hidden = 1
				extended = 1
			}
			30 {
				id = status
				type = SelectFacet
				facetID = status
				query = {!join from=kloster_id to=id}(status_facet:"%s" AND typ:standort-orden)
				extended = 1
			}
			31 {
				id = status-nojoin
				type = SelectFacet
				facetID = status
				query = (status_facet:%s AND typ:standort-orden)
				phrase = 1
				extended = 1
				hidden = 1
			}
			40 {
				id = bistum
				type = Text
				query = {!join from=kloster_id to=id}(bistum:%s AND typ:standort-orden)
				noescape = 1
				extended = 1
				autocomplete = 1
				autocompleteDictionary = bistum_suggest
			}
			41 {
				id = bistum-nojoin
				type = Text
				query = (bistum:%s AND typ:standort-orden)
				hidden = 1
				noescape = 1
				extended = 1
			}
			50 {
				id = orden
				type = Text
				query = {!join from=kloster_id to=id}(orden:%s AND typ:standort-orden)
				noescape = 1
				extended = 1
				autocomplete = 1
				autocompleteDictionary = orden_suggest
			}
			51 {
				id = orden-nojoin
				type = Text
				query = (orden:%s AND typ:standort-orden)
				hidden = 1
				noescape = 1
				extended = 1
			}
			60 {
				id = ort
				type = Text
				query = {!join from=kloster_id to=id}(ort:%s AND typ:standort-orden)
				noescape = 1
				extended = 1
				autocomplete = 1
				autocompleteDictionary = ort_suggest
			}
			61 {
				id = ort-nojoin
				type = Text
				query = (ort:%s AND typ:standort-orden)
				hidden = 1
				noescape = 1
				extended = 1
			}
			70 {
				id = zeitraum
				type = Range
				query = {!join from=kloster_id to=id}(orden_standort_von:[* TO %2$s] AND orden_standort_bis:[%1$s TO *] AND typ:standort-orden)
				default.0 = *
				default.1 = *
				noescape = 1
				extended = 1
			}
			71 {
				id = zeitraum-nojoin
				type = Range
				query =  (orden_standort_von:[* TO %2$s] AND orden_standort_bis:[%1$s TO *] AND typ:standort-orden)
				default.0 = *
				default.1 = *
				hidden = 1
				noescape = 1
				extended = 1
			}
			80 {
				id = person
				type = Text
				query = ((person_name:%1$s OR person_namensalternativen:%1$s) AND typ:kloster)
				queryAlternate.1 = ((person_name:%1$s~0.7 OR person_namensalternativen:%1$s~0.7) AND typ:kloster)
				noescape = 1
				extended = 1
			}
			81 {
				id = person-nojoin
				type = Text
				query = ((person_name:%1$s OR person_namensalternativen:%1$s) AND typ:kloster)
				queryAlternate.1 = ((person_name:%1$s~0.7 OR person_namensalternativen:%1$s~0.7) AND typ:kloster)
				hidden = 1
				noescape = 1
				extended = 1
			}
			# corresponds to facet 20
			121 {
				id = orden-facet-nojoin
				type = Text
				query = (orden_facet:%s AND typ:standort-orden)
				phrase = 1
				extended = 1
				hidden = 1
			}
			# corresponds to facet 30
			131 {
				id = jahr50-facet-nojoin
				type = Text
				query = (orden_standort_jahr50:%s AND typ:standort-orden)
				extended = 1
				hidden = 1
			}
			# corresponds to facet 40
			141 {
				id = bistum-facet-nojoin
				type = Text
				query = (bistum_facet:%s AND typ:standort-orden)
				phrase = 1
				extended = 1
				hidden = 1
			}
			# corresponds to facet 50
			151 {
				id = band-facet-nojoin
				type = Text
				query = (band_facet:%s AND typ:standort-orden)
				phrase = 1
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
			# corresponds to queryField 121
			20 {
				id = orden
				field = orden_facet
				autocomplete = 1
				query = {!join from=kloster_id to=id}(orden_facet:"%s" AND typ:standort-orden)
			}
			# corresponds to queryField 131
			30 {
				id = jahr50
				field = jahr50
				type = Histogram
				query = {!join from=kloster_id to=id}(orden_standort_jahr50:%s AND typ:standort-orden)
				sortOrder = index
				fetchMaximum = 1000
				barWidth = 10
			}
			# corresponds to queryField 141
			40 {
				id = bistum
				field = bistum_facet
				autocomplete = 1
				query = {!join from=kloster_id to=id}(bistum_facet:"%s" AND typ:standort-orden)
			}
			# corresponds to queryField 151
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

		dataFields {
			default {
				default {
					f0 = id
					f1 = kloster
				}
			}
			detail {
				default {
					f0 = *
				}
			}
			data < plugin.tx_find.settings.dataFields.detail
		}

		highlight {
			default {
				fields {
					f1 = kloster
				}
				useQueryTerms = 1
				useFacetTerms = 1
			}
			detail {
				fields {
					f2 = patrozinium
					f11 = ort
					f12 = bistum
					f13 = land
					f21 = orden
					f22 = bemerkung_kloster
					f31 = band_nummer
					f32 = band_titel
					f41 = url
					f42 = url_bemerkung
					f51 = person_name
					f52 = person_namensalternativen
					# f53 = person_anmerkung
				}
			}
		}

		additionalFilters {
			# 2 = bearbeitungsstatus:Online
		}

		CSSPaths.50 = EXT:find/Projects/germania-sacra/Resources/germania-sacra.css
		CSSPaths.60 = EXT:find/Projects/germania-sacra/Resources/bib.css
		JSPaths.50 =  EXT:find/Projects/germania-sacra/Resources/germania-sacra.js

		languageRootPath = EXT:find/Projects/germania-sacra/Language/
	}
	view {
		templateRootPath = EXT:find/Projects/germania-sacra/Templates/
		partialRootPath = EXT:find/Projects/germania-sacra/Partials/
	}
}

tx_find_page_turtle = PAGE
tx_find_page_turtle {
	typeNum = 1380124799
	10 < tt_content.list.20.find_find
	config {
		disableAllHeaderCode = 1
		additionalHeaders = Content-type:text/turtle;charset=utf-8
	}
}

tx_find_page_rdf = PAGE
tx_find_page_rdf {
	typeNum = 1378891468
	10 < tt_content.list.20.find_find
	config {
		disableAllHeaderCode = 1
		additionalHeaders = Content-type:text/turtle;charset=utf-8
	}
}

tx_find_page_jsonld = PAGE
tx_find_page_jsonld {
	typeNum = 1380123307
	10 < tt_content.list.20.find_find
	config {
		disableAllHeaderCode = 1
		additionalHeaders = Content-type:text/json;charset=utf-8
	}
}

tx_find_page_csv = PAGE
tx_find_page_csv {
	typeNum = 1378902868
	10 < tt_content.list.20.find_find
	config {
		disableAllHeaderCode = 1
		additionalHeaders = Content-type:text/comma-separated-values;charset=utf-8|Content-Disposition:attachment;filename="Kloester.csv"
	}
}

tx_find_page_bna = PAGE
tx_find_page_bna {
	typeNum = 1378914906
	10 < tt_content.list.20.find_find
	config {
		disableAllHeaderCode = 1
		additionalHeaders = Content-type:text/plain;charset=utf-8|Content-Disposition:attachment;filename="Kloester.bna"
	}
}

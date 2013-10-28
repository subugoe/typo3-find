# »find« Extension configuration for the Germania Sacra index.
#
# 2013 Sven-S. Porst, SUB Göttingen <porst@sub.uni-goettingen.de>
#
plugin.tx_find {
	# Paths for own templates and partials.
	# Most of them us symlinks to point back to the standard files provided by the extension.
	view {
		templateRootPath = EXT:find/Projects/germania-sacra/Templates/
		partialRootPath = EXT:find/Projects/germania-sacra/Partials/
	}

	settings {
		# Connection setup for the Solr index.
		# Needs to be adapted / overwritten for the final configuration.
		connection {
			host = 127.0.0.1
			port = 8080
			path = /solr/germania-sacra

			# Use a huge 30 second timeout for Solr queries.
			# Some queries, e.g. when using a similarity search for person names
			# on documents with many (>1000) persons as well as highlighting,
			# do take longer than 5 seconds for some reason.
			timeout = 30
		}

		# Page ID of the bib extension’s store for Germania Sacra’s bibliography.
		# This needs to be adjusted for the Page ID of the target site.
		tx_bib_pid = 107

		# Add a filter query to only return documents marked as »Online«.
		additionalFilters {
			1 = bearbeitungsstatus:Online
		}

		# Query field configuration
		# The Germania Sacra index is complex as described in
		# https://github.com/subugoe/germania-sacra-daten/tree/master/klosterdatenbank_neu#ausmultiplizieren-der-daten
		#
		# There are documents with typ:kloster containing the full monastery information
		# used for display. While documents with typ:standort-orden are more granular
		# and contain information about a monastery at a time interval in which it
		# is at a single location and member of a single order.
		#
		# To allow precise queries on time + order + location information despite Solr’s
		# flat document model, we query the typ:standort-orden documents and then
		# use Solr 4’s {!join} to get the corresponding full monastery documents for display.
		#
		# In addition, for each query field (with number *0), there is a
		# hidden variant without the {!join} (with number *1) which returns the typ:standort-orden documents.
		# Similary the is a hidden query field without {!join} for each facet.
		# These are used to retrieve standort-orden documents for export to CSV and BNA in the GS/DownloadLinks Partial.
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
			# The monastery status query field displays a popup menu which is filled
			# with values from the status facet (facets.130).
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
			# corresponds to 20
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

		# Sort by city name.
		sort {
			1 {
				id = default
				sortCriteria = ort_sort asc,von asc
			}
		}

		# Fields to use for displaying the result list.
		standardFields {
			title = kloster
			snippet >
		}

		# Facet configuration.
		# Just like the queryFields the facets use {!join} in their filter queries.
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
			# Request the status information to build the popup menu for the
			# monastery status query field (queryFields.30).
			130 {
				id = status
				field = status_facet
				hidden = 1
				fetchMinimum = 0
			}
		}

		# Limit the requested data fields for different query types:
		# Only request the minimum by default and load all fields for displaying
		# full records or loading data.
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

		# Configure the fields to highlight.
		# Just highlight the monastery name in the result list.
		# Highlight more fields for the detail view.
		# Set up a highlight query (required to not lose highlighting due to {!join}
		highlight {
			default {
				fields {
					f1 = kloster
				}
				query = %s
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
					f53 = person_anmerkung
				}
			}
		}

		# Configure custom CSS, JavaScript and localisation resources.
		CSSPaths.50 = EXT:find/Projects/germania-sacra/Resources/germania-sacra.css
		CSSPaths.60 = EXT:find/Projects/germania-sacra/Resources/bib.css

		languageRootPath = EXT:find/Projects/germania-sacra/Language/
	}
}


# Configure TYPO3 page types.
# These are needed to send the correct Contnent-Type headers for export and linked data formats.
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
		additionalHeaders = Content-type:application/rdf+xml;charset=utf-8
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



# Remove filters suppressing records when the user is logged in.
# usergroup needs to be compared witht the uid of the frontend user group in TYPO3.
#[usergroup = 1]
plugin.tx_find.settings {
	additionalFilters {
		1 >
	}
}
#[global]
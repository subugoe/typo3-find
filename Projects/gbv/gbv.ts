plugin.tx_find {
	settings {
		connection {
			host = 127.0.0.1
			port = 80
			path = /solr-gbv/40
		}
		queryFields {
			0 {
				noescape = 1
			}
			10 {
				id = title
				type = Text
				query = title:%s
				extended = 1
				noescape = 1
			}
			20 {
				id = author
				type = Text
				query = author:%s
				extended = 1
				noescape = 1
			}
			30 {
				id = year
				type = Range
				query = publishDate:[%1$s TO %2$s]
				default.0 = *
				default.1 = *
				extended = 1
			}
		}
		additionalFilters {
			0 = collection_details:GBV_ILN_40 OR collection:NL
			10 = -collection:OLC
		}
		sort {
		}
		standardFields {
			title = title
			snippet = author_browse
		}
		facets {
			10 {
				id = format
				field = format_facet
			}
			20 {
				id = year
				type = Histogram
				field = publishDateSort
			}
			30 {
				id = language
				field = language
			}
			40 {
				id = topic
				field = topic_facet
			}
			50 {
				id = collection
				field = collection
			}
		}
		highlight {
			default {
				fields {
				}
				useQueryTerms = 0
				useFacetTerms = 0
				alternateFields {
				}
			}
		}

	#	CSSPaths.50 = EXT:find/Projects/edfu/Resources/edfu.css
	#	JSPaths.50 = EXT:find/Projects/edfu/Resources/edfu.js

	#	languageRootPath = EXT:find/Projects/edfu/Language/
	}
	view {
	#	templateRootPath = EXT:find/Projects/edfu/Templates/
	#	partialRootPath = EXT:find/Projects/edfu/Partials/
	}
}
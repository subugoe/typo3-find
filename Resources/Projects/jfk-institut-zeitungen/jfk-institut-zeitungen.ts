plugin.tx_find {
	settings {
		connection {
			host = 127.0.0.1
			port = 80
			path = /solr-jfk/
		}
		queryFields {
		}
		additionalFilters {
		}
		sort {
			1 {
				id = default
				sortCriteria = title_sort asc
			}
		}
		standardFields {
			title = title
			snippet = publisher
		}
		facets {
			10 {
				id = buchstabe
				field = title_facet
				sortOrder = index
				type = Tabs
				excludeOwnFilter = 1
				hidden = 1
				selectedByDefault {
					0 = 1
				}
			}
		}
		highlight {
			fields.1 = *
		}

		CSSPaths.50 = EXT:find/Resources/Projects/jfk-institut-zeitungen/Resources/jfk.css
		JSPaths.50 = EXT:find/Resources/Projects/jfk-institut-zeitungen/Resources/jfk.js

		languageRootPath = EXT:find/Resources/Projects/jfk-institut-zeitungen/Language/
	}
	view {
		templateRootPath = EXT:find/Resources/Projects/jfk-institut-zeitungen/Templates/
		# partialRootPath = EXT:find/Resources/Projects/jfk-institut-zeitungen/Partials/
	}
}
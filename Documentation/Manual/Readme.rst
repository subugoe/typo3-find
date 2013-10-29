Find
====

This TYPO3 extension aims to enable the query and display of arbitrary Solr indexes.

It provides the ability to configure many aspects of the query – e.g. query fields, facets, filtering through TypoScript – and set up the display through Fluid templates. Partials for standard display features as well as a number of View Helpers that help creating those templates are included in the extension.


Aims
----

The extensions aims are to provide:

* access to arbitrary Solr indexes in TYPO3
* minimal confiuguration for a basic display
* rich templating abilities for creating complex displays


Basic Example
--------------

For the most basic example you need to:

#. add the find plug-in to a TYPO3 page

#. include the find plug-in’s template in your site/page’s template

#. configure your index information in the TypoScript template for that page. At minimum you should set the address of your Solr index and the fields to display in the result list::

	plugin.tx_find.settings {
		connection {
			host = solr.local
			port = 8080
			path = /solr/myIndex
		}
		standardFields {
			title = title
			snippet = publisher
		}
	}

   With this setup, find will give you a search form for your index’ default search field and display a result list with the document’s »title« field as the heading of the item and the »publisher« field added as a snippet beneath it. Each result can be clicked to show the detail view for that document which presents a definition list of the fields in the Solr document.

#. you can then add facets for text fields and numeric range selection, e.g.::

	plugin.tx_find.settings {
		facets {
			10 {
				id = format
				field = format
			}
			20 {
				id = year
				type = Histogram
				field = publishDateSort
			}
		}
	}

#. additional query fields for an extended search option can also be added::

	plugin.tx_find.settings {
		queryFields {
			10 {
				id = title
				type = Text
				extended = 1
			}
		}
	}

There are many more TypoScript configuration options. Please refer to the rest of this document and the example configurations provided in the ``Projects`` folder to learn about them.


Example projects
----------------

A few example projects are included with the extension in the ``Projects`` folder. While you do not have the Solr indexes they are made for, they may give you an idea what more elaborate configurations may look like and how their templates are set up. The projects are:

* gbv: basic configuration for a big library index with multiple search fields and facets but without customised display
* hans: simple configuration for a smaller library index with multiple search fields, facets and mildly customised templates
* jfk-institut-zeitungen: simple configuration with a single search field, a non-trivial facet and a custom template without detail view
* edfu: elaborate configuration with two search fields, two facets and highly customised display
* germania-sacra: elaborate configuration with many search fields, facets, data export, complex queries and highly customised display
* view-helper-test: trivial configuration used to show the test partial created to demonstrate the use of the included Fluid View Helpers

These projects are structured in a common way (with potentially only a subset of the folders / files existing)

* projectname.ts: TypoScript configuration for the setup
* EXT-Private: symlink to the extension’s Resources/Private folder; this is used as a scheme to link the extension’s partials and templates into the custom configuration so they can be used in the custom configuration
* Templates/Search: typically some of these are symlinked to the originals
	* Index.html and Detail.html for the display
	* Index.data and Detail.data for loading data
	* Suggest.data for autocomplete / suggest responses
* Partials: Contains symlinks to the folders inside the extension’s »Partials« folder. If the default partials are to be overridden, a an actual folder with partials can be placed here. You can also add your own partials / folder of partials here. The standard partials provided by the extension are in the folders
	* Components: elements used to create the page
	* Display: create markup for fields in the document
	* Facets: create facets
	* Formats: various output formats used by the data format
	* Page: standard elements to add to the page
	* Pager: creates the pager for result lists
* Language: localisation files or symlinks to the extension’s localisation files
* Resources: JavaScript, CSS, images used by the project’s templates and partials


TypoScript configuration options
--------------------------------

All settings discussed in this section are inside the ``plugin.tx_find.settings`` array of the TypoScript configuration.


Connection to the Solr index
............................

The ``connection`` settings array is used to configure access to the Solr index. It contains:

* ``host`` [127.0.0.1]: hostname of the server running the index
* ``port`` [8080]: port of the Solr service on the server
* ``path`` [/solr/]: path of the Index on the Solr server
* ``timeout`` [5]: number of seconds before a Solr request times out

The search form
:::::::::::::::

The ``queryFields`` setting configures the search form. It is a numbered array of arrays, one for each query field that can be used. The query fields have a number of parameters depending on their type:

* ``id`` (required): the id for the query field; this is used in URL parameters (``tx_find_find[q][myID]``) and to identify the localised label for the query field
* ``type`` (required): the type of the query field; the partial with this name in ``Partials/Form/Fields`` is used to create the field for input form; the default set of partials provides the Text, Range, Hidden, Select, SelectFacet, Checkbox and Radio options, a few of which depend on specific code in the controller to create the right queries
* ``query``: a sprintf string with the Solr query for this field, e.g. ``title_search:%s``; if not given the default query ``$id:%s`` is used (where ``$id`` is the value of the ``id`` field); this lets you use more complex queries (e.g. querying several fields at once or adding ``{!join}`` to a query), it also supports multiple parameters (see the Range type);
* ``extended`` [0]: if true, the query field will only be visible in the extended search form
* ``noescape`` [0]: if true, the extension will not escape the user input before querying the index; this allows technically inclined users to run their own Solr queries; but it opens the risk of users accidentally entering invalid queries which will cause Solr exceptions (which the standard setup catches and offers the user a link for running an escaped query)
* ``phrase`` [0]: if true, the string in the field will be phrase escaped – rather than term escaped – before being placed in the Solr query
* ``hidden`` [0]: if true, the input field will not be displayed; however the field will be displayed if a term for it is passed in a search parameter


Some of the search field types have custom behaviour and specific configuration options.

Text
....

The Text field can be the simplest field available. It also allows advanced behaviour by adding autocomplete or a checkbox to select an alternate query style.

* ``queryAlternate``: an array of alternative queries that can be configured for the Text type; it creates a checkbox next to the input field which toggles between the provided ``query`` and the first ``queryAlternate``
* ``autocomplete`` [0]: if true, a field of Text type will be hooked up for autocompletion using Solr suggest query
* ``autocompleteDictionary``: name of the dictionary the Solr suggest query should use
* ``default``: default values to use in the query if no value is provided by the user (yet); may be a single value string (e.g. for the default state of checkboxes) or an array (especially useful for range queries)

Examples::

	plugin.tx_find.settings.queryFields {
		10 {
			id = name
			type = Text
		}
		11 {
			id = name2
			type = Text
			query = name:%1$s
			queryAlternate.1 = name:%1$s~0.7
			noescape = 1
		}
		12 {
			id = name3
			autocomplete = 1
			autocompleteDictionary = name
		}
	}


Range
.....

The Range field creates two text inputs for the arguments q.{fieldInfo.id}.0 and q.{fieldInfo.id}.1. This can be used with a query like ``from:[* TO %2$s] AND to:[%1$s TO *]`` if your index has ``from`` and ``to`` fields. E.g.::

	plugin.tx_find.settings.queryFields.20 {
		id = year
		type = Range
		query = from:[* TO %2$s] AND to:[%1$s TO *]
		default.0 = *
		default.1 = *
	}

Hidden
......

The Hidden field creates an input element of type ``hidden`` to pass additional parameters through the form. E.g.::

	plugin.tx_find.settings.queryFields.30 {
		id = hidden
		type = Hidden
		default = surprise
	}

Select
......

The Select field creates a popup menu. The popup menu is set up using ``options``, with the default selection‘s key in the ``key``. E.g.::

	plugin.tx_find.settings.queryFields.40 {
		id = country
		type = Select
		options {
			blank =
			key = value
			key2 = value2
		}
		default = key
	}

SelectFacet
...........

The SelectFacet field creates a popup menu using the data from a facet that has been loaded. For this to work the facet needs to have been configured and its ``id`` has to be set as the ``facetID`` parameter. E.g.::

	plugin.tx_find.settings {
		queryFields.50 {
			id = status
			type = SelectFacet
			facetID = status
			query = status_facet:%s
		}
		facets.50 {
			id = status
			field = status_facet
			hidden = 1
			fetchMinimum = 0
		}
	}

Checkbox
........

TODO: document


Radio
.....

TODO: document



Prerequisites
-------------

* TYPO3 6.1 or higher
* t3jquery Extension


Contact
-------

* `Sven-S. Porst <https://github.com/ssp/>`_, SUB Göttingen
* `Ingo Pfennigstorf <https://github.com/ipf/>`_, SUB Göttingen


Acknowledgements
----------------

The extension’s Solr connectivity is provided by the `Solarium <http://www.solarium-project.org/>`_ PHP Solr client `(github) <https://github.com/basdenooijer/solarium]>`_.

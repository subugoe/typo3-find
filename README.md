# Find

[![image](https://travis-ci.org/subugoe/typo3-find.svg?branch=travis)](https://travis-ci.org/subugoe/typo3-find)

This TYPO3 extension aims to enable the query and display of arbitrary
Solr indexes.

It provides the ability to configure many aspects of the query – e.g.
query fields, facets, filtering through TypoScript – and set up the
display through Fluid templates. Partials for standard display features
as well as a number of View Helpers that help creating those templates
are included in the extension.

## Installation

For developing this extension clone this repository and install the
dependencies via composer with `composer install`.

## Aims

The extensions aims are to provide:

-   access to arbitrary Solr indexes in TYPO3
-   minimal configuration for a basic display
-   rich templating abilities for creating complex displays

## Basic Example

For the most basic example you need to:

1.  add the find plug-in to a TYPO3 page
2.  include the find plug-in’s template in your site/page’s template
3.  configure your index information in the TypoScript template for that
    page. At minimum you should set the address of your default Solr
    index and the fields to display in the result list:
    ```
    plugin.tx_find.settings {
        connections {
            default {
                options {
                    host = solr.local
                    port = 8080
                    path = /
                    core = myIndex
                }
            }
        }
        standardFields {
            title = title
            snippet = publisher
        }
    }
    ```

    With this setup, find will give you a search form for your index’
    default search field and display a result list with the document’s
    »title« field as the heading of the item and the »publisher« field
    added as a snippet beneath it. Each result can be clicked to show
    the detail view for that document which presents a definition list
    of the fields in the Solr document.

4.  you can then add facets for text fields and numeric range selection,
    e.g.:
    ```
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
    ```
5.  additional query fields for an extended search option can also be
    added:
    ```
    plugin.tx_find.settings {
        queryFields {
            10 {
                id = title
                type = Text
                extended = 1
            }
        }
    }
    ```

There are many more TypoScript configuration options. Please refer to
the rest of this document and the linked example configurations to
learn about them.

## Example projects

A few example projects can be found on github. While you do not have the
Solr indexes they are made for, they may give you an idea what more
elaborate configurations may look like and how their templates are set
up. The projects are:

- [test](https://github.com/ssp/typo3-find-test): configuration to
    demonstrate the settings of this Readme as well as the included View Helpers
- [gbv](https://github.com/subugoe/typo3-find-gbv): basic
    configuration for a big library index with multiple search fields
    and facets but without customised display
- [hans](https://github.com/subugoe/typo3-find-hans): simple configuration
    for a smaller library index with multiple search fields, facets and
    mildly customised templates
- [jfk-institut-zeitungen](https://github.com/subugoe/typo3-find-jfk-institut-zeitungen):
    simple configuration with a single search field, a non-trivial facet
    and a custom template without detail view
- [Edfu](https://github.com/subugoe/typo3-find-edfu): elaborate
    configuration with two search fields, two facets and highly
    customised display
- [Germania Sacra](https://github.com/subugoe/typo3-find-germania-sacra):
    elaborate configuration with many search fields, facets, data
    export, complex queries and highly customised display

These projects are structured in a common way (with potentially only a
subset of the folders / files existing)

-   projectname.ts: TypoScript configuration for the setup
-   Templates/Search:
    -   Index.html and Detail.html for the display
    -   Index.data and Detail.data for loading data
    -   Suggest.data for autocomplete / suggest responses

-   Partials: You can also add your own partials here. The extension can be configured to override the built-in Partials by putting the replacemnts at the same paths in here. The extension Partials are in the folders:
    -   Components: elements used to create the page
    -   Display: create markup for fields in the document
    -   Facets: create facets
    -   Formats: various output formats used by the data format
    -   Page: standard elements to add to the page
    -   Pager: creates the pager for result lists

-   Language: localisation files or symlinks to the extension’s localisation files
-   Resources: JavaScript, CSS, images used by the project’s templates and partials

## TypoScript configuration options

All settings discussed in this section are inside the
`plugin.tx_find.settings` array of the TypoScript configuration.

### Connection to the Solr index

You can have multiple Solr connections. Every connection needs to use a
provider and an options array.

The `plugin.tx_find.settings.activeConnection` determines the currently
used connection. The default value is `default`.

The `options` settings array in a connection definition is used to
configure access to the Solr index. It contains:

-   `host` \[127.0.0.1\]: hostname of the server running the index
-   `port` \[8080\]: port of the Solr service on the server
-   `path` \[/solr/\]: path of the Index on the Solr server
-   `timeout` \[5\]: number of seconds before a Solr request times out
-   `scheme` \[http\]: URI scheme of the connection

1.  Example:
    ```
    plugin.tx_find.settings {
        connections {
            default {
                provider = Subugoe\Find\Service\SolrServiceProvider
                options {
                    host = 127.0.0.1
                    port = 8080
                    path = /solr/
                    timeout = 5
                    scheme = http
                }
            }
        }
    }
    ```

### Solr Components

When using the eDisMax feature solr offers, add

-   `features.eDisMax = 1`

In case the Solr version is lower than 8, the setting
`plugin.tx_find.settings.luceneMatchVersion` has to be set to the major version
that is used (for instance 6 or 7). By default this is set to 8 and affects
a magic query prefix (see https://lucene.apache.org/solr/guide/6_6/the-extended-dismax-query-parser.html#TheExtendedDisMaxQueryParser-Usingthe_magicfields__val_and_query_).

### The search form

The `queryFields` setting configures the search form. It is a numbered
array of arrays, one for each query field that can be used. The query
fields have a number of parameters depending on their type:

- `id` (required): the id for the query field; this is used in URL
    parameters (`tx_find_find[q][myID]`) and to identify the localised
    label for the query field
- `type` (required): the type of the query field; the partial with
    this name in `Partials/Form/Fields` is used to create the field for
    input form; the default set of partials provides the Text, Range,
    Hidden, Select, SelectFacet and Radio options, a few of which depend
    on specific code in the controller to create the right queries
- `query`: a sprintf string with the Solr query for this field, e.g.
    `title_search:%s`; if not given the default query `$id:%s` is used
    (where `$id` is the value of the `id` field); this lets you use more
    complex queries (e.g. querying several fields at once or adding
    `{!join}` to a query), it also supports multiple parameters (see the
    Range type);
- `extended` \[0\]: if true, the query field will only be visible in
    the extended search form
- `noescape` \[0\]: if true, the extension will not escape the user
    input before querying the index; this allows technically inclined
    users to run their own Solr queries; but it opens the risk of users
    accidentally entering invalid queries which will cause Solr
    exceptions (which the standard setup catches and offers the user a
    link for running an escaped query). If noescape is 2 you can 
    configure the characters that will be escaped with escapechar.
- `escapechar` \[""\]: escapechar defines the characters with will be 
    escaped if noescape is 2
- `phrase` \[0\]: if true, the string in the field will be phrase
    escaped – rather than term escaped – before being placed in the Solr
    query
- `hidden` \[0\]: if true, the input field will not be displayed;
    however the field will be displayed if a term for it is passed in a
    search parameter

The default configuration sets up a general Text query for index `0`
with id `default`, as well as a Hidden field to transport the state of
the search form with for index `10001` with id `extended` and a Text
field for raw Solr queries for index `10002` with id `raw`. Please be
aware of these configurations so you can override or delete them as
needed.

Some of the search field types have custom behaviour and specific
configuration options.

Examples:

```
plugin.tx_find.settings.queryFields {
    10 {
        id = name
        type = Text
        query = %s
        noescape = 2
        escapechar = \,+,-,&,|,!,{,},[,],?,:
    }
}
```


#### Text

The Text field can be the simplest field available. It also allows
advanced behaviour by adding autocomplete or a checkbox to select an
alternate query style.

-   `queryAlternate`: an array of alternative queries that can be
    configured for the Text type; it creates a checkbox next to the
    input field which toggles between the provided `query` and the first
    `queryAlternate`
-   `autocomplete` \[0\]: if true, a field of Text type will be hooked
    up for autocompletion using Solr suggest query
-   `autocompleteDictionary`: name of the dictionary the Solr suggest
    query should use
-   `default`: default values to use in the query if no value is
    provided by the user (yet); may be a single value string (e.g. for
    the default state of checkboxes) or an array (especially useful for
    range queries)

Examples:

```
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
        type = Text
        autocomplete = 1
        autocompleteDictionary = name
    }
}
```

#### Range

The Range field creates two text inputs for the arguments
q.{fieldInfo.id}.0 and q.{fieldInfo.id}.1. This can be used with a query
like `from:[* TO %2$s] AND to:[%1$s TO *]` if your index has `from` and
`to` fields. E.g.:

```
plugin.tx_find.settings.queryFields.20 {
    id = year
    type = Range
    query = from:[* TO %2$s] AND to:[%1$s TO *]
    default.0 = *
    default.1 = *
}
```

#### Hidden

The Hidden field creates an input element of type `hidden` to pass
additional parameters through the form. E.g.:

```
plugin.tx_find.settings.queryFields.30 {
    id = hidden
    type = Hidden
    default = surprise
}
```

#### Select

The Select field creates a popup menu. The popup menu is set up using
`options`, with the default selection‘s key in the `key`. E.g.:

```
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
```

#### SelectFacet

The SelectFacet field creates a popup menu using the data from a facet
that has been loaded. For this to work the facet needs to have been
configured and its `id` has to be set as the `facetID` parameter. E.g.:

```
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
```

#### Radio

Creates radio buttons for the array set in the `options` array. E.g.:

```
plugin.tx_find.settings {
    60 {
        id = version
        extended = 1
        type = Radio
        options {
            1 = Steak
            2 = Chicken
            3 = Pancake
        }
        default = 2
    }
}
```

### Default Display Fields

Two fields in the index document can be designated as the document’s
title and a snippet that are used to display the result list. This
enable a simple initial configuration and should have many cases
covered. If you need to display more complex information in the result
list, that can be achieved by replacing the `Display/Result` partial or
– the `Index` template.:
```
plugin.tx_find.settings {
    standardFields {
        title = title
        snippet = detail
    }
}
```

### Default Query

By default all records in the index will be displayed when no search
term is given: the query `*:*` is used for this. You can change this
default query (e.g. to a query with no results):

```
plugin.tx_find.settings {
    defaultQuery = *:*
}
```

### Default search operator

If you want to change the default search operator you can use the following configuration:

```
plugin.tx_find.settings {
    defaultQueryOperator = OR
}
```

### Facets

Faceting can be configured in TypoScript using the `facets` setting. It
is a numbered list of arrays. Each array can have the keys:

- `id` (required): ID used to identify the facet
- `type` \[List\]: the type of facet to use (see below for the types
    provided by the extension)
- `field`: the Solr field to use for the facet, if not given the field
    given by the `id` will be used
- `sortOrder` \[count\]: using `index` gives alphabetically sorted
    facet entries, by default facet items are sorted by the number of
    results
- `fetchMinimum` \[1\]: the minimum number of facet entries needed to
    display the facet; the facet will not be shown at all if there are
    fewer entries than this
- `fetchMaximum` \[100\]: the maximum number of facet entries to load
- `query`: sprintf style formatted string to use as a filter query if
    the facet is selected; by default the facet’s field is used with the
    selected term
- `facetQuery`: array of facet query configuration arrays to use for
    creating specific facets; each of the arrays has the keys `id` to
    identify the facet query and `query` the Solr query to create the
    facet for
- `selectedByDefault`: array with keys field value and values 1 to
    indicate facet terms that should be selected when no facet selection
    is given (especially useful with the `Tabs` facet type.
- `excludeOwnFilter` \[0\]: if set to 1 the filters created by the
    facet itself will not be used when computing the result count for
    its items
- `hidden` \[0\]: whether to hide the facet from display (e.g. to use
    the facet data in some other part of the page like a `SelectFacet`
    query field)
- `showMissing`\[0\]: If set to 1 the facet shows an item for documents with missing values
- `labelMissing`: Set own label for the missing facet item

To change the defaults for these fields you can use the `facetsDefaults`
setting and set your preferred default values there.

The provided facet types are given by the partials in
`Partials/Facets/Facet`. The partial is picked using the `type`
configured for the facet.

#### List

This is a default facet list displaying the facet name with a result
count behind it. You can use CSS to hide the result count if it is not
needed.

-   `displayDefault` \[6\]: the number of facet items to display by
    default (the remaining ones are initially hidden and can be revealed
    by the user)
-   `autocomplete`: whether to offer an autocompletion search field
    above the facet items (helpful for facets with many items)
    The autocomplete feature uses the
    [`jQuery.chosen`](https://harvesthq.github.io/chosen/) library
    Be sure to download it and serve them with your page, e.g. by adding
    the paths to the files to `page.includeJS` in TypoScript after jQuery.
-   `sortPrefixSeparator`: this string is used to split the facet’s name
    into two parts and only display the second part; this way you can
    sort by the first part (e.g. with zero-padded numbers) and still
    have good looking facet names

Examples:

```
plugin.tx_find.settings.facets {
    10 {
        id = orden
        field = orden_facet
        autocomplete = 1
    }
    20 {
        id = band
        field = band_facet
        sortOrder = index
        displayDefault = 8
        sortPrefixSeparator = ####
    }
}
```

#### Tabs

The `Tabs` style is a slight variation of the plain list. As the name
suggests, it can be used to create »Tabs« above the search results to
allow users to pick a view on a certain subset of the data. This can be
particularly useful with predefined facet queries to define the desired
subsets.

You will have to add the partial for this type of facet to your template
yourself to make it appear at the top of the page. When doing so use the
`hidden` setting to ensure it does not appear along with the other
facets as well. Turning on the `excludeOwnFilter` setting will ensure
you get correct result counts for the facet items which are not
currently selected.

Example: a Tabs facet with facet queries for four specific document
»typ« values, selecting the »formular« option by default:

```
plugin.tx_find.settings.facets {
    30 {
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
            30 {
                id = gott
                query = typ:gott
            }
            40 {
                id = ort
                query = typ:ort
            }
        }
    }
}
```

#### Histogram

This facet is made for numeric fields. It will draw a histogram to
visualise the number of results per number in the index. It is a nice
way to visualise a »year« facet.

You typically want a high `fetchMaximum` setting for the histogram
facet. Setting `excludeOwnFilter = 1` will not remove the filtered
values from the facet as usual but keep the previous hustogram and
highlight the selected range.

-   `barWidth`: the »width« of each of the bars in the histogram; if you
    cover a wide number range it can be worthwhile to group the bars in
    wider ranges; doing so requires an index that already contains
    rounded data (e.g. the rounded number of the decade instead of the
    precise year)

Example:

```
plugin.tx_find.settings.facets {
    40 {
        id = decade
        field = decade
        type = Histogram
        excludeOwnFilter = 1
        sortOrder = index
        fetchMaximum = 1000
        barWidth = 10
    }
}
```

The Histogram facet uses the jQuery.flot and jQuery.flot.selection
[0.8.3](https://github.com/flot/flot/releases/tag/v0.8.3) libraries
from [flotcharts](https://www.flotcharts.org). Be sure to download
them and serve them with your page, e.g. by adding the paths to the
files to `page.includeJS` in TypoScript after jQuery.

#### Map

This face creates a tiny Google map from a Solr field containing
specifically formatted geohashes. Please look at the
`Partials/Facets/Facet/Map.html` partial for details. (This can still be
improved in many ways.)

Example:

```
plugin.tx_find.settings.facets {
    50 {
        id = map
        field = geohash
        type = Map
        sortOrder = index
        fetchMaximum = 1000
    }
}
```

### Sorting

Sort behaviour can be configured using the `sort` setting. It is an
array of arrays with the fields `id` and `sortCriteria`. The latter is a
Solr sort order string, i.e. a comma-separated list of the form
`fieldName [a|de]sc`. The `id` of the default sort order should be
`default`.

If the array has several elements, a popup menu for selecting the sort
order is added to the user interface.

Example:

```
plugin.tx_find.settings.sort {
    1 {
        id = default
        sortCriteria = year desc,name asc
    }
}
```

### Paging

Use the `paging` setting to adjust navigation in the results. In this
array you can set:

-   `perPage` \[20\]: the number of results per page
-   `menu` \[array()\]: array of numbers used to create a menu from
    which users can pick the number of results per page
-   `maximumPerPage` \[1000\]: the maximum number of results to fetch
    from Solr, even if the query asks for more
-   `detailPagePaging` \[1\]: if 1 this enables paging between detail
    pages for a search

Example:

```
plugin.tx_find.settings.paging {
    perPage = 100
    maximumPerPage = 1000
    detailPagePaging = 1
}
```

#### Detail Page Paging

The `detailPagePaging` option enables a feature that lets you have
pretty and unique URLs for the pages corresponding to your Solr
documents when RealURL is used *and* have paging between a result’s
detail page and the detail pages before and after it.

This is achieved by POSTing information about the previous query along
with the ID of the requested record sent in the URL. A drawback of this
solution is that using the browser’s back button may trigger a »Do you
want to submit this form again?« dialogue. Turn this option off if you
don’t need paging between the detail pages.

#### URL Parameters

You can also set the the number of results and the initial document in a
server reply using the `count` and `position` arguments. The `count`
will be limited by the `maximumPerPage` setting.

### Excluding documents

If your index contains documents that should never be shown (e.g.
because they are not published yet or because you are using them for
search but `{!join}` them to other documents for display), you can add
filter queries using the `additionalFilters` setting. The setting is an
array with the filter queries as values:

```
plugin.tx_find.settings.additionalFilters {
    1 = published:true
}
```

### Choosing the fields to fetch

By default the complete Solr document is loaded and all its fields can
be used. If your documents are very large or you want to avoid
unnecessary highlighting, it can be useful to explicitly state which
fields are to be fetched. The `dataFields` setting lets you do this. It
has four sections `default`, `index`, `detail`, `data`. The extension
will start with the fields configured in `default` and add the fields
given in the array for the action that is used.

Each of these sections is an array with keys `default` (again), `allow`
and `disallow`. Typically you will only need the `default` array but the
other keys can be used to force-add fields or explicitly prohibit the
output of fields. (Please note that this will not be a failsafe
guarantee that users cannot see those field due to the various actions
or field name wildcards.) You may also use the `data-fields` argument in
action URLs to overwrite the `default` configuration. For technical
reasons the keys for the fields need to begin with a letter rather than
just be a number (e.g. use `f1` instead of `1`).

Example configuration to only load minimal fields by default and load
all fields for the `detail` and `data` actions:

```
plugin.tx_find.settings {
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
}
```

### Highlighting

The use of Solr’s result highlighting is configured by the `highlight`
setting. Similar to the `dataFields` setting, it contains arrays
`default`, `index`, `detail` and `data`. Each of which can contain the
following fields:

-   `fields` \[{f1 = \*}\]: an array of field names; its keys should
    begin with a letter for technical reasons (i.e `f1` instead of `1`
-   `fragsize` \[100\]: the maximum length of the highlighted fragment
-   `query`: a custom sprintf-style query template to use for
    highlighting, e.g. in the simplest case \[%s]
-   `useQueryTerms` \[0\]: set to 1 to create highlight queries for each
    query term from the search form
-   `useFacetTerms` \[0\]: set to 1 to create highlight queries for each
    selected facet term
-   `alternateFields`: an array with keys the field name and values the
    corresponding alternate field name for situations where the
    highlighting does not work in the field itself

Please note that particularly the final three options do not seem ideal
yet and are considered experimental. Changes may be needed in the future
to make these more versatile in complicated situations.

Example highlighting just a few fields by default and a wider range of
fields for the `detail` action. As it is used with `{!join}` queries,
the terms from queries and facets are explicitly added again for
highligh queries:

```
plugin.tx_find.settings.highlight {
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
            f3 = ort
            f4 = bistum
            f5 = land
            f6 = orden
            f7 = bemerkung_kloster
        }
    }
}
```

### Linking to data fields

When displaying field content with the `Partials/Display/Field/Content`
partial (or its siblings who use it) the `linkFieldContent` argument can
be given to not just display the field content but insert a link to
search all documents with the same value in that field. Without further
configuration this will create a `raw` query where the user may see the
Solr query. It can be desirable to instead hide the Solr query syntax
and define a (potentially `hidden`) query field for that Solr field and
then just fill that field with the term only.

The `queryFieldForDataField` setting is an array with keys Solr field
names and values IDs of `queryFields` which creates the mapping needed
for creating those queries.

Example:

```
plugin.tx_find.settings {
    queryFields {
        100 {
            id = city
            type = Text
            hidden = 1
            phrase = 1
        }

    queryFieldForDataField {
        city = city
    }
}
```

### Jumping to the content

By default the extension creates links that jump to the extension’s
content (`#tx_find`) on the target page to maximise the visible space
for search results and information that may otherwise be wasted for the
page’s head. You can remove the anchor to jump to or pick another one on
your page (e.g. to leave site navigation visible) with the `jumpToID`
setting:

`plugin.tx_find.settings.jumpToID = menu`

### JavaScript and CSS resources

Settings include the `JSPaths` and `CSSPaths` arrays which can be used
to configure JavaScript and CSS files to be added to the page. The
default setup configures files at positions `10` and `20` of `CSSPaths`
and at position `10` of `JSPaths`. E.g.:

```
plugin.tx_find.settings {
    CSSPaths.30 = EXT:find/Projects/test/Resources/test.css
    JSPaths.20 = EXT:find/Projects/test/Resources/test.js
}
```

jQuery has to be included manually on your TypoScript `PAGE`-object of
choice. Example:

```
page.includeJSFooterlibs.jquery = https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js
page.includeJSFooterlibs.jquery.external = 1
page.includeJSFooterlibs.jquery.integrity = sha256-hVVnYaiADRTO2PzUGmuLJr8BLUSjGIZsDYGmIJLv2b8=
page.includeJSFooterlibs.jqueryUi = https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.js
page.includeJSFooterlibs.jqueryUi.external = 1
page.includeJSFooterlibs.jqueryUi.integrity = sha256-T0Vest3yCU7pafRw9r+settMBX6JkKN06dqBnpQ8d30=
```

### Localisation

You can set the `languageRootPath` pointing to your own `Localisations`
folder. The partials included with the extension will honour that path
when accessing their localisation files. As with the partials and
templates it can be handy to symlink some of the default localisation
files and just override or add the additional terminology you need:

`plugin.tx_find.settings.languageRootPath = EXT:find/Projects/test/Language/`

Localisation files used by the included partials are:

- locallang.xml: general terminology for the search interface (the
    default file)
- locallang-form.xml: labels and placeholders for the search form
- locallang-facets.xml: facet names and facet item names
- locallang-fields.xml: field labels

Please refer to the initial comments in those files for the conventions
used to create the localisation keys based on the `id` s of the
respective query fields, facets or fields.

## Templating

You probably want to create your own templates and partials to tailor
the display of your search results for your index content. To do that
create a project structure along the lines of the included example
projects, symlink the parts of the extension’s templates and partials
you want to use and override/add your own.

The extension comes with a large number of View Helpers and partials
that can be helpful in that context. Look around the
`Classes/ViewHelpers` and `Resources/Private/Partials` folders to see
which parts of the work have already been done for you.

Most of the View Helpers come with usage examples in the `Test` partial
of the `test` project and appear on its start page (the search interface
appears after those examples) once you have it set up.

## Actions

The extension provides three actions:

- `index`: the default action that performs searches
- `detail`: the action to display a single document (automatically
    triggered if the `id` argument is present)
- `suggest`: used for the autocomplete setup of Text query fields

## Data export

Creating data exports requires the following setup:

-   set up a TYPO3 page type without HTML and the MIME Type you need;
    the extension provides type `1369315139` one for JSON:
    ```
    tx_find_page = PAGE
    tx_find_page {
        typeNum = 1369315139
        10 < tt_content.list.20.find_find
        config {
            disableAllHeaderCode = 1
            additionalHeaders = Content-type:application/json;charset=utf-8
        }
    }
    ```
-   create a link with `f:link.action` using the `pageType` you need,
    `format="data"` and add the argument `data-format` with the name of
    the format you want to the query
-   create a partial for your data format in `Partials/Formats` with the
    `.data` file name extension and create the desired output there.

Example output formats, e.g. for JSON, are available in the extension.
The germania-sacra project contains additional ones.

## Query String Arguments

The plug-in’s query parameters are of the form
`tx_find_find[parameterName]`.

### Standard arguments

Built-in parameter names are

- `id`: the Solr document ID of the document to show in the detail
    action; having the id argument will always trigger the detail action
- `q`: for the query; this is an array with keys the queryField IDs,
    e.g. `tx_find_find[q][default]=term`; some query field types (e.g.
    Range) use an array as their value to cover both their input values
- `facet`: for selected facets; this is an array with keys the facet
    IDs, and values arrays; those arrays have keys the facet term and
    value 1, e.g. `tx_find_find[facet][typ][formular]=1`
- `page`: the page of results to show (1-based)
- `extended`: whether to show the extended search form
- `sort`: the sort order to use

### Special arguments

These arguments are not typically exposed but can be useful when
providing data exports through the extension, specifically when using
the data action.

- `start`: the document index to start at in the result set
- `count`: the number of documents to ask Solr for (limited by the
  `paging.maximumPerPage` setting)
- `data-format`: when using the `data` format, this file in
  `Partials/Formats` will be used to create the output

### POST arguments

-   `underlyingQuery`: information about the underlying query, sent in
    the POST body when `paging.detailPagePaging` is turned on; it may
    contain the keys `q`, `facet`, `position`, `count` and `sort`.

### Logging

The [TYPO3 Log Manager](https://docs.typo3.org/typo3cms/CoreApiReference/7.6/ApiOverview/Logging/Index.html) is used. If no special configuration for the find-logging is applied, log entries 
can be found under the component-key `find` in the TYPO3 log, i.e.:

`06 Jun 2016 06:36:06 +0000 [ERROR] request="e2737b83ada7d" component="find": Solr Exception (Timeout?)`

## RealURL

The extension includes a hook for RealURL autoconfiguration. It mainly
handles the parameter name for the detail view by using a
`id/documentID` path segment.

URLs for queries and faceting are not prettified and – if required –
will need to be manually configured due to the query parameter names
depending on the `id` s used for fields and facets.

## Prerequisites

- TYPO3 10.4
- PHP 7.4 or higher

## Testing

To run the unit tests, clone this repository, and run
* `composer install`
* `.Build/bin/phpunit --colors -c .Build/vendor/nimut/testing-framework/res/Configuration/UnitTests.xml Tests/Unit/`

## Contributing

Open a pull request on Github.

Make sure to run `composer lint` before to see, if the coding style is met.
If not, this can be automatically fixed with `composer fix`.

### Building CSS files

Install Node.js (version 16 or above), run `npm install` and build the final CSS file
with `npm run build`.

Contact
-------

- [Sven-S. Porst](https://github.com/ssp/)
- [Ingo Pfennigstorf](https://github.com/ipf/), SUB Göttingen

Acknowledgements
----------------

The extension’s Solr connectivity is provided by the
[Solarium](http://www.solarium-project.org/) PHP Solr client

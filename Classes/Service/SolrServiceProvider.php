<?php

namespace Subugoe\Find\Service;

/* * *************************************************************
 *  Copyright notice
 *
 *  (c) 2015 Ingo Pfennigstorf <pfennigstorf@sub-goettingen.de>
 *      Goettingen State Library
 *
 *  All rights reserved
 *
 *  This script is part of the TYPO3 project. The TYPO3 project is
 *  free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  The GNU General Public License can be found at
 *  http://www.gnu.org/copyleft/gpl.html.
 *
 *  This script is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  This copyright notice MUST APPEAR in all copies of the script!
 * ************************************************************* */

use Solarium\Client;
use Solarium\Exception\HttpException;
use Solarium\QueryType\Select\Query\Query;
use Subugoe\Find\Utility\FrontendUtility;
use Subugoe\Find\Utility\LoggerUtility;
use Subugoe\Find\Utility\SettingsUtility;
use TYPO3\CMS\Extbase\Utility\LocalizationUtility;

/**
 * Service provider for solr.
 */
class SolrServiceProvider extends AbstractServiceProvider implements ServiceProviderInterface
{
    /**
     * @var Client
     */
    protected $connection;

    /**
     * @var array
     */
    protected $configuration = [];

    /**
     * @var \Solarium\QueryType\Select\Query\Query
     */
    protected $query;

    /**
     * @var string
     */
    protected $action;

    /**
     * @var string
     */
    protected $controllerExtensionKey;

    public function connect()
    {
        $currentConnectionSettings = $this->settings['connections'][$this->connectionName]['options'];
        $connectionSettings = [
            'endpoint' => [
                'localhost' => [
                    'host' => $currentConnectionSettings['host'],
                    'port' => intval($currentConnectionSettings['port']),
                    'path' => $currentConnectionSettings['path'],
                    'timeout' => $currentConnectionSettings['timeout'],
                    'scheme' => $currentConnectionSettings['scheme'],
                ],
            ],
        ];

        $this->setConnection(new Client($connectionSettings));
    }

    /**
     * @param array $arguments
     *
     * @return array
     */
    public function suggestQuery($arguments)
    {
        $this->query = $this->getConnection()->createSuggester();
        $results = [];
        if (array_key_exists('q', $arguments)) {
            $this->query->setQuery($arguments);
            if ($arguments['dictionary']) {
                $this->query->setDictionary($arguments['dictionary']);
            }

            $this->addFacetFilters($arguments);
            $solrResults = $this->getConnection()->execute($this->query)->getResults();
            foreach ($solrResults as $suggestions) {
                $results = array_merge($results, $suggestions->getSuggestions());
            }
        } else {
            // TODO: Error message in JSON?
        }

        return $results;
    }

    /**
     * Returns the number of the first result on the page.
     *
     * @return int
     */
    protected function counterStart()
    {
        return $this->getOffset() + 1;
    }

    /**
     * Returns the number of the last result on the page.
     *
     * @return int
     */
    protected function counterEnd()
    {
        return $this->getOffset() + $this->getCount();
    }

    public function setCounter()
    {
        $this->setConfigurationValue('counterStart', $this->counterStart());
        $this->setConfigurationValue('counterEnd', $this->counterEnd());
    }

    /**
     * Returns the number of results per page using the first of:
     * * query parameter »count«
     * * TypoScript setting »paging.perPage«
     * limited by the setting »paging.maximumPerPage«.
     *
     * @param array $arguments overrides $this->requestArguments if set
     *
     * @return int
     */
    protected function getCount($arguments = null)
    {
        if (null === $arguments) {
            $arguments = $this->getRequestArguments();
        }

        $count = intval($this->settings['paging']['perPage']);

        if (array_key_exists('count', $arguments)) {
            $count = intval($this->requestArguments['count']);
        }

        $maxCount = intval($this->settings['paging']['maximumPerPage']);
        $count = min([$count, $maxCount]);

        $this->setConfigurationValue('count', $count);

        return $count;
    }

    protected function addFeatures()
    {
        if ($this->settings['features']['eDisMax']) {
            $this->addEDisMax();
        }
    }

    protected function addEDisMax()
    {
        $this->query->getEDisMax();
    }

    /**
     * @return Client
     */
    protected function getConnection()
    {
        return $this->connection;
    }

    /**
     * @param mixed $connection
     */
    protected function setConnection($connection)
    {
        $this->connection = $connection;
    }

    /**
     * Adds filter queries for active facets to $query.
     *
     * @param array $arguments request arguments
     *
     * @return array
     */
    protected function addFacetFilters($arguments)
    {
        $activeFacets = $this->getActiveFacets($arguments);
        $activeFacetsForTemplate = [];
        foreach ($activeFacets as $facetID => $facets) {
            foreach ($facets as $facetTerm => $facetInfo) {
                $facetQuery = $this->getFacetQuery($this->getFacetConfig($facetID), $facetTerm);
                if ($facetInfo['config']['queryStyle'] === 'and') {
                    // TODO: Do we really use this part of the condition? Can it be removed?
                    // Alternative query style: adding a conjunction to the main query.
                    // Can be useful when using {!join} to filter on the underlying
                    // records instead of the joined ones.
                    $queryString = $this->query->getQuery();
                    if ($queryString) {
                        $queryString = $queryString.' '.Query::QUERY_OPERATOR_AND.' ';
                    }
                    $queryString .= $facetQuery;
                    $this->query->setQuery($queryString);
                } else {
                    // Add a filter query by default.

                    // Add tag/key when configured to excludeOwnFilter for this facet.
                    // Do not add it otherwise as the additional {!tag …} prepended to the Solr query
                    // will break usage of {!join …} in the query.
                    $queryInfo = ['key' => 'facet-'.$facetID.'-'.$facetTerm];
                    if ($facetInfo['config']['excludeOwnFilter'] && $facetQuery) {
                        $queryInfo['tag'] = $this->tagForFacet($facetID);
                    }

                    $this->query->createFilterQuery($queryInfo)
                        ->setQuery($facetQuery);
                }
                $activeFacetsForTemplate[$facetID][$facetTerm] = $facetInfo;
            }
        }

        return $activeFacetsForTemplate;
    }

    /**
     * Adds facet queries to $query from setup in TypoScript.
     * Provides the facet setup enriched with the default values when no configuration
     * is present in the »facets« template variable.
     */
    protected function addFacetQueries()
    {
        $facetConfiguration = $this->settings['facets'];

        if ($facetConfiguration) {
            $facetSet = $this->query->getFacetSet();
            foreach ($facetConfiguration as $key => $facet) {
                if (array_key_exists('id', $facet)) {
                    $facetID = $facet['id'];

                    // start with defaults and overwrite with specific facet configuration
                    $facet = array_merge($this->settings['facetDefaults'], $facet);
                    $facetConfiguration[$key] = $facet;

                    $queryForFacet = null;
                    if (array_key_exists('facetQuery', $facet)) {
                        $queryForFacet = $facetSet->createFacetMultiQuery($facetID);
                        foreach ($facet['facetQuery'] as $facetQueryIndex => $facetQuery) {
                            if (array_key_exists('id', $facetQuery) && array_key_exists('query', $facetQuery)) {
                                $queryForFacet->createQuery($facetQuery['id'], $facetQuery['query']);
                            } else {
                                LoggerUtility::logError(
                                    sprintf('find: TypoScript facet »%s«, facetQuery %s does not have the required keys »id« and »query«. Ignoring this facetQuery.',
                                        $facetID, $facetQueryIndex),
                                    [
                                        'facetQuery' => $facetQuery,
                                        'facetConfiguration' => $facetConfiguration,
                                    ]
                                );
                            }
                        }
                    } else {
                        $queryForFacet = $facetSet->createFacetField($facetID);
                        $queryForFacet->setField($facet['field'] ? $facet['field'] : $facetID)
                            ->setMinCount($facet['fetchMinimum'])
                            ->setLimit($facet['fetchMaximum'])
                            ->setSort($facet['sortOrder']);
                    }

                    if (1 == $facet['excludeOwnFilter']) {
                        $queryForFacet->addExclude($this->tagForFacet($facetID));
                    }
                } else {
                    LoggerUtility::logWarning(
                        sprintf('find: TypoScript facet %s does not have the required key »id«. Ignoring this facet.',
                            $key),
                        [
                            'facet' => $facet,
                            'facetConfiguration' => $facetConfiguration,
                        ]
                    );
                }
            }
        }

        $this->setConfigurationValue('facets', $facetConfiguration);
    }

    /**
     * Returns the facet/filter key for the given $facetID.
     *
     * @param string $facetID
     *
     * @return string
     */
    protected function tagForFacet($facetID)
    {
        return 'facet-'.$facetID;
    }

    /**
     * Returns array with information about active facets.
     *
     * @param array $arguments request arguments
     *
     * @return array of arrays with information about active facets
     */
    protected function getActiveFacets($arguments)
    {
        $activeFacets = [];

        // Add facets activated by default.
        foreach ($this->settings['facets'] as $facet) {
            if (!empty($facet['selectedByDefault'])) {
                $this->setActiveFacetSelectionForID($activeFacets, $facet['id'], $facet['selectedByDefault']);
            }
        }

        // Add facets activated by query parameters.
        if (array_key_exists('facet', $arguments)) {
            foreach ($arguments['facet'] as $facetID => $facetSelection) {
                $this->setActiveFacetSelectionForID($activeFacets, $facetID, $facetSelection);
            }
        }

        return $activeFacets;
    }

    /**
     * Adds information about the selected items for a given facet to $activeFacets.
     *
     * @param array  $activeFacets
     * @param string $facetID        ID of the facet to set
     * @param array  $facetSelection array of selected items for the facet
     */
    protected function setActiveFacetSelectionForID(&$activeFacets, $facetID, $facetSelection)
    {
        $facetQueries = [];
        $facetConfig = $this->getFacetConfig($facetID);
        foreach ($facetSelection as $facetTerm => $facetStatus) {
            $facetInfo = [
                'id' => $facetID,
                'config' => $facetConfig,
                'term' => $facetTerm,
                'query' => $this->getFacetQuery($facetConfig, $facetTerm),
            ];
            $facetQueries[$facetTerm] = $facetInfo;
        }
        if (count($facetQueries) > 0) {
            $activeFacets[$facetID] = $facetQueries;
        }
    }

    /**
     * Returns the facet configuration for the given $ID.
     *
     * @param string $ID
     *
     * @return array
     */
    protected function getFacetConfig($ID)
    {
        $config = null;

        foreach ($this->settings['facets'] as $facet) {
            if (array_key_exists('id', $facet)) {
                if ($facet['id'] === $ID) {
                    $config = $facet;
                    break;
                }
            }
        }

        return $config;
    }

    /**
     * Returns query for the given facet $ID and $term based on the facet’s
     * configuration.
     *
     * @param array  $facetConfig
     * @param string $queryTerm
     *
     * @return string query string
     */
    protected function getFacetQuery($facetConfig, $queryTerm)
    {
        $queryString = null;

        if ($facetConfig) {
            if (array_key_exists('facetQuery', $facetConfig)) {
                // Facet queries are configured: use one of them.
                foreach ($facetConfig['facetQuery'] as $facetQueryConfig) {
                    if ($facetQueryConfig['id'] === $queryTerm) {
                        $queryString = $facetQueryConfig['query'];
                        break;
                    }
                }
                if (null === $queryString) {
                    LoggerUtility::logInfo(
                        sprintf('find: Results for Facet »%s« with facetQuery ID »%s« were requested, but this facetQuery is not configured. Building a generic facet query instead.',
                            $facetConfig['id'], $queryTerm),
                        [
                            'requestArguments' => $this->requestArguments,
                            'facetConfig' => $facetConfig,
                            'queryTerm' => $queryTerm,
                        ]
                    );
                }
            }

            if (null === $queryString) {
                // No Facet queries applicable: build the query.
                if (array_key_exists('query', $facetConfig)) {
                    $queryPattern = $facetConfig['query'];
                } else {
                    $queryPattern = ($facetConfig['field'] ? $facetConfig['field'] : $facetConfig['id']).':'.'%s';
                }

                // Hack: convert strings »RANGE XX TO YY« Solr style range queries »[XX TO YY]«
                // (because PHP loses ] in array keys during URL parsing)
                $queryTerm = preg_replace('/RANGE (.*) TO (.*)/', '[\1 TO \2]', $queryTerm);
                $queryString = sprintf($queryPattern, $queryTerm);
            }
        } else {
            $message = 'find: A non-configured facet was selected. Ignoring it.';
            LoggerUtility::logWarning(
                $message,
                ['requestArguments' => $this->requestArguments]
            );
        }

        return $queryString;
    }

    /**
     * Returns the index of the first row to return.
     *
     * @param array $arguments overrides $this->requestArguments if set
     *
     * @return int
     */
    protected function getOffset($arguments = null)
    {
        if (null === $arguments) {
            $arguments = $this->requestArguments;
        }

        $offset = 0;

        if (array_key_exists('start', $arguments)) {
            $offset = intval($arguments['start']);
        } else {
            if (array_key_exists('page', $arguments)) {
                $offset = (intval($arguments['page']) - 1) * $this->getCount();
            }
        }

        $this->setConfigurationValue('offset', $offset);

        return $offset;
    }

    /**
     * Returns whether extended search should be used or not.
     *
     * @return bool
     */
    public function isExtendedSearch()
    {
        $result = false;

        if (array_key_exists('extended', $this->requestArguments)) {
            // Show extended search when told so by the »extended« argument.
            $result = (true == $this->requestArguments['extended']);
        } else {
            // Show extended search when any of the »extended« fields are used.
            if (array_key_exists('q', $this->requestArguments)) {
                foreach ($this->settings['queryFields'] as $fieldInfo) {
                    if ($fieldInfo['extended']
                        && array_key_exists($fieldInfo['id'], $this->requestArguments['q'])
                        && $this->requestArguments['q'][$fieldInfo['id']]
                    ) {
                        $result = true;
                        break;
                    }
                }
            }
        }

        return $result;
    }

    /**
     * Takes the array of search query parameters and builds an array of Solr
     * search strings from it, using the »queryFields« configuration from TypoScript.
     * These search strings need to be ANDed together for the complete query.
     *
     * @param array $queryParameters
     *
     * @return array
     */
    protected function queryComponentsForQueryParameters($queryParameters)
    {
        $queryComponents = [];

        $queryFields = $this->settings['queryFields'];
        foreach ($queryFields as $fieldInfo) {
            $fieldID = $fieldInfo['id'];
            if ($fieldID && $queryParameters[$fieldID]) {
                // Extract array of query terms from the different structures:
                // a) just a single string (e.g. text field)
                // b) array of strings (e.g. date range field)
                // c) single field with additional configuration (e.g. text field with alternate query)
                $queryArguments = $queryParameters[$fieldID];
                $queryAlternate = null;
                if (is_array($queryArguments) && array_key_exists('alternate',
                        $queryArguments) && array_key_exists('queryAlternate', $fieldInfo)
                ) {
                    $queryAlternate = $queryArguments['alternate'];
                    if (array_key_exists('term', $queryArguments)) {
                        $queryTerms = $queryArguments['term'];
                    }
                } else {
                    $queryTerms = $queryArguments;
                }

                if (isset($queryTerms) && !is_array($queryTerms)) {
                    $queryTerms = [$queryTerms];
                }

                // Fill in pre-configured default values if they exist and the field is empty.
                $defaults = $fieldInfo['default'];
                if ($defaults) {
                    if (!is_array($defaults)) {
                        $defaults = [$defaults];
                    }
                    foreach ($defaults as $defaultKey => $default) {
                        if (!array_key_exists($defaultKey, $queryTerms)) {
                            $queryTerms[$defaultKey] = $default;
                        }
                    }
                }

                // Escape all arguments unless told not to do so.
                if (!$fieldInfo['noescape']) {
                    $escapedQueryTerms = [];
                    foreach ($queryTerms as $key => $term) {
                        if ($fieldInfo['phrase']) {
                            $escapedQueryTerms[$key] = $this->query->getHelper()->escapePhrase($term);
                        } else {
                            $escapedQueryTerms[$key] = $this->query->getHelper()->escapeTerm($term);
                        }
                    }
                    $queryTerms = $escapedQueryTerms;
                }

                // Get the query format and insert the query term.
                if (!$queryAlternate) {
                    $queryFormat = $fieldInfo['query'];
                } else {
                    if (array_key_exists($queryAlternate, $fieldInfo['queryAlternate'])) {
                        $queryFormat = $fieldInfo['queryAlternate'][$queryAlternate];
                    }
                }
                if (!$queryFormat) {
                    $queryFormat = $fieldID.':%s';
                }

                ksort($queryTerms);

                if ($this->settings['features']['eDisMax']) {
                    $queryPart = '_query_:{!edismax}'.$this->query->getHelper()->escapePhrase(vsprintf($queryFormat,
                            $queryTerms));
                    $queryPart = str_replace('"', '', $queryPart);
                } else {
                    $queryPart = '_query_:'.$this->query->getHelper()->escapePhrase(vsprintf($queryFormat,
                            $queryTerms));
                }

                if ($queryPart) {
                    if (is_array($queryParameters[$fieldID]) && empty($queryParameters[$fieldID]['term'])) {
                        // TODO some handling
                    } else {
                        $queryComponents[$fieldID] = $queryPart;
                    }
                }
            }
        }

        // Ask for all results if there is no query.
        if (0 === count($queryComponents)) {
            $queryComponents[] = $this->settings['defaultQuery'];
        }

        return $queryComponents;
    }

    /**
     * Sets up $query’s highlighting according to TypoScript settings.
     * Unicode Private Use Area Codepoints U+EEEE and U+EEEF are used to mark
     * the highlight to better deal with field contents that contain markup
     * themselves.
     *
     * @param array $arguments request arguments
     */
    protected function addHighlighting($arguments)
    {
        $highlightConfig = SettingsUtility::getMergedSettings('highlight', $this->settings);

        if ($highlightConfig && $highlightConfig['fields'] && count($highlightConfig['fields']) > 0) {
            $highlight = $this->query->getHighlighting();

            // Configure highlight queries.
            if ($highlightConfig['query']) {
                $queryWords = [];
                if ($highlightConfig['useQueryTerms'] && array_key_exists('q', $arguments)) {
                    $queryParameters = $arguments['q'];
                    foreach ($this->settings['queryFields'] as $fieldInfo) {
                        $fieldID = $fieldInfo['id'];
                        if ($fieldID && $queryParameters[$fieldID]) {
                            $queryArguments = $queryParameters[$fieldID];
                            $queryAlternate = null;
                            if (is_array($queryArguments) && array_key_exists('alternate',
                                    $queryArguments) && array_key_exists('queryAlternate', $fieldInfo)
                            ) {
                                $queryAlternate = $queryArguments['alternate'];
                                if (array_key_exists('term', $queryArguments)) {
                                    $queryTerms = $queryArguments['term'];
                                }
                            } else {
                                $queryTerms = $queryArguments;
                            }

                            if (!is_array($queryTerms)) {
                                $queryTerms = [$queryTerms];
                            }

                            foreach ($queryTerms as $queryTerm) {
                                if (!$fieldInfo['noescape']) {
                                    if ($fieldInfo['phrase']) {
                                        $queryTerm = $this->query->getHelper()->escapePhrase($queryTerm);
                                    } else {
                                        $queryTerm = $this->query->getHelper()->escapeTerm($queryTerm);
                                    }
                                }
                                $queryWords[] = $queryTerm;
                            }
                        }
                    }
                }

                $queryWords = array_filter($queryWords);

                if ($highlightConfig['useFacetTerms']) {
                    foreach ($this->getActiveFacets($arguments) as $facets) {
                        foreach (array_keys($facets) as $facetTerm) {
                            $queryWords[] = $this->query->getHelper()->escapePhrase($facetTerm);
                        }
                    }
                }

                $queryComponents = [];
                foreach ($queryWords as $queryWord) {
                    $queryComponents[] = '('.sprintf($highlightConfig['query'], $queryWord).')';
                }
                $queryString = implode(' OR ', $queryComponents);

                $highlight->setQuery($queryString);
            }

            // Configure highlight fields.
            $highlight->addFields(implode(',', $highlightConfig['fields']));

            // Configure the fragement length.
            $highlight->setFragSize($highlightConfig['fragsize']);

            // Set up alternative fields.
            if ($highlightConfig['alternateFields']) {
                foreach ($highlightConfig['alternateFields'] as $fieldName => $alternateFieldName) {
                    $highlightField = $highlight->getField($fieldName);
                    $highlightField->setAlternateField($alternateFieldName);
                }
            }

            // Set up prefix and postfix.
            $highlight->setSimplePrefix('\ueeee');
            $highlight->setSimplePostfix('\ueeef');
        }

        $this->setConfigurationValue('highlight', $highlightConfig);
    }

    /**
     * Checks that $sortString is well-formatted and adds the sort conidition
     * defined by it to $query.
     * Adds feedback about invalid sort string format to the page.
     *
     * @param string $sortString
     */
    protected function addSortStringForQuery($sortString)
    {
        if (!empty($sortString)) {
            $sortCriteria = explode(',', $sortString);
            foreach ($sortCriteria as $sortCriterion) {
                $sortCriterionParts = explode(' ', $sortCriterion);
                if (2 === count($sortCriterionParts)) {
                    $sortDirection = Query::SORT_ASC;
                    if ('desc' === $sortCriterionParts[1]) {
                        $sortDirection = Query::SORT_DESC;
                    } else {
                        if ('asc' !== $sortCriterionParts[1]) {
                            $message = sprintf('find: sort criterion »%s«’s sort direction is »%s« It should be »asc« or »desc«. Ignoring it.',
                                $sortCriterion, $sortCriterionParts[1]);
                            LoggerUtility::logWarning($message);
                            continue;
                        }
                    }

                    $this->query->addSort($sortCriterionParts[0], $sortDirection);
                } else {
                    $message = sprintf('find: sort criterion »%s« does not have the required form »fieldName [asc|desc]«. Ignoring it.',
                        $sortCriterion);
                    LoggerUtility::logWarning($message);
                }
            }
        }
    }

    /**
     * Main starting point for blank index action.
     *
     * @return array
     */
    public function getDefaultQuery()
    {
        $this->createQueryForArguments($this->getRequestArguments());
        $error = null;
        $resultSet = null;

        try {
            $resultSet = $this->connection->execute($this->query);
        } catch (HttpException $exception) {
            LoggerUtility::logError(
                'find: Solr Exception (Timeout?)',
                [
                    'requestArguments' => $this->getRequestArguments(),
                    'exception' => LoggerUtility::exceptionToArray($exception),
                ]
            );

            $error = ['solr' => $exception];
        }

        return [
            'results' => $resultSet,
            'error' => $error,
        ];
    }

    /**
     * Creates a query configured with all parameters set in the request’s arguments.
     *
     * @param array $arguments request arguments
     */
    protected function createQueryForArguments($arguments)
    {
        $this->createQuery();

        // Build query string.
        $queryParameters = [];
        if (array_key_exists('q', $arguments)) {
            $queryParameters = $arguments['q'];
        }

        $queryComponents = $this->queryComponentsForQueryParameters($queryParameters);
        $queryString = implode(' '.Query::QUERY_OPERATOR_AND.' ', $queryComponents);
        $this->query->setQuery($queryString);

        $this->setConfigurationValue('query', $queryParameters);
        $this->setConfigurationValue('queryString', $queryString);

        $this->setFields($arguments);
        $this->setRange($arguments);
        $this->setSortOrder($arguments);

        $this->addHighlighting($arguments);
        $this->setConfigurationValue('activeFacets', $this->addFacetFilters($arguments));
        $this->addFacetQueries();
    }

    /**
     * Sets up the fields to be fetched by the query.
     *
     * @param array $arguments request arguments
     */
    protected function setFields($arguments)
    {
        $fieldsConfig = SettingsUtility::getMergedSettings('dataFields', $this->settings, $this->getAction());
        $fields = [];

        // Use field list from query parameters or from defaults.
        if (array_key_exists('data-fields', $arguments) && $arguments['data-fields']) {
            $fields = explode(',', $arguments['data-fields']);
        } else {
            if ($fieldsConfig['default']) {
                $fields = array_values($fieldsConfig['default']);
            }
        }

        // If allowed fields are configured, keep only those.
        $allowedFields = $fieldsConfig['allow'];
        if ($allowedFields) {
            $fields = array_intersect($fields, $allowedFields);
        }

        // If disallowed fields are configured, remove those.
        $disallowedFields = $fieldsConfig['disallow'];
        if ($disallowedFields) {
            $fields = array_diff($fields, $disallowedFields);
        }

        // Only set fields of the query if there is a result. Otherwise use the default setting.
        if ($fields) {
            $this->query->setFields($fields);
        }
    }

    /**
     * Creates a blank query, sets up TypoScript filters and adds it to the view.
     */
    protected function createQuery()
    {
        $this->query = $this->connection->createSelect();
        $this->addFeatures();
        $this->addTypoScriptFilters();

        $this->setConfigurationValue('solarium', $this->query);
    }

    /**
     * Adds filter queries configured in TypoScript to $query.
     *
     * @return $this
     */
    protected function addTypoScriptFilters()
    {
        if (!empty($this->settings['additionalFilters'])) {
            foreach ($this->settings['additionalFilters'] as $key => $filterQuery) {
                $this->query->createFilterQuery('additionalFilter-'.$key)
                    ->setQuery($filterQuery);
            }
        }

        return $this;
    }

    /**
     * Sets up the range of documents to be fetches by $query.
     *
     * @param array $arguments request arguments
     */
    protected function setRange($arguments)
    {
        $this->query->setStart($this->getOffset($arguments));
        $this->query->setRows($this->getCount($arguments));
    }

    /**
     * Provides result count information in the configuration »resultCountOptions«.
     *
     * For the key »menu« it contains an array with keys and values the result count
     * that is suitable for use in the f:form.select View Helper’s options argument.
     * For the key »default« it contains the default number of results.
     * For the key »selected« it contains the the selected number of results.
     *
     * @param array $arguments request arguments
     */
    protected function addResultCountOptionsToTemplate($arguments)
    {
        $resultCountOptions = ['menu' => []];

        if (is_array($this->settings['paging']['menu'])) {
            ksort($this->settings['paging']['menu']);
            foreach ($this->settings['paging']['menu'] as $resultCount) {
                $resultCountOptions['menu'][$resultCount] = $resultCount;
            }

            $resultCountOptions['default'] = $this->settings['paging']['perPage'];

            if ($arguments['count'] && array_key_exists($arguments['count'], $resultCountOptions['menu'])) {
                $resultCountOptions['selected'] = $arguments['count'];
            } else {
                $resultCountOptions['selected'] = $resultCountOptions['default'];
            }
        }

        $this->setConfigurationValue('resultCountOptions', $resultCountOptions);
    }

    /**
     * Sets up $query’s sort order from URL arguments or the TypoScript default.
     *
     * @param array $arguments request arguments
     */
    protected function setSortOrder($arguments)
    {
        $sortString = '';
        if (!empty($arguments['sort'])) {
            $sortString = $arguments['sort'];
        } else {
            if (!empty($this->settings['sort'])) {
                foreach ($this->settings['sort'] as $sortSetting) {
                    if ('default' === $sortSetting['id']) {
                        $sortString = $sortSetting['sortCriteria'];
                        break;
                    }
                }
            }
        }

        $this->addSortStringForQuery($sortString);
        $this->addSortOrdersToTemplate($arguments);
    }

    /**
     * Provides sorting information in the template variable »sortOptions«.
     *
     * For the key »menu« it contains an array with keys: sort criteria and
     * values: localised labels that is suitable for use in the f:form.select
     * View Helper’s options argument.
     * For the key »default« it contains the default sort order string.
     * For the key »selected« it contains the selected sort order string.
     *
     * @param array $arguments request arguments
     */
    protected function addSortOrdersToTemplate($arguments)
    {
        $sortOptions = ['menu' => []];

        if (is_array($this->settings['sort'])) {
            ksort($this->settings['sort']);
            foreach ($this->settings['sort'] as $sortOptionIndex => $sortOption) {
                if (array_key_exists('id', $sortOption) && array_key_exists('sortCriteria', $sortOption)) {
                    $localisationKey = 'LLL:'.$this->settings['languageRootPath'].'locallang-form.xml:input.sort-'.$sortOption['id'];
                    $localisedLabel = LocalizationUtility::translate(
                        $localisationKey,
                        $this->getControllerExtensionKey()
                    );
                    if (!$localisedLabel) {
                        $localisedLabel = $sortOption['id'];
                    }
                    $sortOptions['menu'][$sortOption['sortCriteria']] = $localisedLabel;

                    if ('default' === $sortOption['id']) {
                        $sortOptions['default'] = $sortOption['sortCriteria'];
                    }
                } else {
                    $message = sprintf('find: TypoScript sort option »%s« does not have the required keys »id« and »sortCriteria. Ignoring this setting.',
                        $sortOptionIndex);
                    LoggerUtility::logWarning(
                        $message,
                        [
                            'sortOption' => $sortOption,
                        ]
                    );
                }
            }

            if ($arguments['sort'] && array_key_exists($arguments['sort'], $sortOptions['menu'])) {
                $sortOptions['selected'] = $arguments['sort'];
            } else {
                $sortOptions['selected'] = $sortOptions['default'];
            }
        }

        $this->setConfigurationValue('sortOptions', $sortOptions);
    }

    /**
     * @param mixed $key
     * @param mixed $value
     */
    public function setConfigurationValue($key, $value)
    {
        $this->configuration[$key] = $value;
    }

    /**
     * @return array
     */
    public function getConfiguration()
    {
        return $this->configuration;
    }

    /**
     * @param array $configuration
     */
    public function setConfiguration($configuration)
    {
        $this->configuration = $configuration;
    }

    /**
     * @param $query
     */
    public function search($query)
    {
        // TODO: Implement search() method.
    }

    /**
     * @return string
     */
    protected function getAction()
    {
        return $this->action;
    }

    /**
     * @param string $action
     */
    public function setAction($action)
    {
        $this->action = $action;
    }

    /**
     * @return string
     */
    protected function getControllerExtensionKey()
    {
        return $this->controllerExtensionKey;
    }

    /**
     * @param string $controllerExtensionKey
     */
    public function setControllerExtensionKey($controllerExtensionKey)
    {
        $this->controllerExtensionKey = $controllerExtensionKey;
    }

    /**
     * @return array
     *
     * @throws \TYPO3\CMS\Extbase\Mvc\Exception\StopActionException
     */
    public function getDetail()
    {
        $arguments = $this->getRequestArguments();
        $id = $arguments['id'];
        $assignments = [];
        if ($this->settings['paging']['detailPagePaging'] && array_key_exists('underlyingQuery', $arguments)) {
            // If underlying query has been sent, fetch more data to enable paging arrows.
            $underlyingQueryInfo = $arguments['underlyingQuery'];

            $index = FrontendUtility::getIndexes($underlyingQueryInfo);

            foreach ($arguments['underlyingQuery'] as $key => $value) {
                $arguments[$key] = $value;
            }

            $this->createQueryForArguments($arguments);
            $this->query->setStart($index['previousIndex']);
            $this->query->setRows($index['nextIndex'] - $index['previousIndex'] + 1);

            $assignments = $this->getRecordsWithUnderlyingQuery($assignments, $index, $id, $arguments);
        } else {
            // Without underlying query information, just get the record specified.
            $assignments = $this->getTheRecordSpecified($id, $assignments);
        }

        return $assignments;
    }

    /**
     * @param $id
     * @param $assignments
     *
     * @return mixed
     */
    protected function getTheRecordSpecified($id, $assignments)
    {
        $connection = $this->getConnection();

        $this->createQuery();
        $escapedID = $this->query->getHelper()->escapeTerm($id);
        $this->query->setQuery('id:'.$escapedID);
        try {
            /** @var \Solarium\Core\Query\Result\ResultInterface $selectResults */
            $selectResults = $connection->execute($this->query);

            if (count($selectResults) > 0) {
                $assignments['results'] = $selectResults;
                $resultSet = $selectResults->getDocuments();
                $assignments['document'] = $resultSet[0];
            } else {
                $message = sprintf('find: »detail« action query for id »%d« returned no results.', $id);
                LoggerUtility::logError($message, ['arguments' => $this->getRequestArguments()]);
            }
        } catch (HttpException $exception) {
            $message = 'find: Solr Exception (Timeout?)';
            LoggerUtility::logError(
                $message,
                [
                    'arguments' => $this->getRequestArguments(),
                    'exception' => LoggerUtility::exceptionToArray($exception),
                ]
            );
        }

        return $assignments;
    }

    /**
     * @param $assignments
     * @param array $index
     * @param $id
     * @param $arguments
     *
     * @return mixed
     */
    protected function getRecordsWithUnderlyingQuery($assignments, $index, $id, $arguments)
    {
        $connection = $this->getConnection();

        try {
            /** @var \Solarium\Core\Query\Result\ResultInterface $selectResults */
            $selectResults = $connection->execute($this->query);
            if (count($selectResults) > 0) {
                $assignments['results'] = $selectResults;
                $resultSet = $selectResults->getDocuments();

                // the actual result is at position 0 (for the first document) or 1 (otherwise).
                $document = $resultSet[$index['resultIndexOffset']];
                if ($document['id'] === $id) {
                    $assignments['document'] = $document;
                    if (0 !== $index['resultIndexOffset']) {
                        $assignments['document-previous'] = $resultSet[0];
                        $assignments['document-previous-number'] = $index['previousIndex'] + 1;
                    }
                    $nextResultIndex = 1 + $index['resultIndexOffset'];
                    if (count($resultSet) > $nextResultIndex) {
                        $assignments['document-next'] = $resultSet[$nextResultIndex];
                        $assignments['document-next-number'] = $index['nextIndex'] + 1;
                    }
                } else {
                    $message = sprintf('find: »detail« action query with underlying query could not retrieve record id »%d«.',
                        $id);
                    LoggerUtility::logError($message, ['arguments' => $arguments]);
                }
            } else {
                $message = 'find: »detail« action query with underlying query returned no results.';
                LoggerUtility::logError($message, ['arguments' => $arguments]);
            }
        } catch (HttpException $exception) {
            $message = 'find: Solr Exception (Timeout?)';
            LoggerUtility::logError(
                $message,
                [
                    'arguments' => $arguments,
                    'exception' => LoggerUtility::exceptionToArray($exception),
                ]
            );
        }

        return $assignments;
    }
}

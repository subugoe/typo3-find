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

use Psr\Log\LoggerInterface;
use Solarium\Client;
use Solarium\Component\Highlighting\Field;
use Solarium\Core\Client\Adapter\Curl;
use Solarium\Exception\HttpException;
use Solarium\QueryType\Select\Query\Query;
use Solarium\QueryType\Select\Result\Result;
use Subugoe\Find\Utility\FrontendUtility;
use Subugoe\Find\Utility\LoggerUtility;
use Subugoe\Find\Utility\SettingsUtility;
use Subugoe\Find\Utility\UpgradeUtility;
use Symfony\Component\EventDispatcher\EventDispatcher;
use TYPO3\CMS\Extbase\Utility\LocalizationUtility;

/**
 * Service provider for Solr.
 */
class SolrServiceProvider implements ServiceProviderInterface
{
    protected ?string $action = null;

    protected array $configuration = [];

    protected Client $connection;

    protected ?string $controllerExtensionKey = null;

    protected Query $query;

    protected array $requestArguments = [];

    protected string $connectionName;

    private array $settings = [];

    public function setConnectionName(string $name): void
    {
        $this->connectionName = $name;
    }

    public function setSettings(array $settings): void
    {
        $this->settings = $settings;
    }

    public function getRequestArguments(): array
    {
        return $this->requestArguments;
    }

    public function setRequestArguments(array $requestArguments): void
    {
        $this->requestArguments = $requestArguments;
    }

    public function __construct(private readonly LoggerInterface $logger) {}

    public function connect(): void
    {
        $connectionConfig = $this->settings['connections'][$this->connectionName]['options'] ?? [];
        if ($connectionConfig === []) {
            throw new \RuntimeException(
                sprintf('No connection settings found for connection "%s".', $this->connectionName),
                1_700_000_001
            );
        }

        // Upgrading to Solarium >= 5
        if (!array_key_exists('core', $connectionConfig)) {
            $connectionConfig = UpgradeUtility::handleSolariumUpgrade($connectionConfig);
        }

        $connectionSettings = [
            'endpoint' => [
                $this->connectionName => [
                    'host' => $connectionConfig['host'] ?? 'localhost',
                    'port' => (int)($connectionConfig['port'] ?? 8983),
                    'path' => $connectionConfig['path'] ?? '/',
                    'scheme' => $connectionConfig['scheme'] ?? 'http',
                    'core' => $connectionConfig['core'] ?? '',
                ],
            ],
        ];

        $adapter = new Curl();
        $eventDispatcher = new EventDispatcher();
        if (!empty($connectionConfig['timeout'])) {
            $adapter->setTimeout((int)$connectionConfig['timeout']);
        }

        $client = new Client($adapter, $eventDispatcher, $connectionSettings);

        $this->setConnection($client);
        $this->testConnection();
    }

    public function getConfiguration(): array
    {
        return $this->configuration;
    }

    /**
     * Main starting point for blank index action.
     */
    public function getDefaultQuery(): array
    {
        $this->createQueryForArguments($this->getRequestArguments());
        $error = null;
        $resultSet = null;

        try {
            $resultSet = $this->connection->execute($this->query);
        } catch (HttpException $httpException) {
            $this->logger->error(
                'Solr Exception (Timeout?)',
                [
                    'requestArguments' => $this->getRequestArguments(),
                    'exception' => LoggerUtility::exceptionToArray($httpException),
                ]
            );

            $error = ['solr' => $httpException];
        }

        return [
            'results' => $resultSet,
            'error' => $error,
        ];
    }

    public function getDocumentById(string $id): array
    {
        $arguments = $this->getRequestArguments();

        $assignments = [];
        if (!empty($this->settings['paging']['detailPagePaging'])
            && array_key_exists('underlyingQuery', $arguments)
            && is_array($arguments['underlyingQuery'])
        ) {
            $underlyingQueryInfo = $arguments['underlyingQuery'];

            $index = FrontendUtility::getIndexes($underlyingQueryInfo);

            foreach ($underlyingQueryInfo as $key => $value) {
                $arguments[$key] = $value;
            }

            $this->createQueryForArguments($arguments);
            $this->query->setStart($index['previousIndex']);
            $this->query->setRows($index['nextIndex'] - $index['previousIndex'] + 1);

            $assignments = $this->getRecordsWithUnderlyingQuery($assignments, $index, $id, $arguments);
        } else {
            $assignments = $this->getTheRecordSpecified($id, $assignments);
        }

        return $assignments;
    }

    /**
     * Returns whether extended search should be used or not.
     */
    public function isExtendedSearch(): bool
    {
        $result = false;

        if (array_key_exists('extended', $this->requestArguments)) {
            $result = (bool)$this->requestArguments['extended'];
        } elseif (array_key_exists('q', $this->requestArguments)
            && is_array($this->requestArguments['q'])
        ) {
            foreach ($this->settings['queryFields'] ?? [] as $fieldInfo) {
                $fieldId = $fieldInfo['id'] ?? null;
                if ($fieldId === null) {
                    continue;
                }

                if (!array_key_exists('extended', $fieldInfo)
                    || !array_key_exists($fieldId, $this->requestArguments['q'])
                    || empty($this->requestArguments['q'][$fieldId])
                ) {
                    continue;
                }

                $fieldValue = $this->requestArguments['q'][$fieldId];

                // Check if the request argument is an array itself (applies to field type "Range")
                if (is_array($fieldValue)) {
                    foreach ($fieldValue as $value) {
                        if ($value !== '') {
                            $result = true;
                            break 2;
                        }
                    }
                } else {
                    $result = true;
                    break;
                }
            }
        }

        return $result;
    }

    public function search($query): void
    {
        // TODO: Implement search() method.
    }

    public function setAction(string $actionName): void
    {
        $this->action = $actionName;
    }

    public function setConfiguration(array $configuration): void
    {
        $this->configuration = $configuration;
    }

    public function setConfigurationValue(string $key, mixed $value): void
    {
        $this->configuration[$key] = $value;
    }

    public function setControllerExtensionKey(string $key): void
    {
        $this->controllerExtensionKey = $key;
    }

    public function setCounter(): void
    {
        $this->setConfigurationValue('counterStart', $this->counterStart());
        $this->setConfigurationValue('counterEnd', $this->counterEnd());
    }

    public function suggestQuery(array $settings): array
    {
        $query = $this->getConnection()->createSuggester();
        $results = [];

        if (!empty($settings['q'])) {
            $query->setQuery($settings['q']);
            if (!empty($settings['dictionary'])) {
                $query->setDictionary($settings['dictionary']);
            }

            $this->addFacetFilters($settings);

            try {
                $solrResults = $this->getConnection()->execute($query)->getResults();
                foreach ($solrResults as $suggestions) {
                    $results = array_merge($results, $suggestions->getSuggestions());
                }
            } catch (HttpException $httpException) {
                $this->logger->error(
                    'Solr suggest query failed',
                    ['exception' => LoggerUtility::exceptionToArray($httpException)]
                );
            }
        }

        return $results;
    }

    protected function addEDisMax(): void
    {
        $this->query->getEDisMax();
    }

    /**
     * Adds filter queries for active facets to $query.
     *
     * @param array $arguments request arguments
     */
    protected function addFacetFilters(array $arguments): array
    {
        $activeFacets = $this->getActiveFacets($arguments);
        $activeFacetsForTemplate = [];

        foreach ($activeFacets as $facetID => $facets) {
            foreach ($facets as $facetTerm => $facetInfo) {
                $facetConfig = $facetInfo['config'];

                // Skip if config is null (non-configured facet)
                if ($facetConfig === null) {
                    continue;
                }

                $facetQuery = $this->getFacetQuery($facetConfig, (string)$facetTerm);

                if ($facetQuery === null) {
                    continue;
                }

                if (!empty($facetConfig['queryStyle']) && $facetConfig['queryStyle'] === 'and') {
                    $queryString = $this->query->getQuery();
                    if ($queryString) {
                        $queryString .= ' ' . Query::QUERY_OPERATOR_AND . ' ';
                    }

                    $queryString .= $facetQuery;
                    $this->query->setQuery($queryString);
                } else {
                    $queryInfo = ['key' => 'facet-' . $facetID . '-' . $facetTerm];

                    if (!empty($facetConfig['excludeOwnFilter']) && $facetQuery) {
                        $queryInfo['tag'] = $this->tagForFacet($facetID);
                    }

                    if (!empty($facetConfig['labelMissing']) && $facetTerm === $facetConfig['labelMissing']) {
                        $missingQuery = '-' . str_replace('("%s")', '[* TO *]', $facetConfig['query'] ?? '');
                        $this->query->createFilterQuery($queryInfo)->setQuery($missingQuery);
                    } else {
                        $this->query->createFilterQuery($queryInfo)->setQuery($facetQuery);
                    }
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
    protected function addFacetQueries(): void
    {
        $facetConfiguration = $this->settings['facets'] ?? [];

        if (!is_array($facetConfiguration) || $facetConfiguration === []) {
            $this->setConfigurationValue('facets', $facetConfiguration);
            return;
        }

        $facetDefaults = $this->settings['facetDefaults'] ?? [];
        $facetSet = $this->query->getFacetSet();

        foreach ($facetConfiguration as $key => $facet) {
            if (!is_array($facet) || !array_key_exists('id', $facet)) {
                $this->logger->warning(
                    sprintf('TypoScript facet %s does not have the required key »id«. Ignoring this facet.', $key),
                    ['facet' => $facet, 'facetConfiguration' => $facetConfiguration]
                );
                continue;
            }

            $facetID = $facet['id'];

            // Start with defaults and overwrite with specific facet configuration
            $facet = array_merge($facetDefaults, $facet);
            $facetConfiguration[$key] = $facet;

            $queryForFacet = null;

            if (array_key_exists('facetQuery', $facet) && is_array($facet['facetQuery'])) {
                $queryForFacet = $facetSet->createFacetMultiQuery($facetID);
                foreach ($facet['facetQuery'] as $facetQueryIndex => $facetQuery) {
                    if (isset($facetQuery['id'], $facetQuery['query'])) {
                        $queryForFacet->createQuery($facetQuery['id'], $facetQuery['query']);
                    } else {
                        $this->logger->error(
                            sprintf(
                                'TypoScript facet »%s«, facetQuery %s does not have the required keys »id« and »query«. Ignoring this facetQuery.',
                                $facetID,
                                $facetQueryIndex
                            ),
                            ['facetQuery' => $facetQuery, 'facetConfiguration' => $facetConfiguration]
                        );
                    }
                }
            } else {
                $queryForFacet = $facetSet->createFacetField($facetID);
                $queryForFacet->setField($facet['field'] ?: $facetID)
                    ->setMinCount($facet['fetchMinimum'] ?? 1)
                    ->setLimit($facet['fetchMaximum'] ?? 100)
                    ->setSort($facet['sortOrder'] ?? 'count');
            }

            // Unified excludeOwnFilter check (only once, for both code paths)
            if (!empty($facet['excludeOwnFilter'])) {
                $queryForFacet->addExclude($this->tagForFacet($facetID));
            }

            if (!empty($facet['showMissing'])) {
                $queryForFacet->setMissing(true);
            }
        }

        $this->setConfigurationValue('facets', $facetConfiguration);
    }

    protected function addFeatures(): void
    {
        if (!empty($this->settings['features']['eDisMax'])) {
            $this->addEDisMax();
        }
    }

    /**
     * Sets up $query's highlighting according to TypoScript settings.
     * Unicode Private Use Area Codepoints U+EEEE and U+EEEF are used to mark
     * the highlight to better deal with field contents that contain markup
     * themselves.
     *
     * @param array $arguments request arguments
     */
    protected function addHighlighting(array $arguments): void
    {
        $highlightConfig = SettingsUtility::getMergedSettings('highlight', $this->settings);

        if (!$highlightConfig
            || empty($highlightConfig['fields'])
            || !is_array($highlightConfig['fields'])
        ) {
            $this->setConfigurationValue('highlight', $highlightConfig);
            return;
        }

        $highlight = $this->query->getHighlighting();

        // Configure highlight queries.
        if (!empty($highlightConfig['query'])) {
            $queryWords = [];

            if (!empty($highlightConfig['useQueryTerms']) && array_key_exists('q', $arguments)) {
                $queryParameters = $arguments['q'];
                foreach ($this->settings['queryFields'] ?? [] as $fieldInfo) {
                    $fieldID = $fieldInfo['id'] ?? null;
                    if ($fieldID === null
                        || !isset($queryParameters[$fieldID])
                        || empty($queryParameters[$fieldID])
                    ) {
                        continue;
                    }

                    $queryArguments = $queryParameters[$fieldID];
                    $queryTerms = null;

                    if (is_array($queryArguments)
                        && array_key_exists('alternate', $queryArguments)
                        && array_key_exists('queryAlternate', $fieldInfo)
                    ) {
                        if (array_key_exists('term', $queryArguments)) {
                            $queryTerms = $queryArguments['term'];
                        }
                    } else {
                        $queryTerms = $queryArguments;
                    }

                    if ($queryTerms === null) {
                        continue;
                    }

                    if (!is_array($queryTerms)) {
                        $queryTerms = [$queryTerms];
                    }

                    foreach ($queryTerms as $queryTerm) {
                        if (empty($fieldInfo['noescape'])) {
                            if (!empty($fieldInfo['phrase'])) {
                                $queryTerm = $this->query->getHelper()->escapePhrase($queryTerm);
                            } else {
                                $queryTerm = $this->query->getHelper()->escapeTerm($queryTerm);
                            }
                        }

                        $queryWords[] = $queryTerm;
                    }
                }
            }

            $queryWords = array_filter($queryWords);

            if (!empty($highlightConfig['useFacetTerms'])) {
                foreach ($this->getActiveFacets($arguments) as $facets) {
                    foreach (array_keys($facets) as $facetTerm) {
                        $queryWords[] = $this->query->getHelper()->escapePhrase((string)$facetTerm);
                    }
                }
            }

            if ($queryWords !== []) {
                $queryComponents = [];
                foreach ($queryWords as $queryWord) {
                    $queryComponents[] = '(' . sprintf($highlightConfig['query'], $queryWord) . ')';
                }

                $highlight->setQuery(implode(' OR ', $queryComponents));
            }
        }

        // Configure highlight fields.
        $highlight->addFields(implode(',', $highlightConfig['fields']));

        // Configure the fragment length.
        if (array_key_exists('fragsize', $highlightConfig)) {
            $highlight->setFragSize((int)$highlightConfig['fragsize']);
        }

        // Set up alternative fields.
        if (!empty($highlightConfig['alternateFields']) && is_array($highlightConfig['alternateFields'])) {
            foreach ($highlightConfig['alternateFields'] as $fieldName => $alternateFieldName) {
                $highlightField = $highlight->getField($fieldName);
                if ($highlightField instanceof Field) {
                    $highlightField->setAlternateField($alternateFieldName);
                }
            }
        }

        // Set up prefix and postfix.
        $highlight->setSimplePrefix('\ueeee');
        $highlight->setSimplePostfix('\ueeef');

        $this->setConfigurationValue('highlight', $highlightConfig);
    }

    /**
     * Provides result count information in the configuration »resultCountOptions«.
     *
     * @param array $arguments request arguments
     */
    protected function addResultCountOptionsToTemplate(array $arguments): void
    {
        $resultCountOptions = ['menu' => []];

        $pagingMenu = $this->settings['paging']['menu'] ?? null;

        if (is_array($pagingMenu)) {
            ksort($pagingMenu);
            foreach ($pagingMenu as $resultCount) {
                $resultCountOptions['menu'][$resultCount] = $resultCount;
            }

            $resultCountOptions['default'] = $this->settings['paging']['perPage'] ?? 10;

            if (!empty($arguments['count'])
                && array_key_exists($arguments['count'], $resultCountOptions['menu'])
            ) {
                $resultCountOptions['selected'] = $arguments['count'];
            } else {
                $resultCountOptions['selected'] = $resultCountOptions['default'];
            }
        }

        $this->setConfigurationValue('resultCountOptions', $resultCountOptions);
    }

    /**
     * Provides sorting information in the template variable »sortOptions«.
     *
     * @param array $arguments request arguments
     */
    protected function addSortOrdersToTemplate(array $arguments): void
    {
        $sortOptions = ['menu' => []];

        $sortSettings = $this->settings['sort'] ?? null;

        if (is_array($sortSettings)) {
            ksort($sortSettings);
            foreach ($sortSettings as $sortOptionIndex => $sortOption) {
                if (!isset($sortOption['id'], $sortOption['sortCriteria'])) {
                    $this->logger->warning(
                        sprintf(
                            'TypoScript sort option »%s« does not have the required keys »id« and »sortCriteria«. Ignoring this setting.',
                            $sortOptionIndex
                        ),
                        ['sortOption' => $sortOption]
                    );
                    continue;
                }

                $localisationKey = 'LLL:' . ($this->settings['languageRootPath'] ?? '')
                    . 'locallang-form.xlf:input.sort-' . $sortOption['id'];
                $localisedLabel = LocalizationUtility::translate(
                    $localisationKey,
                    $this->getControllerExtensionKey()
                );
                if (!$localisedLabel) {
                    $localisedLabel = $sortOption['id'];
                }

                $sortOptions['menu'][$sortOption['sortCriteria']] = $localisedLabel;

                if ($sortOption['id'] === 'default') {
                    $sortOptions['default'] = $sortOption['sortCriteria'];
                }
            }

            if (!empty($arguments['sort'])
                && array_key_exists($arguments['sort'], $sortOptions['menu'])
            ) {
                $sortOptions['selected'] = $arguments['sort'];
            } elseif (array_key_exists('default', $sortOptions)) {
                $sortOptions['selected'] = $sortOptions['default'];
            } else {
                $sortOptions['selected'] = 'id asc';
            }
        }

        $this->setConfigurationValue('sortOptions', $sortOptions);
    }

    /**
     * Checks that $sortString is well-formatted and adds the sort condition
     * defined by it to $query.
     */
    protected function addSortStringForQuery(string $sortString): void
    {
        if ($sortString === '') {
            return;
        }

        // Whitelist: only allow word characters, spaces, commas
        // to prevent injection of arbitrary Solr parameters
        if (!preg_match('/^[\w\s,]+$/', $sortString)) {
            $this->logger->warning(
                sprintf('Sort string »%s« contains invalid characters. Ignoring it.', $sortString)
            );
            return;
        }

        $sortCriteria = explode(',', $sortString);
        foreach ($sortCriteria as $sortCriterion) {
            $sortCriterion = trim($sortCriterion);
            if ($sortCriterion === '') {
                continue;
            }

            $sortCriterionParts = explode(' ', $sortCriterion);
            if (count($sortCriterionParts) !== 2) {
                $this->logger->warning(
                    sprintf(
                        'Sort criterion »%s« does not have the required form »fieldName [asc|desc]«. Ignoring it.',
                        $sortCriterion
                    )
                );
                continue;
            }

            $sortDirection = Query::SORT_ASC;
            if ($sortCriterionParts[1] === 'desc') {
                $sortDirection = Query::SORT_DESC;
            } elseif ($sortCriterionParts[1] !== 'asc') {
                $this->logger->warning(
                    sprintf(
                        'Sort criterion »%s«: sort direction is »%s«. It should be »asc« or »desc«. Ignoring it.',
                        $sortCriterion,
                        $sortCriterionParts[1]
                    )
                );
                continue;
            }

            $this->query->addSort($sortCriterionParts[0], $sortDirection);
        }
    }

    /**
     * Adds filter queries configured in TypoScript to $query.
     */
    protected function addTypoScriptFilters(): static
    {
        if (!empty($this->settings['additionalFilters']) && is_array($this->settings['additionalFilters'])) {
            foreach ($this->settings['additionalFilters'] as $key => $filterQuery) {
                $this->query->createFilterQuery('additionalFilter-' . $key)
                    ->setQuery($filterQuery);
            }
        }

        return $this;
    }

    /**
     * Returns the number of the last result on the page.
     */
    protected function counterEnd(): int
    {
        return $this->getOffset() + $this->getCount();
    }

    /**
     * Returns the number of the first result on the page.
     */
    protected function counterStart(): int
    {
        return $this->getOffset() + 1;
    }

    /**
     * Creates a blank query, sets up TypoScript filters and adds it to the view.
     */
    protected function createQuery(): void
    {
        $this->query = $this->connection->createSelect();
        $this->addFeatures();
        $this->addTypoScriptFilters();
        $this->addDefaultQueryOperator();

        $this->setConfigurationValue('solarium', $this->query);
    }

    /**
     * Creates a query configured with all parameters set in the request's arguments.
     *
     * @param array $arguments request arguments
     */
    protected function createQueryForArguments(array $arguments): void
    {
        $this->createQuery();

        // Build query string.
        $rawQueryParameters = [];
        if (array_key_exists('q', $arguments) && is_array($arguments['q'])) {
            $rawQueryParameters = $arguments['q'];
        }

        // Process parameters to eliminate empty values
        $queryParameters = [];
        foreach ($rawQueryParameters as $key => $value) {
            if (is_array($value)) {
                $filtered = array_filter($value, static fn($v): bool => $v !== '' && $v !== null);
                if ($filtered !== []) {
                    $queryParameters[$key] = $filtered;
                }
            } elseif ($value !== '' && $value !== null) {
                $queryParameters[$key] = $value;
            }
        }

        $queryComponents = $this->queryComponentsForQueryParameters($queryParameters);
        $queryString = implode(' ' . Query::QUERY_OPERATOR_AND . ' ', $queryComponents);

        $this->query->setQuery($queryString);

        $this->setConfigurationValue('query', $queryParameters);
        $this->setConfigurationValue('queryString', $queryString);

        $this->setFields($arguments);
        $this->setRange($arguments);
        $this->setSortOrder($arguments);

        $this->addHighlighting($arguments);
        $this->setConfigurationValue('activeFacets', $this->addFacetFilters($arguments));
        $this->addFacetQueries();
        $this->addResultCountOptionsToTemplate($arguments);
    }

    protected function getAction(): ?string
    {
        return $this->action;
    }

    /**
     * Returns array with information about active facets.
     *
     * @param array $arguments request arguments
     *
     * @return array of arrays with information about active facets
     */
    protected function getActiveFacets(array $arguments): array
    {
        $activeFacets = [];

        // Add facets activated by default.
        foreach ($this->settings['facets'] ?? [] as $facet) {
            if (!empty($facet['selectedByDefault']) && !empty($facet['id']) && is_array($facet['selectedByDefault'])) {
                $this->setActiveFacetSelectionForID($activeFacets, $facet['id'], $facet['selectedByDefault']);
            }
        }

        // Add facets activated by query parameters.
        if (array_key_exists('facet', $arguments) && is_array($arguments['facet'])) {
            foreach ($arguments['facet'] as $facetID => $facetSelection) {
                if (is_array($facetSelection)) {
                    $this->setActiveFacetSelectionForID($activeFacets, (string)$facetID, $facetSelection);
                }
            }
        }

        return $activeFacets;
    }

    protected function getConnection(): Client
    {
        return $this->connection;
    }

    protected function getControllerExtensionKey(): ?string
    {
        return $this->controllerExtensionKey;
    }

    /**
     * Returns the number of results per page using the first of:
     * * query parameter »count«
     * * TypoScript setting »paging.perPage«
     * limited by the setting »paging.maximumPerPage«.
     *
     * @param array|null $arguments overrides $this->requestArguments if set
     */
    protected function getCount(?array $arguments = null): int
    {
        if ($arguments === null) {
            $arguments = $this->getRequestArguments();
        }

        $count = (int)($this->settings['paging']['perPage'] ?? 10);

        if (array_key_exists('count', $arguments)) {
            $count = (int)$arguments['count'];
        }

        $maxCount = (int)($this->settings['paging']['maximumPerPage'] ?? 100);
        $count = min($count, max($maxCount, 1));

        $this->setConfigurationValue('count', $count);

        return $count;
    }

    /**
     * Returns the facet configuration for the given $id.
     */
    protected function getFacetConfig(string $id): ?array
    {
        foreach ($this->settings['facets'] ?? [] as $facet) {
            if (isset($facet['id']) && $facet['id'] === $id) {
                return $facet;
            }
        }

        return null;
    }

    /**
     * Returns query for the given facet $id and $term based on the facet's
     * configuration.
     */
    protected function getFacetQuery(?array $facetConfig, string $queryTerm): ?string
    {
        if ($facetConfig === null || $facetConfig === []) {
            $this->logger->warning(
                'A non-configured facet was selected. Ignoring it.',
                ['requestArguments' => $this->requestArguments]
            );
            return null;
        }

        $queryString = null;

        if (array_key_exists('facetQuery', $facetConfig) && is_array($facetConfig['facetQuery'])) {
            // Facet queries are configured: use one of them.
            foreach ($facetConfig['facetQuery'] as $facetQueryConfig) {
                if (isset($facetQueryConfig['id']) && $facetQueryConfig['id'] === $queryTerm) {
                    $queryString = $facetQueryConfig['query'] ?? null;
                    break;
                }
            }

            if ($queryString === null) {
                $this->logger->info(
                    sprintf(
                        'Results for Facet »%s« with facetQuery ID »%s« were requested, but this facetQuery is not configured. Building a generic facet query instead.',
                        $facetConfig['id'] ?? 'unknown',
                        $queryTerm
                    ),
                    [
                        'requestArguments' => $this->requestArguments,
                        'facetConfig' => $facetConfig,
                        'queryTerm' => $queryTerm,
                    ]
                );
            }
        }

        if ($queryString === null) {
            // No facet queries applicable: build the query.
            if (array_key_exists('query', $facetConfig)) {
                $queryPattern = $facetConfig['query'];
            } else {
                $queryPattern = ($facetConfig['field'] ?? $facetConfig['id'] ?? '') . ':%s';
            }

            // Handle RANGE syntax (because PHP loses ] in array keys during URL parsing)
            if (preg_match('#^RANGE (.+) TO (.+)$#', $queryTerm, $matches)) {
                $from = $this->query->getHelper()->escapeTerm($matches[1]);
                $to = $this->query->getHelper()->escapeTerm($matches[2]);
                $queryTerm = '[' . $from . ' TO ' . $to . ']';
            } else {
                // Escape the term to prevent Solr injection
                $queryTerm = $this->query->getHelper()->escapePhrase($queryTerm);
            }

            $queryString = sprintf($queryPattern, $queryTerm);
        }

        return $queryString;
    }

    /**
     * Returns the index of the first row to return.
     *
     * @param array|null $arguments overrides $this->requestArguments if set
     */
    protected function getOffset(?array $arguments = null): int
    {
        if ($arguments === null) {
            $arguments = $this->requestArguments;
        }

        $offset = 0;

        if (array_key_exists('start', $arguments)) {
            $offset = max(0, (int)$arguments['start']);
        } elseif (array_key_exists('page', $arguments)) {
            $offset = max(0, ((int)$arguments['page'] - 1)) * $this->getCount();
        }

        $this->setConfigurationValue('offset', $offset);

        return $offset;
    }

    protected function getRecordsWithUnderlyingQuery(array $assignments, array $index, string $id, array $arguments): array
    {
        $connection = $this->getConnection();

        try {
            /** @var Result $selectResults */
            $selectResults = $connection->execute($this->query);

            if ($selectResults->getNumFound() <= 0) {
                $this->logger->error(
                    '»detail« action query with underlying query returned no results.',
                    ['arguments' => $arguments]
                );
                return $assignments;
            }

            $assignments['results'] = $selectResults;
            $resultSet = $selectResults->getDocuments();

            $resultIndexOffset = $index['resultIndexOffset'] ?? 0;

            if (!isset($resultSet[$resultIndexOffset])) {
                $this->logger->error(
                    sprintf('»detail« action: result index offset %d out of bounds (result count: %d).', $resultIndexOffset, count($resultSet)),
                    ['arguments' => $arguments]
                );
                return $assignments;
            }

            $document = $resultSet[$resultIndexOffset];

            if (($document['id'] ?? null) !== $id) {
                $this->logger->error(
                    sprintf('»detail« action query with underlying query could not retrieve record id »%s«.', $id),
                    ['arguments' => $arguments]
                );
                return $assignments;
            }

            $assignments['document'] = $document;

            if ($resultIndexOffset !== 0 && isset($resultSet[0])) {
                $assignments['document-previous'] = $resultSet[0];
                $assignments['document-previous-number'] = $index['previousIndex'] + 1;
            }

            $nextResultIndex = 1 + $resultIndexOffset;
            if (count($resultSet) > $nextResultIndex) {
                $assignments['document-next'] = $resultSet[$nextResultIndex];
                $assignments['document-next-number'] = $index['nextIndex'] + 1;
            }
        } catch (HttpException $httpException) {
            $this->logger->error(
                'Solr Exception (Timeout?)',
                [
                    'arguments' => $arguments,
                    'exception' => LoggerUtility::exceptionToArray($httpException),
                ]
            );
        }

        return $assignments;
    }

    protected function getTheRecordSpecified(string $id, array $assignments): array
    {
        $connection = $this->getConnection();

        $this->createQuery();
        $escapedID = $this->query->getHelper()->escapeTerm($id);
        $this->query->setQuery('id:' . $escapedID);

        try {
            /** @var Result $selectResults */
            $selectResults = $connection->execute($this->query);

            if ($selectResults->getNumFound() > 0) {
                $assignments['results'] = $selectResults;
                $resultSet = $selectResults->getDocuments();
                $assignments['document'] = $resultSet[0];
            } else {
                $this->logger->error(
                    sprintf('»detail« action query for id »%s« returned no results.', $id),
                    ['arguments' => $this->getRequestArguments()]
                );
            }
        } catch (HttpException $httpException) {
            $this->logger->error(
                'Solr Exception (Timeout?)',
                [
                    'arguments' => $this->getRequestArguments(),
                    'exception' => LoggerUtility::exceptionToArray($httpException),
                ]
            );
        }

        return $assignments;
    }

    /**
     * Takes the array of search query parameters and builds an array of Solr
     * search strings from it, using the »queryFields« configuration from TypoScript.
     * These search strings need to be ANDed together for the complete query.
     */
    protected function queryComponentsForQueryParameters(array $queryParameters): array
    {
        $queryComponents = [];

        $queryFields = $this->settings['queryFields'] ?? [];
        foreach ($queryFields as $fieldInfo) {
            $fieldID = $fieldInfo['id'] ?? null;
            if ($fieldID === null
                || !array_key_exists($fieldID, $queryParameters)
                || $queryParameters[$fieldID] === null
            ) {
                continue;
            }

            $queryArguments = $queryParameters[$fieldID];
            $queryAlternate = null;
            $queryTerms = null;

            if (is_array($queryArguments)
                && array_key_exists('alternate', $queryArguments)
                && array_key_exists('queryAlternate', $fieldInfo)
            ) {
                $queryAlternate = $queryArguments['alternate'];
                if (array_key_exists('term', $queryArguments)) {
                    $queryTerms = $queryArguments['term'];
                }
            } else {
                $queryTerms = $queryArguments;
            }

            if ($queryTerms !== null && !is_array($queryTerms)) {
                $queryTerms = [$queryTerms];
            }

            if ($queryTerms === null) {
                $queryTerms = [];
            }

            // Fill in pre-configured default values if they exist and the field is empty.
            $defaults = $fieldInfo['default'] ?? null;
            if ($defaults !== null) {
                if (!is_array($defaults)) {
                    $defaults = [$defaults];
                }

                foreach ($defaults as $defaultKey => $default) {
                    if (!array_key_exists($defaultKey, $queryTerms)) {
                        $queryTerms[$defaultKey] = $default;
                    }
                }
            }

            if ($queryTerms === []) {
                continue;
            }

            // Escape all arguments unless told not to do so.
            $noEscape = (int)($fieldInfo['noescape'] ?? 0);

            if ($noEscape === 0) {
                $escapedQueryTerms = [];
                foreach ($queryTerms as $key => $term) {
                    if (!empty($fieldInfo['phrase'])) {
                        $escapedQueryTerms[$key] = $this->query->getHelper()->escapePhrase($term);
                    } else {
                        $escapedQueryTerms[$key] = $this->query->getHelper()->escapeTerm($term);
                    }
                }

                $queryTerms = $escapedQueryTerms;
            }

            // Get the query format and insert the query term.
            $queryFormat = '';
            if (!$queryAlternate) {
                $queryFormat = $fieldInfo['query'] ?? '';
            } elseif (isset($fieldInfo['queryAlternate'][$queryAlternate])) {
                $queryFormat = $fieldInfo['queryAlternate'][$queryAlternate];
            }

            if ($queryFormat === '') {
                $queryFormat = $fieldID . ':%s';
            }

            ksort($queryTerms);

            $magicFieldPrefix = '';

            $luceneVersion = (int)($this->settings['luceneMatchVersionNumber'] ?? 0);
            if ($luceneVersion < 8) {
                $magicFieldPrefix = '_query_:';
            }

            if (!empty($this->settings['features']['eDisMax'])) {
                $magicFieldPrefix .= '{!edismax}';
            }

            if ($noEscape === 2) {
                $chars = explode(',', (string)($fieldInfo['escapechar'] ?? ''));
                foreach (array_keys($queryTerms) as $key) {
                    foreach ($chars as $char) {
                        if ($char !== '') {
                            $queryTerms[$key] = str_replace($char, '\\' . $char, (string)$queryTerms[$key]);
                        }
                    }
                }

                $queryPart = $magicFieldPrefix . vsprintf($queryFormat, $queryTerms);
            } elseif ($noEscape === 1) {
                $queryPart = $magicFieldPrefix . vsprintf($queryFormat, $queryTerms);
            } else {
                $queryPart = $magicFieldPrefix . $this->query->getHelper()->escapePhrase(
                    vsprintf($queryFormat, $queryTerms)
                );
            }

            if ($queryPart !== '' && $queryPart !== '0') {
                $queryComponents[$fieldID] = $queryPart;
            }
        }

        // Ask for all results if there is no query.
        if ($queryComponents === []) {
            $queryComponents[] = $this->settings['defaultQuery'] ?? '*:*';
        }

        return $queryComponents;
    }

    /**
     * Adds information about the selected items for a given facet to $activeFacets.
     *
     * @param array  &$activeFacets active facets accumulator (by reference)
     * @param string $facetID       ID of the facet to set
     * @param array  $facetSelection array of selected items for the facet
     */
    protected function setActiveFacetSelectionForID(array &$activeFacets, string $facetID, array $facetSelection): void
    {
        $facetConfig = $this->getFacetConfig($facetID);
        $facetQueries = [];

        foreach (array_keys($facetSelection) as $facetTerm) {
            $facetTerm = (string)$facetTerm;
            $facetQueries[$facetTerm] = [
                'id' => $facetID,
                'config' => $facetConfig,
                'term' => $facetTerm,
                'query' => $this->getFacetQuery($facetConfig, $facetTerm),
            ];
        }

        if ($facetQueries !== []) {
            $activeFacets[$facetID] = $facetQueries;
        }
    }

    protected function setConnection(Client $connection): void
    {
        $this->connection = $connection;
    }

    /**
     * Sets up the fields to be fetched by the query.
     *
     * @param array $arguments request arguments
     */
    protected function setFields(array $arguments): void
    {
        $fieldsConfig = SettingsUtility::getMergedSettings('dataFields', $this->settings, $this->getAction() ?? 'index');
        $fields = [];

        // Use field list from query parameters or from defaults.
        if (!empty($arguments['data-fields'])) {
            $fields = explode(',', (string)$arguments['data-fields']);
        } elseif (!empty($fieldsConfig['default'])) {
            $fields = array_values($fieldsConfig['default']);
        }

        // If allowed fields are configured, keep only those.
        if (!empty($fieldsConfig['allow']) && is_array($fieldsConfig['allow'])) {
            $fields = array_intersect($fields, $fieldsConfig['allow']);
        }

        // If disallowed fields are configured, remove those.
        if (!empty($fieldsConfig['disallow']) && is_array($fieldsConfig['disallow'])) {
            $fields = array_diff($fields, $fieldsConfig['disallow']);
        }

        // Only set fields of the query if there is a result. Otherwise use the default setting.
        if ($fields !== []) {
            $this->query->setFields($fields);
        }
    }

    /**
     * Sets up the range of documents to be fetched by $query.
     *
     * @param array $arguments request arguments
     */
    protected function setRange(array $arguments): void
    {
        $this->query->setStart($this->getOffset($arguments));
        $this->query->setRows($this->getCount($arguments));
    }

    /**
     * Sets up $query's sort order from URL arguments or the TypoScript default.
     *
     * @param array $arguments request arguments
     */
    protected function setSortOrder(array $arguments): void
    {
        $sortString = '';
        if (!empty($arguments['sort'])) {
            $sortString = (string)$arguments['sort'];
        } elseif (!empty($this->settings['sort']) && is_array($this->settings['sort'])) {
            foreach ($this->settings['sort'] as $sortSetting) {
                if (($sortSetting['id'] ?? '') === 'default' && isset($sortSetting['sortCriteria'])) {
                    $sortString = $sortSetting['sortCriteria'];
                    break;
                }
            }
        }

        $this->addSortStringForQuery($sortString);
        $this->addSortOrdersToTemplate($arguments);
    }

    /**
     * Returns the facet/filter key for the given $facetID.
     */
    protected function tagForFacet(string $facetID): string
    {
        return 'facet-' . $facetID;
    }

    /**
     * Set configured main query operator. Defaults to 'AND'.
     */
    private function addDefaultQueryOperator(): void
    {
        if (!empty($this->settings['defaultQueryOperator'])) {
            $this->query->setQueryDefaultOperator($this->settings['defaultQueryOperator']);
        }
    }

    private function testConnection(): void
    {
        try {
            $ping = $this->connection->createPing();
            $this->connection->ping($ping);
        } catch (HttpException $httpException) {
            $this->logger->error('Solr connection test failed', [
                'exception' => LoggerUtility::exceptionToArray($httpException),
            ]);
            throw $httpException;
        }
    }
}

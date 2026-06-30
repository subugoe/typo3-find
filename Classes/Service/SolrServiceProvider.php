<?php

declare(strict_types=1);

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
use Symfony\Contracts\EventDispatcher\EventDispatcherInterface;
use TYPO3\CMS\Extbase\Utility\LocalizationUtility;

class SolrServiceProvider implements ServiceProviderInterface
{
    protected ?string $action = null;

    protected array $configuration = [];

    protected Client $connection;

    protected ?string $controllerExtensionKey = null;

    protected Query $query;

    protected array $requestArguments = [];

    /**
     * Connection name must be set via setConnectionName() before calling connect().
     */
    protected string $connectionName = '';

    private array $settings = [];

    /**
     * Simple in-memory cache for query results within a single request.
     * Key: md5 of serialized arguments, Value: result array.
     */
    private array $queryCache = [];

    private int $cacheHits = 0;

    /**
     * Whether the Solr connection has been verified as reachable.
     * Avoids redundant ping calls within the same request.
     */
    private bool $connectionVerified = false;

    public function __construct(
        private readonly LoggerInterface $logger,
        private readonly EventDispatcherInterface $eventDispatcher,
    ) {}

    public function setConnectionName(string $name): void
    {
        if ($name === '') {
            throw new \InvalidArgumentException('Connection name must not be empty.', 1_700_000_005);
        }

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

    /**
     * Establishes the Solarium client connection using configured settings.
     *
     * Does NOT throw if Solr is unreachable — a warning is logged instead,
     * so that the rest of the page can still render (e.g. with an error message).
     *
     * @throws \RuntimeException if connection settings are missing or incomplete.
     */
    public function connect(): void
    {
        if ($this->connectionName === '') {
            throw new \RuntimeException(
                'Connection name must be set via setConnectionName() before calling connect().',
                1_700_000_006
            );
        }

        $connectionConfig = $this->settings['connections'][$this->connectionName]['options'] ?? [];

        if ($connectionConfig === []) {
            throw new \RuntimeException(
                sprintf('No connection settings found for connection "%s".', $this->connectionName),
                1_700_000_001
            );
        }

        if (!array_key_exists('core', $connectionConfig)) {
            $connectionConfig = UpgradeUtility::handleSolariumUpgrade($connectionConfig);
        }

        $connectionSettings = [
            'endpoint' => [
                $this->connectionName => [
                    'host'   => $connectionConfig['host'] ?? 'localhost',
                    'port'   => (int)($connectionConfig['port'] ?? 8983),
                    'path'   => $connectionConfig['path'] ?? '/',
                    'scheme' => $connectionConfig['scheme'] ?? 'http',
                    'core'   => $connectionConfig['core'] ?? '',
                ],
            ],
        ];

        $adapter = new Curl();

        if (!empty($connectionConfig['timeout'])) {
            $adapter->setTimeout((int)$connectionConfig['timeout']);
        }

        $this->setConnection(new Client($adapter, $this->eventDispatcher, $connectionSettings));

        // Verify the connection is reachable. Logs a warning on failure but does
        // not throw, so the rest of the page can still degrade gracefully.
        if (!$this->connectionVerified) {
            $this->verifyConnection();
        }
    }

    public function getConfiguration(): array
    {
        return $this->configuration;
    }

    public function getDefaultQuery(): array
    {
        $cacheKey = $this->buildCacheKey($this->getRequestArguments());

        if (isset($this->queryCache[$cacheKey])) {
            $this->cacheHits++;
            return $this->queryCache[$cacheKey];
        }

        $this->createQueryForArguments($this->getRequestArguments());

        $error     = null;
        $resultSet = null;

        try {
            $resultSet = $this->connection->execute($this->query);
        } catch (HttpException $httpException) {
            $this->logger->error(
                'Solr Exception (Timeout?)',
                [
                    'requestArguments' => $this->getRequestArguments(),
                    'exception'        => LoggerUtility::exceptionToArray($httpException),
                ]
            );
            $error = ['solr' => $httpException];
        }

        $result = [
            'results' => $resultSet,
            'error'   => $error,
        ];

        $this->queryCache[$cacheKey] = $result;

        // Prevent unbounded memory growth within a single request.
        if (count($this->queryCache) > 100) {
            $this->queryCache = array_slice($this->queryCache, -50, null, true);
        }

        return $result;
    }

    public function getDocumentById(string $id): array
    {
        $arguments   = $this->getRequestArguments();
        $assignments = [];

        if (!empty($this->settings['paging']['detailPagePaging'])
            && array_key_exists('underlyingQuery', $arguments)
            && is_array($arguments['underlyingQuery'])
        ) {
            $underlyingQueryInfo = $arguments['underlyingQuery'];
            $index               = FrontendUtility::getIndexes($underlyingQueryInfo);
            $mergedArguments     = $this->mergeUnderlyingQuery($arguments, $underlyingQueryInfo);

            $this->createQueryForArguments($mergedArguments);
            $this->query->setStart($index['previousIndex']);
            $this->query->setRows($index['nextIndex'] - $index['previousIndex'] + 1);

            $assignments = $this->getRecordsWithUnderlyingQuery($assignments, $index, $id, $mergedArguments);
        } else {
            $assignments = $this->getTheRecordSpecified($id, $assignments);
        }

        return $assignments;
    }

    private function mergeUnderlyingQuery(array $arguments, array $underlyingQueryInfo): array
    {
        $merged = $arguments;

        foreach ($underlyingQueryInfo as $key => $value) {
            if (!is_array($value)) {
                $merged[$key] = $value;
            } elseif (!isset($merged[$key]) || !is_array($merged[$key])) {
                $merged[$key] = $value;
            } else {
                $merged[$key] = array_replace_recursive($merged[$key], $value);
            }
        }

        return $merged;
    }

    public function isExtendedSearch(): bool
    {
        if (array_key_exists('extended', $this->requestArguments)) {
            return (bool)$this->requestArguments['extended'];
        }

        if (!array_key_exists('q', $this->requestArguments)
            || !is_array($this->requestArguments['q'])
        ) {
            return false;
        }

        foreach ($this->settings['queryFields'] ?? [] as $fieldInfo) {
            $fieldId = $fieldInfo['id'] ?? null;

            if ($fieldId === null
                || !array_key_exists('extended', $fieldInfo)
                || !array_key_exists($fieldId, $this->requestArguments['q'])
                || empty($this->requestArguments['q'][$fieldId])
            ) {
                continue;
            }

            $fieldValue = $this->requestArguments['q'][$fieldId];

            if (is_array($fieldValue)) {
                foreach ($fieldValue as $value) {
                    if ($value !== '') {
                        return true;
                    }
                }
            } else {
                return true;
            }
        }

        return false;
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

    /**
     * Runs a Solr suggester query and returns a flat array of suggestion strings.
     *
     * Note: the Solarium Suggester API does not support filter queries directly,
     * so facet filters are intentionally not applied here.
     */
    public function suggestQuery(array $settings): array
    {
        $results = [];

        if (empty($settings['q'])) {
            return $results;
        }

        $query = $this->getConnection()->createSuggester();
        $query->setQuery($settings['q']);

        if (!empty($settings['dictionary'])) {
            $query->setDictionary($settings['dictionary']);
        }

        try {
            $solrResults = $this->getConnection()->execute($query)->getResults();

            foreach ($solrResults as $suggestions) {
                $suggestionsArray = $suggestions->getSuggestions();
                if (is_array($suggestionsArray)) {
                    array_push($results, ...$suggestionsArray);
                }
            }
        } catch (HttpException $httpException) {
            $this->logger->error(
                'Solr suggest query failed',
                ['exception' => LoggerUtility::exceptionToArray($httpException)]
            );
        }

        return $results;
    }

    protected function addEDisMax(): void
    {
        $this->query->getEDisMax();
    }

    protected function addFacetFilters(array $arguments): array
    {
        $activeFacets            = $this->getActiveFacets($arguments);
        $activeFacetsForTemplate = [];

        foreach ($activeFacets as $facetID => $facets) {
            foreach ($facets as $facetTerm => $facetInfo) {
                $facetConfig = $facetInfo['config'];

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

                    if (!empty($facetConfig['excludeOwnFilter'])) {
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

    protected function addFacetQueries(): void
    {
        $facetConfiguration = $this->settings['facets'] ?? [];

        if (!is_array($facetConfiguration) || $facetConfiguration === []) {
            $this->setConfigurationValue('facets', $facetConfiguration);
            return;
        }

        $facetDefaults = $this->settings['facetDefaults'] ?? [];
        $facetSet      = $this->query->getFacetSet();

        foreach ($facetConfiguration as $key => $facet) {
            if (!is_array($facet) || !array_key_exists('id', $facet)) {
                $this->logger->warning(
                    sprintf('TypoScript facet %s does not have the required key »id«. Ignoring this facet.', $key),
                    ['facet' => $facet, 'facetConfiguration' => $facetConfiguration]
                );
                continue;
            }

            $facetID = $facet['id'];
            $facet   = array_merge($facetDefaults, $facet);

            $facetConfiguration[$key] = $facet;

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
                $queryForFacet
                    ->setField($facet['field'] ?: $facetID)
                    ->setMinCount($facet['fetchMinimum'] ?? 1)
                    ->setLimit($facet['fetchMaximum'] ?? 100)
                    ->setSort($facet['sortOrder'] ?? 'count');
            }

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
                    $queryTerms     = null;

                    if (is_array($queryArguments)
                        && array_key_exists('alternate', $queryArguments)
                        && array_key_exists('queryAlternate', $fieldInfo)
                    ) {
                        $queryTerms = $queryArguments['term'] ?? null;
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
                            $queryTerm = empty($fieldInfo['phrase'])
                                ? $this->query->getHelper()->escapeTerm($queryTerm)
                                : $this->query->getHelper()->escapePhrase($queryTerm);
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

        $highlight->addFields(implode(',', $highlightConfig['fields']));

        if (array_key_exists('fragsize', $highlightConfig)) {
            $highlight->setFragSize((int)$highlightConfig['fragsize']);
        }

        if (!empty($highlightConfig['alternateFields']) && is_array($highlightConfig['alternateFields'])) {
            foreach ($highlightConfig['alternateFields'] as $fieldName => $alternateFieldName) {
                $highlightField = $highlight->getField($fieldName);

                if ($highlightField instanceof Field) {
                    $highlightField->setAlternateField($alternateFieldName);
                }
            }
        }

        $highlight->setSimplePrefix('\ueeee');
        $highlight->setSimplePostfix('\ueeef');

        $this->setConfigurationValue('highlight', $highlightConfig);
    }

    protected function addResultCountOptionsToTemplate(array $arguments): void
    {
        $resultCountOptions = ['menu' => []];
        $pagingMenu         = $this->settings['paging']['menu'] ?? null;

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

    protected function addSortOrdersToTemplate(array $arguments): void
    {
        $sortOptions  = ['menu' => []];
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

                $sortOptions['menu'][$sortOption['sortCriteria']] =
                    LocalizationUtility::translate($localisationKey) ?? $sortOption['id'];

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

    protected function addSortStringForQuery(string $sortString): void
    {
        if ($sortString === '') {
            return;
        }

        if (!preg_match('/^[\w\s,]+$/', $sortString)) {
            $this->logger->warning(
                sprintf('Sort string »%s« contains invalid characters. Ignoring it.', $sortString)
            );
            return;
        }

        foreach (explode(',', $sortString) as $sortCriterion) {
            $sortCriterion = trim($sortCriterion);

            if ($sortCriterion === '') {
                continue;
            }

            $parts = explode(' ', $sortCriterion);

            if (count($parts) !== 2) {
                $this->logger->warning(
                    sprintf(
                        'Sort criterion »%s« does not have the required form »fieldName [asc|desc]«. Ignoring it.',
                        $sortCriterion
                    )
                );
                continue;
            }

            [$fieldName, $direction] = $parts;

            if ($direction !== 'asc' && $direction !== 'desc') {
                $this->logger->warning(
                    sprintf(
                        'Sort criterion »%s«: sort direction is »%s«. It should be »asc« or »desc«. Ignoring it.',
                        $sortCriterion,
                        $direction
                    )
                );
                continue;
            }

            $this->query->addSort(
                $fieldName,
                $direction === 'desc' ? Query::SORT_DESC : Query::SORT_ASC
            );
        }
    }

    protected function addTypoScriptFilters(): void
    {
        if (!empty($this->settings['additionalFilters']) && is_array($this->settings['additionalFilters'])) {
            foreach ($this->settings['additionalFilters'] as $key => $filterQuery) {
                $this->query->createFilterQuery('additionalFilter-' . $key)
                    ->setQuery($filterQuery);
            }
        }
    }

    protected function counterEnd(): int
    {
        return $this->getOffset() + $this->getCount();
    }

    protected function counterStart(): int
    {
        return $this->getOffset() + 1;
    }

    protected function createQuery(): void
    {
        $this->query = $this->connection->createSelect();
        $this->addFeatures();
        $this->addTypoScriptFilters();
        $this->addDefaultQueryOperator();
        $this->setConfigurationValue('solarium', $this->query);
    }

    protected function createQueryForArguments(array $arguments): void
    {
        $this->createQuery();

        $rawQueryParameters = [];

        if (array_key_exists('q', $arguments) && is_array($arguments['q'])) {
            $rawQueryParameters = $arguments['q'];
        }

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
        $queryString     = implode(' ' . Query::QUERY_OPERATOR_AND . ' ', $queryComponents);

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

    protected function getActiveFacets(array $arguments): array
    {
        $activeFacets = [];

        foreach ($this->settings['facets'] ?? [] as $facet) {
            if (!empty($facet['selectedByDefault'])
                && !empty($facet['id'])
                && is_array($facet['selectedByDefault'])
            ) {
                $this->setActiveFacetSelectionForID($activeFacets, $facet['id'], $facet['selectedByDefault']);
            }
        }

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
     * Returns the number of results per page, clamped between 1 and maximumPerPage.
     *
     * Pure computation — does NOT write to configuration. Callers that need the
     * value stored in configuration should call setConfigurationValue() themselves.
     */
    protected function getCount(?array $arguments = null): int
    {
        $arguments ??= $this->getRequestArguments();

        $default  = (int)($this->settings['paging']['perPage'] ?? 10);
        $maxCount = max(1, (int)($this->settings['paging']['maximumPerPage'] ?? 100));
        $count    = isset($arguments['count']) ? (int)$arguments['count'] : $default;

        return max(1, min($count, $maxCount));
    }

    protected function getFacetConfig(string $id): ?array
    {
        foreach ($this->settings['facets'] ?? [] as $facet) {
            if (isset($facet['id']) && $facet['id'] === $id) {
                return $facet;
            }
        }

        return null;
    }

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
                        'facetConfig'      => $facetConfig,
                        'queryTerm'        => $queryTerm,
                    ]
                );
            }
        }

        if ($queryString === null) {
            if (array_key_exists('query', $facetConfig)) {
                $queryPattern = $facetConfig['query'];
            } else {
                $queryPattern = ($facetConfig['field'] ?? $facetConfig['id'] ?? '') . ':%s';
            }

            if (preg_match('#^RANGE (.+) TO (.+)$#', $queryTerm, $matches)) {
                $from      = $this->query->getHelper()->escapeTerm($matches[1]);
                $to        = $this->query->getHelper()->escapeTerm($matches[2]);
                $queryTerm = '[' . $from . ' TO ' . $to . ']';
            } else {
                $queryTerm = $this->query->getHelper()->escapePhrase($queryTerm);
            }

            $queryString = sprintf($queryPattern, $queryTerm);
        }

        return $queryString;
    }

    /**
     * Returns the result offset (zero-based).
     *
     * Pure computation — does NOT write to configuration.
     */
    protected function getOffset(?array $arguments = null): int
    {
        $arguments ??= $this->requestArguments;

        if (array_key_exists('start', $arguments)) {
            return max(0, (int)$arguments['start']);
        }

        if (array_key_exists('page', $arguments)) {
            return max(0, ((int)$arguments['page'] - 1)) * $this->getCount($arguments);
        }

        return 0;
    }

    protected function getRecordsWithUnderlyingQuery(
        array $assignments,
        array $index,
        string $id,
        array $arguments
    ): array {
        try {
            /** @var Result $selectResults */
            $selectResults = $this->getConnection()->execute($this->query);

            if ($selectResults->getNumFound() <= 0) {
                $this->logger->error(
                    '»detail« action query with underlying query returned no results.',
                    ['arguments' => $arguments]
                );
                return $assignments;
            }

            $resultSet         = $selectResults->getDocuments();
            $resultIndexOffset = $index['resultIndexOffset'] ?? 0;

            if (!isset($resultSet[$resultIndexOffset])) {
                $this->logger->error(
                    sprintf(
                        '»detail« action: result index offset %d out of bounds (result count: %d).',
                        $resultIndexOffset,
                        count($resultSet)
                    ),
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

            $assignments['results']  = $selectResults;
            $assignments['document'] = $document;

            if ($resultIndexOffset !== 0 && isset($resultSet[0])) {
                $assignments['document-previous']        = $resultSet[0];
                $assignments['document-previous-number'] = $index['previousIndex'] + 1;
            }

            $nextResultIndex = $resultIndexOffset + 1;

            if (isset($resultSet[$nextResultIndex])) {
                $assignments['document-next']        = $resultSet[$nextResultIndex];
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
        $this->createQuery();

        $escapedID = $this->query->getHelper()->escapeTerm($id);
        $this->query->setQuery('id:' . $escapedID);

        try {
            /** @var Result $selectResults */
            $selectResults = $this->getConnection()->execute($this->query);

            if ($selectResults->getNumFound() > 0) {
                $assignments['results']  = $selectResults;
                $assignments['document'] = $selectResults->getDocuments()[0];
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

    protected function queryComponentsForQueryParameters(array $queryParameters): array
    {
        $queryComponents = [];

        foreach ($this->settings['queryFields'] ?? [] as $fieldInfo) {
            $fieldID = $fieldInfo['id'] ?? null;

            if ($fieldID === null
                || !array_key_exists($fieldID, $queryParameters)
                || $queryParameters[$fieldID] === null
            ) {
                continue;
            }

            $queryComponent = $this->buildQueryComponent($fieldInfo, $queryParameters[$fieldID]);

            if ($queryComponent !== null) {
                $queryComponents[$fieldID] = $queryComponent;
            }
        }

        if ($queryComponents === []) {
            $queryComponents[] = $this->settings['defaultQuery'] ?? '*:*';
        }

        return $queryComponents;
    }

    /**
     * Builds a single Solr query component for one query field.
     *
     * The optional $queryAlternate value selects which format string to use
     * when the field defines multiple »queryAlternate« formats.
     */
    private function buildQueryComponent(array $fieldInfo, mixed $queryArguments): ?string
    {
        if (($fieldInfo['id'] ?? null) === null) {
            return null;
        }

        [$queryTerms, $queryAlternate] = $this->extractQueryTerms($fieldInfo, $queryArguments);
        $queryTerms = $this->applyDefaultValues($fieldInfo, $queryTerms);

        if ($queryTerms === []) {
            return null;
        }

        $queryTerms  = $this->escapeQueryTerms($fieldInfo, $queryTerms);
        $queryTerms  = $this->applyCustomEscaping($fieldInfo, $queryTerms);

        $queryFormat = $this->resolveQueryFormat($fieldInfo, $queryAlternate);
        $prefix      = $this->getMagicFieldPrefix();
        $queryPart   = $prefix . vsprintf($queryFormat, $queryTerms);

        return ($queryPart !== '' && $queryPart !== '0') ? $queryPart : null;
    }

    /**
     * Extracts query terms and the optional alternate key from raw query arguments.
     *
     * Returns a two-element array: [string[] $terms, ?string $alternateKey].
     *
     * When query arguments are an associative array with an »alternate« key and
     * the field defines »queryAlternate«, the alternate key is returned so that
     * the correct query format string can be selected in resolveQueryFormat().
     */
    private function extractQueryTerms(array $fieldInfo, mixed $queryArguments): array
    {
        $queryTerms     = null;
        $queryAlternate = null;

        if (is_array($queryArguments)
            && array_key_exists('alternate', $queryArguments)
            && array_key_exists('queryAlternate', $fieldInfo)
        ) {
            $queryAlternate = (string)$queryArguments['alternate'];
            $queryTerms     = $queryArguments['term'] ?? null;
        } else {
            $queryTerms = $queryArguments;
        }

        if ($queryTerms !== null && !is_array($queryTerms)) {
            $queryTerms = [$queryTerms];
        }

        return [$queryTerms ?? [], $queryAlternate];
    }

    private function applyDefaultValues(array $fieldInfo, array $queryTerms): array
    {
        $defaults = $fieldInfo['default'] ?? null;

        if ($defaults !== null) {
            $defaults = is_array($defaults) ? $defaults : [$defaults];

            foreach ($defaults as $defaultKey => $default) {
                if (!array_key_exists($defaultKey, $queryTerms)) {
                    $queryTerms[$defaultKey] = $default;
                }
            }
        }

        return $queryTerms;
    }

    private function escapeQueryTerms(array $fieldInfo, array $queryTerms): array
    {
        if ((int)($fieldInfo['noescape'] ?? 0) !== 0) {
            return $queryTerms;
        }

        foreach (array_keys($queryTerms) as $key) {
            $queryTerms[$key] = empty($fieldInfo['phrase'])
                ? $this->query->getHelper()->escapeTerm($queryTerms[$key])
                : $this->query->getHelper()->escapePhrase($queryTerms[$key]);
        }

        return $queryTerms;
    }

    /**
     * Resolves the query format string for a field, taking the alternate key into account.
     *
     * When $alternateKey is provided and the field defines a matching »queryAlternate«
     * entry, that format is used. Otherwise the first alternate or the plain »query«
     * setting is used, falling back to »fieldId:%s«.
     */
    private function resolveQueryFormat(array $fieldInfo, ?string $alternateKey): string
    {
        $fieldID   = $fieldInfo['id'] ?? '';
        $fallback  = ($fieldInfo['query'] ?? null) ?? ($fieldID . ':%s');
        $alternates = $fieldInfo['queryAlternate'] ?? [];

        if (empty($alternates) || !is_array($alternates)) {
            return $fallback;
        }

        // Use the explicitly requested alternate if it exists.
        if ($alternateKey !== null && array_key_exists($alternateKey, $alternates)) {
            return (string)$alternates[$alternateKey];
        }

        // Fall back to the first defined alternate when no key was given.
        $first = array_key_first($alternates);
        return $first !== null ? (string)$alternates[$first] : $fallback;
    }

    private function getMagicFieldPrefix(): string
    {
        $prefix        = '';
        $luceneVersion = (int)($this->settings['luceneMatchVersionNumber'] ?? 0);

        if ($luceneVersion < 8) {
            $prefix = '_query_:';
        }

        if (array_key_exists('features', $this->settings) && !empty($this->settings['features']['eDisMax'])) {
            $prefix .= '{!edismax}';
        }

        return $prefix;
    }

    private function applyCustomEscaping(array $fieldInfo, array $queryTerms): array
    {
        if ((int)($fieldInfo['noescape'] ?? 0) === 2) {
            $chars = explode(',', (string)($fieldInfo['escapechar'] ?? ''));

            foreach (array_keys($queryTerms) as $key) {
                foreach ($chars as $char) {
                    if ($char !== '') {
                        $queryTerms[$key] = str_replace($char, '\\' . $char, (string)$queryTerms[$key]);
                    }
                }
            }
        }

        ksort($queryTerms);
        return $queryTerms;
    }

    protected function setActiveFacetSelectionForID(
        array &$activeFacets,
        string $facetID,
        array $facetSelection
    ): void {
        $facetConfig  = $this->getFacetConfig($facetID);
        $facetQueries = [];

        foreach (array_keys($facetSelection) as $facetTerm) {
            $facetTerm              = (string)$facetTerm;
            $facetQueries[$facetTerm] = [
                'id'     => $facetID,
                'config' => $facetConfig,
                'term'   => $facetTerm,
                'query'  => $this->getFacetQuery($facetConfig, $facetTerm),
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

    protected function setFields(array $arguments): void
    {
        $fieldsConfig = SettingsUtility::getMergedSettings(
            'dataFields',
            $this->settings,
            $this->getAction() ?? 'index'
        );
        $fields = [];

        if (!empty($arguments['data-fields'])) {
            $fields = explode(',', (string)$arguments['data-fields']);
        } elseif (!empty($fieldsConfig['default'])) {
            $fields = array_values($fieldsConfig['default']);
        }

        if (!empty($fieldsConfig['allow']) && is_array($fieldsConfig['allow'])) {
            $fields = array_intersect($fields, $fieldsConfig['allow']);
        }

        if (!empty($fieldsConfig['disallow']) && is_array($fieldsConfig['disallow'])) {
            $fields = array_diff($fields, $fieldsConfig['disallow']);
        }

        if ($fields !== []) {
            $this->query->setFields($fields);
        }
    }

    protected function setRange(array $arguments): void
    {
        $offset = $this->getOffset($arguments);
        $count  = $this->getCount($arguments);

        // Store computed paging values so templates can read them.
        $this->setConfigurationValue('offset', $offset);
        $this->setConfigurationValue('count', $count);

        $this->query->setStart($offset);
        $this->query->setRows($count);
    }

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

    protected function tagForFacet(string $facetID): string
    {
        return 'facet-' . $facetID;
    }

    private function addDefaultQueryOperator(): void
    {
        if (!empty($this->settings['defaultQueryOperator'])) {
            $this->query->setQueryDefaultOperator($this->settings['defaultQueryOperator']);
        }
    }

    /**
     * Builds a stable, order-independent cache key from a query-arguments array.
     *
     * Uses JSON rather than serialize() to avoid differences caused by object
     * identity or internal PHP serialization quirks.
     */
    private function buildCacheKey(array $arguments): string
    {
        array_walk_recursive($arguments, static function (mixed &$v): void {
            $v = (string)$v;
        });

        ksort($arguments);
        return md5((string)json_encode($arguments));
    }

    /**
     * Pings Solr once to verify the connection is reachable.
     */
    private function verifyConnection(): void
    {
        try {
            $ping = $this->connection->createPing();
            $this->connection->ping($ping);
            $this->connectionVerified = true;
        } catch (HttpException $httpException) {
            $this->logger->warning(
                'Solr connection test failed. Search functionality will be unavailable.',
                ['exception' => LoggerUtility::exceptionToArray($httpException)]
            );
        }
    }

    public function search(mixed $query): array
    {
        if (!is_array($query)) {
            throw new \InvalidArgumentException(
                sprintf('%s::search() expects an array of query arguments.', self::class),
                1_700_000_003
            );
        }

        $this->setRequestArguments($query);
        return $this->getDefaultQuery();
    }
}

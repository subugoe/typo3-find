<?php

declare(strict_types=1);

namespace Subugoe\Find\Service;

use Psr\Log\LoggerInterface;
use Subugoe\Find\Utility\LoggerUtility;
use Subugoe\Find\Utility\SettingsUtility;
use TYPO3\CMS\Extbase\Utility\LocalizationUtility;

/* * *************************************************************
 *  Copyright notice
 *
 *  (c) 2025
 *      Contributors
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

/**
 * OpenSearch/Elasticsearch service provider adapter for TYPO3 Find.
 *
 * Implements ServiceProviderInterface to provide search functionality using
 * OpenSearch or Elasticsearch as the backend instead of Solr.
 */
class OpenSearchServiceProvider implements ServiceProviderInterface
{
    protected ?string $action = null;

    protected array $configuration = [];

    protected ?string $controllerExtensionKey = null;

    protected array $requestArguments = [];

    protected string $connectionName = '';

    private array $settings = [];

    private ?\Elasticsearch\Client $client = null;

    public function __construct(
        private readonly LoggerInterface $logger
    ) {}

    public function setConnectionName(string $name): void
    {
        if ($name === '') {
            throw new \InvalidArgumentException('Connection name must not be empty.', 1_700_000_007);
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

    public function connect(): void
    {
        if ($this->connectionName === '') {
            throw new \RuntimeException(
                'Connection name must be set via setConnectionName() before calling connect().',
                1_700_000_008
            );
        }

        $connectionConfig = $this->settings['connections'][$this->connectionName]['options'] ?? [];

        if ($connectionConfig === []) {
            throw new \RuntimeException(
                sprintf('No connection settings found for connection "%s".', $this->connectionName),
                1_700_000_009
            );
        }

        $hosts = [
            [
                'host' => $connectionConfig['host'] ?? 'localhost',
                'port' => (int)($connectionConfig['port'] ?? 9200),
                'scheme' => $connectionConfig['scheme'] ?? 'http',
                'path' => $connectionConfig['path'] ?? '',
            ],
        ];

        if (!empty($connectionConfig['username'])) {
            $hosts[0]['username'] = $connectionConfig['username'];
        }

        if (!empty($connectionConfig['password'])) {
            $hosts[0]['password'] = $connectionConfig['password'];
        }

        if (!empty($connectionConfig['api_key'])) {
            $hosts[0]['api_key'] = $connectionConfig['api_key'];
        }

        $clientBuilder = \Elasticsearch\ClientBuilder::create();
        $clientBuilder->setHosts($hosts);

        if (!empty($connectionConfig['timeout'])) {
            $clientBuilder->setConnectionParams([
                'timeout' => (int)$connectionConfig['timeout'],
            ]);
        }

        $this->client = $clientBuilder->build();

        try {
            $this->client->ping();
        } catch (\Exception $exception) {
            $this->logger->warning(
                'OpenSearch/Elasticsearch connection test failed. Search functionality may be unavailable.',
                ['exception' => LoggerUtility::exceptionToArray($exception)]
            );
        }
    }

    public function getConfiguration(): array
    {
        return $this->configuration;
    }

    public function getDefaultQuery(): array
    {
        $index = $this->settings['connections'][$this->connectionName]['options']['index'] ?? 'default';

        $searchParams = $this->buildSearchParams();

        $error = null;
        $resultSet = null;

        try {
            $response = $this->client->search($searchParams);
            $resultSet = $this->transformSearchResults($response);
        } catch (\Exception $exception) {
            $this->logger->error(
                'OpenSearch/Elasticsearch Exception',
                [
                    'requestArguments' => $this->getRequestArguments(),
                    'exception' => LoggerUtility::exceptionToArray($exception),
                ]
            );
            $error = ['opensearch' => $exception];
        }

        return [
            'results' => $resultSet,
            'error' => $error,
        ];
    }

    public function getDocumentById(string $id): array
    {
        $index = $this->settings['connections'][$this->connectionName]['options']['index'] ?? 'default';
        $assignments = [];

        try {
            $params = [
                'index' => $index,
                'id' => $id,
            ];

            $response = $this->client->get($params);

            if ($response['found'] ?? false) {
                $assignments['document'] = $response['_source'];
                $assignments['document']['id'] = $response['_id'];
                $assignments['results'] = [
                    'numFound' => 1,
                    'documents' => [$assignments['document']],
                ];
            }
        } catch (\Exception $exception) {
            $this->logger->error(
                'OpenSearch/Elasticsearch Exception',
                [
                    'id' => $id,
                    'exception' => LoggerUtility::exceptionToArray($exception),
                ]
            );
        }

        return $assignments;
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

    public function suggestQuery(array $settings): array
    {
        $results = [];

        if (empty($settings['q'])) {
            return $results;
        }

        $index = $this->settings['connections'][$this->connectionName]['options']['index'] ?? 'default';
        $suggestField = $this->settings['connections'][$this->connectionName]['options']['suggest_field'] ?? 'suggest';

        try {
            $params = [
                'index' => $index,
                'body' => [
                    'suggest' => [
                        'text' => $settings['q'],
                        'simple_phrase' => [
                            'phrase' => [
                                'field' => $suggestField,
                                'size' => 10,
                            ],
                        ],
                    ],
                ],
            ];

            if (!empty($settings['dictionary'])) {
                $params['body']['suggest']['simple_phrase']['phrase']['field'] = $settings['dictionary'];
            }

            $response = $this->client->search($params);

            foreach ($response['suggest']['simple_phrase'][0]['options'] ?? [] as $option) {
                $results[] = $option['text'];
            }
        } catch (\Exception $exception) {
            $this->logger->error(
                'OpenSearch/Elasticsearch suggest query failed',
                ['exception' => LoggerUtility::exceptionToArray($exception)]
            );
        }

        return $results;
    }

    public function search(mixed $query): array
    {
        if (!is_array($query)) {
            throw new \InvalidArgumentException(
                sprintf('%s::search() expects an array of query arguments.', self::class),
                1_700_000_010
            );
        }

        $this->setRequestArguments($query);
        return $this->getDefaultQuery();
    }

    protected function buildSearchParams(): array
    {
        $index = $this->settings['connections'][$this->connectionName]['options']['index'] ?? 'default';
        $arguments = $this->getRequestArguments();

        $params = [
            'index' => $index,
            'body' => [
                'query' => $this->buildQuery($arguments),
                'from' => $this->getOffset($arguments),
                'size' => $this->getCount($arguments),
            ],
        ];

        $this->addSort($params, $arguments);
        $this->addAggregations($params, $arguments);
        $this->addHighlighting($params, $arguments);

        $fieldsConfig = SettingsUtility::getMergedSettings('dataFields', $this->settings, $this->getAction() ?? 'index');

        if (!empty($fieldsConfig['default']) && is_array($fieldsConfig['default'])) {
            $fields = array_values($fieldsConfig['default']);
            if ($fields !== []) {
                $params['body']['_source'] = $fields;
            }
        }

        return $params;
    }

    protected function buildQuery(array $arguments): array
    {
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

        $mustClauses = [];
        $filterClauses = [];

        foreach ($this->settings['queryFields'] ?? [] as $fieldInfo) {
            $fieldID = $fieldInfo['id'] ?? null;

            if ($fieldID === null
                || !array_key_exists($fieldID, $queryParameters)
                || $queryParameters[$fieldID] === null
            ) {
                continue;
            }

            $queryClause = $this->buildQueryClause($fieldInfo, $queryParameters[$fieldID]);

            if ($queryClause !== null) {
                $mustClauses[] = $queryClause;
            }
        }

        $this->addFacetFilters($filterClauses, $arguments);

        if ($mustClauses === []) {
            $mustClauses[] = ['match_all' => new \stdClass()];
        }

        $query = [
            'bool' => [
                'must' => $mustClauses,
            ],
        ];

        if ($filterClauses !== []) {
            $query['bool']['filter'] = $filterClauses;
        }

        return $query;
    }

    protected function buildQueryClause(array $fieldInfo, mixed $queryArguments): ?array
    {
        $fieldID = $fieldInfo['id'] ?? '';
        $queryField = $fieldInfo['query'] ?? $fieldID;

        if (!is_array($queryArguments)) {
            $queryArguments = [$queryArguments];
        }

        $queryTerms = array_filter($queryArguments, fn($v): bool => $v !== '' && $v !== null);

        if ($queryTerms === []) {
            return null;
        }

        if (count($queryTerms) === 1) {
            return [
                'simple_query_string' => [
                    'query' => $this->escapeTerm(current($queryTerms)),
                    'fields' => [$queryField],
                    'default_operator' => $this->settings['defaultQueryOperator'] ?? 'OR',
                ],
            ];
        }

        $shouldClauses = [];
        foreach ($queryTerms as $term) {
            $shouldClauses[] = [
                'simple_query_string' => [
                    'query' => $this->escapeTerm($term),
                    'fields' => [$queryField],
                    'default_operator' => $this->settings['defaultQueryOperator'] ?? 'OR',
                ],
            ];
        }

        return ['bool' => ['should' => $shouldClauses, 'minimum_should_match' => 1]];
    }

    protected function addFacetFilters(array &$filterClauses, array $arguments): void
    {
        if (!array_key_exists('facet', $arguments) || !is_array($arguments['facet'])) {
            return;
        }

        foreach ($arguments['facet'] as $facetID => $facetSelection) {
            if (!is_array($facetSelection)) {
                continue;
            }

            $facetConfig = $this->getFacetConfig($facetID);

            if ($facetConfig === null) {
                continue;
            }

            $facetField = $facetConfig['field'] ?? $facetID;

            foreach (array_keys($facetSelection) as $facetTerm) {
                $filterClauses[] = [
                    'term' => [
                        $facetField => $facetTerm,
                    ],
                ];
            }
        }

        $activeFacets = $this->getActiveFacets($arguments);
        $this->setConfigurationValue('activeFacets', $activeFacets);
    }

    protected function addAggregations(array &$params, array $arguments): void
    {
        $facetConfiguration = $this->settings['facets'] ?? [];

        if (!is_array($facetConfiguration) || $facetConfiguration === []) {
            return;
        }

        $facetDefaults = $this->settings['facetDefaults'] ?? [];

        foreach ($facetConfiguration as $key => $facet) {
            if (!is_array($facet) || !array_key_exists('id', $facet)) {
                continue;
            }

            $facetID = $facet['id'];
            $facet = array_merge($facetDefaults, $facet);
            $facetField = $facet['field'] ?? $facetID;

            if (array_key_exists('facetQuery', $facet) && is_array($facet['facetQuery'])) {
                $filters = [];
                foreach ($facet['facetQuery'] as $facetQueryIndex => $facetQuery) {
                    if (isset($facetQuery['id'], $facetQuery['query'])) {
                        $filters[$facetQuery['id']] = [
                            'filter' => [
                                'query_string' => [
                                    'query' => $facetQuery['query'],
                                ],
                            ],
                        ];
                    }
                }

                if ($filters !== []) {
                    $params['body']['aggs'][$facetID] = [
                        'filters' => ['filters' => $filters],
                    ];
                }
            } else {
                $params['body']['aggs'][$facetID] = [
                    'terms' => [
                        'field' => $facetField,
                        'size' => $facet['fetchMaximum'] ?? 100,
                        'order' => ($facet['sortOrder'] ?? 'count') === 'index' ? ['_key' => 'asc'] : ['_count' => 'desc'],
                    ],
                ];
            }
        }

        $this->setConfigurationValue('facets', $facetConfiguration);
    }

    protected function addSort(array &$params, array $arguments): void
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

        if ($sortString !== '') {
            $sortClauses = [];
            foreach (explode(',', (string)$sortString) as $sortCriterion) {
                $sortCriterion = trim($sortCriterion);
                if ($sortCriterion === '') {
                    continue;
                }

                $parts = explode(' ', $sortCriterion);
                if (count($parts) === 2) {
                    [$fieldName, $direction] = $parts;
                    $sortClauses[] = [$fieldName => strtolower($direction)];
                }
            }

            if ($sortClauses !== []) {
                $params['body']['sort'] = $sortClauses;
            }
        }

        $this->addSortOrdersToTemplate($arguments);
    }

    protected function addHighlighting(array &$params, array $arguments): void
    {
        $highlightConfig = SettingsUtility::getMergedSettings('highlight', $this->settings);

        if (!$highlightConfig
            || empty($highlightConfig['fields'])
            || !is_array($highlightConfig['fields'])
        ) {
            return;
        }

        $params['body']['highlight'] = [
            'fields' => [],
            'pre_tags' => ['\ueeee'],
            'post_tags' => ['\ueeef'],
        ];

        foreach ($highlightConfig['fields'] as $fieldName) {
            $fieldConfig = [];
            if (!empty($highlightConfig['fragsize'])) {
                $fieldConfig['fragment_size'] = (int)$highlightConfig['fragsize'];
            }

            if (!empty($highlightConfig['alternateFields'][$fieldName])) {
                $fieldConfig['number_of_fragments'] = 1;
                $fieldConfig['fragment_offset'] = 0;
            }

            $params['body']['highlight']['fields'][$fieldName] = $fieldConfig;
        }

        $this->setConfigurationValue('highlight', $highlightConfig);
    }

    protected function addSortOrdersToTemplate(array $arguments): void
    {
        $sortOptions = ['menu' => []];
        $sortSettings = $this->settings['sort'] ?? null;

        if (is_array($sortSettings)) {
            ksort($sortSettings);

            foreach ($sortSettings as $sortOptionIndex => $sortOption) {
                if (!isset($sortOption['id'], $sortOption['sortCriteria'])) {
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
                $sortOptions['selected'] = '_score desc';
            }
        }

        $this->setConfigurationValue('sortOptions', $sortOptions);
    }

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

    protected function setActiveFacetSelectionForID(
        array &$activeFacets,
        string $facetID,
        array $facetSelection
    ): void {
        $facetConfig = $this->getFacetConfig($facetID);
        $facetQueries = [];

        foreach (array_keys($facetSelection) as $facetTerm) {
            $facetTerm = (string)$facetTerm;
            $facetQueries[$facetTerm] = [
                'id' => $facetID,
                'config' => $facetConfig,
                'term' => $facetTerm,
                'query' => $facetConfig['field'] ?? $facetID . ':%s',
            ];
        }

        if ($facetQueries !== []) {
            $activeFacets[$facetID] = $facetQueries;
        }
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

    protected function transformSearchResults(array $response): array
    {
        $hits = $response['hits'] ?? [];
        $total = $hits['total']['value'] ?? 0;

        $documents = [];
        foreach ($hits['hits'] ?? [] as $hit) {
            $document = $hit['_source'];
            $document['id'] = $hit['_id'];
            $document['_score'] = $hit['_score'] ?? 0;

            if (!empty($hit['highlight'])) {
                $document['highlighting'] = $hit['highlight'];
            }

            $documents[] = $document;
        }

        $facets = [];
        foreach ($response['aggregations'] ?? [] as $facetID => $facetData) {
            if (isset($facetData['buckets'])) {
                $facets[$facetID] = [];
                foreach ($facetData['buckets'] as $bucket) {
                    $facets[$facetID][$bucket['key']] = $bucket['doc_count'];
                }
            } elseif (isset($facetData['buckets']['buckets'])) {
                $facets[$facetID] = [];
                foreach ($facetData['buckets']['buckets'] as $bucket) {
                    $key = $facetData['buckets']['name'] ?? $facetID;
                    $facets[$facetID][$bucket['key']] = $bucket['doc_count'];
                }
            }
        }

        $this->addResultCountOptionsToTemplate($this->getRequestArguments());
        $this->setConfigurationValue('offset', $this->getOffset($this->getRequestArguments()));
        $this->setConfigurationValue('count', $this->getCount($this->getRequestArguments()));
        $this->setConfigurationValue('facets', $facets);

        return [
            'numFound' => $total,
            'documents' => $documents,
        ];
    }

    protected function getAction(): ?string
    {
        return $this->action;
    }

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

    protected function getCount(?array $arguments = null): int
    {
        $arguments ??= $this->getRequestArguments();

        $default = (int)($this->settings['paging']['perPage'] ?? 10);
        $maxCount = max(1, (int)($this->settings['paging']['maximumPerPage'] ?? 100));
        $count = isset($arguments['count']) ? (int)$arguments['count'] : $default;

        return max(1, min($count, $maxCount));
    }

    protected function counterEnd(): int
    {
        return $this->getOffset() + $this->getCount();
    }

    protected function counterStart(): int
    {
        return $this->getOffset() + 1;
    }

    protected function escapeTerm(string $term): string
    {
        $specialChars = ['\\', '+', '-', '=', '&&', '||', '!', '(', ')', '{', '}', '[', ']', '^', '"', '~', '*', '?', ':', '/', ' '];

        foreach ($specialChars as $char) {
            $term = str_replace($char, '\\' . $char, $term);
        }

        return $term;
    }
}

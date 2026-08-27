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
 * Pagefind.app service provider adapter for TYPO3 Find.
 *
 * Implements ServiceProviderInterface to provide search functionality using
 * Pagefind (static site search) as the backend instead of Solr.
 *
 * Pagefind stores its index in JSON files on the filesystem, which this adapter
 * reads and processes to provide search results and facets.
 */
class PagefindServiceProvider implements ServiceProviderInterface
{
    protected ?string $action = null;

    protected array $configuration = [];

    protected ?string $controllerExtensionKey = null;

    protected array $requestArguments = [];

    protected string $connectionName = '';

    private array $settings = [];

    private ?array $pagefindIndex = null;

    public function __construct(
        private readonly LoggerInterface $logger
    ) {}

    public function setConnectionName(string $name): void
    {
        if ($name === '') {
            throw new \InvalidArgumentException('Connection name must not be empty.', 1_700_000_011);
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
                1_700_000_012
            );
        }

        $connectionConfig = $this->settings['connections'][$this->connectionName]['options'] ?? [];

        if ($connectionConfig === []) {
            throw new \RuntimeException(
                sprintf('No connection settings found for connection "%s".', $this->connectionName),
                1_700_000_013
            );
        }

        $indexPath = $connectionConfig['indexPath'] ?? '';

        if ($indexPath === '' || !file_exists($indexPath)) {
            $this->logger->warning(
                'Pagefind index path does not exist. Search functionality will be unavailable.',
                ['indexPath' => $indexPath]
            );
            return;
        }

        $this->pagefindIndex = $this->loadPagefindIndex($indexPath);
    }

    public function getConfiguration(): array
    {
        return $this->configuration;
    }

    public function getDefaultQuery(): array
    {
        $index = $this->pagefindIndex;

        if ($index === null) {
            return [
                'results' => ['numFound' => 0, 'documents' => []],
                'error' => ['pagefind' => 'Index not loaded'],
            ];
        }

        $searchParams = $this->buildSearchParams();

        $error = null;
        $resultSet = null;

        try {
            $response = $this->searchPagefind($searchParams);
            $resultSet = $this->transformSearchResults($response);
        } catch (\Exception $exception) {
            $this->logger->error(
                'Pagefind Exception',
                [
                    'requestArguments' => $this->getRequestArguments(),
                    'exception' => LoggerUtility::exceptionToArray($exception),
                ]
            );
            $error = ['pagefind' => $exception];
        }

        return [
            'results' => $resultSet,
            'error' => $error,
        ];
    }

    public function getDocumentById(string $id): array
    {
        $assignments = [];

        if ($this->pagefindIndex === null) {
            $assignments['document'] = null;
            return $assignments;
        }

        try {
            $document = $this->findDocumentById($id);

            if ($document !== null) {
                $assignments['document'] = $document;
                $assignments['results'] = [
                    'numFound' => 1,
                    'documents' => [$document],
                ];
            }
        } catch (\Exception $exception) {
            $this->logger->error(
                'Pagefind getDocumentById Exception',
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

        if ($this->pagefindIndex === null || empty($settings['q'])) {
            return $results;
        }

        try {
            $query = strtolower(trim((string)$settings['q']));
            $suggestions = [];

            foreach ($this->pagefindIndex['documents'] ?? [] as $document) {
                $content = strtolower((string)($document['content'] ?? ' ' . $document['title'] ?? ''));

                if (str_contains($content, $query)) {
                    $titleWords = explode(' ', $document['title'] ?? '');
                    foreach ($titleWords as $word) {
                        if (str_starts_with(strtolower($word), $query) && !in_array($word, $suggestions, true)) {
                            $suggestions[] = $word;
                        }
                    }
                }
            }

            $results = array_slice($suggestions, 0, 10);
        } catch (\Exception $exception) {
            $this->logger->error(
                'Pagefind suggest query failed',
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
                1_700_000_014
            );
        }

        $this->setRequestArguments($query);
        return $this->getDefaultQuery();
    }

    protected function loadPagefindIndex(string $indexPath): ?array
    {
        try {
            $indexFile = $indexPath . '/pagefind_index.json';

            if (!file_exists($indexFile)) {
                $this->logger->warning(
                    'Pagefind index file not found',
                    ['indexFile' => $indexFile]
                );
                return null;
            }

            $indexContent = file_get_contents($indexFile);
            $indexData = json_decode($indexContent, true, 512, JSON_THROW_ON_ERROR);

            return $indexData;
        } catch (\Exception $exception) {
            $this->logger->error(
                'Failed to load Pagefind index',
                ['exception' => LoggerUtility::exceptionToArray($exception)]
            );
            return null;
        }
    }

    protected function buildSearchParams(): array
    {
        $arguments = $this->getRequestArguments();

        $params = [
            'query' => $this->buildQuery($arguments),
            'filters' => $this->buildFilters($arguments),
            'sort' => $this->getSortOrder($arguments),
            'offset' => $this->getOffset($arguments),
            'limit' => $this->getCount($arguments),
        ];

        $fieldsConfig = SettingsUtility::getMergedSettings('dataFields', $this->settings, $this->getAction() ?? 'index');
        if (!empty($fieldsConfig['default']) && is_array($fieldsConfig['default'])) {
            $params['fields'] = $fieldsConfig['default'];
        }

        return $params;
    }

    protected function buildQuery(array $arguments): string
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

        $queryTerms = [];
        $defaultQuery = $this->settings['defaultQuery'] ?? '*';

        foreach ($this->settings['queryFields'] ?? [] as $fieldInfo) {
            $fieldID = $fieldInfo['id'] ?? null;

            if ($fieldID === null
                || !array_key_exists($fieldID, $queryParameters)
                || $queryParameters[$fieldID] === null
            ) {
                continue;
            }

            $value = $queryParameters[$fieldID];

            if (is_array($value)) {
                $value = implode(' ', array_filter($value));
            }

            if ($value !== '') {
                $queryTerms[] = trim((string)$value);
            }
        }

        $queryString = $queryTerms === [] ? $defaultQuery : implode(' ', $queryTerms);

        $this->setConfigurationValue('query', $queryParameters);
        $this->setConfigurationValue('queryString', $queryString);

        return $queryString;
    }

    protected function buildFilters(array $arguments): array
    {
        $filters = [];

        if (!array_key_exists('facet', $arguments) || !is_array($arguments['facet'])) {
            return $filters;
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
            $filters[$facetField] = array_keys($facetSelection);
        }

        $activeFacets = $this->getActiveFacets($arguments);
        $this->setConfigurationValue('activeFacets', $activeFacets);

        return $filters;
    }

    protected function getSortOrder(array $arguments): array
    {
        $sortConfig = '';

        if (!empty($arguments['sort'])) {
            $sortConfig = (string)$arguments['sort'];
        } elseif (!empty($this->settings['sort']) && is_array($this->settings['sort'])) {
            foreach ($this->settings['sort'] as $sortSetting) {
                if (($sortSetting['id'] ?? '') === 'default' && isset($sortSetting['sortCriteria'])) {
                    $sortConfig = $sortSetting['sortCriteria'];
                    break;
                }
            }
        }

        $sortOrder = [];
        if ($sortConfig !== '') {
            $parts = explode(',', (string)$sortConfig);
            foreach ($parts as $part) {
                $part = trim($part);
                if ($part === '') {
                    continue;
                }

                $components = explode(' ', $part);
                $field = $components[0] ?? 'title';
                $direction = isset($components[1]) && strtolower($components[1]) === 'desc' ? 'desc' : 'asc';
                $sortOrder[] = ['field' => $field, 'direction' => $direction];
            }
        }

        $this->addSortOrdersToTemplate($arguments);

        return $sortOrder;
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
                $sortOptions['selected'] = 'title asc';
            }
        }

        $this->setConfigurationValue('sortOptions', $sortOptions);
    }

    protected function searchPagefind(array $params): array
    {
        if ($this->pagefindIndex === null) {
            return ['total' => 0, 'results' => [], 'facets' => []];
        }

        $queryString = strtolower(trim((string)$params['query']));
        $filters = $params['filters'] ?? [];
        $sortOrder = $params['sort'] ?? [];
        $offset = $params['offset'] ?? 0;
        $limit = $params['limit'] ?? 10;

        $documents = $this->pagefindIndex['documents'] ?? [];
        $results = [];
        $facets = [];

        foreach ($documents as $index => $document) {
            $documentMatchesQuery = true;

            if ($queryString !== '*' && $queryString !== '') {
                $content = strtolower((string)($document['content'] ?? ' ' . $document['title'] ?? ''));
                $queryWords = explode(' ', $queryString);

                $wordMatches = 0;
                foreach ($queryWords as $word) {
                    if (trim($word) !== '' && str_contains($content, trim($word))) {
                        $wordMatches++;
                    }
                }

                $documentMatchesQuery = $wordMatches > 0;
            }

            $documentMatchesFilters = true;
            foreach ($filters as $field => $values) {
                $docFieldValue = strtolower((string)($document[$field] ?? ''));
                $matchesFilter = false;

                foreach ($values as $value) {
                    if (str_contains($docFieldValue, strtolower((string)$value))) {
                        $matchesFilter = true;
                        break;
                    }
                }

                if (!$matchesFilter) {
                    $documentMatchesFilters = false;
                    break;
                }
            }

            if ($documentMatchesQuery && $documentMatchesFilters) {
                $result = $document;
                $result['score'] = $this->calculateRelevanceScore($document, $queryString);
                $results[] = $result;

                $this->addToFacets($facets, $document);
            }
        }

        $results = $this->sortResults($results, $sortOrder);
        $total = count($results);
        $results = array_slice($results, $offset, $limit);

        $facets = $this->processFacets($facets, $params);

        return [
            'total' => $total,
            'results' => $results,
            'facets' => $facets,
        ];
    }

    protected function calculateRelevanceScore(array $document, string $query): float
    {
        if ($query === '' || $query === '*') {
            return 0.5;
        }

        $content = strtolower((string)($document['content'] ?? ' ' . $document['title'] ?? ''));
        $queryWords = array_filter(explode(' ', $query));
        $score = 0;

        foreach ($queryWords as $word) {
            $word = trim($word);
            if ($word === '') {
                continue;
            }

            if (str_contains(strtolower((string)($document['title'] ?? '')), $word)) {
                $score += 1.0;
            } elseif (str_contains($content, $word)) {
                $score += 0.5;
            }

            $occurrences = substr_count($content, $word);
            $score += min($occurrences * 0.1, 2.0);
        }

        return min($score, 10.0);
    }

    protected function sortResults(array $results, array $sortOrder): array
    {
        if ($sortOrder === []) {
            usort($results, fn(array $a, array $b): int => ($b['score'] ?? 0) <=> ($a['score'] ?? 0));
            return $results;
        }

        foreach (array_reverse($sortOrder) as $sort) {
            $field = $sort['field'] ?? 'title';
            $direction = $sort['direction'] ?? 'asc';
            $isAscending = strtolower($direction) === 'asc';

            usort($results, function (array $a, array $b) use ($field, $isAscending): int {
                $aValue = (string)($a[$field] ?? '');
                $bValue = (string)($b[$field] ?? '');

                $comparison = strnatcasecmp($aValue, $bValue);
                return $isAscending ? $comparison : -$comparison;
            });
        }

        return $results;
    }

    protected function addToFacets(array &$facets, array $document): void
    {
        foreach ($this->settings['facets'] ?? [] as $facetConfig) {
            $facetID = $facetConfig['id'] ?? null;
            $facetField = $facetConfig['field'] ?? $facetID;

            if ($facetID === null || $facetField === null) {
                continue;
            }

            $value = $document[$facetField] ?? null;
            if ($value === null || $value === '') {
                continue;
            }

            if (!isset($facets[$facetID])) {
                $facets[$facetID] = [];
            }

            $valueKey = (string)$value;
            if (!isset($facets[$facetID][$valueKey])) {
                $facets[$facetID][$valueKey] = 0;
            }

            $facets[$facetID][$valueKey]++;
        }
    }

    protected function processFacets(array $facets, array $params): array
    {
        $processedFacets = [];

        foreach ($this->settings['facets'] ?? [] as $facetConfig) {
            $facetID = $facetConfig['id'] ?? null;
            if ($facetID === null || !isset($facets[$facetID])) {
                continue;
            }

            $facetData = $facets[$facetID];
            $fetchMaximum = $facetConfig['fetchMaximum'] ?? 100;
            $sortOrder = $facetConfig['sortOrder'] ?? 'count';

            if ($sortOrder === 'index') {
                ksort($facetData);
            } else {
                arsort($facetData);
            }

            $processedFacets[$facetID] = array_slice($facetData, 0, $fetchMaximum, true);
        }

        $this->setConfigurationValue('facets', $processedFacets);
        $this->addResultCountOptionsToTemplate($params);

        return $processedFacets;
    }

    protected function transformSearchResults(array $response): array
    {
        $total = $response['total'] ?? 0;
        $results = $response['results'] ?? [];
        $facets = $response['facets'] ?? [];

        $documents = [];
        foreach ($results as $result) {
            $document = $result;
            $document['id'] ??= md5((string)($document['url'] ?? ''));
            $document['score'] = $result['score'] ?? 0;

            $highlightConfig = SettingsUtility::getMergedSettings('highlight', $this->settings);
            if ($highlightConfig && !empty($highlightConfig['fields'])) {
                $document = $this->addHighlighting($document, $highlightConfig);
            }

            $documents[] = $document;
        }

        $this->setConfigurationValue('offset', $this->getOffset($this->getRequestArguments()));
        $this->setConfigurationValue('count', $this->getCount($this->getRequestArguments()));
        $this->setConfigurationValue('facets', $facets);

        return [
            'numFound' => $total,
            'documents' => $documents,
        ];
    }

    protected function addHighlighting(array $document, array $highlightConfig): array
    {
        $queryWords = [];
        $queryString = $this->getRequestArguments()['q']['default'] ?? '';
        if ($queryString !== '') {
            $queryWords = array_filter(explode(' ', (string)$queryString));
        }

        foreach ($highlightConfig['fields'] as $fieldName) {
            if (!isset($document[$fieldName])) {
                continue;
            }

            $text = $document[$fieldName];
            $highlightedText = $text;

            foreach ($queryWords as $word) {
                $word = trim(strtolower($word));
                if ($word === '') {
                    continue;
                }

                $highlightedText = preg_replace(
                    '/(' . preg_quote($word, '/') . ')/iu',
                    '\ueeee$1\ueeef',
                    (string)$highlightedText
                );
            }

            $document[$fieldName . '_highlighted'] = $highlightedText;
        }

        $this->setConfigurationValue('highlight', $highlightConfig);

        return $document;
    }

    protected function addResultCountOptionsToTemplate(array $params): void
    {
        $resultCountOptions = ['menu' => []];
        $pagingMenu = $this->settings['paging']['menu'] ?? null;

        if (is_array($pagingMenu)) {
            ksort($pagingMenu);

            foreach ($pagingMenu as $resultCount) {
                $resultCountOptions['menu'][$resultCount] = $resultCount;
            }

            $resultCountOptions['default'] = $this->settings['paging']['perPage'] ?? 10;
            $resultCountOptions['selected'] = $params['limit'] ?? $resultCountOptions['default'];
        }

        $this->setConfigurationValue('resultCountOptions', $resultCountOptions);
    }

    protected function findDocumentById(string $id): ?array
    {
        foreach ($this->pagefindIndex['documents'] ?? [] as $document) {
            $docId = $document['id'] ?? md5((string)($document['url'] ?? ''));
            if ($docId === $id) {
                return $document;
            }
        }

        return null;
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
                'query' => ($facetConfig['field'] ?? $facetID) . ':%s',
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
}

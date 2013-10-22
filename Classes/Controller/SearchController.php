<?php

/* * *************************************************************
 *  Copyright notice
 *
 *  (c) 2013
 *      Ingo Pfennigstorf <pfennigstorf@sub-goettingen.de>
 *      Sven-S. Porst <porst@sub.uni-goettingen.de>
 *      Göttingen State and University Library
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

namespace Subugoe\Find\Controller;



require_once(\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::extPath('find') . 'vendor/autoload.php');

/**
 * Description
 */
class SearchController extends \TYPO3\CMS\Extbase\Mvc\Controller\ActionController {

	/**
	 * @var \Solarium\Client
	 */
	protected $solr;


	/**
	 * @var array
	 */
	protected $requestArguments;


	/**
	 * Array to collect the configuration information that will be added as a template variable.
	 * @var array
	 */
	protected $configuration = array();


	/**
	 * Initialisation and setup.
	 */
	public function initializeAction() {
		$configuration = array(
			'endpoint' => array(
				'localhost' => array(
					'host' => $this->settings['connection']['host'],
					'port' => intval($this->settings['connection']['port']),
					'path' => $this->settings['connection']['path'],
					'timeout' => $this->settings['connection']['timeout']
				)
			)
		);

		$this->solr = new \Solarium\Client($configuration);

		$this->requestArguments = $this->request->getArguments();
        $this->cleanArgumentsArray($this->requestArguments);
		ksort($this->settings['queryFields']);
	}

	
	/**
	 * Index Action.
	 */
	public function indexAction() {
		if (array_key_exists('id', $this->requestArguments)) {
			$this->forward('detail');
		}
		else {
			$query = $this->createQueryForArguments($this->requestArguments);

			// Run the query.
			try {
				$resultSet = $this->solr->select($query);
			}
			catch (\Solarium\Exception\HttpException $exception) {
				$message = 'find: Solr Exception (Timeout?)';
				$this->logError($message, \TYPO3\CMS\Core\Messaging\FlashMessage::ERROR, array('requestArguments' => $this->requestArguments, 'exception' => $this->exceptionToArray($exception)), FALSE);
				$this->view->assign('error', array('solr' => $exception));
			}

			$this->view->assignMultiple(array(
				'results' => $resultSet,
			));
			
			$this->configuration['counterStart'] = $this->counterStart();
			$this->configuration['counterEnd'] = $this->counterEnd();

			$this->addQueryInformationAsJavaScript($this->requestArguments['q']);
			$this->addStandardAssignments();
		}
	}



	/**
	 * Suggest/Autocomplete action.
	 */
	public function suggestAction() {
		$query = $this->solr->createSuggester();
		$results = array();
		if (array_key_exists('q', $this->requestArguments)) {
			$query->setQuery($this->requestArguments['q']);
			if ($this->requestArguments['dictionary']) {
				$query->setDictionary($this->requestArguments['dictionary']);
			}

			$this->addFacetFilters($query, $this->requestArguments);
			$solrResults = $this->solr->suggester($query)->getResults();
			foreach ($solrResults as $suggestions)  {
				$results = array_merge($results, $suggestions->getSuggestions());
			}
		}
		else {
			// TODO: Error message in JSON?
		}

		$this->view->assign('suggestions', $results);
	}


	/**
	 * Single Item View action.
	 */
	public function detailAction() {
		$arguments = $this->requestArguments;
		if (array_key_exists('id', $arguments) && !empty($arguments['id'])) {
			$id = $arguments['id'];
			$assignments = array();
			if ($this->settings['paging']['detailPagePaging'] && array_key_exists('underlyingQuery', $arguments)) {
				// If underlying query has been sent, fetch more data to enable paging arrows.
				$underlyingQueryInfo = $arguments['underlyingQuery'];

				// These indexes are 0-based for Solr & PHP. The user visible numbering is 1-based.
				$positionIndex = $underlyingQueryInfo['position'] - 1;
				$previousIndex = max(array($positionIndex - 1, 0));
				$nextIndex = $positionIndex + 1;
				$resultIndexOffset = ($positionIndex === 0) ? 0 : 1;

				foreach ($arguments['underlyingQuery'] as $key => $value) {
					$arguments[$key] = $value;
				}

				$this->addQueryInformationAsJavaScript($underlyingQueryInfo['q'], (int)$underlyingQueryInfo['position'], $arguments);

				$query = $this->createQueryForArguments($arguments);
				$query->setStart($previousIndex);
				$query->setRows($nextIndex - $previousIndex + 1);

				try {
					$selectResults = $this->solr->select($query);
					if (count($selectResults) > 0) {
						$assignments['results'] = $selectResults;
						$resultSet = $selectResults->getDocuments();

						// the actual result is at position 0 (for the first document) or 1 (otherwise).
						$document = $resultSet[$resultIndexOffset];
						if ($document['id'] === $id) {
							$assignments['document'] = $document;
							if ($resultIndexOffset !== 0) {
								$assignments['document-previous'] = $resultSet[0];
								$assignments['document-previous-number'] = $previousIndex + 1;
							}
							$nextResultIndex = 1 + $resultIndexOffset;
							if (count($resultSet) > $nextResultIndex) {
								$assignments['document-next'] = $resultSet[$nextResultIndex];
								$assignments['document-next-number'] = $nextIndex + 1;
							}
						}
						else {
							$message = 'find: »detail« action query with underlying query could not retrieve record id »' . $id . '«.';
							$this->logError($message, \TYPO3\CMS\Core\Messaging\FlashMessage::ERROR, array('arguments' => $arguments));
							$this->forward('index');
						}
					}
					else {
						$message = 'find: »detail« action query with underlying query returned no results.';
						$this->logError($message, \TYPO3\CMS\Core\Messaging\FlashMessage::ERROR, array('arguments' => $arguments));
						$this->forward('index');
					}
				}
				catch (\Solarium\Exception\HttpException $exception) {
					$message = 'find: Solr Exception (Timeout?)';
					$this->logError($message, \TYPO3\CMS\Core\Messaging\FlashMessage::ERROR, array('arguments' => $arguments, 'exception' => $this->exceptionToArray($exception)), FALSE);
					$this->view->assign('error', array('solr' => $exception));
				}
			}
			else {
				// Without underlying query information, just get the record specified.
				$query = $this->createQuery();
				$escapedID = $query->getHelper()->escapeTerm($id);
				$query->setQuery('id:' . $escapedID);
				try {
					$selectResults = $this->solr->select($query);
					if (count($selectResults) > 0) {
						$assignments['results'] = $selectResults;
						$resultSet = $selectResults->getDocuments();
						$assignments['document'] = $resultSet[0];
					}
					else {
						$message = 'find: »detail« action query for id »' . $id . '« returned no results.';
						$this->logError($message, \TYPO3\CMS\Core\Messaging\FlashMessage::ERROR, array('arguments' => $arguments));
						$this->forward('index');
					}
				}
				catch (\Solarium\Exception\HttpException $exception) {
					$message = 'find: Solr Exception (Timeout?)';
					$this->logError($message, \TYPO3\CMS\Core\Messaging\FlashMessage::ERROR, array('arguments' => $arguments, 'exception' => $this->exceptionToArray($exception)));
					$this->view->assign('error', array('solr' => $exception));
				}
			}

			$this->view->assignMultiple($assignments);
			$this->addStandardAssignments();
		}
		else {
			// id argument missing or empty
			$message = 'find: Non-empty argument »id« is required for action »detail«.';
			$this->logError($message, \TYPO3\CMS\Core\Messaging\FlashMessage::ERROR, array('arguments' => $arguments));
			$this->forward('index');
		}
	}


	/**
	 * Assigns standard variables to the view.
	 */
	private function addStandardAssignments () {
		$this->view->assign('arguments', $this->requestArguments);
		
		$this->configuration['extendedSearch'] = $this->isExtendedSearch();
	
		$contentObject = $this->configurationManager->getContentObject();
		$uid = $contentObject->data['uid'];
		$this->configuration['uid'] = $uid;

		$this->configuration['prefixID'] = 'tx_find_find';

		$this->configuration['pageTitle'] = $GLOBALS['TSFE']->page['title'];

		// ksort($this->configuration);
		$this->view->assign('config', $this->configuration);
	}


	/**
	 * Returns whether extended search should be used or not.
	 * 
	 * @return Boolean
	 */
	private function isExtendedSearch () {
		$result = FALSE;

		if (array_key_exists('extended', $this->requestArguments)) {
			// Show extended search when told so by the »extended« argument.
			$result = ($this->requestArguments['extended'] == TRUE);
		}
		else {
			// Show extended search when any of the »extended« fields are used.
			if (array_key_exists('q', $this->requestArguments)) {
				foreach ($this->settings['queryFields'] as $fieldInfo) {
					if ($fieldInfo['extended']
							&& array_key_exists($fieldInfo['id'], $this->requestArguments['q'])
							&& $this->requestArguments['q'][$fieldInfo['id']]) {
						$result = TRUE;
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
	 * @return array
	 */
	private function queryComponentsForQueryParameters ($query, $queryParameters) {
		$queryComponents = array();

		$queryFields = $this->settings['queryFields'];
		foreach ($queryFields as $fieldInfo) {
			$fieldID = $fieldInfo['id'];
			if ($fieldID && $queryParameters[$fieldID]) {
				// Extract array of query terms from the different structures:
				// a) just a single string (e.g. text field)
				// b) array of strings (e.g. date range field)
				// c) single field with additional configuration (e.g. text field with alternate query)
				$queryArguments = $queryParameters[$fieldID];
				$queryAlternate = NULL;
				if (is_array($queryArguments) && array_key_exists('alternate', $queryArguments) && array_key_exists('queryAlternate', $fieldInfo)) {
					$queryAlternate = $queryArguments['alternate'];
					if (array_key_exists('term', $queryArguments)) {
						$queryTerms = $queryArguments['term'];
					}
				}
				else {
					$queryTerms = $queryArguments;
				}

				if (!is_array($queryTerms)) {
					$queryTerms = Array($queryTerms);
				}

				// Fill in pre-configured default values if they exist and the field is empty.
				$defaults = $fieldInfo['default'];
				if ($defaults) {
					if (!is_array($defaults)) {
						$defaults = array($defaults);
					}
					foreach($defaults as $defaultKey => $default) {
						if (!array_key_exists($defaultKey, $queryTerms)) {
							$queryTerms[$defaultKey] = $default;
						}
					}
				}

				// Escape all arguments unless told not to do so.
				if (!$fieldInfo['noescape']) {
					$escapedQueryTerms = array();
					foreach($queryTerms as $key => $term) {
						if ($fieldInfo['phrase']) {
							$escapedQueryTerms[$key] = $query->getHelper()->escapePhrase($term);
						}
						else {
							$escapedQueryTerms[$key] = $query->getHelper()->escapeTerm($term);
						}
					}
					$queryTerms = $escapedQueryTerms;
				}

				// Get the query format and insert the query term.
				if (!$queryAlternate) {
					$queryFormat = $fieldInfo['query'];
				}
				else if (array_key_exists($queryAlternate, $fieldInfo['queryAlternate'])) {
					$queryFormat = $fieldInfo['queryAlternate'][$queryAlternate];
				}
				if (!$queryFormat) {
					$queryFormat = $fieldID . ':%s';
				}

				ksort($queryTerms);
				$queryPart = '_query_:' . $query->getHelper()->escapePhrase(vsprintf($queryFormat, $queryTerms));
				if ($queryPart) {
					$queryComponents[$fieldID] = $queryPart;
				}
			}
		}

		// Ask for all results if there is no query.
		if (count($queryComponents) === 0) {
			$queryComponents[] = $this->settings['defaultQuery'];
		}

		return $queryComponents;
	}


	/**
	 * Creates a blank query, sets up TypoScript filters and adds it to the view.
	 *
	 * @return \Solarium\QueryType\Select\Query\Query
	 */
	private function createQuery () {
		$query = $this->solr->createSelect();
		$this->addTypoScriptFilters($query);

		$this->configuration['solarium'] = $query;

		return $query;
	}



	/**
	 * Creates a query configured with all parameters set in the request’s arguments.
	 *
	 * @param array $arguments request arguments
	 * @return \Solarium\QueryType\Select\Query\Query
	 */
	private function createQueryForArguments ($arguments) {
		$query = $this->createQuery($arguments);

		// Build query string.
		$queryParameters = array();
		if (array_key_exists('q', $arguments)) {
			$queryParameters = $arguments['q'];
		}
		$queryComponents = $this->queryComponentsForQueryParameters($query, $queryParameters);
		$queryString = implode(' ' . $query::QUERY_OPERATOR_AND . ' ', $queryComponents);
		$query->setQuery($queryString);

		$this->configuration['query'] = $queryParameters;
		$this->configuration['queryString'] = $queryString;

		$this->setFields($query, $arguments);
		$this->setRange($query, $arguments);
		$this->setSortOrder($query, $arguments);

		$this->addHighlighting($query, $arguments);
		$this->addFacetFilters($query, $arguments);
		$this->addFacetQueries($query);

		return $query;
	}

	

	/**
	 * Adds filter queries for active facets to $query.
	 *
	 * @param \Solarium\QueryType\Select\Query\Query $query
	 * @param array $arguments request arguments
	 */
	private function addFacetFilters ($query, $arguments) {
		$activeFacets = $this->getActiveFacets($arguments);
		$activeFacetsForTemplate = array();
		foreach ($activeFacets as $facetID => $facets) {
			foreach ($facets as $facetTerm => $facetInfo) {
				$facetQuery = $this->getFacetQuery($this->getFacetConfig($facetID), $facetTerm);
				if ($facetInfo['config']['queryStyle'] === 'and') {
					// TODO: Do we really use this part of the condition? Can it be removed?
					// Alternative query style: adding a conjunction to the main query.
					// Can be useful when using {!join} to filter on the underlying
					// records instead of the joined ones.
					$queryString = $query->getQuery();
					if ($queryString) {
						$queryString = $queryString . ' ' . $query::QUERY_OPERATOR_AND . ' ';
					}
					$queryString .= $facetQuery;
					$query->setQuery($queryString);
				}
				else {
					// Add a filter query by default.

					// Add tag/key when configured to excludeOwnFilter for this facet.
					// Do not add it otherwise as the additional {!tag …} prepended to the Solr query
					// will break usage of {!join …} in the query.
					$queryInfo = array('key' => 'facet-' . $facetID . '-' . $facetTerm);
					if ($facetInfo['config']['excludeOwnFilter'] && $facetQuery) {
						$queryInfo['tag'] =  $this->tagForFacet($facetID);
					}

					$query->createFilterQuery($queryInfo)
							->setQuery($facetQuery);
				}
				$activeFacetsForTemplate[$facetID][$facetTerm] = $facetInfo;
			}
		}

		$this->configuration['activeFacets'] = $activeFacetsForTemplate;
	}



	/**
	 * Returns query for the given facet $ID and $term based on the facet’s
	 * configuration.
	 *
	 * @param array $facetConfig
	 * @param string $queryTerm
	 * @return string query string
	 */
	private function getFacetQuery ($facetConfig, $queryTerm) {
		$queryString = NULL;

		if ($facetConfig) {
			if (array_key_exists('facetQuery', $facetConfig)) {
				// Facet queries are configured: use one of them.
				foreach ($facetConfig['facetQuery'] as $facetQueryConfig) {
					if ($facetQueryConfig['id'] === $queryTerm) {
						$queryString = $facetQueryConfig['query'];
						break;
					}
				}
				if ($queryString === NULL) {
					$message = 'find: Results for Facet »' . $facetConfig['id'] . '« with facetQuery ID »' . $queryTerm . '« were requested, but this facetQuery is not configured. Building a generic facet query instead.';
					$this->logError($message, \TYPO3\CMS\Core\Messaging\FlashMessage::INFO, array('requestArguments' => $this->requestArguments, 'facetConfig' => $facetConfig, 'queryTerm' => $queryTerm), FALSE);
				}
			}

			if ($queryString === NULL) {
				// No Facet queries applicable: build the query.
				if (array_key_exists('query', $facetConfig)) {
					$queryPattern = $facetConfig['query'];
				}
				else {
					$queryPattern = ($facetConfig['field'] ? $facetConfig['field'] : $facetConfig['id']) . ':' . '%s';
				}

				// Hack: convert strings »RANGE XX TO YY« Solr style range queries »[XX TO YY]«
				// (because PHP loses ] in array keys during URL parsing)
				$queryTerm = preg_replace('/RANGE (.*) TO (.*)/', '[\1 TO \2]', $queryTerm);
				$queryString = sprintf($queryPattern, $queryTerm);
			}
		}
		else {
			$message = 'find: A non-configured facet was selected. Ignoring it.';
			$this->logError($message, \TYPO3\CMS\Core\Messaging\FlashMessage::WARNING, array('requestArguments' => $this->requestArguments));
		}

		return $queryString;
	}



	/**
	 * Returns the facet configuration for the given $ID.
	 *
	 * @param string $ID
	 * @return array
	 */
	private function getFacetConfig ($ID) {
		$config = NULL;

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
	 * Returns array with information about active facets.
	 *
	 * @param array $arguments request arguments
	 * @return array of arrays with information about active facets
	 */
	private function getActiveFacets ($arguments) {
		$activeFacets = array();

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
	 * Adds information about the selected items for a given facet to $activeFacets
	 *
	 * @param array $activeFacets
	 * @param string $facetID ID of the facet to set
	 * @param array $facetSelection array of selected items for the facet
	 */
	private function setActiveFacetSelectionForID (&$activeFacets, $facetID, $facetSelection) {
		$facetQueries = array();
		$facetConfig = $this->getFacetConfig($facetID);
		foreach ($facetSelection as $facetTerm => $facetStatus) {
			$facetInfo = array(
				'id' => $facetID,
				'config' => $facetConfig,
				'term' => $facetTerm,
				'query' => $this->getFacetQuery($facetConfig, $facetTerm)
			);
			$facetQueries[$facetTerm] = $facetInfo;
		}
		if (count($facetQueries) > 0) {
			$activeFacets[$facetID] = $facetQueries;
		}
	}


	
	/**
	 * Adds facet queries to $query from setup in TypoScript.
	 * Provides the facet setup enriched with the default values when no configuration
	 * is present in the »facets« template variable.
	 * 
	 * @param \Solarium\QueryType\Select\Query\Query $query
	 */
	private function addFacetQueries ($query) {
		$facetConfiguration = $this->settings['facets'];

		if ($facetConfiguration) {
			$facetSet = $query->getFacetSet();
			foreach($facetConfiguration as $key => $facet) {
				if (array_key_exists('id', $facet)) {
					$facetID = $facet['id'];

					// start with defaults and overwrite with specific facet configuration
					$facet = array_merge($this->settings['facetDefaults'], $facet);
					$facetConfiguration[$key] = $facet;

					$queryForFacet = NULL;
					if (array_key_exists('facetQuery', $facet)) {
						$queryForFacet = $facetSet->createFacetMultiQuery($facetID);
						foreach ($facet['facetQuery'] as $facetQueryIndex => $facetQuery) {
							if (array_key_exists('id', $facetQuery) && array_key_exists('query', $facetQuery)) {
								$queryForFacet->createQuery($facetQuery['id'], $facetQuery['query']);
							}
							else {
								$message = 'find: TypoScript facet »' . $facetID . '«, facetQuery ' . $facetQueryIndex . ' does not have the required keys »id« and »query«. Ignoring this facetQuery.';
								$this->logError($message, \TYPO3\CMS\Core\Messaging\FlashMessage::WARNING, array('facetQuery' => $facetQuery, 'facetConfiguration' => $facetConfiguration));
							}
						}
					}
					else {
						$queryForFacet = $facetSet->createFacetField($facetID);
						$queryForFacet->setField($facet['field'] ? $facet['field'] : $facetID)
										->setMinCount($facet['fetchMinimum'])
										->setLimit($facet['fetchMaximum'])
										->setSort($facet['sortOrder']);
					}
					
					if ($facet['excludeOwnFilter'] == 1) {
						$queryForFacet->addExclude($this->tagForFacet($facetID));
					}
				}
				else {
					$message = 'find: TypoScript facet ' . $key . ' does not have the required key »id«. Ignoring this facet.';
					$this->logError($message, \TYPO3\CMS\Core\Messaging\FlashMessage::WARNING, array('facet' => $facet, 'facetConfiguration' => $facetConfiguration));
				}
			}
		}
		
		$this->configuration['facets'] = $facetConfiguration;
	}



	/**
	 * Returns the facet/filter key for the given $facetID.
	 *
	 * @param string $facetID
	 * @return string
	 */
	private function tagForFacet ($facetID) {
		return 'facet-' . $facetID;
	}



	/**
	 * Adds filter queries configured in TypoScript to $query.
	 *
	 * @param \Solarium\QueryType\Select\Query\Query $query
	 */
	private function addTypoScriptFilters ($query) {
		if (!empty($this->settings['additionalFilters'])) {
			foreach($this->settings['additionalFilters'] as $key => $filterQuery) {
				$query->createFilterQuery('additionalFilter-' . $key)
						->setQuery($filterQuery);
			}
		}
	}



	/**
	 * Sets up $query’s sort order from URL arguments or the TypoScript default.
	 *
	 * @param \Solarium\QueryType\Select\Query\Query $query
	 * @param array $arguments request arguments
	 */
	private function setSortOrder ($query, $arguments) {
		$sortString = '';
		if (!empty($arguments['sort'])) {
			$sortString = $arguments['sort'];
		}
		else if (!empty($this->settings['sort'])) {
			foreach ($this->settings['sort'] as $sortSetting) {
				if ($sortSetting['id'] === 'default') {
					$sortString = $sortSetting['sortCriteria'];
					break;
				}
			}
		}

		$this->addSortStringForQuery($sortString, $query);

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
	private function addSortOrdersToTemplate ($arguments) {
		$sortOptions = array('menu' => array());

		if (is_array($this->settings['sort'])) {
			ksort($this->settings['sort']);
			foreach ($this->settings['sort'] as $sortOptionIndex => $sortOption) {
				if (array_key_exists('id', $sortOption) && array_key_exists('sortCriteria', $sortOption)) {
					$localisationKey = 'LLL:' . $this->settings['languageRootPath'] . 'locallang-form.xml:input.sort-' . $sortOption['id'];
					$localisedLabel = \TYPO3\CMS\Extbase\Utility\LocalizationUtility::translate($localisationKey, $this->request->getControllerExtensionKey());
					if (!$localisedLabel) {
						$localisedLabel = $sortOption['id'];
					}
					$sortOptions['menu'][$sortOption['sortCriteria']] = $localisedLabel;

					if ($sortOption['id'] === 'default') {
						$sortOptions['default'] = $sortOption['sortCriteria'];
					}
				}
				else {
					$message = 'find: TypoScript sort option »' . $sortOptionIndex . '« does not have the required keys »id« and »sortCriteria. Ignoring this setting.';
					$this->logError($message, \TYPO3\CMS\Core\Messaging\FlashMessage::WARNING, array('sortOption' => $sortOption));
				}
			}

			if ($arguments['sort'] && array_key_exists($arguments['sort'], $sortOptions['menu'])) {
				$sortOptions['selected'] = $arguments['sort'];
			}
			else {
				$sortOptions['selected'] = $sortOptions['default'];
			}
		}

		$this->configuration['sortOptions'] = $sortOptions;
	}



	/**
	 * Checks that $sortString is well-formatted and adds the sort conidition
	 * defined by it to $query.
	 * Adds feedback about invalid sort string format to the page.
	 *
	 * @param \Solarium\QueryType\Select\Query\Query $sortString
	 * @param $query
	 */
	private function addSortStringForQuery ($sortString, $query) {
		if (!empty($sortString)) {
			$sortCriteria = explode(',', $sortString);
			foreach ($sortCriteria as $sortCriterion) {
				$sortCriterionParts = explode(' ', $sortCriterion);
				if (count($sortCriterionParts) === 2) {
					$sortDirection = $query::SORT_ASC;
					if ($sortCriterionParts[1] === 'desc') {
						$sortDirection = $query::SORT_DESC;
					}
					else if ($sortCriterionParts[1] !== 'asc') {
						$message = 'find: sort criterion »' . $sortCriterion . '«’s sort direction is »' . $sortCriterionParts[1] . '« It should be »asc« or »desc«. Ignoring it.';
						$this->logError($message, \TYPO3\CMS\Core\Messaging\FlashMessage::WARNING);
						continue;
					}

					$query->addSort($sortCriterionParts[0], $sortDirection);
				}
				else {
					$message = 'find: sort criterion »' . $sortCriterion . '« does not have the required form »fieldName [asc|desc]«. Ignoring it.';
					$this->logError($message, \TYPO3\CMS\Core\Messaging\FlashMessage::WARNING);
				}
			}
		}
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
	private function addResultCountOptionsToTemplate ($arguments) {
		$resultCountOptions = array('menu' => array());

		if (is_array($this->settings['paging']['menu'])) {
			ksort($this->settings['paging']['menu']);
			foreach ($this->settings['paging']['menu'] as $resultCount) {
				$resultCountOptions['menu'][$resultCount] = $resultCount;
			}

			$resultCountOptions['default'] = $this->settings['paging']['perPage'];

			if ($arguments['count'] && array_key_exists($arguments['count'], $resultCountOptions['menu'])) {
				$resultCountOptions['selected'] = $arguments['count'];
			}
			else {
				$resultCountOptions['selected'] = $resultCountOptions['default'];
			}
		}

		$this->configuration['resultCountOptions'] = $resultCountOptions;
	}



	/**
	 * Returns the merged settings for the given name.
	 * Uses settings.$settingName.default and adds
	 * settings.$settingsName.$actionName to it.
	 *
	 * Settings array keys need to be non-numeric if they are supposed to be overriden.
	 *
	 * @param string $settingName the key of the subarray of $this->settings to work on
	 * @return array highlight configuration
	 */
	private function getMergedSettings ($settingName) {
		$config = array();

		if (array_key_exists($settingName, $this->settings)) {
			$setting = $this->settings[$settingName];

			if (array_key_exists('default', $setting)) {
				$config = $setting['default'];

				$actionName = $this->request->getControllerActionName();
				if (array_key_exists($actionName, $setting)) {
					$actionConfig = $setting[$actionName];
					$config = array_replace_recursive($config, $actionConfig);
				}
			}
		}

		return $config;
	}



	/**
	 * Sets up $query’s highlighting according to TypoScript settings.
	 * Unicode Private Use Area Codepoints U+EEEE and U+EEEF are used to mark
	 * the highlight to better deal with field contents that contain markup
	 * themselves.
	 *
	 * @param \Solarium\QueryType\Select\Query\Query $query
	 * @param array $arguments request arguments
	 */
	private function addHighlighting ($query, $arguments) {
		$highlightConfig = $this->getMergedSettings('highlight');

		if ($highlightConfig && $highlightConfig['fields'] && count($highlightConfig['fields']) > 0) {
			$highlight = $query->getHighlighting();

			// Configure highlight queries.
			if ($highlightConfig['query']) {
				$queryWords = array();
				if ($highlightConfig['useQueryTerms'] && array_key_exists('q', $arguments)) {
					$queryParameters = $arguments['q'];
					foreach ($this->settings['queryFields'] as $fieldInfo) {
						$fieldID = $fieldInfo['id'];
						if ($fieldID && $queryParameters[$fieldID]) {
							$queryArguments = $queryParameters[$fieldID];
							$queryAlternate = NULL;
							if (is_array($queryArguments) && array_key_exists('alternate', $queryArguments) && array_key_exists('queryAlternate', $fieldInfo)) {
								$queryAlternate = $queryArguments['alternate'];
								if (array_key_exists('term', $queryArguments)) {
									$queryTerms = $queryArguments['term'];
								}
							}
							else {
								$queryTerms = $queryArguments;
							}

							if (!is_array($queryTerms)) {
								$queryTerms = Array($queryTerms);
							}

							foreach($queryTerms as $queryTerm) {
								if (!$fieldInfo['noescape']) {
									if ($fieldInfo['phrase']) {
										$queryTerm = $query->getHelper()->escapePhrase($queryTerm);
									}
									else {
										$queryTerm = $query->getHelper()->escapeTerm($queryTerm);
									}
								}
								$queryWords[] = $queryTerm;
							}
						}
					}
				}

				if ($highlightConfig['useFacetTerms']) {
					foreach ($this->getActiveFacets($arguments) as $facets) {
						foreach (array_keys($facets) as $facetTerm) {
							$queryWords[] = $query->getHelper()->escapePhrase($facetTerm);
						}
					}
				}

				$queryComponents = array();
				foreach ($queryWords as $queryWord) {
					$queryComponents[] = '(' . sprintf($highlightConfig['query'], $queryWord) . ')';
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

		$this->configuration['highlight'] =  $highlightConfig;
	}


	
	/**
	 * Sets up the range of documents to be fetches by $query.
	 *
	 * @param \Solarium\QueryType\Select\Query\Query $query
	 * @param array $arguments request arguments
	 */
	private function setRange ($query, $arguments) {
		$query->setStart($this->getOffset($arguments));
		$query->setRows($this->getCount($arguments));
		$this->addResultCountOptionsToTemplate($arguments);
	}



	/**
	 * Sets up the fields to be fetched by the query.
	 *
	 * @param \Solarium\QueryType\Select\Query\Query $query
	 * @param array $arguments request arguments
	 */
	private function setFields ($query, $arguments) {
		$fieldsConfig = $this->getMergedSettings('dataFields');
		$fields = array();

		// Use field list from query parameters or from defaults.
		if (array_key_exists('data-fields', $arguments) && $arguments['data-fields']) {
			$fields = explode(',', $arguments['data-fields']);
		}
		else if ($fieldsConfig['default']) {
			$fields = array_values($fieldsConfig['default']);
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
			$query->setFields($fields);
		}
	}



	/**
	 * Returns the number of the first result on the page.
	 *
	 * @return int
	 */
	protected function counterStart() {
		return $this->getOffset() + 1;
	}


	/**
	 * Returns the number of the last result on the page.
	 *
	 * @return int
	 */
	protected function counterEnd() {
		return $this->getOffset() + $this->getCount();
	}


	/**
	 * Returns the index of the first row to return.
	 *
	 * @param array $arguments overrides $this->requestArguments if set
	 * @return int
	 */
	protected function getOffset ($arguments = NULL) {
		if ($arguments === NULL) {
			$arguments = $this->requestArguments;
		}

		$offset = 0;

		if (array_key_exists('start', $arguments)) {
			$offset =  intval($arguments['start']);
		}
		else if (array_key_exists('page', $arguments)) {
			$offset = (intval($arguments['page']) - 1)  * $this->getCount();
		}

		$this->configuration['offset'] = $offset;
		return $offset;
	}


	/**
	 * Returns the number of results per page using the first of:
	 * * query parameter »count«
	 * * TypoScript setting »paging.perPage«
	 * limited by the setting »paging.maximumPerPage«
	 *
	 * @param array $arguments overrides $this->requestArguments if set
	 * @return int
	 */
	protected function getCount ($arguments = NULL) {
		if ($arguments === NULL) {
			$arguments = $this->requestArguments;
		}

		$count = intval($this->settings['paging']['perPage']);

		if (array_key_exists('count', $arguments)) {
			$count = intval($this->requestArguments['count']);
		}

		$maxCount = intval($this->settings['paging']['maximumPerPage']);
		$count = min(array($count, $maxCount));

		$this->configuration['count'] = $count;
		return $count;
	}


	
	/**
	 * Stores information about the active query in the »underlyingQuery« JavaScript variable.
	 *
	 * @param array $query
	 * @param int|NULL $position of the record in the result list
	 * @param array $arguments overrides $this->requestArguments if set
	 */
	private function addQueryInformationAsJavaScript ($query, $position = NULL, $arguments = NULL) {
		if ($arguments === NULL) {
			$arguments = $this->requestArguments;
		}

		if ($this->settings['paging']['detailPagePaging']) {
			$scriptTag = new \TYPO3\CMS\Fluid\Core\ViewHelper\TagBuilder('script');
			$scriptTag->addAttribute('type', 'text/javascript');
			
			$underlyingQuery = array('q' => $query);
			if (!empty($arguments['facet'])) {
				$underlyingQuery['facet'] = $arguments['facet'];
			}
			if ($position !== NULL) {
				$underlyingQuery['position'] = $position;
			}
			if ($arguments['count']) {
				$underlyingQuery['count'] = $arguments['count'];
			}
			if ($arguments['sort']) {
				$underlyingQuery['sort'] = $arguments['sort'];
			}
			$scriptTag->setContent('var underlyingQuery = ' . json_encode($underlyingQuery) . ';');
			$this->response->addAdditionalHeaderData($scriptTag->render());
		}
	}


	/**
	 * Removes all values from $array whose
	 * * keys begin with __
	 * * values are an empty string
	 *
	 * Specifically aimed at the __hmac and __referrer keys introduced by Fluid
	 * forms as well as the text submitted by empty search form fields.
	 * 
	 * @param array $array
	 */
	private function cleanArgumentsArray (&$array) {
		foreach ($array as $key => &$value) {
			if (strpos($key, '__') === 0 || $value === '') {
				unset($array[$key]);
			}
			else if (is_array($value)) {
				$this->cleanArgumentsArray($value);
			}
		}
	}


	/**
	 * Logs errors to both flashMessages and devLog.
	 *
	 * @param string $message the message to display
	 * @param int $level the error level using the scale from TYPO3\CMS\Core\Messaging
	 * @param array $extraInfo additional data to pass to devLog
	 * @param boolean $showFlashMessages whether to show the flash message or not (defaults to TRUE)
	 */
	private function logError ($message, $level, $extraInfo = NULL, $showFlashMessage = TRUE) {
		if ($showFlashMessage) {
			$this->flashMessageContainer->add($message, $level);
		}

		/* translates between the equivalent \TYPO3\CMS\Core\Messaging and devLog log levels */
		$logLevelTranslation = array(
			\TYPO3\CMS\Core\Messaging\FlashMessage::NOTICE => 1,
			\TYPO3\CMS\Core\Messaging\FlashMessage::INFO => 0,
			\TYPO3\CMS\Core\Messaging\FlashMessage::OK => -1,
			\TYPO3\CMS\Core\Messaging\FlashMessage::WARNING => 2,
			\TYPO3\CMS\Core\Messaging\FlashMessage::ERROR => 3
		);

		\TYPO3\CMS\Core\Utility\GeneralUtility::devLog($message, 'find', $logLevelTranslation[$level], $extraInfo);
	}



	/**
	 * Returns an array that can be handled by devLog with the information from an exception.
	 *
	 * @param Exception $exception
	 * @return array
	 */
	private function exceptionToArray ($exception, $includePrevious = FALSE) {
		$array = array(
			'message' => $exception->getMessage(),
			'code' => $exception->getCode(),
			'file' => $exception->getFile(),
			'line' => $exception->getLine(),
			'trace' => $exception->getTraceAsString()
		);

		if ($includePrevious) {
			$array['previous'] = $this->exceptionToArray($exception->getPrevious(), TRUE);
		}

		return $array;
	}

}
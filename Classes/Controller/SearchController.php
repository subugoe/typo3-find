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

require_once(t3lib_extMgm::extPath('find') . 'vendor/autoload.php');

/**
 * Description
 */
class Tx_Find_Controller_SearchController extends Tx_Extbase_MVC_Controller_ActionController {

	/**
	 * @var \Solarium\Client
	 */
	protected $solr;


	/**
	 * @var array
	 */
	protected $requestArguments;


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
				)
			)
		);

		$this->solr = new Solarium\Client($configuration);

		$this->requestArguments = $this->request->getArguments();
        $this->cleanArgumentsArray($this->requestArguments);
		ksort($this->settings[queryFields]);
	}

	
	/**
	 * Index Action.
	 */
	public function indexAction() {
		$query = $this->createQueryForArguments($this->requestArguments);

		// Run the query.
		try {
			$resultSet = $this->solr->select($query);
		}
		catch (Solarium\Exception\HttpException $e) {
			$this->view->assign('error', array('solr' => $e));
		}

		$this->view->assignMultiple(array(
			'results' => $resultSet,
			'counterStart' => $this->counterStart(),
			'counterEnd' => $this->counterEnd(),
		));

		$this->addQueryInformationAsJavaScript($this->requestArguments['q']);
		$this->addStandardAssignments();
	}


	/**
	 * Data output.
	 */
	public function dataAction() {
		$this->indexAction();
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
		if (array_key_exists('id', $this->requestArguments) && !empty($this->requestArguments['id'])) {
			$id = $this->requestArguments['id'];
			$assignments = array();
			if ($this->settings['paging']['detailPagePaging'] && array_key_exists('underlyingQuery', $this->requestArguments)) {
				// If underlying query has been sent, fetch more data to enable paging arrows.
				$underlyingQueryInfo = $this->requestArguments['underlyingQuery'];

				// These indexes are 0-based for Solr & PHP. The user visible numbering is 1-based.
				$positionIndex = $underlyingQueryInfo['position'] - 1;
				$previousIndex = max(array($positionIndex - 1, 0));
				$nextIndex = $positionIndex + 1;
				$resultIndexOffset = ($positionIndex === 0) ? 0 : 1;

				$arguments = $this->requestArguments;
				foreach ($arguments['underlyingQuery'] as $key => $value) {
					$arguments[$key] = $value;
				}

				$this->addQueryInformationAsJavaScript($underlyingQueryInfo['q'], (int)$underlyingQueryInfo['position'], $arguments);

				$query = $this->createQueryForArguments($arguments);
				$query->setStart($previousIndex);
				$query->setRows($nextIndex - $previousIndex + 1);

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
						$this->flashMessageContainer->add('find: »detail« action query with underlying query could not retrieve record id »' . $id . '«.', t3lib_FlashMessage::ERROR);
						$this->redirect('index');
					}
				}
				else {
					$this->flashMessageContainer->add('find: »detail« action query with underlying query returned no results.', t3lib_FlashMessage::ERROR);
					$this->redirect('index');
				}
			}
			else {
				// Without underlying query information, just get the record specified.
				$query = $this->createQuery();
				$escapedID = $query->getHelper()->escapeTerm($id);
				$query->setQuery('id:' . $escapedID);
				$selectResults = $this->solr->select($query);
				if (count($selectResults) > 0) {
					$assignments['results'] = $selectResults;
					$resultSet = $selectResults->getDocuments();
					$assignments['document'] = $resultSet[0];
				}
				else {
					$this->flashMessageContainer->add('find: »detail« action query for id »' . $id . '« returned no results.', t3lib_FlashMessage::ERROR);
					$this->redirect('index');
				}
			}

			$this->view->assignMultiple($assignments);
			$this->addStandardAssignments();
		}
		else {
			// id argument missing or empty
			$this->flashMessageContainer->add('find: Non-empty argument »id« is required for action »detail«.', t3lib_FlashMessage::ERROR);
			$this->redirect('index');
		}
	}


	/**
	 * Assigns standard variables to the view.
	 */
	private function addStandardAssignments () {
		$this->view->assign('prefixId', 'tx_find_find');
		$this->view->assign('arguments', $this->requestArguments);
		$this->view->assign('extendedSearch', $this->isExtendedSearch());

		$contentObject = $this->configurationManager->getContentObject();
		$uid = $contentObject->data['uid'];
		$this->view->assign('uid', $uid);
		$this->view->assign('pageTitle', $GLOBALS['TSFE']->page['title']);
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
				$queryArguments = $queryParameters[$fieldID];
				if (!is_array($queryArguments)) {
					$queryArguments = Array($queryArguments);
				}

				// Fill in pre-configured default values if they exist and the field is empty.
				$defaults = $fieldInfo['default'];
				if ($defaults) {
					if (!is_array($defaults)) {
						$defaults = array($defaults);
					}
					foreach($defaults as $defaultKey => $default) {
						if (!array_key_exists($defaultKey, $queryArguments)) {
							$queryArguments[$defaultKey] = $default;
						}
					}
				}

				// Escape all arguments unless told not to do so.
				if (!$fieldInfo['noescape']) {
					$escapedQueryArguments = array();
					foreach($queryArguments as $key => $queryArgument) {
						$escapedQueryArguments[$key] = $query->getHelper()->escapeTerm($queryArgument);
					}
					$queryArguments = $escapedQueryArguments;
				}

				$queryFormat = $fieldInfo['query'];
				if (!$queryFormat) {
					$queryFormat = $fieldID . ':%s';
				}
				$queryPart = '_query_:' . $query->getHelper()->escapePhrase(vsprintf($queryFormat, $queryArguments));

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

		$this->view->assign('solarium', $query);

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
		$this->view->assign('query', $queryParameters);
		$this->view->assign('queryString', $queryString);

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
					// Do not add it otherwise as the additional {!tag ...} prepended to the Solr query
					// will break usage of {!join …} in the query.
					$queryInfo = array('key' => 'facet-' . $facetID . '-' . $facetTerm);
					if ($facetInfo['config']['excludeOwnFilter']) {
						$queryInfo['tag'] =  $this->tagForFacet($facetID);
					}

					$query->createFilterQuery($queryInfo)
							->setQuery($facetQuery);
				}
				$activeFacetsForTemplate[$facetID][$facetTerm] = $facetInfo;
			}
		}

		$this->view->assign('activeFacets', $activeFacetsForTemplate);
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

		if (array_key_exists('facetQuery', $facetConfig)) {
			// Facet queries are configured: use one of them.
			foreach ($facetConfig['facetQuery'] as $facetQueryConfig) {
				if ($facetQueryConfig['id'] === $queryTerm) {
					$queryString = $facetQueryConfig['query'];
					break;
				}
			}
			if ($queryString === NULL) {
				$this->flashMessageContainer->add('find: Resuls for Facet »' . $facetConfig['id'] . '« with facetQuery ID »' . $queryTerm . '« were requested, but this facetQuery is not configured. Ignoring it.', t3lib_FlashMessage::WARNING);
			}
		}
		else {
			// No Facet queries configured: build the query.
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
								$this->flashMessageContainer->add('find: TypoScript facet »' . $facetID . '«, facetQuery ' . $facetQueryIndex . ' does not have the required keys »id« and »query«. Ignoring this facetQuery.', t3lib_FlashMessage::WARNING);
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
					$this->flashMessageContainer->add('find: TypoScript facet ' . $key . ' does not have the required key »id«. Ignoring this facet.', t3lib_FlashMessage::WARNING);
				}
			}
		}
		$this->view->assign('facets', $facetConfiguration);
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
					$localisedLabel = Tx_Extbase_Utility_Localization::translate($localisationKey, $this->request->getControllerExtensionKey());
					if (!$localisedLabel) {
						$localisedLabel = $sortOption['id'];
					}
					$sortOptions['menu'][$sortOption['sortCriteria']] = $localisedLabel;

					if ($sortOption['id'] === 'default') {
						$sortOptions['default'] = $sortOption['sortCriteria'];
					}
				}
				else {
					$this->flashMessageContainer->add('find: TypoScript sort option »' . $sortOptionIndex . '« does not have the required keys »id« and »sortCriteria. Ignoring this setting.', t3lib_FlashMessage::WARNING);
				}
			}

			if ($arguments['sort'] && array_key_exists($arguments['sort'], $sortOptions['menu'])) {
				$sortOptions['selected'] = $arguments['sort'];
			}
			else {
				$sortOptions['selected'] = $sortOptions['default'];
			}
		}

		$this->view->assign('sortOptions', $sortOptions);
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
						$this->flashMessageContainer->add('find: sort criterion »' . $sortCriterion . '«’s sort direction is »' . $sortCriterionParts[1] . '« It should be »asc« or »desc«. Ignoring it.', t3lib_FlashMessage::WARNING);
						continue;
					}

					$query->addSort($sortCriterionParts[0], $sortDirection);
				}
				else {
					$this->flashMessageContainer->add('find: sort criterion »' . $sortCriterion . '« does not have the required form »fieldName [asc|desc]«. Ignoring it.', t3lib_FlashMessage::WARNING);
				}
			}
		}
	}



	/**
	 * Provides result count information in the template variable »resultCountOptions«.
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

		$this->view->assign('resultCountOptions', $resultCountOptions);
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
		if ($this->settings['highlight'] && $this->settings['highlight']['fields']
				&& count($this->settings['highlight']['fields']) > 0) {
			$highlight = $query->getHighlighting();

			// Configure highlight queries.
			if ($this->settings['highlight']['query']) {
				$queryWords= array();
				if ($this->settings['highlight']['useQueryTerms'] && array_key_exists('q', $arguments)) {
					foreach ($this->settings['queryFields'] as $queryField) {
						if (array_key_exists($queryField['id'], $arguments['q'])) {
							$queryTerm = $arguments['q'][$queryField['id']];
							if (!$queryField['noescape']) {
								$queryTerm = $query->getHelper()->escapeTerm($queryTerm);
							}
							$queryWords[] = $queryTerm;
						}
					}
				}
				if ($this->settings['highlight']['useFacetTerms']) {
					foreach ($this->getActiveFacets($arguments) as $facets) {
						foreach ($facets as $facetTerm => $facetInfo) {
							$queryWords[] = $query->getHelper()->escapePhrase($facetTerm);
						}
					}
				}

				$queryComponents = array();
				foreach ($queryWords as $queryWord) {
					$queryComponents[] = '(' . sprintf($this->settings['highlight']['query'], $queryWord) . ')';
				}
				$queryString = implode(' OR ', $queryComponents);

				$highlight->setQuery($queryString);
			}

			// Configure highlight fields.
			$highlight->addFields(implode(',', $this->settings['highlight']['fields']));
			
			// Set up alternative fields.
			if ($this->settings['highlight']['alternateFields']) {
				foreach ($this->settings['highlight']['alternateFields'] as $fieldName => $alternateFieldName) {
					$highlightField = $highlight->getField($fieldName);
					$highlightField->setAlternateField($alternateFieldName);
				}
			}

			// Set up prefix and postfix.
			$highlight->setSimplePrefix('\ueeee');
			$highlight->setSimplePostfix('\ueeef');
		}
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
		$fields = array();

		// Use field list from query parameters or from defaults.
		if (array_key_exists('dataFields', $arguments) && $arguments['dataFields']) {
			$fields = explode(',', $arguments['dataFields']);
		}
		else if ($this->settings['dataFields']['default']) {
			$fields = array_values($this->settings['dataFields']['default']);
		}

		// If allowed fields are configured, keep only those.
		$allowedFields = $this->settings['dataFields']['allow'];
		if ($allowedFields) {
			$fields = array_intersect($fields, $allowedFields);
		}

		// If disallowed fields are configured, remove those.
		$disallowedFields = $this->settings['dataFields']['disallow'];
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

		$this->view->assign('offset', $offset);
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

		$this->view->assign('count', $count);
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
			$scriptTag = new Tx_Fluid_Core_ViewHelper_TagBuilder('script');
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
	 * @param type $array
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

}

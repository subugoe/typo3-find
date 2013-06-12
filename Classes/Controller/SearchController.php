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

require_once(t3lib_extMgm::extPath('solr_frontend') . 'vendor/autoload.php');

/**
 * Description
 */
class Tx_SolrFrontend_Controller_SearchController extends Tx_Extbase_MVC_Controller_ActionController {

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
		$this->addResourcesToHead();
		
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
	}

	
	/**
	 * Index Action.
	 */
	public function indexAction($arguments = NULL) {
		if ($arguments === NULL) {
			$arguments = $this->requestArguments;
		}

		$query = $this->createQueryForArguments($arguments);

		// Run the query.
		$resultSet = $this->solr->select($query);

		// Determine number of pages for pagebrowser.
		$numberOfPages = 0;
		if ($this->getCount() > 0) {
			$numberOfPages = ceil($resultSet->getNumFound() / $this->getCount());
		}

		$assignments = array(
			'results' => $resultSet,
			'numberOfPages' => $numberOfPages,
			'counterStart' => $this->counterStart(),
			'counterEnd' => $this->counterEnd(),
			'extendedSearch' => $this->isExtendedSearch(),
		);
		$this->view->assignMultiple($assignments);

		$this->addQueryInformationAsJavaScript($this->requestArguments['q']);
		$this->addStandardAssignments();
	}


	/**
	 * JSON output.
	 */
	public function jsonAction() {
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

			$this->addFacetFilters($query, $this->requestArguments);
			$solrResults = $this->solr->suggester($query)->getResults();
			foreach ($solrResults as $suggestions)  {
				$results = array_merge($results, $suggestions->getSuggestions());
			}
		}

		$this->view->assign('suggestions', $results);
	}


	/**
	 * Action for single item view.
	 *
	 * @param String $id
	 */
	public function detailAction($id = NULL) {
		if (empty($id)) {
			// Bail out if no id is provided.
			$this->flashMessageContainer->add('Please provide a valid document id', t3lib_FlashMessage::ERROR);
			$this->redirect('index');
		}
		else {
			$assignments = array();

			if ($this->settings['paging']['detailPagePaging'] && array_key_exists('underlyingQuery', $this->requestArguments)) {
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
					// ERROR
				}
			}
			else {
				$query = $this->createQuery();
				$query->setQuery('id:' . $id);
				$resultSet = $this->solr->select($query)->getDocuments();
				$assignments['document'] = $resultSet[0];
			}

			$this->view->assignMultiple($assignments);
			$this->addStandardAssignments();
		}
	}


	/**
	 * Assigns standard variables to the view.
	 */
	private function addStandardAssignments () {
		$this->view->assign('prefixId', 'tx_solrfrontend_solrfrontend');
		$this->view->assign('arguments', $this->requestArguments);

		$contentObject = $this->configurationManager->getContentObject();
		$uid = $contentObject->data['uid'];
		$this->view->assign('uid', $uid);
	}


	/**
	 * Returns whether extended search should be used or not.
	 * 
	 * @return Boolean
	 */
	private function isExtendedSearch () {
		$result = FALSE;

		if (array_key_exists('extendedSearch', $this->requestArguments)) {
			$result = ($this->requestArguments['extendedSearch'] == TRUE);
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
	private function queryComponentsForQueryParameters ($queryParameters) {
		$queryComponents = array();
		$queryFields = $this->settings['queryFields'];
		$queryFields[] = array('id' => 'raw', 'query' => '###term###');
		foreach ($queryFields as $fieldInfo) {
			$fieldID = $fieldInfo['id'];
			if ($fieldID && $queryParameters[$fieldID]) {
				$queryPart = '';
				if ($fieldInfo['query']) {
					$queryPart = trim(str_replace('###term###', $queryParameters[$fieldID], $fieldInfo['query']));
				}
				else {
					$queryPart = $fieldID . ':' . $queryParameters[$fieldID];
				}
				if ($queryPart) {
					$queryComponents[$fieldID] = $queryPart;
				}
			}
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

		// Add search terms.
		if (array_key_exists('q', $arguments)) {
			$queryParameters = $arguments['q'];

			// Remove unneeded parameters from request.
			if (array_key_exists('__hmac', $queryParameters)) {
				unset($queryParameters['__hmac']);
			}
			if (array_key_exists('__referrer', $queryParameters)) {
				unset($queryParameters['__referrer']);
			}

			$queryComponents = array();
			if ($queryParameters) {
				$queryComponents = $this->queryComponentsForQueryParameters($queryParameters);
				if ($queryComponents) {
					$queryString = implode(' AND ', $queryComponents);
					$query->setQuery($queryString);
				}
			}
			
			$this->view->assign('query', $queryParameters);
		}

		$this->addFacetFilters($query, $arguments);
		$this->setSortOrder($query);
		$this->setRange($query, $arguments);
		$this->setFields($query, $arguments);

		// Configure facets.
		// Copy the facet configuration to a separate array $facetConfiguration
		// and enrich it with the defaults settings where they are missing
		// (to avoid having to check settings in two places with Fluid templating’s
		// weak logical abilities). Pass this array to the template as well.
		// (Less redundant approaches like writing the information to $this->settings
		// or trying to use $this->configurationManager->setConfiguration() to
		// write it back did not work.)
		$facetConfiguration = $this->settings['facets'];
		if ($facetConfiguration) {
			$facetSet = $query->getFacetSet();
			foreach($facetConfiguration as $key => $facet) {
				// start with defaults and overwrite with specific facet configuration
				$facet = array_merge($this->settings['facetDefaults'], $facet);
				$facetConfiguration[$key] = $facet;

				$facetSet->createFacetField($facet['field'])
						 ->setField($facet['field'])
						 ->setMinCount($facet['fetchMinimum'])
						 ->setLimit($facet['fetchMaximum'])
						 ->setSort($facet['sortOrder']);
			}
		}
		$this->view->assign('facets', $facetConfiguration);

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
		foreach ($activeFacets as $key => $value) {
			$query->createFilterQuery('facet-' . $key)
					->setQuery($value);
		}

		$activeFacetsForTemplate = array();
		foreach ($activeFacets as $activeFacet) {
			$facetQueryComponents = explode(':', $activeFacet, 2);
			if (count($facetQueryComponents) === 2) {
				$activeFacetsForTemplate[] = array(
					'name' => $facetQueryComponents[0],
					'value' => $facetQueryComponents[1]
				);
			}
		}

		$this->view->assign('activeFacets', $activeFacetsForTemplate);
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
	 * Sets up $query’s sort order from TypoScript settings.
	 *
	 * @param \Solarium\QueryType\Select\Query\Query $query
	 */
	private function setSortOrder ($query) {
		if (!empty($this->settings['sort'])) {
			foreach ($this->settings['sort'] as $sortConfiguration) {
				$sortOrder = $sortConfiguration['ascending'] ? $query::SORT_ASC : $query::SORT_DESC;
				$query->addSort($sortConfiguration['field'], $sortOrder);
			}
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
	 * Get active facets
	 *
	 * @param array $arguments request arguments
	 */
	private function getActiveFacets($arguments) {
		$activeFacets = array();

		if (array_key_exists('facet', $arguments)) {
			$facets = $arguments['facet'];
			foreach ($facets as $key => $facet) {
				// add to stack of active facets
				$activeFacets[$key] = $facet;
			}
		}

		return $activeFacets;
	}


	/**
	 * Returns the number of the first result on the page.
	 *
	 * @return int
	 */
	protected function counterStart() {
		return $this->getOffset() + 1 ;
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

		if ($arguments && array_key_exists('start', $arguments)) {
			$offset =  intval($arguments['start']);
		}

		$this->view->assign('offset', $offset);
		return $offset;
	}


	/**
	 * Returns the number of results per page using the first of:
	 * * query parameter »count«
	 * * TypoScript setting »paging.perPage«
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
	 * Returns whether or not the jQuery flot library is needed
	 * by the histogram facet.
	 *
	 * @return Boolean
	 */
	protected function requiresFlot() {
		$result = FALSE;
		foreach ($this->settings['facets'] as $facetInfo) {
			if ($facetInfo['type'] === 'histogram') {
				$result = TRUE;
				break;
			}
		}
		return $result;
	}


	/**
	 * Creates and inserts <style> and <script> tags inside <head>.
	 * Add files configured in TypoScript.
	 * Also add jQuery flot library if we are using histograms.
	 */
	protected function addResourcesToHead () {
		$CSSFileNames = array();
		if ($this->settings['CSSPaths']) {
			$CSSFileNames = $this->settings['CSSPaths'];
		}
		$CSSFileNames[] = 'EXT:solr_frontend/Resources/Public/CSS/jquery-ui.css';

		if ($CSSFileNames) {
			foreach ($CSSFileNames as $CSSFileName) {
				$CSSFileName = $GLOBALS['TSFE']->tmpl->getFileName($CSSFileName);
				if ($CSSFileName) {
					$CSSTag = new Tx_Fluid_Core_ViewHelper_TagBuilder('link');
					$CSSTag->addAttribute('rel', 'stylesheet');
					$CSSTag->addAttribute('type', 'text/css');
					$CSSTag->addAttribute('href', $CSSFileName);
					$this->response->addAdditionalHeaderData($CSSTag->render());
				}
			}
		}

		$JSFileNames = array();
		if ($this->settings['JSPaths']) {
			$JSFileNames = $this->settings['JSPaths'];
		}
		if ($this->requiresFlot()) {
			$JSFileNames[] = 'EXT:solr_frontend/Resources/Public/JavaScript/flot/jquery.flot.js';
			$JSFileNames[] = 'EXT:solr_frontend/Resources/Public/JavaScript/flot/jquery.flot.selection.js';
		}
		if ($JSFileNames) {
			foreach ($JSFileNames as $JSFileName) {
				$JSFileName = $GLOBALS['TSFE']->tmpl->getFileName($JSFileName);
				if ($JSFileName) {
					$scriptTag = new Tx_Fluid_Core_ViewHelper_TagBuilder('script');
					$scriptTag->addAttribute('type', 'text/javascript');
					$scriptTag->addAttribute('src', $JSFileName);
					$scriptTag->forceClosingTag(true);
					$this->response->addAdditionalHeaderData($scriptTag->render());
				}
			}
		}
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
			$underlyingQuery['facet'] = $this->getActiveFacets($arguments);
			if ($position !== NULL) {
				$underlyingQuery['position'] = $position;
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

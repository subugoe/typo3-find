<?php

/* * *************************************************************
 *  Copyright notice
 *
 *  (c) 2013 Ingo Pfennigstorf <pfennigstorf@sub-goettingen.de>
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
	}

	
	/**
	 * Index Action.
	 */
	public function indexAction() {
		$query = $this->createQueryForArguments();

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

		$this->addQueryInformationAsJavaScript($query->getQuery());
		$this->addStandardAssignments();
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
			$query = $this->createQueryForArguments();
			$assignments = array();

			if ($this->settings['resultPaging'] && array_key_exists('underlyingQuery', $this->requestArguments)) {
				$underlyingQueryInfo = $this->requestArguments['underlyingQuery'];
				// These indexes are 0-based for Solr & PHP. The user visible numbering is 1-based.
				$position = $underlyingQueryInfo['position'] - 1;
				$previous = max(array($position - 1, 0));
				$next = $position + 1;

				$this->addQueryInformationAsJavaScript($underlyingQueryInfo['query'], $position);

				$query->setQuery($underlyingQueryInfo['query']);

				$query->setStart($previous);
				$query->setRows($next - $previous + 1);

				$selectResults = $this->solr->select($query);
				$assignments['results'] = $selectResults;
				$resultSet = $selectResults->getDocuments();

				// the actual result is at position 0 (for the first document) or 1 (otherwise).
				$resultIndexOffset = ($position === 0) ? 0 : 1;
				$document = $resultSet[$resultIndexOffset];
				if ($document['id'] === $id) {
					$assignments['document'] = $document;
					if ($resultIndexOffset !== 0) {
						$assignments['document-previous'] = $resultSet[0];
						$assignments['document-previous-index'] = $previous + 1;
					}
					if (count($resultSet) > 2) {
						$assignments['document-next'] = $resultSet[2];
						$assignments['document-next-index'] = $next + 1;
					}
				}
				else {
					// ERROR
				}
			}
			else {
				$query->setQuery('id:' . $id);
				$resultSet = $this->solr->select($query)->getDocuments();
				$assignments['document'] = $resultSet[0];
			}

			$this->view->assignMultiple($assignments);
			$this->addStandardAssignments();
		}
	}


	/**
	 * Action for query autocomplete.
	 */
	public function autoCompleteAction() {
		$searchTerm = filter_var($_GET['term'], FILTER_SANITIZE_STRING);

		$query = $this->solr->createSuggester();

		$query->setQuery($searchTerm);
		$activeFacets = $this->getActiveFacets();

		// respect active facets
		foreach ($activeFacets as $key => $value) {
			$query->createFilterQuery('facet-' . $key)
					->setQuery($value);
		}

		$results = $this->solr->suggester($query)->getResponse()->getBody();
		$this->view->assign('results', $results);
	}


	/**
	 *
	 */
	public function jsonAction() {

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
	 * Creates a blank query and adds it to the view.
	 *
	 * @return \Solarium\QueryType\Select\Query\Query
	 */
	private function createQuery () {
		$query = $this->solr->createSelect();
		$this->view->assign('solarium', $query);

		return $query;
	}


	/**
	 * Creates a query configured with all parameters set in the request’s arguments.
	 *
	 * @return \Solarium\QueryType\Select\Query\Query
	 */
	private function createQueryForArguments ($arguments = NULL) {
		$query = $this->createQuery();

		if ($arguments === NULL) {
			$arguments = $this->requestArguments;
		}

		// Add search terms.
		if (array_key_exists('q', $arguments)) {
			$queryParameters = $arguments['q'];

			// remove not needed parameters from request
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

		$this->addFacetFilters($query);
		$this->addTypoScriptFilters($query);
		$this->addSortOrder($query);

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
		
		// Set the rows to retrieve.
		$query->setStart($this->getOffset());
		$query->setRows($this->getCount());

		return $query;
	}


	/**
	 * Adds filter queries for active facets to $query.
	 *
	 * @param \Solarium\QueryType\Select\Query\Query $query
	 */
	private function addFacetFilters ($query) {
		$activeFacets = $this->getActiveFacets();
		foreach ($activeFacets as $key => $value) {
			$query->createFilterQuery('facet-' . $key)
					->setQuery($value);
		}

		$this->view->assign('activeFacets', $activeFacets);
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
	private function addSortOrder ($query) {
		if (!empty($this->settings['sort'])) {
			foreach ($this->settings['sort'] as $sortConfiguration) {
				$sortOrder = $sortConfiguration['ascending'] ? $query::SORT_ASC : $query::SORT_DESC;
				$query->addSort($sortConfiguration['field'], $sortOrder);
			}
		}
	}


	/**
	 * Get active facets
	 */
	protected function getActiveFacets() {

		$activeFacets = array();
		if (array_key_exists('facet', $this->requestArguments)) {
			$facets = $this->requestArguments['facet'];

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
	 * @return int
	 */
	protected function getOffset () {
		if (array_key_exists('start', $this->requestArguments)) {
			return intval($this->requestArguments['start']);
		}
		else {
			return 0;
		}
	}


	/**
	 * Returns the number of results per page using the first of:
	 * * query parameter »count«
	 * * setting »count«
	 * * default (10)
	 *
	 * @return int
	 */
	protected function getCount () {
		if (array_key_exists('count', $this->requestArguments)) {
			return intval($this->requestArguments['count']);
		}
		else if (array_key_exists('count', $this->settings)) {
			return intval($this->settings['count']);
		}
		else {
			return 10;
		}
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
	 * @param \Solarium\QueryType\Select\Query\Query $query
	 * @param int|NULL $position
	 */
	protected function addQueryInformationAsJavaScript ($query, $position = NULL) {
		if ($this->settings['resultPaging']) {
			$scriptTag = new Tx_Fluid_Core_ViewHelper_TagBuilder('script');
			$scriptTag->addAttribute('type', 'text/javascript');
			$underlyingQuery= array('query' => $query);
			if ($position !== NULL) {
				$underlyingQuery['position'] = $position;
			}
			$scriptTag->setContent('var underlyingQuery = ' . json_encode($underlyingQuery) . ';');
			$this->response->addAdditionalHeaderData($scriptTag->render());
		}
	}

}

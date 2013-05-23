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
	 * @var Tx_SolrFrontend_Domain_Model_Search
	 * @inject
	 */
	protected $search;

	/**
	 * @var int
	 */
	protected $offset = 0;

	/**
	 * @var int
	 */
	protected $resultsPerPage;

	/**
	 * @var tslib_cObj
	 */
	protected $contentObject;

	/**
	 * @var string
	 */
	public $prefixId = 'tx_solrfrontend_solrfrontend';

	/**
	 * Initializes some defaults
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

		$this->resultsPerPage = intval($this->settings['results']['numberOfResultsPerPage']);

		if ($this->request->hasArgument('page')) {
			$this->offset = $this->request->getArgument('page') * $this->resultsPerPage;
		}

		$this->contentObject = $this->configurationManager->getContentObject();
	}


	/**
	 * Returns whether extended search should be used or not.
	 * 
	 * @return Boolean
	 */
	private function isExtendedSearch () {
		$result = FALSE;

		if ($this->request->hasArgument('extendedSearch')) {
			$result = ($this->request->getArgument('extendedSearch') == TRUE);
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
	 * Index Action
	 */
	public function indexAction() {
		$query = $this->solr->createSelect();
		// search query
		$queryParameters = array();
		if ($this->request->hasArgument('q')) {
			$queryParameters = $this->request->getArgument('q');

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
		}

		// add filter queries for facets
		$activeFacets = array();
		if ($this->request->hasArgument('facet')) {
			$facets = $this->request->getArgument('facet');

			foreach ($facets as $key => $facet) {
				// add to stack of active facets
				$activeFacets[$key] = $facet;

				// add the filter
				$query->createFilterQuery('facet-' . $key)
						->setQuery($facet);
			}
		}

		// Add filter queries configured in TypoScript.
		if (!empty($this->settings['additionalFilters'])) {
			foreach($this->settings['additionalFilters'] as $key => $filterQuery) {
				$query->createFilterQuery('additionalFilter-' . $key)
						->setQuery($filterQuery);
			}
		}

		// Set up the sort order.
		if (!empty($this->settings['sort'])) {
			foreach ($this->settings['sort'] as $sortConfiguration) {
				$sortOrder = $sortConfiguration['ascending'] ? $query::SORT_ASC : $query::SORT_DESC;
				$query->addSort($sortConfiguration['field'], $sortOrder);
			}
		}

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

		// offset for pagination
		$query->setStart($this->offset)->setRows($this->resultsPerPage);

		// fire the query
		$resultSet = $this->solr->select($query);

		// determine number of pages for pagebrowser
		$numberOfPages = ceil($resultSet->getNumFound() / $this->resultsPerPage);

		$uid = $this->contentObject->data['uid'];

		$assignments = array(
			'facets' => $facetConfiguration,
			'query' => $queryParameters,
			'solarium' => $query,
			'results' => $resultSet,
			'numberOfPages' => $numberOfPages,
			'activeFacets' => $activeFacets,
			'uid' => $uid,
			'counterStart' => $this->counterStart(),
			'counterEnd' => $this->counterEnd(),
			'prefixId' => $this->prefixId,
			'extendedSearch' => $this->isExtendedSearch()
		);

		$this->view->assignMultiple($assignments);

	}

	/**
	 * Single view
	 *
	 * @param String $id
	 */
	public function detailAction($id = NULL) {

		// if no id is provided
		if (empty($id)) {
			$this->flashMessageContainer->add('Please provide a valid document id', t3lib_FlashMessage::ERROR);
			$this->redirect('index');
		}

		$query = $this->solr->createSelect();
		$query->setQuery('id:' . $id);
		$resultSet = $this->solr->select($query)->getDocuments();

		$this->view->assign('document', $resultSet[0]);
	}

	/**
	 * Action for autocompletion
	 */
	public function autoCompleteAction() {
		$searchTerm = filter_var($_GET['term'], FILTER_SANITIZE_STRING);
		$this->view->assign('searchTerm', $searchTerm);
	}

	/**
	 * Calculates the starting point for the ordered list
	 *
	 * @return int
	 */
	protected function counterStart() {
		return $this->offset + 1 ;
	}


	/**
	 * Calculates the number of the last result on a page
	 *
	 * @return int
	 */
	protected function counterEnd() {
		return $this->offset + $this->resultsPerPage;
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

}
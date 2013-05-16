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
	 * Counting current facets
	 *
	 * @var int
	 */
	protected $facetCounter = 0;

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

		if ($this->request->hasArgument('offset')) {
			$this->offset = $this->request->getArgument('offset') * $this->resultsPerPage;
		}
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
					$queryPart = str_replace('###term###', $queryParameters[$fieldID], $fieldInfo['query']);
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
	 *
	 */
	public function indexAction() {
		$query = $this->solr->createSelect();

		// search query
		if ($this->request->hasArgument('q')) {
			$queryParameters = $this->request->getArgument('q');
			$queryComponents = Array();
			if ($queryParameters) {
				$queryComponents = $this->queryComponentsForQueryParameters($queryParameters);
				$queryString = implode(' AND ', $queryComponents);
				$query->setQuery($queryString);
			}
		}
	
		// add filter queries for facets
		if ($this->request->hasArgument('facet')) {
			$facets = $this->request->getArgument('facet');
			$activeFacets = array();

			foreach ($facets as $key => $facet) {
				$this->facetCounter++;
				// add to stack of active facets
				$activeFacets[$key] = $facet;

				// add the filter
				$query->createFilterQuery('facet-' . $key)
						->setQuery($facet);
			}
		}

		// add filter queries configured in TypoScript
		if (!empty($this->settings['additionalFilters'])) {
			// define filters
			foreach($this->settings['additionalFilters'] as $key => $filterQuery) {
				$query->createFilterQuery('additionalFilter-' . $key)
						->setQuery($filterQuery);
			}
		}

		// get the facetset component
		$facetSet = $query->getFacetSet();

		if (!empty($this->settings['facets'])) {
			// @todo sort array
			// define facets
			foreach($this->settings['facets'] as $index => $facetName) {
				$facetSet->createFacetField($facetName)
						 ->setField($facetName)
						 ->setMinCount(1);
			}
		}

		// offset for pagination
		$query->setStart($this->offset)->setRows($this->resultsPerPage);

		// fire the query
		$resultSet = $this->solr->select($query);

		// determine number of pages for pagebrowser
		$numberOfPages = ceil($resultSet->getNumFound() / $this->resultsPerPage);

		$contentObject = $this->configurationManager->getContentObject();
		$uid = $contentObject->data['uid'];

		$this->view
				->assign('query', $queryParameters)
				->assign('search', $this->search)
				->assign('results', $resultSet)
				->assign('numberOfPages', $numberOfPages)
				->assign('facetCounter', $this->facetCounter)
				->assign('activeFacets', $activeFacets)
				->assign('uid', $uid)
				->assign('counterStart', $this->counterStart())
				->assign('counterEnd', $this->counterEnd())
				->assign('prefixId', $this->prefixId);
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
	 * Creates and inserts tags inside <head>.
	 */
	protected function addResourcesToHead () {
		// Add CSS to head: Custom file if configured, included default file otherwise.
		$CSSFileName = $GLOBALS['TSFE']->tmpl->getFileName($this->settings['CSSPath']);
		if ($CSSFileName) {
			$cssTag = new Tx_Fluid_Core_ViewHelper_TagBuilder('link');
			$cssTag->addAttribute('rel', 'stylesheet');
			$cssTag->addAttribute('type', 'text/css');
			$cssTag->addAttribute('href', $CSSFileName);
			$this->response->addAdditionalHeaderData( $cssTag->render() );
		}
		
		// Add JavaScript to head: Custom file if configured, included default file otherwise.
		$scriptFileName = $GLOBALS['TSFE']->tmpl->getFileName($this->settings['JSPath']);
		if ($scriptFileName) {
			$scriptTag = new Tx_Fluid_Core_ViewHelper_TagBuilder('script');
			$scriptTag->addAttribute('type', 'text/javascript');
			$scriptTag->addAttribute('src', $scriptFileName);
			$scriptTag->forceClosingTag(true);
			$this->response->addAdditionalHeaderData( $scriptTag->render() );
		}
	}

}
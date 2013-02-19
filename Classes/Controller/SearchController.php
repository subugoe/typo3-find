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

require_once(t3lib_extMgm::extPath('sublar') . 'vendor/autoload.php');

/**
 * Description
 */
class Tx_Sublar_Controller_SearchController extends Tx_Extbase_MVC_Controller_ActionController {

	/**
	 * @var \Solarium\Client
	 */
	protected $solr;

	/**
	 * @var Tx_Sublar_Domain_Model_Search
	 * @inject
	 */
	protected $search;

	public function initializeAction() {

		$configuration = array(
			'endpoint' => array(
			'localhost' => array(
				'host' => '10.0.4.9',
				'port' => 8080,
				'path' => '/solr/edfu/',
			)
		));

		$this->solr = new Solarium\Client($configuration);
	}

	/**
	 * @param Tx_Sublar_Domain_Model_Search $search
	 */
	public function indexAction(Tx_Sublar_Domain_Model_Search $search = NULL) {

		$query = $this->solr->createSelect();

		if ($search) {
			$this->search = $search;
			$query->setQuery($search->getQ());
		} else {
			$query->setQuery($this->search->setQ('*'));
		}
		// get the facetset component
		$facetSet = $query->getFacetSet();
		$facetSet->createFacetField('typ')->setField('typ');

		$resultset = $this->solr->select($query);

		$this->view
				->assign('results', $resultset)
				->assign('search', $this->search);
	}

}
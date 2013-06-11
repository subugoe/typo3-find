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

/**
 * Determines whether a facet is selected or not
 */
class Tx_SolrFrontend_ViewHelpers_FacetIsActiveViewHelper extends Tx_Fluid_Core_ViewHelper_AbstractViewHelper{


	/**
	 * Register arguments.
	 */
	public function initializeArguments() {
		parent::initializeArguments();
		$this->registerArgument('facetName', 'string', 'The name of the facet to determine the selection status of', TRUE);
		$this->registerArgument('itemName', 'string', 'The name of the facet item to determine the selection status of; if NULL any facet with the given facetName matches', FALSE, NULL);
		$this->registerArgument('activeFacets', 'array', 'Array of active facets', FALSE, Array());
		$this->registerArgument('type', 'string', 'Query type [string, range]', FALSE, 'string');
	}


	/**
	 * @return array
	 */
	public function render() {
		$itemName = $this->arguments['itemName'];
		if ($this->arguments['type'] === 'string') {
			$itemName = '"' . $itemName . '"';
		}

		foreach ($this->arguments['activeFacets'] as $activeFacet) {
			if ($activeFacet['name'] === $this->arguments['facetName'] 
					&& ($activeFacet['value'] === $itemName || $itemName === NULL)) {
				return TRUE;
			}
		}

		return FALSE;
	}

}

?>
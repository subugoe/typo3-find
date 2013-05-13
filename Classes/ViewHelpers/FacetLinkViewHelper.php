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

/**
 * Returns an array out of two values in a facet array
 */
class Tx_SolrFrontend_ViewHelpers_FacetLinkViewHelper extends Tx_Fluid_Core_ViewHelper_AbstractViewHelper{

	/**
	 * @param int $counter
	 * @param string $label
	 * @param string $value
	 * @param array $activeFacets
	 * @return array
	 */
	public function render($counter, $label, $value, $activeFacets = NULL) {

		$facet = $label . ':"' . $value . '"';

		// active facet mode
		if (is_array($activeFacets)) {

			foreach ($activeFacets as $activeFacet) {
				if ($activeFacet === $facet) {
					return array();
				}
			}
		}

		return array(
			'facet' => array(
				$counter => $facet
			)
		);
	}
}
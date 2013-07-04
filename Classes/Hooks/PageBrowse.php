<?php

/* * *************************************************************
 *  Copyright notice
 *
 *  (c) 2013 Ingo Pfennigstorf <pfennigstorf@sub-goettingen.de>
 *         & Sven-S. Porst <porst@sub.uni-goettingen.de>
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
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details.
 *
 *  This copyright notice MUST APPEAR in all copies of the script!
 * ************************************************************* */

/**
 * Description 
 */
class Tx_Find_Hooks_PageBrowse {

	/**
	 * Add extra marker for the last page.
	 * Add subpart to show/hide the first/last page number when it is part of the current group.
	 * Add subpart to show/hide ellipses when just next to the first/last page.
	 *
	 * Note: $this->currentPage is the page number - 1
	 *
	 * @param $params
	 * @param $object
	 */
	public function addAdditionalMarkers(&$params, $object) {

		// Marker: set text
		// final page number
		$params['markers']['###LAST_PAGE###'] = $params['numberOfPages'];

		// Subparts:
		// Setting to '' suppresses the subpart.
		// Show or suppress the first/last page number?
		// Suppress when the first/last page is already part of the current group.
		if ($params['currentPage'] - $object->conf['pagesBefore'] < 1) {
			$params['subparts']['###MAIN_GROUP_NOT_FIRST###'] = '';
		}

		if ($params['currentPage'] + 1 + $object->conf['pagesAfter'] >= $params['numberOfPages']) {
			$params['subparts']['###MAIN_GROUP_NOT_LAST###'] = '';
		}

		// Show ellipses before/after the current selection?
		if ($params['currentPage'] - $object->conf['pagesBefore'] < 2) {
			$params['subparts']['###LESS_PAGES###'] = '';
		}

		if (($params['currentPage'] + 1) + $object->conf['pagesAfter'] >= $params['numberOfPages']) {
			$params['subparts']['###MORE_PAGES###'] = '';
		}
	}

}
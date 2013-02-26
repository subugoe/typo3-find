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
 * Description 
 */
class Tx_SolrFrontend_ViewHelpers_PageBrowserViewHelper extends Tx_Fluid_Core_ViewHelper_AbstractViewHelper{

	/**
	 * @param int $numberOfPages
	 * @param string $prefixId
	 * @param string $pageParameterName
	 * @param string $searchTerm
	 * @return string
	 */
	public function render($numberOfPages, $prefixId, $pageParameterName = 'page', $searchTerm) {
		$conf = $GLOBALS['TSFE']->tmpl->setup['plugin.']['tx_pagebrowse_pi1.'];
		// Modify this configuration
		$conf['pageParameterName'] = $prefixId . '|' . $pageParameterName;
		$conf['numberOfPages'] = $numberOfPages;
		$conf['extraQueryString'] = '&' . $prefixId . '[q]=' . $searchTerm;

		// Get page browser
		$cObj = t3lib_div::makeInstance('tslib_cObj');
		/* @var $cObj tslib_cObj */
		$cObj->start(array(), '');
		return $cObj->cObjGetSingle('USER', $conf);
	}

}
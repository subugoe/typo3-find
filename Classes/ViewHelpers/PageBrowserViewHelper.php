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
class Tx_Find_ViewHelpers_PageBrowserViewHelper extends Tx_Fluid_Core_ViewHelper_AbstractViewHelper{

	/**
	 * Register arguments.
	 */
	public function initializeArguments() {
		parent::initializeArguments();
		$this->registerArgument('numberOfPages', 'int', 'The total number of pages to create a pager for', TRUE);
		$this->registerArgument('prefixId', 'string', 'The string to prefix the URL parameter with', TRUE);
		$this->registerArgument('pageParameterName', 'page', 'The URL parameter name', FALSE, 'page');
	}


	/**
	 * @return string
	 */
	public function render() {
		$conf = $GLOBALS['TSFE']->tmpl->setup['plugin.']['tx_pagebrowse_pi1.'];
		// Modify this configuration
		$conf['pageParameterName'] = $this->arguments['prefixId'] . '|' . $this->arguments['pageParameterName'];
		$conf['numberOfPages'] = $this->arguments['numberOfPages'];

		// Get page browser
		$cObj = t3lib_div::makeInstance('tslib_cObj');
		/* @var $cObj tslib_cObj */
		$cObj->start(array(), '');
		return $cObj->cObjGetSingle('USER', $conf);
	}

}

?>
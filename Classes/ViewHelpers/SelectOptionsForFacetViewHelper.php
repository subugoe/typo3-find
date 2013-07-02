<?php
/*******************************************************************************
 * Copyright notice
 *
 * Copyright 2013 Sven-S. Porst, Göttingen State and University Library
 *                <porst@sub.uni-goettingen.de>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 ******************************************************************************/


/**
 * View Helper to convert an array with facet information into an array suitable
 * for use as options for f:form.select.
 */
class Tx_SolrFrontend_ViewHelpers_SelectOptionsForFacetViewHelper extends Tx_Fluid_Core_ViewHelper_AbstractViewHelper {


	/**
	 * Registers own arguments.
	 */
	public function initializeArguments() {
		parent::initializeArguments();
		$this->registerArgument('values', 'array', 'values array for a facet', TRUE);
		$this->registerArgument('showCount', 'boolean', 'include the item count for the facet in the label?', FALSE, FALSE);
		$this->registerArgument('leadingBlank', 'boolean', 'begin the select with a blank item? (for jquery.chosen)', FALSE, FALSE);
	}


	/**
	 * @return string
	 */
	public function render() {
		$result = array();

		if ($this->arguments['leadingBlank']) {
			$result[''] = '';
		}
		foreach ($this->arguments['values'] as $item => $count) {
			$result[$item] = $item . ($this->arguments[showCount] ? ' (' . $count . ')' : '');
		}

		return $result;
	}

}

?>
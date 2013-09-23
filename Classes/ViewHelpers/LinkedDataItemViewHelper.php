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
 * View Helper to create a container for linked data output.
 * Add data by using the linkedDataItem View Helper inside it.
 */
class Tx_Find_ViewHelpers_LinkedDataItemViewHelper extends Tx_Fluid_Core_ViewHelper_AbstractViewHelper {


	/**;
	 * Registers own arguments.
	 */
	public function initializeArguments() {
		parent::initializeArguments();
		$this->registerArgument('subject', 'string', 'The triple’s subject', TRUE);
		$this->registerArgument('predicate', 'string', 'The triple’s predicate', TRUE);
		$this->registerArgument('object', 'string', 'The triple’s object', FALSE, NULL);
		$this->registerArgument('objectType', 'string', 'Type of the triple’s object', FALSE, NULL);
		$this->registerArgument('language', 'string', 'Language code for the triple’s object', FALSE, NULL);

		$this->registerArgument('name', 'string', 'The name of the template variable to store the data in', FALSE, 'linkedDataContainer');
	}


	/**
	 * @return string
	 */
	public function render() {
		$container = $this->templateVariableContainer->get($this->arguments['name']);
		if (!$container[$this->arguments['subject']]) {
			$container[$this->arguments['subject']] = array();
		}

		if (!$container[$this->arguments['subject']][$this->arguments['predicate']]) {
			$container[$this->arguments['subject']][$this->arguments['predicate']] = array();
		}

		if ($this->arguments['object'] !== NULL) {
			$container[$this->arguments['subject']][$this->arguments['predicate']][$this->arguments['object']] = NULL;
		}
		else {
			$container[$this->arguments['subject']][$this->arguments['predicate']][$this->renderChildren()] = array('type' => $this->arguments['objectType'], 'language' => $this->arguments['language']);
		}

		$this->templateVariableContainer->remove($this->arguments['name']);
		$this->templateVariableContainer->add($this->arguments['name'], $container);
	}

}

?>
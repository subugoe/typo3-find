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
	 * View Helper to create a new array with the given keys and values.
	 */
	class Tx_Find_ViewHelpers_NewArrayViewHelper extends Tx_Fluid_Core_ViewHelper_AbstractViewHelper {


		/**
		 * Registers own arguments.
		 */
		public function initializeArguments() {
			parent::initializeArguments();
			$this->registerArgument('array', 'array', 'existing array to add the new keys and values to', FALSE, array());
			$this->registerArgument('keys', 'array', 'array of keys', FALSE, NULL);
			$this->registerArgument('values', 'array', 'array of values', TRUE);
			$this->registerArgument('name', 'string', 'name of template variable to assign the result to', FALSE, NULL);
			$this->registerArgument('global', 'boolean', 'whether to make the variable available to all templates coming afterwards', FALSE, FALSE);
		}


		/**
		 * @return string
		 */
		public function render() {
			$result = '';
			$array = $this->arguments['array'];

			if ($this->arguments['keys']) {
				$newArray = array_combine($this->arguments['keys'], $this->arguments['values']);
				if ($newArray !== FALSE) {
					$result = array_merge($array, $newArray);
				}
				else {
					$result = "newArray View Helper: Could not combine keys and values to new array, probably they don’t have the same number of elements.\n" . print_r($this->arguments, TRUE);
				}
			}
			else {
				$result = array_merge($array, $this->arguments['values']);
			}

			$variableName = $this->arguments['name'];
			if ($variableName !== NULL) {
				$this->templateVariableContainer->add($variableName, $result);
				$result = $this->renderChildren();
				if ($this->arguments['global'] !== TRUE) {
					$this->templateVariableContainer->remove($variableName);
				}
			}

			return $result;
		}

	}

?>
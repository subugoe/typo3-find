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
class Tx_Find_ViewHelpers_LinkedDataContainerViewHelper extends Tx_Fluid_Core_ViewHelper_AbstractViewHelper {

	protected $usedPrefixes = array();


	/**
	 * Registers own arguments.
	 */
	public function initializeArguments () {
		parent::initializeArguments();
		$this->registerArgument('format', 'string', 'The linked data format to create', FALSE, 'turtle');
		$this->registerArgument('base', 'string', 'The base name', FALSE, NULL);
		$this->registerArgument('prefixes', 'array', 'The namespace names to use', FALSE, array());

		$this->registerArgument('name', 'string', 'The name of the template variable to store the data in', FALSE, 'linkedDataContainer');
	}


	/**
	 * @return string
	 */
	public function render () {
		$this->templateVariableContainer->add($this->arguments['name'], array());

		$this->renderChildren();
		$items = $this->templateVariableContainer->get($this->arguments['name'], $items);
		$this->templateVariableContainer->remove($this->arguments['name']);

		$result = '';
		$format = $this->arguments['format'];
		if ($format === 'turtle') {
			$result = $this->renderTurtle($items);
		}

		return $result;
	}


	private function renderTurtle ($items) {
		// loop over subjects
		$subjectArray = array();
		foreach ($items as $subject => $subjectStatements) {
			$subjectString = $this->turtleString($subject) . "\n\t";

			// loop over predicates
			$predicateArray = array();
			foreach ($subjectStatements as $predicate => $objects) {
				$predicateString = $this->turtleString($predicate) . ' ';

				// loop over objects
				$objectArray = array();
				foreach ($objects as $object => $properties) {
					$objectString = '';
					if ($properties === NULL) {
						$objectString = $this->turtleString($object);
					}
					else {
						if (strpos($object, '"') === FALSE && strpos($object, "\r") === FALSE && strpos($object, "\n") === FALSE) {
							$objectString = '"' . $object . '"';
						}
						else if (strpos($object, '"""') === FALSE) {
							$objectString = '"""' . $object . '"""';
						}
						else if (strpos($object, "'''") === FALSE) {
							$objectString = "'''" . $object . "'''";
						}
						else {
							// TODO: Error Handling for could not escape.
							debugster('gaga');
						}
						if ($properties['language']) {
							$objectString .= '@' . $properties['language'];
						}
						if ($properties['type']) {
							$objectString .= '^^' . $this->turtleString($properties['type']);
						}
					}
					$objectArray[] = $objectString;
				}
				$predicateString .= implode(', ', $objectArray);
				$predicateArray[] = $predicateString;
			}
	
			$subjectString .= implode(" ;\n\t", $predicateArray);
			$subjectArray[] = $subjectString;
		}
		$result .= implode(" .\n\n", $subjectArray) . " .\n";

		// Prepend the prefixes that are used.
		$prefixes = array();
		foreach ($this->arguments['prefixes'] as $acronym => $prefix) {
			if ($this->usedPrefixes[$acronym] === TRUE) {
				$prefixes[] = '@prefix ' . $acronym . ': ' . $this->turtleString($prefix, FALSE) . " .\n";
			}
		}

		$result = "\n" . implode('', $prefixes) . "\n" . $result;

		return $result;
	}

	private function turtleString ($item, $usePrefixes = TRUE) {
		$result = '<' . $item . '>';
		
		if ($usePrefixes) {
			foreach($this->arguments['prefixes'] as $acronym => $prefix) {
				if (strpos($item, $prefix) === 0) {
					$result = str_replace($prefix, $acronym . ':', $item);
					$this->usedPrefixes[$acronym] = TRUE;
					break;
				}
				else if (strpos($item, $acronym . ':') === 0) {
					$result = $item;
					$this->usedPrefixes[$acronym] = TRUE;
					break;
				}
			}
		}
		
		return $result;
	}

}

?>
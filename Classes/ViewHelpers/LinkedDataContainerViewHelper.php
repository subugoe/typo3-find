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

		$LDRenderer = Tx_Find_ViewHelpers_LinkedDataRenderer::instantiateSubclassForType($this->arguments['format']);
		$LDRenderer->setPrefixes($this->arguments['prefixes']);
		$result = $LDRenderer->renderItems($items);

		return $result;
	}



}



abstract class Tx_Find_ViewHelpers_LinkedDataRenderer {

	protected $prefixes = array();
	protected $usedPrefixes = array();

	public static function instantiateSubclassForType ($type) {
		if ($type === 'rdf') {
			$instance = t3lib_div::makeInstance('Tx_Find_ViewHelpers_LinkedDataRDFRenderer');
		}
		else {
			$instance = t3lib_div::makeInstance('Tx_Find_ViewHelpers_LinkedDataTurtleRenderer');
		}

		return $instance;
	}

	public function setPrefixes ($prefixes) {
		$this->prefixes = $prefixes;
	}

	abstract function renderItems ($items);
}



class Tx_Find_ViewHelpers_LinkedDataTurtleRenderer extends Tx_Find_ViewHelpers_LinkedDataRenderer {

	public function renderItems ($items) {
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
		foreach ($this->prefixes as $acronym => $prefix) {
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
			foreach($this->prefixes as $acronym => $prefix) {
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



class Tx_Find_ViewHelpers_LinkedDataRDFRenderer extends Tx_Find_ViewHelpers_LinkedDataRenderer {

	protected $doc;

	public function renderItems ($items) {
		$this->doc = new DomDocument();
		$this->prefixes['rdf'] = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
		$rdf = $this->doc->createElement($this->prefixedName('rdf:RDF'));
		$this->doc->appendChild($rdf);

		// loop over subjects
		foreach ($items as $subject => $subjectStatements) {
			$subjectDescription = $this->doc->createElement($this->prefixedName('rdf:Description'));
			$subjectDescription->setAttribute($this->prefixedName('rdf:about'), $subject);

			// loop over predicates
			foreach ($subjectStatements as $predicate => $objects) {

				// loop over objects
				foreach ($objects as $object => $properties) {
					$predicateElement = $this->doc->createElement($this->prefixedName($predicate));
					$subjectDescription->appendChild($predicateElement);

					if ($properties === NULL) {
						$objectParts = explode(':', $object, 2);
						if ($this->prefixes[$objectParts[0]] && count($objectParts) === 2) {
							$object = $this->prefixes[$objectParts[0]] . $objectParts[1];
						}
						$fullObjectURI = object;
						$predicateElement->setAttribute($this->prefixedName('rdf:resource'), $this->prefixedName($object));
					}
					else {
						if ($properties['language']) {
							$predicateElement->setAttribute($this->prefixedName('xml:lang'), $properties['language']);
						}
						if ($properties['type']) {
							$predicateElement->setAttribute($this->prefixedName('rdf:datatype'), $properties['type']);
						}

						$predicateElement->appendChild($this->doc->createTextNode($object));
					}
					
					$subjectDescription->appendChild($predicateElement);
				}
			}

			$rdf->appendChild($subjectDescription);
		}

		// Add the prefixes that are used as xmlns.
		foreach ($this->usedPrefixes as $prefix => $value) {
			if ($this->prefixes[$prefix]) {
				$this->doc->firstChild->setAttribute('xmlns:' . $prefix, $this->prefixes[$prefix]);
			}
		}

		$this->doc->formatOutput = TRUE;
		return $this->doc->saveXML();
	}

	private function prefixedName ($name) {
		$nameParts = explode(':', $name, 2);
		if ($this->prefixes[$nameParts[0]]) {
			$this->usedPrefixes[$nameParts[0]] = TRUE;
		}

		return $name;
	}

}


?>
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

namespace Subugoe\Find\ViewHelpers;



/**
 * View Helper to create a container for linked data output.
 * Add data by using the linkedDataItem View Helper inside it.
 */
class LinkedDataContainerViewHelper extends \TYPO3\CMS\Fluid\Core\ViewHelper\AbstractViewHelper {

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

		$LDRenderer = LinkedDataRenderer::instantiateSubclassForType($this->arguments['format']);
		$LDRenderer->setPrefixes($this->arguments['prefixes']);
		$result = $LDRenderer->renderItems($items);

		return $result;
	}



}



abstract class LinkedDataRenderer {

	protected $prefixes = array();
	protected $usedPrefixes = array();

	public static function instantiateSubclassForType ($type) {
		if ($type === 'rdf') {
			$instance = \TYPO3\CMS\Core\Utility\GeneralUtility::makeInstance('Subugoe\Find\ViewHelpers\LinkedDataRDFRenderer');
		}
		else if ($type === 'json-ld') {
			$instance = \TYPO3\CMS\Core\Utility\GeneralUtility::makeInstance('Subugoe\Find\ViewHelpersLinkedDataJSONLDRenderer');
		}
		else {
			$instance = \TYPO3\CMS\Core\Utility\GeneralUtility::makeInstance('Subugoe\Find\ViewHelpers\LinkedDataTurtleRenderer');
		}

		return $instance;
	}

	public function setPrefixes ($prefixes) {
		$this->prefixes = $prefixes;
	}

	abstract function renderItems ($items);
}


/*
 * http://www.w3.org/TR/2012/WD-turtle-20120710/
 */
class LinkedDataTurtleRenderer extends LinkedDataRenderer {

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

		$itemParts = explode(':', $item, 2);
		$rdfTypeURI = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
		if ($item === $rdfTypeURI
				|| (count($itemParts) > 1 && $this->prefixes[$itemParts[0]] . $itemParts[1] === $rdfTypeURI)) {
			$result = 'a';
		}
		else {
			if ($usePrefixes) {
				foreach($this->prefixes as $acronym => $prefix) {
					if (strpos($item, $prefix) === 0) {
						$result = str_replace($prefix, $acronym . ':', $item);
						$this->usedPrefixes[$acronym] = TRUE;
						break;
					}
					else if ($itemParts[0] === $acronym) {
						$result = $item;
						$this->usedPrefixes[$acronym] = TRUE;
						break;
					}
				}
			}
		}

		return $result;
	}

}


/*
 * http://www.w3.org/RDF/
 * http://www.w3.org/TR/REC-rdf-syntax/
 */
class LinkedDataRDFRenderer extends LinkedDataRenderer {

	public function renderItems ($items) {
		$doc = new DomDocument();
		$this->prefixes['rdf'] = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
		$rdf = $doc->createElement($this->prefixedName('rdf:RDF'));
		$doc->appendChild($rdf);

		// loop over subjects
		foreach ($items as $subjectURI => $subjectStatements) {
			$subjectDescription = $doc->createElement($this->prefixedName('rdf:Description'));
			$subjectDescription->setAttribute($this->prefixedName('rdf:about'), $this->prefixedName($subjectURI, TRUE));

			// loop over predicates
			foreach ($subjectStatements as $predicate => $objects) {

				// loop over objects
				foreach ($objects as $object => $properties) {
					$predicateElement = $doc->createElement($this->prefixedName($predicate));
					$subjectDescription->appendChild($predicateElement);

					if ($properties === NULL) {
						$objectParts = explode(':', $object, 2);
						if ($this->prefixes[$objectParts[0]] && count($objectParts) === 2) {
							$object = $this->prefixes[$objectParts[0]] . $objectParts[1];
						}
						$predicateElement->setAttribute($this->prefixedName('rdf:resource'), $this->prefixedName($object, TRUE));
					}
					else {
						if ($properties['language']) {
							$predicateElement->setAttribute($this->prefixedName('xml:lang'), $properties['language']);
						}
						if ($properties['type']) {
							$predicateElement->setAttribute($this->prefixedName('rdf:datatype'), $this->prefixedName($properties['type'], TRUE));
						}

						$predicateElement->appendChild($doc->createTextNode($object));
					}
					
					$subjectDescription->appendChild($predicateElement);
				}
			}

			$rdf->appendChild($subjectDescription);
		}

		// Add the prefixes that are used as xmlns.
		foreach ($this->usedPrefixes as $prefix => $value) {
			if ($this->prefixes[$prefix]) {
				$doc->firstChild->setAttribute('xmlns:' . $prefix, $this->prefixes[$prefix]);
			}
		}

		$doc->formatOutput = TRUE;
		return $doc->saveXML();
	}

	private function prefixedName ($name, $expand = FALSE) {
		$nameParts = explode(':', $name, 2);
		if ($this->prefixes[$nameParts[0]]) {
			$this->usedPrefixes[$nameParts[0]] = TRUE;
			if ($expand && count($nameParts) > 1) {
				$name = $this->prefixes[$nameParts[0]] . $nameParts[1];
			}
		}

		return $name;
	}

}


/*
 *
 * http://www.w3.org/TR/json-ld-syntax/
 */
class LinkedDataJSONLDRenderer extends LinkedDataRenderer {

	public function renderItems ($items) {
		$graph = array();

		// loop over subjects
		foreach ($items as $subjectURI => $subjectStatements) {
			$subject = array('@id' => $this->prefixedName($subjectURI));

			// loop over predicates
			foreach ($subjectStatements as $predicateURI => $objects) {

				// loop over objects
				foreach ($objects as $objectString => $properties) {
					if ($properties === NULL) {
						$object = $this->prefixedName($objectString);
					}
					else {
						$object = array('@value' => $objectString);

						if ($properties['language']) {
							$object['@language'] = $properties['language'];
						}
						if ($properties['type']) {
							$object['@type'] = $properties['type'];
						}
					}

					$predicateURI = $this->prefixedName($predicateURI);
					if ($subject[$predicateURI]) {
						if (is_array($subject[$predicateURI])) {
							$subject[$predicateURI][] = $object;
 						}
						else {
							$subject[$predicateURI] = array($subject[$predicateURI], $object);
						}
					}
					else {
						$subject[$predicateURI] = $object;
					}
				}
			}

			$graph[] = $subject;
		}

		// Add the prefixes as the @context.
		$context = array();
		foreach ($this->usedPrefixes as $prefix => $value) {
			if ($this->prefixes[$prefix]) {
				$context[$prefix] = $this->prefixes[$prefix];
			}
		}

		return json_encode(array(
			'@context' => $context,
			'@graph' => $graph
		));
	}

	private function prefixedName ($name) {
		foreach ($this->prefixes as $acronym => $URI) {
			if (strpos($name, $URI) === 0) {
				$name = str_replace($URI, $acronym . ':', $name);
				$this->usedPrefixes[$acronym] = TRUE;
				break;
			}
			else if (strpos($name, $acronym . ':') === 0) {
				$this->usedPrefixes[$acronym] = TRUE;
				break;
			}
		}

		return $name;
	}

}

?>
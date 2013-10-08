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

namespace Subugoe\Find\ViewHelpers\LinkedData\Renderer;



/*
 * http://www.w3.org/TR/2012/WD-turtle-20120710/
 */
class TurtleRenderer extends AbstractRenderer {

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

?>
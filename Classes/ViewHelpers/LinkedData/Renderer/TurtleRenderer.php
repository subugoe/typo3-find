<?php

namespace Subugoe\Find\ViewHelpers\LinkedData\Renderer;

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
 * @see http://www.w3.org/TR/2012/WD-turtle-20120710/
 */
class TurtleRenderer extends AbstractRenderer implements RendererInterface
{
    public function renderItems($items): string
    {
        $result = '';

        // loop over subjects
        $subjectArray = [];
        foreach ($items as $subject => $subjectStatements) {
            $subjectString = $this->turtleString($subject)."\n\t";

            // loop over predicates
            $predicateArray = [];
            foreach ($subjectStatements as $predicate => $objects) {
                $predicateString = $this->turtleString($predicate).' ';

                // loop over objects
                $objectArray = [];
                foreach ($objects as $object => $properties) {
                    $objectString = '';
                    if (null === $properties) {
                        $objectString = $this->turtleString($object);
                    } else {
                        if (!str_contains($object, '"') && !str_contains($object, "\r") && !str_contains($object,
                            "\n")) {
                            $objectString = '"'.$object.'"';
                        } elseif (!str_contains($object, '"""')) {
                            $objectString = '"""'.$object.'"""';
                        } elseif (!str_contains($object, "'''")) {
                            $objectString = "'''".$object."'''";
                        } else {
                            // TODO: Error Handling for could not escape.
                        }

                        if ($properties['language']) {
                            $objectString .= '@'.$properties['language'];
                        }

                        if ($properties['type']) {
                            $objectString .= '^^'.$this->turtleString($properties['type']);
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

        $result .= implode(' .'.PHP_EOL.PHP_EOL, $subjectArray).' .'.PHP_EOL;

        // Prepend the prefixes that are used.
        $prefixes = [];
        foreach ($this->prefixes as $acronym => $prefix) {
            if (true === $this->usedPrefixes[$acronym]) {
                $prefixes[] = '@prefix '.$acronym.': '.$this->turtleString($prefix, false).' .'.PHP_EOL;
            }
        }

        return PHP_EOL.implode('', $prefixes).PHP_EOL.$result;
    }

    /**
     * @param bool $usePrefixes
     *
     * @return mixed|string
     */
    protected function turtleString($item, $usePrefixes = true)
    {
        $result = '<'.$item.'>';

        $itemParts = explode(':', $item, 2);
        $rdfTypeURI = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
        if ($item === $rdfTypeURI
            || (count($itemParts) > 1 && $this->prefixes[$itemParts[0]].$itemParts[1] === $rdfTypeURI)) {
            $result = 'a';
        } elseif ($usePrefixes) {
            foreach ($this->prefixes as $acronym => $prefix) {
                if (str_starts_with($item, $prefix)) {
                    $result = str_replace($prefix, $acronym.':', $item);
                    $this->usedPrefixes[$acronym] = true;
                    break;
                } elseif ($itemParts[0] === $acronym) {
                    $result = $item;
                    $this->usedPrefixes[$acronym] = true;
                    break;
                }
            }
        }

        return $result;
    }
}

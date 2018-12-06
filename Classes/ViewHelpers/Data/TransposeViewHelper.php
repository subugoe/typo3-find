<?php

namespace Subugoe\Find\ViewHelpers\Data;

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

use TYPO3Fluid\Fluid\Core\Rendering\RenderingContextInterface;
use TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper;

/**
 * View Helper to rearrange an array of columns into an array of rows and.
 *
 * Usage examples are available in Private/Partials/Test.html.
 */
class TransposeViewHelper extends AbstractViewHelper
{
    /**
     * Register arguments.
     */
    public function initializeArguments()
    {
        parent::initializeArguments();
        $this->registerArgument('arrays', 'array', 'Array with keys: field names and values: arrays', false, []);
        $this->registerArgument('name', 'string', 'Variable name to assign the new array to', true);
    }

    /**
     * @return string Rendered string
     */
    public static function renderStatic(
        array $arguments,
        \Closure $renderChildrenClosure,
        RenderingContextInterface $renderingContext
    ) {
        $arrays = [];
        $iterationArray = [];
        // Strip non-numeric keys in the value arrays.
        foreach ($arguments['arrays'] as $key => $array) {
            $iterationArray = (null !== $array) ? $array : [];
            $arrays[$key] = array_values($iterationArray);
        }

        if ($iterationArray && static::identicalLengths($arrays)) {
            $rows = [];
            foreach (array_keys($iterationArray) as $rowIndex) {
                $row = [];
                foreach ($arrays as $key => $array) {
                    $row[$key] = $array[$rowIndex];
                }
                $rows[] = $row;
            }

            $variableName = $arguments['name'];
            $renderingContext->getVariableProvider()->add($variableName, $rows);
            $output = $renderChildrenClosure();
            $renderingContext->getVariableProvider()->remove($variableName);
        } else {
            $info = [];
            foreach ($arguments['arrays'] as $key => $array) {
                $info[] = $key.': '.count($array);
            }

            $output = 'The arrays passed in the »arrays« argument do not have identical numbers of values: ('.implode(', ',
                    $info).')';
        }

        return $output;
    }

    /**
     * Returns TRUE if all elements of $arrays have the same count(), FALSE otherwise.
     *
     * @param array $arrays array of arrays
     *
     * @return bool
     */
    protected static function identicalLengths($arrays)
    {
        $result = true;

        $length = null;
        foreach ($arrays as $array) {
            if (null === $length) {
                $length = count($array);
            } else {
                if ($length !== count($array)) {
                    $result = false;
                    break;
                }
            }
        }

        return $result;
    }
}

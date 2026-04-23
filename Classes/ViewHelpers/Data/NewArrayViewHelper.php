<?php

declare(strict_types=1);

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

use TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper;

/**
 * View Helper to create a new array with the given keys and values.
 *
 * Usage examples are available in Private/Partials/Test.html.
 *
 * Examples:
 *   Build associative array:
 *     <s:data.newArray keys="{0: 'foo', 1: 'bar'}" values="{0: 'a', 1: 'b'}" name="myArray">
 *       {myArray.foo} => "a"
 *     </s:data.newArray>
 *
 *   Append to existing array:
 *     <s:data.newArray array="{existing}" values="{0: 'extra'}" name="merged">…</s:data.newArray>
 *
 *   Global assignment:
 *     <s:data.newArray keys="{0: 'x'}" values="{0: 1}" name="cfg" global="true" />
 */
class NewArrayViewHelper extends AbstractViewHelper
{
    protected $escapeOutput = false;

    public function initializeArguments(): void
    {
        parent::initializeArguments();
        $this->registerArgument('name', 'string', 'Name of template variable to assign the result to', false, null);
        $this->registerArgument('array', 'array', 'Existing array to add the new keys and values to', false, []);
        $this->registerArgument('keys', 'array', 'Array of keys', false, []);
        $this->registerArgument('values', 'array', 'Array of values', false, []);
        $this->registerArgument(
            'global',
            'boolean',
            'Whether to make the variable available to all templates coming afterwards',
            false,
            false
        );
        $this->registerArgument('omitEmptyFields', 'boolean', 'Omits empty fields', false, false);
    }

    #[\Override]
    public function render(): mixed
    {
        $result = $this->arguments['array'];
        if (!is_array($result)) {
            $result = [];
        }

        $keys = $this->arguments['keys'];
        $values = $this->arguments['values'];
        $omitEmpty = (bool)$this->arguments['omitEmptyFields'];

        if (is_array($keys) && $keys !== []) {
            if (!is_array($values)) {
                $values = [];
            }

            // Re-index both arrays numerically so we can safely zip them
            // regardless of the original key structure
            $keyList = array_values($keys);
            $valueList = array_values($values);
            $keyCount = count($keyList);
            $valueCount = count($valueList);
            if ($keyCount !== $valueCount) {
                // Pad the shorter array: missing values become null, extra values are ignored
                // This prevents silent data loss when counts don't match
                $valueList = $valueCount < $keyCount ? array_pad($valueList, $keyCount, null) : array_slice($valueList, 0, $keyCount);
            }

            foreach ($keyList as $index => $key) {
                if (!is_string($key) && !is_int($key)) {
                    continue;
                }

                $value = $valueList[$index] ?? null;

                if ($omitEmpty && empty($value)) {
                    continue;
                }

                $result[$key] = $value;
            }
        } elseif (is_array($values)) {
            // No keys provided: append values with numeric indices
            foreach ($values as $value) {
                if ($omitEmpty && empty($value)) {
                    continue;
                }

                $result[] = $value;
            }
        }

        $variableName = $this->arguments['name'] ?? null;

        if ($variableName === null || $variableName === '') {
            return $result;
        }

        $variableProvider = $this->renderingContext->getVariableProvider();

        if ($variableProvider->exists($variableName)) {
            $variableProvider->remove($variableName);
        }

        $variableProvider->add($variableName, $result);

        $childContent = $this->renderChildren();

        if ($this->arguments['global'] !== true) {
            $variableProvider->remove($variableName);
        }

        return $childContent;
    }
}

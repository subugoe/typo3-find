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
 * View Helper to return the first element of the passed array even when not
 * knowing the key names.
 *
 * Usage examples are available in Private/Partials/Test.html.
 *
 * Examples:
 *   <f:variable name="items" value="{foo: 'bar', baz: 'qux'}" />
 *   {s:data.arrayFirst(array: items)} => "bar"
 *
 *   Inline with tag children:
 *   <s:data.arrayFirst>{items}</s:data.arrayFirst>
 */
class ArrayFirstViewHelper extends AbstractViewHelper
{
    /**
     * Output is determined by the array content which may contain HTML.
     * Escaping must be disabled so that HTML values pass through untouched.
     */
    protected $escapeOutput = false;

    public function initializeArguments(): void
    {
        parent::initializeArguments();
        $this->registerArgument(
            'array',
            'mixed',
            'The array (or Traversable) to return the first value of. Falls back to tag children if omitted.',
            false,
            null
        );
    }

    #[\Override]
    public function render(): mixed
    {
        $array = $this->arguments['array'] ?? $this->renderChildren();

        if ($array === null) {
            return null;
        }

        // Convert Traversable (e.g. SplFixedArray, QueryResult, ObjectStorage) to a plain array
        if ($array instanceof \Traversable) {
            $array = iterator_to_array($array, true);
        }

        // Handle comma-separated strings passed from Fluid inline notation
        if (is_string($array)) {
            $array = array_map(trim(...), explode(',', $array));
        }

        if (!is_array($array) || $array === []) {
            return null;
        }

        return reset($array);
    }
}

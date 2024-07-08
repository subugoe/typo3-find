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
 * View Helper to return the value of a key in an array.
 *
 * Usage examples are available in Private/Partials/Test.html.
 */
class ValueForKeyViewHelper extends AbstractViewHelper
{
    public function initializeArguments()
    {
        parent::initializeArguments();
        $this->registerArgument('array', 'array', 'The array to extract the value from', true);
        $this->registerArgument('key', 'string', 'The key to extract the value for', true);
    }

    /**
     * @return string|int|bool|array
     */
    public static function renderStatic(
        array $arguments,
        \Closure $renderChildrenClosure,
        RenderingContextInterface $renderingContext
    ) {
        $result = null;

        if ((is_int($arguments['key']) || is_string($arguments['key'])) && ($arguments['array'] && array_key_exists($arguments['key'], $arguments['array']))) {
            $result = $arguments['array'][$arguments['key']];
        }

        return $result;
    }
}

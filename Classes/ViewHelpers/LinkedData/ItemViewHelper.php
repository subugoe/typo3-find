<?php

namespace Subugoe\Find\ViewHelpers\LinkedData;

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
 * View Helper to create a container for linked data output.
 * Add data by using the linkedDataItem View Helper inside it.
 */
class ItemViewHelper extends AbstractViewHelper
{
    /**;
     * Registers own arguments.
     * @return void
     */
    public function initializeArguments()
    {
        parent::initializeArguments();
        $this->registerArgument('subject', 'string', 'The triple’s subject', true);
        $this->registerArgument('predicate', 'string', 'The triple’s predicate', true);
        $this->registerArgument('object', 'string', 'The triple’s object', false, null);
        $this->registerArgument('objectType', 'string', 'Type of the triple’s object', false, null);
        $this->registerArgument('language', 'string', 'ISO 639-1 language code for the triple’s object', false, null);
        $this->registerArgument('name', 'string', 'The name of the template variable to store the data in', false,
            'linkedDataContainer');
    }

    public static function renderStatic(
        array $arguments,
        \Closure $renderChildrenClosure,
        RenderingContextInterface $renderingContext
    ) {
        $container = $renderingContext->getVariableProvider()->get($arguments['name']);
        if (!$container[$arguments['subject']]) {
            $container[$arguments['subject']] = [];
        }

        if (!$container[$arguments['subject']][$arguments['predicate']]) {
            $container[$arguments['subject']][$arguments['predicate']] = [];
        }

        if (null !== $arguments['object']) {
            $container[$arguments['subject']][$arguments['predicate']][$arguments['object']] = null;
        } else {
            $container[$arguments['subject']][$arguments['predicate']][$renderChildrenClosure()] = [
                'type' => $arguments['objectType'],
                'language' => $arguments['language'],
            ];
        }

        $renderingContext->getVariableProvider()->remove($arguments['name']);
        $renderingContext->getVariableProvider()->add($arguments['name'], $container);
    }
}

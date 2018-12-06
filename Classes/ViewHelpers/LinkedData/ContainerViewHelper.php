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
 *
 * Usage examples are available in Private/Partials/Test.html.
 */
class ContainerViewHelper extends AbstractViewHelper
{
    /**
     * Registers own arguments.
     */
    public function initializeArguments()
    {
        parent::initializeArguments();
        $this->registerArgument('format', 'string', 'The linked data format to create', false, 'turtle');
        $this->registerArgument('prefixes', 'array', 'The namespace names to use', false, []);
        $this->registerArgument('name', 'string', 'The name of the template variable to store the data in', false,
            'linkedDataContainer');
    }

    /**
     * @return string
     */
    public static function renderStatic(
        array $arguments,
        \Closure $renderChildrenClosure,
        RenderingContextInterface $renderingContext
    ) {
        $renderingContext->getVariableProvider()->add($arguments['name'], []);

        $renderChildrenClosure();
        $items = $renderingContext->getVariableProvider()->get($arguments['name']);
        $renderingContext->getVariableProvider()->remove($arguments['name']);

        $LDRenderer = Renderer\AbstractRenderer::instantiateSubclassForType($arguments['format']);
        $LDRenderer->setPrefixes($arguments['prefixes']);
        $result = $LDRenderer->renderItems($items);

        return $result;
    }
}

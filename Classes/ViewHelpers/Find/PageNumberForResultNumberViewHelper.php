<?php

namespace Subugoe\Find\ViewHelpers\Find;

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

use TYPO3\CMS\Fluid\Core\Rendering\RenderingContextInterface;
use TYPO3\CMS\Fluid\Core\ViewHelper\AbstractViewHelper;
use TYPO3\CMS\Fluid\Core\ViewHelper\Facets\CompilableInterface;

/**
 * View Helper to return the number of the page the result at position resultNumber
 * appears on with resultsPerPage items per page, i.e. returns
 * resultNumber mod resultsPerPage.
 */
class PageNumberForResultNumberViewHelper extends AbstractViewHelper implements CompilableInterface
{
    /**
     * Avoid divisions by zero.
     */
    const DEFAULT_RESULTS_PER_PAGE = 20;

    /**
     * @param int $resultNumber   Number of the rsult to determine the page number for
     * @param int $resultsPerPage Number of results per page
     *
     * @return string|int|bool|array
     */
    public function render($resultNumber, $resultsPerPage = 20)
    {
        return self::renderStatic(
            [
                'resultNumber' => $resultNumber,
                'resultsPerPage' => $resultsPerPage,
            ],
            $this->buildRenderChildrenClosure(),
            $this->renderingContext
        );
    }

    /**
     * @param array                     $arguments
     * @param \Closure                  $renderChildrenClosure
     * @param RenderingContextInterface $renderingContext
     *
     * @return float
     */
    public static function renderStatic(
        array $arguments,
        \Closure $renderChildrenClosure,
        RenderingContextInterface $renderingContext
    ) {
        if (0 === $arguments['resultsPerPage']) {
            $arguments['resultsPerPage'] = self::DEFAULT_RESULTS_PER_PAGE;
        }

        $pageNumber = intval(ceil($arguments['resultNumber'] / $arguments['resultsPerPage']));

        return $pageNumber;
    }
}

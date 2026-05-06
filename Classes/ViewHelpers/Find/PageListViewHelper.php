<?php

declare(strict_types=1);

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
use TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper;

/**
 * View Helper returning an array of data needed to create a page list with templates.
 */
class PageListViewHelper extends AbstractViewHelper
{
    public function initializeArguments(): void
    {
        parent::initializeArguments();
        $this->registerArgument('currentPage', 'int', 'number of the current page', false, 1);
        $this->registerArgument('resultCount', 'int', 'total number of results', true);
        $this->registerArgument('perPage', 'int', 'number of results per page', false, 10);
        $this->registerArgument('adjacentPages', 'int', 'number of neighbours of the current page to show', false, 3);
        $this->registerArgument('minimumGapSize', 'int', 'gaps of fewer items than this are filles', false, 2);
    }

    #[\Override]
    public function render(
    ): array {
        $currentPage = ($this->arguments['currentPage'] ? (int)$this->arguments['currentPage'] : 1);
        $numberOfPages = (int)ceil($this->arguments['resultCount'] / $this->arguments['perPage']);
        $adjacentPages = (int)$this->arguments['adjacentPages'];
        $adjacentFirst = max($currentPage - $adjacentPages, 1);
        $adjacentLast = min($currentPage + $adjacentPages, $numberOfPages);
        $minimumGapSize = (int)$this->arguments['minimumGapSize'];

        $pageIndex = 1;
        $pages = [];
        while ($pageIndex <= $numberOfPages) {
            $pageInfo = ['number' => $pageIndex, 'current' => false, 'gap' => false];

            if ($pageIndex === $currentPage) {
                $pageInfo['status'] = 'current';
                $pageInfo['current'] = true;
            } elseif (($pageIndex === 1 | $pageIndex === $numberOfPages) !== 0) {
                $pageInfo['status'] = 'edge';
            } elseif (abs($pageIndex - $currentPage) <= $adjacentPages) {
                $pageInfo['status'] = 'adjacent';
            } elseif (($pageIndex < $adjacentFirst && $adjacentFirst <= 1 + $minimumGapSize)
                || ($pageIndex > $adjacentLast && $numberOfPages - $adjacentLast <= $minimumGapSize)) {
                $pageInfo['status'] = 'gapfiller';
            } else {
                $pageInfo['status'] = 'gap';
                $pageInfo['gap'] = true;
            }

            if ($pageInfo['status'] === 'gap') {
                $pageInfo['text'] = '…';
                if ($pageIndex < $currentPage) {
                    $pageIndex = $currentPage - $adjacentPages;
                } elseif ($pageIndex > $currentPage) {
                    $pageIndex = $numberOfPages;
                }
            } else {
                $pageInfo['text'] = (string)$pageIndex;
                ++$pageIndex;
            }

            $pages[] = $pageInfo;
        }

        return [
            'pages' => $pages,
            'current' => $currentPage,
            'previous' => ($currentPage === 1) ? null : $currentPage - 1,
            'next' => ($currentPage === $numberOfPages) ? null : $currentPage + 1,
        ];
    }
}

<?php

namespace Subugoe\Find\Tests\Unit\ViewHelpers\Find;

/* * *************************************************************
 *  Copyright notice
 *
 *  (c) 2013 Ingo Pfennigstorf <pfennigstorf@sub-goettingen.de>
 *
 *  All rights reserved
 *
 *  This script is part of the TYPO3 project. The TYPO3 project is
 *  free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  The GNU General Public License can be found at
 *  http://www.gnu.org/copyleft/gpl.html.
 *
 *  This script is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  This copyright notice MUST APPEAR in all copies of the script!
 * ************************************************************* */

use PHPUnit\Framework\Attributes\Test;
use Subugoe\Find\ViewHelpers\Find\FacetLinkArgumentsViewHelper;
use TYPO3\TestingFramework\Core\Unit\UnitTestCase;
use TYPO3Fluid\Fluid\Core\Rendering\RenderingContextInterface;
use TYPO3Fluid\Fluid\Core\ViewHelper\ViewHelperInvoker;
use TYPO3Fluid\Fluid\View\TemplateView;

class FacetLinkArgumentsViewHelperTest extends UnitTestCase
{
    private ViewHelperInvoker $invoker;

    private RenderingContextInterface $renderingContext;

    protected function setUp(): void
    {
        parent::setUp();
        $this->renderingContext = (new TemplateView())->getRenderingContext();
        $this->invoker = new ViewHelperInvoker();
    }

    private function invoke(array $arguments): array
    {
        return (array)$this->invoker->invoke(
            FacetLinkArgumentsViewHelper::class,
            $arguments,
            $this->renderingContext,
        );
    }

    #[Test]
    public function filterIsCorrectlyRemovedOnTextQueries(): void
    {
        $result = $this->invoke([
            'facetID' => 'title',
            'facetTerm' => 'hrdr',
            'activeFacets' => ['title' => ['hrdr' => 1], 'horus' => 'behedeti'],
            'mode' => 'remove',
        ]);

        self::assertSame('tx_find_find[facet][title][hrdr]', $result[0]);
        self::assertSame('tx_find_find[page]', $result[1]);
    }

    #[Test]
    public function filterIsCorrectlyAddedOnTextQueries(): void
    {
        $result = $this->invoke([
            'facetID' => 'title',
            'facetTerm' => 'hrdr',
            'activeFacets' => [],
            'mode' => 'add',
        ]);

        self::assertSame(['hrdr' => 1], $result['facet']['title']);
    }

    #[Test]
    public function removeWithoutMatchingFacetIdReturnsOnlyPageReset(): void
    {
        $result = $this->invoke([
            'facetID' => 'nonexistent',
            'facetTerm' => 'hrdr',
            'activeFacets' => ['title' => ['hrdr' => 1]],
            'mode' => 'remove',
        ]);

        // facetID not in activeFacets - only page reset is added
        self::assertSame(['tx_find_find[page]'], $result);
    }

    #[Test]
    public function removeWithEmptyActiveFacetsReturnsEmptyArray(): void
    {
        $result = $this->invoke([
            'facetID' => 'title',
            'facetTerm' => 'hrdr',
            'activeFacets' => [],
            'mode' => 'remove',
        ]);

        // When activeFacets is empty, the remove block is skipped entirely
        self::assertSame([], $result);
    }

    #[Test]
    public function addModeReturnsCorrectStructure(): void
    {
        $result = $this->invoke([
            'facetID' => 'author',
            'facetTerm' => 'Porst',
            'activeFacets' => [],
            'mode' => 'add',
        ]);

        self::assertArrayHasKey('facet', $result);
        self::assertArrayHasKey('author', $result['facet']);
        self::assertSame(['Porst' => 1], $result['facet']['author']);
    }
}

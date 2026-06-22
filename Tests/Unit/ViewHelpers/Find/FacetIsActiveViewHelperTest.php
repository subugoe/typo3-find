<?php

namespace Subugoe\Find\Tests\Unit\ViewHelpers\Find;

/* * *************************************************************
 *  Copyright notice
 *
 *  (c) 2015 Ingo Pfennigstorf <pfennigstorf@sub-goettingen.de>
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
use Subugoe\Find\ViewHelpers\Find\FacetIsActiveViewHelper;
use TYPO3\TestingFramework\Core\Unit\UnitTestCase;
use TYPO3Fluid\Fluid\Core\Rendering\RenderingContextInterface;
use TYPO3Fluid\Fluid\Core\ViewHelper\ViewHelperInvoker;
use TYPO3Fluid\Fluid\View\TemplateView;

class FacetIsActiveViewHelperTest extends UnitTestCase
{
    private ViewHelperInvoker $invoker;

    private RenderingContextInterface $renderingContext;

    private array $activeFacets = [
        [
            ['id' => 'horus', 'term' => 'behedeti'],
            ['id' => 'hrdr', 'term' => 'horus'],
        ],
    ];

    protected function setUp(): void
    {
        parent::setUp();
        $this->renderingContext = (new TemplateView())->getRenderingContext();
        $this->invoker = new ViewHelperInvoker();
    }

    private function invoke(string $facetID, ?string $facetTerm, array $activeFacets): bool
    {
        return (bool)$this->invoker->invoke(
            FacetIsActiveViewHelper::class,
            [
                'facetID' => $facetID,
                'facetTerm' => $facetTerm,
                'activeFacets' => $activeFacets,
            ],
            $this->renderingContext,
        );
    }

    #[Test]
    public function activeFacetIsCorrectlyRecognized(): void
    {
        self::assertTrue($this->invoke('horus', 'behedeti', $this->activeFacets));
    }

    #[Test]
    public function notActiveFacetReturnsFalse(): void
    {
        self::assertFalse($this->invoke('behedeti', 'behedeti', $this->activeFacets));
    }

    #[Test]
    public function nullFacetTermMatchesAnyTermForGivenId(): void
    {
        self::assertTrue($this->invoke('horus', null, $this->activeFacets));
    }

    #[Test]
    public function nullFacetTermReturnsFalseWhenIdNotFound(): void
    {
        self::assertFalse($this->invoke('nonexistent', null, $this->activeFacets));
    }

    #[Test]
    public function emptyActiveFacetsReturnsFalse(): void
    {
        self::assertFalse($this->invoke('horus', 'behedeti', []));
    }

    #[Test]
    public function secondFacetInListIsCorrectlyRecognized(): void
    {
        self::assertTrue($this->invoke('hrdr', 'horus', $this->activeFacets));
    }
}

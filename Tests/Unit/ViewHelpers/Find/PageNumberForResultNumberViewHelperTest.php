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
use Subugoe\Find\Tests\Unit\ViewHelpers\MockRenderingContextTrait;
use Subugoe\Find\ViewHelpers\Find\PageNumberForResultNumberViewHelper;
use TYPO3\CMS\Core\Tests\BaseTestCase;

/**
 * Test for PageNumberForResultNumber ViewHelper.
 */
class PageNumberForResultNumberViewHelperTest extends BaseTestCase
{
    use MockRenderingContextTrait;

    /**
     * @var \Subugoe\Find\ViewHelpers\Find\PageNumberForResultNumberViewHelper
     */
    public $fixture;

    public function setUp()
    {
        parent::setUp();

        $this->fixture = $this->getAccessibleMock(PageNumberForResultNumberViewHelper::class, ['renderChildren']);
        $this->fixture->initializeArguments();

        $this->createRenderingContextMock();
        $this->inject($this->fixture, 'renderingContext', $this->renderingContextMock);
    }

    /**
     * @test
     */
    public function pageNumberIsCorrectlyCalculated()
    {
        $resultNumber = 55;
        $resultsPerPage = 20;

        $expected = 3;

        $this->assertSame($expected, $this->fixture->render($resultNumber, $resultsPerPage));
    }

    /**
     * @test
     */
    public function pageNumerWhenResultIsZero()
    {
        $resultNumber = 0;
        $resultsPerPage = 20;

        $expected = 0;

        $this->assertSame($expected, $this->fixture->render($resultNumber, $resultsPerPage));
    }

    /**
     * @test
     */
    public function divisionByZeroIsCaught()
    {
        $resultNumber = 0;
        $resultsPerPage = 0;

        $expected = 0;

        $this->assertSame($expected, $this->fixture->render($resultNumber, $resultsPerPage));
    }

    public function pageNumberFallBackForZeroResultsPerPage()
    {
        $resultNumber = 55;
        $resultsPerPage = 0;

        $expected = 3;

        $this->assertSame($expected, $this->fixture->render($resultNumber, $resultsPerPage));
    }
}

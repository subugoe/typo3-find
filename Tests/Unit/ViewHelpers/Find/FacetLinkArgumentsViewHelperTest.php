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

use Nimut\TestingFramework\TestCase\ViewHelperBaseTestcase;
use Subugoe\Find\Tests\Unit\ViewHelpers\MockRenderingContextTrait;
use Subugoe\Find\ViewHelpers\Find\FacetLinkArgumentsViewHelper;

/**
 * Test for FacetLinkArguments ViewHelper.
 */
class FacetLinkArgumentsViewHelperTest extends ViewHelperBaseTestcase
{
    use MockRenderingContextTrait;

    /**
     * @var \Subugoe\Find\ViewHelpers\Find\FacetLinkArgumentsViewHelper
     */
    public $fixture;

    public function setUp()
    {
        parent::setUp();
        $this->fixture = $this->getMockBuilder(FacetLinkArgumentsViewHelper::class)->setMethods(['dummy'])->getMock();
        $this->fixture->initializeArguments();
        $this->createRenderingContextMock();
        $this->inject($this->fixture, 'renderingContext', $this->renderingContextMock);
    }

    /**
     * @test
     */
    public function filterIsCorrectlyRemovedOnTextQueries()
    {
        $this->fixture->setArguments([
            'facetID' => 'title',
            'facetTerm' => 'hrdr',
            'activeFacets' => ['title' => ['hrdr'], 'horus' => 'behedeti'],
            'mode' => 'remove',
        ]);

        $result = $this->fixture->render();
        $this->assertEquals('tx_find_find[facet][title]', $result[0]);
    }

    /**
     * @test
     */
    public function filterIsCorrectlyAddedOnTextQueries()
    {
        $this->fixture->setArguments([
            'facetID' => 'title',
            'facetTerm' => 'hrdr',
            'activeFacets' => [],
            'mode' => 'add',
        ]);

        $result = $this->fixture->render();
        $resultValue = array_keys($result['facet']['title']);
        $this->assertEquals('hrdr', $resultValue[0]);
    }
}

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
use Subugoe\Find\ViewHelpers\Find\FacetLinkArgumentsViewHelper;
use TYPO3\CMS\Core\Tests\BaseTestCase;

/**
 * Test for FacetLinkArguments ViewHelper.
 */
class FacetLinkArgumentsViewHelperTest extends BaseTestCase
{
    /**
     * @var \Subugoe\Find\ViewHelpers\Find\FacetLinkArgumentsViewHelper
     */
    public $fixture;

    public function setUp()
    {
        parent::setUp();
        $this->fixture = $this->getAccessibleMock(FacetLinkArgumentsViewHelper::class, ['renderChildren']);
        $this->fixture->initializeArguments();
    }

    /**
     * @test
     */
    public function filterIsCorrectlyRemovedOnTextQueries()
    {
        $result = $this->fixture->render('title', 'hrdr', ['title' => ['hrdr'], 'horus' => 'behedeti'], 'remove');
        $this->assertEquals('tx_find_find[facet][title]', $result[0]);
    }

    /**
     * @test
     */
    public function filterIsCorrectlyAddedOnTextQueries()
    {
        $result = $this->fixture->render('title', 'hrdr', [], 'add');
        $resultValue = array_keys($result['facet']['title']);
        $this->assertEquals('hrdr', $resultValue[0]);
    }
}

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

use Subugoe\Find\ViewHelpers\Find\HighlightFieldViewHelper;
use TYPO3\CMS\Core\Tests\BaseTestCase;

/**
 * Test for HighlightField ViewHelper.
 */
class HighlightFieldViewHelperTest extends BaseTestCase
{
    /**
     * @var \Subugoe\Find\ViewHelpers\Find\HighlightFieldViewHelper
     */
    public $fixture;

    protected $solariumClient;

    protected $solariumResponse;

    public function setUp()
    {
        parent::setUp();

        $this->fixture = $this->getAccessibleMock(HighlightFieldViewHelper::class, ['renderChildren']);
        $this->fixture->initializeArguments();
    }

    /**
     * @test
     */
    public function fieldIsCorrectlyHighlighted()
    {
        $this->markTestIncomplete('Still something to do with mocking solarium');
    }
}

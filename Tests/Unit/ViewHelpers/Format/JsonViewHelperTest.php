<?php

namespace Subugoe\Find\Tests\Unit\ViewHelpers\Format;

/* * *************************************************************
 *  Copyright notice
 *
 *  (c) 2015 Ingo Pfennigstorf <pfennigstorf@sub-goettingen.de>
 *      Goettingen State Library
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
use Subugoe\Find\ViewHelpers\Format\JsonViewHelper;

/**
 * Json viewhelper test.
 */
class JsonViewHelperTest extends ViewHelperBaseTestcase
{
    /**
     * @var JsonViewHelper
     */
    protected $fixture;

    public function setUp()
    {
        parent::setUp();
        $this->fixture = $this->getMockBuilder(JsonViewHelper::class)->setMethods(['dummy'])->getMock();
        $this->injectDependenciesIntoViewHelper($this->fixture);
    }

    /**
     * @test
     */
    public function arrayIsRenderedAsJsonString()
    {
        $data = ['hrdr', 'behedeti', 'chub'];

        $this->fixture->setArguments([
            'data' => $data,
        ]);

        $expected = '["hrdr","behedeti","chub"]';
        $this->assertSame($expected, $this->fixture->initializeArgumentsAndRender());
    }

    /**
     * @test
     */
    public function integerIsRenderedAsJson()
    {
        $data = 667;

        $this->fixture->setArguments([
            'data' => $data,
        ]);

        $expected = '667';
        $this->assertSame($expected, $this->fixture->initializeArgumentsAndRender());
    }

    /**
     * @test
     */
    public function stringIsRenderedAsJson()
    {
        $data = 'hrdr behedeti mate';

        $this->fixture->setArguments([
            'data' => $data,
        ]);

        $expected = '"hrdr behedeti mate"';
        $this->assertSame($expected, $this->fixture->initializeArgumentsAndRender());
    }

    /**
     * @test
     */
    public function floatIsRenderedAsJson()
    {
        $data = 667.67;

        $this->fixture->setArguments([
            'data' => $data,
        ]);

        $expected = '667.67';
        $this->assertSame($expected, $this->fixture->initializeArgumentsAndRender());
    }
}

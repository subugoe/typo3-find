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
use Subugoe\Find\ViewHelpers\Format\JoinViewHelper;

/**
 * Join viewhelper test.
 */
class JoinViewHelperTest extends ViewHelperBaseTestcase
{
    /**
     * @var JoinViewHelper
     */
    protected $fixture;

    protected function setUp(): void
    {
        parent::setUp();

        $this->fixture = $this->getMockBuilder(JoinViewHelper::class)
            ->addMethods(['dummy'])
            ->getMock();
        $this->injectDependenciesIntoViewHelper($this->fixture);
    }

    /**
     * @test
     */
    public function arrayIsJoinedAsCommaSeparatedValue()
    {
        $array = ['hrdr', 'behedeti', 'chub'];
        $separator = ',';

        $this->fixture->setArguments([
            'array' => $array,
            'separator' => $separator,
        ]);

        $expected = 'hrdr,behedeti,chub';
        self::assertSame($expected, $this->fixture->initializeArgumentsAndRender());
    }

    /**
     * @test
     */
    public function arrayIsJoinedWithNonAsciiCharacter()
    {
        $array = ['hrdr', 'behedeti', 'chub'];
        $separator = '€';

        $this->fixture->setArguments([
            'array' => $array,
            'separator' => $separator,
        ]);

        $expected = 'hrdr€behedeti€chub';
        self::assertSame($expected, $this->fixture->initializeArgumentsAndRender());
    }

    /**
     * @test
     */
    public function arrayIsJoinedWithMoreThanOneCharacter()
    {
        $array = ['hrdr', 'behedeti', 'chub'];
        $separator = '€$';

        $this->fixture->setArguments([
            'array' => $array,
            'separator' => $separator,
        ]);

        $expected = 'hrdr€$behedeti€$chub';
        self::assertSame($expected, $this->fixture->initializeArgumentsAndRender());
    }

    /**
     * @test
     */
    public function arrayWithOneElementIsNotPostfixedWithSeparator()
    {
        $array = ['hrdr'];
        $separator = '€$';

        $this->fixture->setArguments([
            'array' => $array,
            'separator' => $separator,
        ]);

        $expected = 'hrdr';
        self::assertSame($expected, $this->fixture->initializeArgumentsAndRender());
    }

    /**
     * @test
     */
    public function emptyArrayResultsInEmptyString()
    {
        $array = [];
        $separator = '€$';

        $this->fixture->setArguments([
            'array' => $array,
            'separator' => $separator,
        ]);

        $expected = '';
        self::assertSame($expected, $this->fixture->initializeArgumentsAndRender());
    }
}

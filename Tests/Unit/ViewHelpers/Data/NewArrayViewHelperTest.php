<?php

namespace Subugoe\Find\Tests\Unit\ViewHelpers\Data;

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

use Nimut\TestingFramework\TestCase\ViewHelperBaseTestcase;
use Subugoe\Find\ViewHelpers\Data\NewArrayViewHelper;

/**
 * Test for NewArray ViewHelper.
 */
class NewArrayViewHelperTest extends ViewHelperBaseTestcase
{
    /**
     * @var NewArrayViewHelper
     */
    public $fixture;

    protected function setUp(): void
    {
        parent::setUp();
        $this->fixture = $this->getMockBuilder(NewArrayViewHelper::class)
            ->onlyMethods(['renderChildren'])
            ->getMock();
        $this->injectDependenciesIntoViewHelper($this->fixture);
    }

    /**
     * @test
     */
    public function aNewArrayFromArgumentsIsCorrectlyCreated(): void
    {
        $arguments = [
            'array' => ['array'],
            'keys' => ['hrdr'],
            'values' => ['behedeti'],
            'global' => false,
            'omitEmptyFields' => false,
        ];

        $expected = [
            0 => 'array',
            'hrdr' => 'behedeti',
        ];

        $this->fixture->setArguments($arguments);
        self::assertSame($expected, $this->fixture->initializeArgumentsAndRender());
    }

    /**
     * @test
     */
    public function aNewArrayWithoutAnExistingOneIsCreated(): void
    {
        $arguments = [
            'keys' => ['hrdr'],
            'values' => ['behedeti'],
            'global' => false,
            'omitEmptyFields' => false,
        ];

        $expected = [
            'hrdr' => 'behedeti',
        ];

        $this->fixture->setArguments($arguments);
        self::assertSame($expected, $this->fixture->initializeArgumentsAndRender());
    }

    /**
     * @test
     */
    public function aNewArrayWithMultipleEntriesIsCreated(): void
    {
        $arguments = [
            'keys' => ['hrdr', 'horus'],
            'values' => ['behedeti', 'edfu'],
            'global' => false,
            'omitEmptyFields' => false,
        ];

        $expected = [
            'hrdr' => 'behedeti',
            'horus' => 'edfu',
        ];

        $this->fixture->setArguments($arguments);
        self::assertSame($expected, $this->fixture->initializeArgumentsAndRender());
    }

    /**
     * @test
     */
    public function emptyStringsAsArrayKeysAreConsideredAsKeysAndValues(): void
    {
        $arguments = [
            'keys' => ['hrdr', 'horus', ''],
            'values' => ['behedeti', 'edfu', ''],
            'global' => false,
            'omitEmptyFields' => false,
        ];

        $expected = [
            'hrdr' => 'behedeti',
            'horus' => 'edfu',
            '' => '',
        ];

        $this->fixture->setArguments($arguments);
        self::assertSame($expected, $this->fixture->initializeArgumentsAndRender());
    }
}

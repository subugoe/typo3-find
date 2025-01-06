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

use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\MockObject\MockObject;
use Subugoe\Find\ViewHelpers\Data\NewArrayViewHelper;
use TYPO3\CMS\Fluid\Core\Rendering\RenderingContext;
use TYPO3\TestingFramework\Core\BaseTestCase;

/**
 * Test for NewArray ViewHelper.
 */
class NewArrayViewHelperTest extends BaseTestCase
{
    /**
     * @var NewArrayViewHelper
     */
    public NewArrayViewHelper|MockObject $fixture;

    protected function setUp(): void
    {
        parent::setUp();
        $this->fixture = $this->getAccessibleMock(NewArrayViewHelper::class, null);
        $this->fixture->setRenderingContext($this->getMockBuilder(RenderingContext::class)->disableOriginalConstructor()->getMock());
    }

    #[Test]
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

    #[Test]
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

    #[Test]
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

    #[Test]
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

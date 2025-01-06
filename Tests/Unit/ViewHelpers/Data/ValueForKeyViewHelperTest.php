<?php

namespace Subugoe\Find\Tests\Unit\ViewHelpers\Data;

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
use Subugoe\Find\Tests\Unit\ViewHelpers\MockRenderingContextTrait;
use Subugoe\Find\ViewHelpers\Data\ValueForKeyViewHelper;
use TYPO3\CMS\Fluid\Core\Rendering\RenderingContext;
use TYPO3\TestingFramework\Core\BaseTestCase;

/**
 * Test for ValueForKey ViewHelper.
 */
class ValueForKeyViewHelperTest extends BaseTestCase
{
    use MockRenderingContextTrait;

    /**
     * @var ValueForKeyViewHelper
     */
    public $fixture;

    protected function setUp(): void
    {
        parent::setUp();

        $this->fixture = $this->getAccessibleMock(ValueForKeyViewHelper::class, null);
        $this->fixture->setRenderingContext($this->getMockBuilder(RenderingContext::class)->disableOriginalConstructor()->getMock());
    }

    #[Test]
    public function keyPicksTheRightValueFromTheArray()
    {
        $array = [
            'a' => 'b',
            'b' => 'c',
        ];
        $key = 'a';

        $this->fixture->setArguments([
            'array' => $array,
            'key' => $key,
        ]);

        self::assertSame('b', $this->fixture->initializeArgumentsAndRender());
    }

    #[Test]
    public function resultIsCorrectlyInterpretedAsJsonFromASimpleValue()
    {
        $array = [
            'a' => 'b',
            'b' => 'c',
        ];
        $key = 'a';

        $this->fixture->setArguments([
            'array' => $array,
            'key' => $key,
            'format' => 'json',
        ]);

        self::assertSame('b', $this->fixture->initializeArgumentsAndRender());
    }

    #[Test]
    public function resultIsCorrectlyInterpretedAsTextFromASimpleValue()
    {
        $array = [
            'a' => 'b',
            'b' => 'c',
        ];
        $key = 'a';

        $this->fixture->setArguments([
            'array' => $array,
            'key' => $key,
            'format' => 'json',
        ]);

        self::assertSame('b', $this->fixture->initializeArgumentsAndRender());
    }

    #[Test]
    public function providingANonexistingKeyReturnsNull()
    {
        $array = [
            'a' => 'b',
            'b' => 'c',
        ];
        $key = 'c';

        $this->fixture->setArguments([
            'array' => $array,
            'key' => $key,
        ]);

        self::assertNull($this->fixture->initializeArgumentsAndRender());
    }
}

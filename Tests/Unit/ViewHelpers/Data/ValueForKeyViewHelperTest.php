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

use Subugoe\Find\Tests\Unit\ViewHelpers\MockRenderingContextTrait;
use Subugoe\Find\ViewHelpers\Data\ValueForKeyViewHelper;
use TYPO3\CMS\Core\Tests\BaseTestCase;

/**
 * Test for ValueForKey ViewHelper.
 */
class ValueForKeyViewHelperTest extends BaseTestCase
{
    use MockRenderingContextTrait;

    /**
     * @var \Subugoe\Find\ViewHelpers\Data\ValueForKeyViewHelper
     */
    public $fixture;

    public function setUp()
    {
        parent::setUp();

        $this->fixture = $this->getAccessibleMock(ValueForKeyViewHelper::class, ['renderChildren']);
        $this->fixture->initializeArguments();

        $this->createRenderingContextMock();
        $this->inject($this->fixture, 'renderingContext', $this->renderingContextMock);
    }

    /**
     * @test
     */
    public function keyPicksTheRightValueFromTheArray()
    {
        $array = [
            'a' => 'b',
            'b' => 'c',
        ];
        $key = 'a';
        $this->assertSame('b', $this->fixture->render($array, $key));
    }

    /**
     * @test
     */
    public function resultIsCorrectlyInterpretedAsJsonFromASimpleValue()
    {
        $array = [
            'a' => 'b',
            'b' => 'c',
        ];
        $key = 'a';
        $this->fixture->setArguments(['format' => 'json']);
        $this->assertSame('b', $this->fixture->render($array, $key));
    }

    /**
     * @test
     */
    public function resultIsCorrectlyInterpretedAsTextFromASimpleValue()
    {
        $array = [
            'a' => 'b',
            'b' => 'c',
        ];
        $key = 'a';
        $this->fixture->setArguments(['format' => 'json']);
        $this->assertSame('b', $this->fixture->render($array, $key));
    }

    /**
     * @test
     */
    public function providingANonexistingKeyReturnsNull()
    {
        $array = [
            'a' => 'b',
            'b' => 'c',
        ];
        $key = 'c';
        $this->assertNull($this->fixture->render($array, $key));
    }
}

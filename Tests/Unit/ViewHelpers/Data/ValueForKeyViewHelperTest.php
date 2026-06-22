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
use Subugoe\Find\ViewHelpers\Data\ValueForKeyViewHelper;
use TYPO3\TestingFramework\Core\Unit\UnitTestCase;
use TYPO3Fluid\Fluid\Core\Rendering\RenderingContextInterface;
use TYPO3Fluid\Fluid\Core\ViewHelper\ViewHelperInvoker;
use TYPO3Fluid\Fluid\View\TemplateView;

class ValueForKeyViewHelperTest extends UnitTestCase
{
    private ViewHelperInvoker $invoker;

    private RenderingContextInterface $renderingContext;

    private array $defaultArray = [
        'a' => 'b',
        'b' => 'c',
    ];

    protected function setUp(): void
    {
        parent::setUp();
        $this->renderingContext = (new TemplateView())->getRenderingContext();
        $this->invoker = new ViewHelperInvoker();
    }

    private function invoke(array $array, string $key): mixed
    {
        return $this->invoker->invoke(
            ValueForKeyViewHelper::class,
            ['array' => $array, 'key' => $key],
            $this->renderingContext,
        );
    }

    #[Test]
    public function keyPicksTheRightValueFromTheArray(): void
    {
        self::assertSame('b', $this->invoke($this->defaultArray, 'a'));
    }

    #[Test]
    public function secondKeyPicksTheRightValueFromTheArray(): void
    {
        self::assertSame('c', $this->invoke($this->defaultArray, 'b'));
    }

    #[Test]
    public function providingANonexistingKeyReturnsNull(): void
    {
        self::assertNull($this->invoke($this->defaultArray, 'c'));
    }

    #[Test]
    public function emptyArrayReturnsNull(): void
    {
        self::assertNull($this->invoke([], 'a'));
    }
}

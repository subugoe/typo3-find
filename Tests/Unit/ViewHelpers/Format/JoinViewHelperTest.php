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

use PHPUnit\Framework\Attributes\Test;
use Subugoe\Find\ViewHelpers\Format\JoinViewHelper;
use TYPO3\TestingFramework\Core\Unit\UnitTestCase;
use TYPO3Fluid\Fluid\Core\Rendering\RenderingContextInterface;
use TYPO3Fluid\Fluid\Core\ViewHelper\ViewHelperInvoker;
use TYPO3Fluid\Fluid\View\TemplateView;

class JoinViewHelperTest extends UnitTestCase
{
    private ViewHelperInvoker $invoker;

    private RenderingContextInterface $renderingContext;

    protected function setUp(): void
    {
        parent::setUp();
        $this->renderingContext = (new TemplateView())->getRenderingContext();
        $this->invoker = new ViewHelperInvoker();
    }

    private function invoke(array $array, string $separator): string
    {
        return (string)$this->invoker->invoke(
            JoinViewHelper::class,
            ['array' => $array, 'separator' => $separator],
            $this->renderingContext,
        );
    }

    #[Test]
    public function arrayIsJoinedAsCommaSeparatedValue(): void
    {
        self::assertSame('hrdr,behedeti,chub', $this->invoke(['hrdr', 'behedeti', 'chub'], ','));
    }

    #[Test]
    public function arrayIsJoinedWithNonAsciiCharacter(): void
    {
        self::assertSame('hrdr€behedeti€chub', $this->invoke(['hrdr', 'behedeti', 'chub'], '€'));
    }

    #[Test]
    public function arrayIsJoinedWithMoreThanOneCharacter(): void
    {
        self::assertSame('hrdr€$behedeti€$chub', $this->invoke(['hrdr', 'behedeti', 'chub'], '€$'));
    }

    #[Test]
    public function arrayWithOneElementIsNotPostfixedWithSeparator(): void
    {
        self::assertSame('hrdr', $this->invoke(['hrdr'], '€$'));
    }

    #[Test]
    public function emptyArrayResultsInEmptyString(): void
    {
        self::assertSame('', $this->invoke([], '€$'));
    }
}

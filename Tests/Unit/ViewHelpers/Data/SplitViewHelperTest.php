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
use Subugoe\Find\ViewHelpers\Data\SplitViewHelper;
use TYPO3\TestingFramework\Core\Unit\UnitTestCase;
use TYPO3Fluid\Fluid\Core\Rendering\RenderingContextInterface;
use TYPO3Fluid\Fluid\Core\ViewHelper\ViewHelperInvoker;
use TYPO3Fluid\Fluid\View\TemplateView;

class SplitViewHelperTest extends UnitTestCase
{
    private ViewHelperInvoker $invoker;

    private RenderingContextInterface $renderingContext;

    protected function setUp(): void
    {
        parent::setUp();
        $this->renderingContext = (new TemplateView())->getRenderingContext();
        $this->invoker = new ViewHelperInvoker();
    }

    private function invoke(string $string, string $separator = SplitViewHelper::DEFAULT_SEPARATOR): array
    {
        return (array)$this->invoker->invoke(
            SplitViewHelper::class,
            ['string' => $string, 'separator' => $separator],
            $this->renderingContext,
        );
    }

    #[Test]
    public function stringIsExplodedCorrectlyWithDefaultSeparator(): void
    {
        self::assertSame(['hrdr', 'behedeti', 'horus'], $this->invoke('hrdr, behedeti, horus'));
    }

    #[Test]
    public function stringIsExplodedCorrectlyWithPassedSeparator(): void
    {
        self::assertSame(['hrdr', 'behedeti', 'horus'], $this->invoke('hrdr, behedeti, horus', ', '));
    }

    #[Test]
    public function stringIsExplodedCorrectlyWithNonDefaultSeparator(): void
    {
        self::assertSame(['hrdr', 'behedeti', 'horus'], $this->invoke('hrdrhorus behedetihorus horus', 'horus '));
    }

    #[Test]
    public function emptyStringReturnsArrayWithEmptyString(): void
    {
        self::assertSame([''], $this->invoke(''));
    }

    #[Test]
    public function stringWithNoSeparatorReturnsArrayWithSingleElement(): void
    {
        self::assertSame(['hrdr'], $this->invoke('hrdr'));
    }

    #[Test]
    public function renderChildrenIsUsedWhenStringIsNull(): void
    {
        $result = (array)$this->invoker->invoke(
            SplitViewHelper::class,
            ['separator' => ', '],
            $this->renderingContext,
            static fn(): string => 'hrdr, behedeti',
        );

        self::assertSame(['hrdr', 'behedeti'], $result);
    }
}

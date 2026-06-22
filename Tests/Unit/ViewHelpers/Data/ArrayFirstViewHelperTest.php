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
use Subugoe\Find\ViewHelpers\Data\ArrayFirstViewHelper;
use TYPO3\TestingFramework\Core\Unit\UnitTestCase;
use TYPO3Fluid\Fluid\Core\Rendering\RenderingContextInterface;
use TYPO3Fluid\Fluid\Core\ViewHelper\ViewHelperInvoker;
use TYPO3Fluid\Fluid\View\TemplateView;

class ArrayFirstViewHelperTest extends UnitTestCase
{
    private ViewHelperInvoker $invoker;

    private RenderingContextInterface $renderingContext;

    protected function setUp(): void
    {
        parent::setUp();
        $this->renderingContext = (new TemplateView())->getRenderingContext();
        $this->invoker = new ViewHelperInvoker();
    }

    private function invoke(mixed $array): mixed
    {
        return $this->invoker->invoke(
            ArrayFirstViewHelper::class,
            ['array' => $array],
            $this->renderingContext,
            static fn(): null => null,
        );
    }

    #[Test]
    public function firstElementOfArrayIsReturned(): void
    {
        self::assertSame('hrdr', $this->invoke(['hrdr', 'horus', 'behedeti']));
    }

    #[Test]
    public function nullIsReturnedOnNullValue(): void
    {
        self::assertNull($this->invoke(null));
    }

    #[Test]
    public function nullIsReturnedWhenPassingAStringInsteadOfAnArray(): void
    {
        // String without comma: treated as single-element array → returns the trimmed string
        // String 'hrdr' → ['hrdr'] → 'hrdr'
        self::assertSame('hrdr', $this->invoke('hrdr'));
    }

    #[Test]
    public function firstValueFromAssociativeArrayIsReturned(): void
    {
        self::assertSame('horus', $this->invoke(['hrdr' => 'horus', 'behedeti']));
    }

    #[Test]
    public function emptyArrayReturnsNull(): void
    {
        self::assertNull($this->invoke([]));
    }

    #[Test]
    public function traversableReturnsFirstValue(): void
    {
        self::assertSame('hrdr', $this->invoke(new \ArrayIterator(['hrdr', 'horus'])));
    }

    #[Test]
    public function commaSeparatedStringReturnsFirstPart(): void
    {
        self::assertSame('hrdr', $this->invoke('hrdr, horus, behedeti'));
    }

    #[Test]
    public function renderChildrenIsUsedWhenArrayArgumentIsOmitted(): void
    {
        $result = $this->invoker->invoke(
            ArrayFirstViewHelper::class,
            [],
            $this->renderingContext,
            static fn(): array => ['hrdr', 'horus'],
        );

        self::assertSame('hrdr', $result);
    }
}

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
use Subugoe\Find\ViewHelpers\Data\IsArrayViewHelper;
use TYPO3\TestingFramework\Core\Unit\UnitTestCase;
use TYPO3Fluid\Fluid\Core\Rendering\RenderingContextInterface;
use TYPO3Fluid\Fluid\Core\ViewHelper\ViewHelperInvoker;
use TYPO3Fluid\Fluid\View\TemplateView;

class IsArrayViewHelperTest extends UnitTestCase
{
    private ViewHelperInvoker $invoker;

    private RenderingContextInterface $renderingContext;

    protected function setUp(): void
    {
        parent::setUp();
        $this->renderingContext = (new TemplateView())->getRenderingContext();
        $this->invoker = new ViewHelperInvoker();
    }

    private function invoke(mixed $subject): bool
    {
        return (bool)$this->invoker->invoke(
            IsArrayViewHelper::class,
            ['subject' => $subject],
            $this->renderingContext,
            static fn(): null => null,
        );
    }

    #[Test]
    public function arrayIsInterpretedAsArray(): void
    {
        self::assertTrue($this->invoke(['hrdr']));
    }

    #[Test]
    public function intIsNotInterpretedAsArray(): void
    {
        self::assertFalse($this->invoke(667));
    }

    #[Test]
    public function stringIsNotInterpretedAsArray(): void
    {
        self::assertFalse($this->invoke('hrdr'));
    }

    #[Test]
    public function nullIsNotInterpretedAsArray(): void
    {
        $result = (bool)$this->invoker->invoke(
            IsArrayViewHelper::class,
            ['subject' => null],
            $this->renderingContext,
            static fn(): null => null,
        );

        self::assertFalse($result);
    }

    #[Test]
    public function traversableIsInterpretedAsArray(): void
    {
        self::assertTrue($this->invoke(new \ArrayIterator(['hrdr'])));
    }

    #[Test]
    public function emptyArrayIsInterpretedAsArray(): void
    {
        self::assertTrue($this->invoke([]));
    }

    #[Test]
    public function renderChildrenIsUsedWhenSubjectIsNull(): void
    {
        $result = (bool)$this->invoker->invoke(
            IsArrayViewHelper::class,
            [],
            $this->renderingContext,
            static fn(): array => ['hrdr'],
        );

        self::assertTrue($result);
    }
}

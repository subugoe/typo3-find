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
use Subugoe\Find\ViewHelpers\Data\NewArrayViewHelper;
use TYPO3\TestingFramework\Core\Unit\UnitTestCase;
use TYPO3Fluid\Fluid\Core\Rendering\RenderingContextInterface;
use TYPO3Fluid\Fluid\Core\ViewHelper\ViewHelperInvoker;
use TYPO3Fluid\Fluid\View\TemplateView;

class NewArrayViewHelperTest extends UnitTestCase
{
    private ViewHelperInvoker $invoker;

    private RenderingContextInterface $renderingContext;

    protected function setUp(): void
    {
        parent::setUp();
        $this->renderingContext = (new TemplateView())->getRenderingContext();
        $this->invoker = new ViewHelperInvoker();
    }

    private function invoke(array $arguments): mixed
    {
        return $this->invoker->invoke(
            NewArrayViewHelper::class,
            $arguments,
            $this->renderingContext,
        );
    }

    #[Test]
    public function aNewArrayFromArgumentsIsCorrectlyCreated(): void
    {
        $result = $this->invoke([
            'array' => ['array'],
            'keys' => ['hrdr'],
            'values' => ['behedeti'],
            'global' => false,
            'omitEmptyFields' => false,
        ]);

        self::assertSame([0 => 'array', 'hrdr' => 'behedeti'], $result);
    }

    #[Test]
    public function aNewArrayWithoutAnExistingOneIsCreated(): void
    {
        $result = $this->invoke([
            'keys' => ['hrdr'],
            'values' => ['behedeti'],
            'global' => false,
            'omitEmptyFields' => false,
        ]);

        self::assertSame(['hrdr' => 'behedeti'], $result);
    }

    #[Test]
    public function aNewArrayWithMultipleEntriesIsCreated(): void
    {
        $result = $this->invoke([
            'keys' => ['hrdr', 'horus'],
            'values' => ['behedeti', 'edfu'],
            'global' => false,
            'omitEmptyFields' => false,
        ]);

        self::assertSame(['hrdr' => 'behedeti', 'horus' => 'edfu'], $result);
    }

    #[Test]
    public function emptyStringsAsArrayKeysAreConsideredAsKeysAndValues(): void
    {
        $result = $this->invoke([
            'keys' => ['hrdr', 'horus', ''],
            'values' => ['behedeti', 'edfu', ''],
            'global' => false,
            'omitEmptyFields' => false,
        ]);

        self::assertSame(['hrdr' => 'behedeti', 'horus' => 'edfu', '' => ''], $result);
    }

    #[Test]
    public function omitEmptyFieldsSkipsEmptyValues(): void
    {
        $result = $this->invoke([
            'keys' => ['hrdr', 'horus', 'empty'],
            'values' => ['behedeti', 'edfu', ''],
            'global' => false,
            'omitEmptyFields' => true,
        ]);

        self::assertSame(['hrdr' => 'behedeti', 'horus' => 'edfu'], $result);
    }

    #[Test]
    public function noKeysAppendsValuesNumerically(): void
    {
        $result = $this->invoke([
            'values' => ['behedeti', 'edfu'],
            'global' => false,
            'omitEmptyFields' => false,
        ]);

        self::assertSame([0 => 'behedeti', 1 => 'edfu'], $result);
    }

    #[Test]
    public function nameAssignsResultToVariableProviderAndReturnsChildContent(): void
    {
        $captured = [];

        $this->invoker->invoke(
            NewArrayViewHelper::class,
            [
                'name' => 'myArray',
                'keys' => ['hrdr'],
                'values' => ['behedeti'],
            ],
            $this->renderingContext,
            function () use (&$captured): string {
                $captured = $this->renderingContext->getVariableProvider()->get('myArray') ?? [];
                return '';
            },
        );

        self::assertSame(['hrdr' => 'behedeti'], $captured);
        // Variable is removed after renderChildren (global=false)
        self::assertFalse($this->renderingContext->getVariableProvider()->exists('myArray'));
    }

    #[Test]
    public function globalTrueKeepsVariableAfterRendering(): void
    {
        $this->invoker->invoke(
            NewArrayViewHelper::class,
            [
                'name' => 'myArray',
                'keys' => ['hrdr'],
                'values' => ['behedeti'],
                'global' => true,
            ],
            $this->renderingContext,
            static fn(): string => '',
        );

        self::assertTrue($this->renderingContext->getVariableProvider()->exists('myArray'));
        self::assertSame(
            ['hrdr' => 'behedeti'],
            $this->renderingContext->getVariableProvider()->get('myArray')
        );
    }
}

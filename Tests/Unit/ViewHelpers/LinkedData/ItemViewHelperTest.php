<?php

namespace Subugoe\Find\Tests\Unit\ViewHelpers\LinkedData;

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
use Subugoe\Find\ViewHelpers\LinkedData\ItemViewHelper;
use TYPO3\TestingFramework\Core\Unit\UnitTestCase;
use TYPO3Fluid\Fluid\Core\Rendering\RenderingContextInterface;
use TYPO3Fluid\Fluid\Core\ViewHelper\ViewHelperInvoker;
use TYPO3Fluid\Fluid\View\TemplateView;

class ItemViewHelperTest extends UnitTestCase
{
    private ViewHelperInvoker $invoker;

    private RenderingContextInterface $renderingContext;

    protected function setUp(): void
    {
        parent::setUp();
        $view = new TemplateView();
        $this->renderingContext = $view->getRenderingContext();
        $this->invoker = new ViewHelperInvoker();
    }

    private function invoke(array $arguments): void
    {
        $this->invoker->invoke(
            ItemViewHelper::class,
            $arguments,
            $this->renderingContext,
        );
    }

    private function getContainer(string $name = 'linkedDataContainer'): mixed
    {
        return $this->renderingContext->getVariableProvider()->get($name);
    }

    #[Test]
    public function itemWithObjectIsAddedToDefaultContainer(): void
    {
        $this->invoke([
            'subject' => 'hrdr',
            'predicate' => 'is',
            'object' => 'thirsty',
        ]);

        $container = $this->getContainer();

        self::assertIsArray($container);
        self::assertArrayHasKey('hrdr', $container);
        self::assertArrayHasKey('is', $container['hrdr']);
        self::assertArrayHasKey('thirsty', $container['hrdr']['is']);
        self::assertNull($container['hrdr']['is']['thirsty']);
    }

    #[Test]
    public function multipleItemsWithSameSubjectAreAccumulated(): void
    {
        $this->invoke([
            'subject' => 'hrdr',
            'predicate' => 'is',
            'object' => 'thirsty',
        ]);

        $this->invoke([
            'subject' => 'hrdr',
            'predicate' => 'is',
            'object' => 'hungry',
        ]);

        $container = $this->getContainer();

        self::assertArrayHasKey('thirsty', $container['hrdr']['is']);
        self::assertArrayHasKey('hungry', $container['hrdr']['is']);
    }

    #[Test]
    public function multipleItemsWithDifferentSubjectsAreStoredSeparately(): void
    {
        $this->invoke([
            'subject' => 'hrdr',
            'predicate' => 'is',
            'object' => 'thirsty',
        ]);

        $this->invoke([
            'subject' => 'behedeti',
            'predicate' => 'has',
            'object' => 'wings',
        ]);

        $container = $this->getContainer();

        self::assertArrayHasKey('hrdr', $container);
        self::assertArrayHasKey('behedeti', $container);
        self::assertArrayHasKey('thirsty', $container['hrdr']['is']);
        self::assertArrayHasKey('wings', $container['behedeti']['has']);
    }

    #[Test]
    public function itemWithCustomNameIsStoredInCustomContainer(): void
    {
        $this->invoke([
            'subject' => 'hrdr',
            'predicate' => 'is',
            'object' => 'thirsty',
            'name' => 'myContainer',
        ]);

        // Default container should be untouched
        self::assertNull($this->getContainer('linkedDataContainer'));

        // Custom container should have the data
        $container = $this->getContainer('myContainer');
        self::assertArrayHasKey('hrdr', $container);
    }

    #[Test]
    public function itemWithoutObjectUsesRenderChildrenWithObjectTypeAndLanguage(): void
    {
        $this->invoker->invoke(
            ItemViewHelper::class,
            [
                'subject' => 'hrdr',
                'predicate' => 'speaks',
                'object' => null,
                'objectType' => 'xsd:string',
                'language' => 'en',
            ],
            $this->renderingContext,
            // Provide renderChildren closure - returns the child content used as object key
            static fn(): string => 'childContent',
        );

        $container = $this->getContainer();
        self::assertArrayHasKey('hrdr', $container);
        self::assertArrayHasKey('speaks', $container['hrdr']);
        self::assertArrayHasKey('childContent', $container['hrdr']['speaks']);

        $entry = $container['hrdr']['speaks']['childContent'];
        self::assertSame('xsd:string', $entry['type']);
        self::assertSame('en', $entry['language']);
    }
}

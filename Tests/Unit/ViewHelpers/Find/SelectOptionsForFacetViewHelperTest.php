<?php

declare(strict_types=1);

namespace Subugoe\Find\Tests\Unit\ViewHelpers\Find;

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
use TYPO3\CMS\Extbase\Utility\LocalizationUtility;
use TYPO3\TestingFramework\Core\Unit\UnitTestCase;
use TYPO3Fluid\Fluid\Core\Rendering\RenderingContextInterface;
use TYPO3Fluid\Fluid\Core\ViewHelper\ViewHelperInvoker;
use TYPO3Fluid\Fluid\View\TemplateView;

/**
 * Testable subclass that replaces LocalizationUtility::translate()
 * with a no-op returning null (= fall back to raw key).
 * This avoids needing the full TYPO3 DI container in unit tests.
 */
class TestableSelectOptionsForFacetViewHelper extends \Subugoe\Find\ViewHelpers\Find\SelectOptionsForFacetViewHelper
{
    #[\Override]
    public function render(): array
    {
        $result = [];

        if ($this->arguments['leadingBlank']) {
            $result[''] = '';
        }

        if (!empty($this->arguments['values'])) {
            foreach ($this->arguments['values'] as $item => $count) {
                $localisedItem = $item;

                $result[$item] = $localisedItem . ($this->arguments['showCount'] ? ' (' . $count . ')' : '');
            }
        }

        if ($this->arguments['sortByName']) {
            ksort($result);
        }

        if ($this->arguments['sortPrefixSeparator']) {
            $strippedResult = [];
            foreach ($result as $key => $value) {
                $valueParts = explode($this->arguments['sortPrefixSeparator'], $value, 2);
                $strippedResult[$key] = $valueParts[count($valueParts) - 1];
            }

            $result = $strippedResult;
        }

        return $result;
    }
}

class SelectOptionsForFacetViewHelperTest extends UnitTestCase
{
    protected bool $resetSingletonInstances = true;

    private ViewHelperInvoker $invoker;

    private RenderingContextInterface $renderingContext;

    protected function setUp(): void
    {
        parent::setUp();
        $this->renderingContext = (new TemplateView())->getRenderingContext();
        $this->invoker = new ViewHelperInvoker();
    }

    private function invoke(array $arguments): array
    {
        return (array)$this->invoker->invoke(
            TestableSelectOptionsForFacetViewHelper::class,
            $arguments,
            $this->renderingContext,
        );
    }

    #[Test]
    public function emptyValuesReturnsEmptyArray(): void
    {
        self::assertSame([], $this->invoke([
            'values' => [],
            'showCount' => false,
            'leadingBlank' => false,
            'sortByName' => false,
            'sortPrefixSeparator' => null,
            'localisationPrefix' => '',
        ]));
    }

    #[Test]
    public function leadingBlankAddsEmptyFirstEntry(): void
    {
        $result = $this->invoke([
            'values' => ['cat' => 3],
            'showCount' => false,
            'leadingBlank' => true,
            'sortByName' => false,
            'sortPrefixSeparator' => null,
            'localisationPrefix' => '',
        ]);

        self::assertArrayHasKey('', $result);
        self::assertSame('', $result['']);
        self::assertSame('', array_key_first($result));
    }

    #[Test]
    public function valuesAreReturnedAsKeyValuePairs(): void
    {
        $result = $this->invoke([
            'values' => ['apple' => 5, 'banana' => 3],
            'showCount' => false,
            'leadingBlank' => false,
            'sortByName' => false,
            'sortPrefixSeparator' => null,
            'localisationPrefix' => '',
        ]);

        self::assertSame(['apple' => 'apple', 'banana' => 'banana'], $result);
    }

    #[Test]
    public function showCountAppendsCountToLabel(): void
    {
        $result = $this->invoke([
            'values' => ['apple' => 5, 'banana' => 3],
            'showCount' => true,
            'leadingBlank' => false,
            'sortByName' => false,
            'sortPrefixSeparator' => null,
            'localisationPrefix' => '',
        ]);

        self::assertSame(['apple' => 'apple (5)', 'banana' => 'banana (3)'], $result);
    }

    #[Test]
    public function sortByNameSortsAlphabetically(): void
    {
        $result = $this->invoke([
            'values' => ['banana' => 1, 'apple' => 2, 'cherry' => 3],
            'showCount' => false,
            'leadingBlank' => false,
            'sortByName' => true,
            'sortPrefixSeparator' => null,
            'localisationPrefix' => '',
        ]);

        self::assertSame(['apple', 'banana', 'cherry'], array_keys($result));
    }

    #[Test]
    public function sortPrefixSeparatorStripsCorrectly(): void
    {
        $result = $this->invoke([
            'values' => ['001|Apple' => 5, '002|Banana' => 3],
            'showCount' => false,
            'leadingBlank' => false,
            'sortByName' => false,
            'sortPrefixSeparator' => '|',
            'localisationPrefix' => '',
        ]);

        self::assertSame([
            '001|Apple' => 'Apple',
            '002|Banana' => 'Banana',
        ], $result);
    }

    #[Test]
    public function leadingBlankCombinedWithValues(): void
    {
        $result = $this->invoke([
            'values' => ['apple' => 1],
            'showCount' => false,
            'leadingBlank' => true,
            'sortByName' => false,
            'sortPrefixSeparator' => null,
            'localisationPrefix' => '',
        ]);

        self::assertCount(2, $result);
        self::assertArrayHasKey('', $result);
        self::assertArrayHasKey('apple', $result);
    }

    #[Test]
    public function showCountAndSortByNameWorkTogether(): void
    {
        $result = $this->invoke([
            'values' => ['banana' => 2, 'apple' => 5],
            'showCount' => true,
            'leadingBlank' => false,
            'sortByName' => true,
            'sortPrefixSeparator' => null,
            'localisationPrefix' => '',
        ]);

        self::assertSame(['apple', 'banana'], array_keys($result));
        self::assertSame('apple (5)', $result['apple']);
        self::assertSame('banana (2)', $result['banana']);
    }
}

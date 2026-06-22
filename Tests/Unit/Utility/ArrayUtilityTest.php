<?php

declare(strict_types=1);

namespace Subugoe\Find\Tests\Unit\Utility;

use PHPUnit\Framework\Attributes\Test;
use Subugoe\Find\Utility\ArrayUtility;
use TYPO3\TestingFramework\Core\Unit\UnitTestCase;

class ArrayUtilityTest extends UnitTestCase
{
    #[Test]
    public function emptyStringsAreRemoved(): void
    {
        self::assertSame(
            ['a' => 'b'],
            ArrayUtility::cleanArgumentsArray(['a' => 'b', 'c' => ''])
        );
    }

    #[Test]
    public function keysStartingWithDoubleUnderscoreAreRemoved(): void
    {
        self::assertSame(
            ['a' => 'b'],
            ArrayUtility::cleanArgumentsArray(['a' => 'b', '__token' => 'xyz'])
        );
    }

    #[Test]
    public function nestedEmptyStringsAreRemovedRecursively(): void
    {
        self::assertSame(
            ['a' => ['b' => 'c']],
            ArrayUtility::cleanArgumentsArray(['a' => ['b' => 'c', 'd' => '']])
        );
    }

    #[Test]
    public function nestedArrayThatBecomesEmptyAfterCleaningIsRemoved(): void
    {
        self::assertSame(
            [],
            ArrayUtility::cleanArgumentsArray(['a' => ['b' => '']])
        );
    }

    #[Test]
    public function nestedDoubleUnderscoreKeysAreRemovedRecursively(): void
    {
        self::assertSame(
            ['a' => ['b' => 'c']],
            ArrayUtility::cleanArgumentsArray(['a' => ['b' => 'c', '__token' => 'xyz']])
        );
    }

    #[Test]
    public function integerKeysArePreserved(): void
    {
        self::assertSame(
            [0 => 'a', 1 => 'b'],
            ArrayUtility::cleanArgumentsArray([0 => 'a', 1 => 'b', 2 => ''])
        );
    }

    #[Test]
    public function emptyArrayReturnsEmptyArray(): void
    {
        self::assertSame([], ArrayUtility::cleanArgumentsArray([]));
    }

    #[Test]
    public function nonEmptyValuesArePreserved(): void
    {
        self::assertSame(
            ['a' => '0', 'b' => 'false', 'c' => ' '],
            ArrayUtility::cleanArgumentsArray(['a' => '0', 'b' => 'false', 'c' => ' '])
        );
    }
}

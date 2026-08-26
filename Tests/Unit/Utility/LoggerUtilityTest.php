<?php

declare(strict_types=1);

namespace Subugoe\Find\Tests\Unit\Utility;

use PHPUnit\Framework\Attributes\Test;
use Subugoe\Find\Utility\LoggerUtility;
use TYPO3\TestingFramework\Core\Unit\UnitTestCase;

class LoggerUtilityTest extends UnitTestCase
{
    #[Test]
    public function exceptionIsConvertedToArray(): void
    {
        $exception = new \RuntimeException('Test message', 42);
        $result = LoggerUtility::exceptionToArray($exception, false);

        self::assertSame('Test message', $result['message']);
        self::assertSame(42, $result['code']);
        self::assertSame($exception->getFile(), $result['file']);
        self::assertSame($exception->getLine(), $result['line']);
        self::assertIsArray($result['trace']);
        self::assertIsString($result['traceAsString']);
        self::assertArrayNotHasKey('previous', $result);
    }

    #[Test]
    public function previousExceptionIsNotIncludedByDefault(): void
    {
        $previous  = new \InvalidArgumentException('Previous', 1);
        $exception = new \RuntimeException('Main', 2, $previous);

        $result = LoggerUtility::exceptionToArray($exception, false, 10);

        self::assertNull($result['previous']);
    }

    #[Test]
    public function previousExceptionIsIncludedWhenFlagIsTrue(): void
    {
        $previous  = new \InvalidArgumentException('Previous message', 1);
        $exception = new \RuntimeException('Main message', 2, $previous);

        $result = LoggerUtility::exceptionToArray($exception, true, 10);

        self::assertArrayHasKey('previous', $result);
        self::assertSame('Previous message', $result['previous']['message']);
        self::assertSame(1, $result['previous']['code']);
    }

    #[Test]
    public function nestedPreviousExceptionsAreIncludedRecursively(): void
    {
        $root      = new \LogicException('Root', 1);
        $middle    = new \InvalidArgumentException('Middle', 2, $root);
        $exception = new \RuntimeException('Top', 3, $middle);

        $result = LoggerUtility::exceptionToArray($exception, true, 10);

        self::assertSame('Top', $result['message']);
        self::assertSame('Middle', $result['previous']['message']);
        self::assertSame('Root', $result['previous']['previous']['message']);
    }

    #[Test]
    public function exceptionWithoutPreviousDoesNotAddPreviousKeyWhenFlagIsTrue(): void
    {
        $exception = new \RuntimeException('No previous', 99);

        $result = LoggerUtility::exceptionToArray($exception, true, 10);

        self::assertNull($result['previous']);
    }

    #[Test]
    public function errorCodeZeroIsIncluded(): void
    {
        $exception = new \RuntimeException('Zero code', 0);
        $result    = LoggerUtility::exceptionToArray($exception);

        self::assertSame(0, $result['code']);
    }

    #[Test]
    public function traceIsNonEmptyString(): void
    {
        $exception = new \RuntimeException('Trace test');
        $result    = LoggerUtility::exceptionToArray($exception);

        self::assertNotSame('', $result['traceAsString']);
        self::assertStringContainsString('#0', $result['traceAsString']);
    }
}

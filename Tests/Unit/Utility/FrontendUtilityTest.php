<?php

declare(strict_types=1);

namespace Subugoe\Find\Tests\Unit\Utility;

use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Test;
use Subugoe\Find\Utility\FrontendUtility;
use TYPO3\TestingFramework\Core\Unit\UnitTestCase;

class FrontendUtilityTest extends UnitTestCase
{
    #[Test]
    public function returnsEmptyStringWhenDetailPagePagingIsDisabled(): void
    {
        self::assertSame('', FrontendUtility::addQueryInformationAsJavaScript(
            ['q' => 'test'],
            ['paging' => ['detailPagePaging' => 0]]
        ));
    }

    #[Test]
    public function returnsEmptyStringWhenDetailPagePagingIsMissing(): void
    {
        self::assertSame('', FrontendUtility::addQueryInformationAsJavaScript(
            ['q' => 'test'],
            []
        ));
    }

    #[Test]
    public function encodesQueryAsJson(): void
    {
        $result = FrontendUtility::addQueryInformationAsJavaScript(
            ['field' => 'value'],
            ['paging' => ['detailPagePaging' => 1, 'perPage' => 10]]
        );

        $decoded = json_decode($result, true);
        self::assertSame(['field' => 'value'], $decoded['q']);
    }

    #[Test]
    public function includesPositionWhenProvided(): void
    {
        $result = FrontendUtility::addQueryInformationAsJavaScript(
            [],
            ['paging' => ['detailPagePaging' => 1]],
            5
        );

        $decoded = json_decode($result, true);
        self::assertSame(5, $decoded['position']);
    }

    #[Test]
    public function omitsPositionWhenNull(): void
    {
        $result = FrontendUtility::addQueryInformationAsJavaScript(
            [],
            ['paging' => ['detailPagePaging' => 1]],
            null
        );

        $decoded = json_decode($result, true);
        self::assertArrayNotHasKey('position', $decoded);
    }

    #[Test]
    public function includesFacetsFromArguments(): void
    {
        $result = FrontendUtility::addQueryInformationAsJavaScript(
            [],
            ['paging' => ['detailPagePaging' => 1]],
            null,
            ['facet' => ['type' => ['book' => 1]]]
        );

        $decoded = json_decode($result, true);
        self::assertSame(['type' => ['book' => 1]], $decoded['facet']);
    }

    #[Test]
    public function includesCountFromArguments(): void
    {
        $result = FrontendUtility::addQueryInformationAsJavaScript(
            [],
            ['paging' => ['detailPagePaging' => 1]],
            null,
            ['count' => 20]
        );

        $decoded = json_decode($result, true);
        self::assertSame(20, $decoded['count']);
    }

    #[Test]
    public function fallsBackToPerPageSettingForCount(): void
    {
        $result = FrontendUtility::addQueryInformationAsJavaScript(
            [],
            ['paging' => ['detailPagePaging' => 1, 'perPage' => 25]],
        );

        $decoded = json_decode($result, true);
        self::assertSame(25, $decoded['count']);
    }

    #[Test]
    public function includesSortWhenProvided(): void
    {
        $result = FrontendUtility::addQueryInformationAsJavaScript(
            [],
            ['paging' => ['detailPagePaging' => 1]],
            null,
            ['sort' => 'date desc']
        );

        $decoded = json_decode($result, true);
        self::assertSame('date desc', $decoded['sort']);
    }

    #[Test]
    public function omitsSortWhenEmpty(): void
    {
        $result = FrontendUtility::addQueryInformationAsJavaScript(
            [],
            ['paging' => ['detailPagePaging' => 1]],
            null,
            ['sort' => '']
        );

        $decoded = json_decode($result, true);
        self::assertArrayNotHasKey('sort', $decoded);
    }

    #[Test]
    public function unwrapsNestedUnderlyingQueryArguments(): void
    {
        $result = FrontendUtility::addQueryInformationAsJavaScript(
            ['field' => 'value'],
            ['paging' => ['detailPagePaging' => 1]],
            null,
            ['underlyingQuery' => ['count' => 15, 'sort' => 'title asc']]
        );

        $decoded = json_decode($result, true);
        self::assertSame(15, $decoded['count']);
        self::assertSame('title asc', $decoded['sort']);
    }

    #[Test]
    public function outputIsValidJson(): void
    {
        $result = FrontendUtility::addQueryInformationAsJavaScript(
            ['field' => '<script>alert("xss")</script>'],
            ['paging' => ['detailPagePaging' => 1]]
        );

        self::assertJson($result);
        // HTML special chars should be escaped
        self::assertStringNotContainsString('<script>', $result);
    }

    public static function indexProvider(): array
    {
        return [
            'first result (position 1)' => [
                ['position' => 1],
                ['positionIndex' => 0, 'previousIndex' => 0, 'nextIndex' => 1, 'resultIndexOffset' => 0],
            ],
            'second result (position 2)' => [
                ['position' => 2],
                ['positionIndex' => 1, 'previousIndex' => 0, 'nextIndex' => 2, 'resultIndexOffset' => 1],
            ],
            'third result (position 3)' => [
                ['position' => 3],
                ['positionIndex' => 2, 'previousIndex' => 1, 'nextIndex' => 3, 'resultIndexOffset' => 1],
            ],
            'missing position defaults to 1' => [
                [],
                ['positionIndex' => 0, 'previousIndex' => 0, 'nextIndex' => 1, 'resultIndexOffset' => 0],
            ],
            'position 0 is clamped to 1' => [
                ['position' => 0],
                ['positionIndex' => 0, 'previousIndex' => 0, 'nextIndex' => 1, 'resultIndexOffset' => 0],
            ],
        ];
    }

    #[Test]
    #[DataProvider('indexProvider')]
    public function getIndexesCalculatesCorrectly(array $input, array $expected): void
    {
        self::assertSame($expected, FrontendUtility::getIndexes($input));
    }
}

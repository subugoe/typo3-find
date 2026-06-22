<?php

declare(strict_types=1);

namespace Subugoe\Find\Tests\Unit\Utility;

use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Test;
use Subugoe\Find\Utility\UpgradeUtility;
use TYPO3\TestingFramework\Core\Unit\UnitTestCase;

class UpgradeUtilityTest extends UnitTestCase
{
    public static function settingsProvider(): array
    {
        return [
            [
                [
                    'host' => 'solr',
                    'port' => 8983,
                    'path' => '/solr/core_en',
                    'scheme' => 'http',
                ],
                [
                    'host' => 'solr',
                    'port' => 8983,
                    'path' => '/',
                    'scheme' => 'http',
                    'core' => 'core_en',
                ],
            ],
            [
                [
                    'host' => 'solr',
                    'port' => 8983,
                    'path' => '/solr/core_en/',
                    'scheme' => 'http',
                ],
                [
                    'host' => 'solr',
                    'port' => 8983,
                    'path' => '/',
                    'scheme' => 'http',
                    'core' => 'core_en',
                ],
            ],
            [
                [
                    'host' => 'solr.local',
                    'port' => 8983,
                    'path' => '/',
                    'scheme' => 'http',
                    'core' => 'core_en',
                ],
                [
                    'host' => 'solr.local',
                    'port' => 8983,
                    'path' => '/',
                    'scheme' => 'http',
                    'core' => 'core_en',
                ],
            ],
        ];
    }

    #[Test]
    #[DataProvider(methodName: 'settingsProvider')]
    public function configurationIsAutomaticallyUpgraded(array $settings, array $expected): void
    {
        set_error_handler(static fn(): true => true, E_USER_DEPRECATED);
        $result = UpgradeUtility::handleSolariumUpgrade($settings);
        restore_error_handler();

        self::assertSame($expected, $result);
    }
}

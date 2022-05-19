<?php

declare(strict_types=1);

namespace Subugoe\Find\Tests\Unit\Utility;

use PHPUnit\Framework\TestCase;
use Subugoe\Find\Utility\UpgradeUtility;

class UpgradeUtilityTest extends TestCase
{
    public function settingsProvider(): array
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

    /**
     * @test
     * @dataProvider settingsProvider
     */
    public function configurationIsAutomaticallyUpgraded(array $settings, $expected): void
    {
        self::assertSame($expected, UpgradeUtility::handleSolariumUpgrade($settings));
    }
}

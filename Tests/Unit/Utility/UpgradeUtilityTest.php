<?php

declare(strict_types=1);

namespace Subugoe\Find\Tests\Unit\Utility;

use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\IgnoreDeprecations;
use PHPUnit\Framework\Attributes\Test;
use Subugoe\Find\Utility\UpgradeUtility;
use TYPO3\TestingFramework\Core\BaseTestCase;

class UpgradeUtilityTest extends BaseTestCase
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

    #[DataProvider('settingsProvider')]
    #[Test]
    #[IgnoreDeprecations]
    public function configurationIsAutomaticallyUpgraded(array $settings, $expected): void
    {
        $this->expectUserDeprecationMessage('Please read the upgrading instructions at https://github.com/subugoe/typo3-find/blob/main/UPGRADING.md');
        self::assertSame($expected, UpgradeUtility::handleSolariumUpgrade($settings));
    }
}

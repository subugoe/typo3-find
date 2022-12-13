<?php

declare(strict_types=1);

namespace Subugoe\Find\Utility;

class UpgradeUtility
{
    public static function handleSolariumUpgrade(array $connectionSettings): array
    {
        trigger_error('Please read the upgrading instructions at https://github.com/subugoe/typo3-find/blob/main/UPGRADING.md', E_USER_DEPRECATED);

        if (str_contains($connectionSettings['path'], '/solr/')) {
            $connectionSettings['core'] = str_replace('/solr/', '', $connectionSettings['path']);
            $connectionSettings['core'] = str_replace('/', '', $connectionSettings['core']);
            $connectionSettings['path'] = '/';
        }

        return $connectionSettings;
    }
}

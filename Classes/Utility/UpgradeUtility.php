<?php

declare(strict_types=1);

namespace Subugoe\Find\Utility;

class UpgradeUtility
{
    public static function handleSolariumUpgrade(array $connectionSettings): array
    {
        trigger_error('Please read the upgrading instructions at https://github.com/subugoe/typo3-find/blob/main/UPGRADING.md', E_USER_DEPRECATED);

        if (false !== strpos($connectionSettings['path'], '/solr/')) {
            $connectionSettings['collection'] = str_replace('/solr/', '', $connectionSettings['path']);
            $connectionSettings['collection'] = str_replace('/', '', $connectionSettings['collection']);
            $connectionSettings['path'] = '/';
        }

        return $connectionSettings;
    }
}

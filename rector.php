<?php

declare(strict_types=1);

use Rector\Config\RectorConfig;
use Rector\Set\ValueObject\SetList;
use Ssch\TYPO3Rector\Set\Typo3LevelSetList;

return static function (RectorConfig $rectorConfig): void {
    $rectorConfig->paths([
        __DIR__.'/Classes',
        __DIR__.'/Tests',
        __DIR__.'/Configuration',
        __DIR__.'/Resources',
        __DIR__.'/*.php',
    ]);

    $rectorConfig->skip([__DIR__.'/.Build/vendor',
        __DIR__.'/var',
        __DIR__.'/*.cache', ]);

    $rectorConfig->sets([
        SetList::PHP_83,
        Typo3LevelSetList::UP_TO_TYPO3_12,
        SetList::CODE_QUALITY,
        SetList::CODING_STYLE,
    ]);
};

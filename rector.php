<?php

declare(strict_types=1);

use Rector\Config\RectorConfig;
use Rector\Set\ValueObject\SetList;
use Ssch\TYPO3Rector\Set\Typo3SetList;

return static function (RectorConfig $containerConfigurator): void {
    $containerConfigurator->paths([
        __DIR__.'/Classes',
        __DIR__.'/Tests',
        __DIR__.'/Configuration',
        __DIR__.'/Resources',
        __DIR__.'/*.php',
    ]);
    $containerConfigurator->skip([
        __DIR__.'/.Build/vendor',
        __DIR__.'/var',
        __DIR__.'/*.cache',
    ]);

    // Define what rule sets will be applied
    $containerConfigurator->sets([
        SetList::CODING_STYLE,
        SetList::CODE_QUALITY,
        SetList::PHP_74,
        Typo3SetList::TYPO3_104,
        Typo3SetList::TYPOSCRIPT_CONDITIONS_104,
    ]);
};

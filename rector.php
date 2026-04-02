<?php

declare(strict_types=1);
use Rector\Config\RectorConfig;
use Rector\Set\ValueObject\SetList;
use Ssch\TYPO3Rector\Set\Typo3LevelSetList;

return RectorConfig::configure()
    ->withPhpSets()
    ->withPreparedSets(codeQuality: true, codingStyle: true, typeDeclarations: true)
    ->withSkip([
        __DIR__ . '/.Build/vendor',
        __DIR__ . '/var',
        __DIR__ . '/*.cache',
    ])
    ->withPaths([
        __DIR__ . '/Classes',
        __DIR__ . '/Tests',
        __DIR__ . '/Configuration',
        __DIR__ . '/Resources',
        __DIR__ . '/*.php',
    ])
    ->withSets([
        SetList::PHP_84,
        Typo3LevelSetList::UP_TO_TYPO3_13,
    ]);

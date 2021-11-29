<?php

declare(strict_types=1);

use Rector\Core\Configuration\Option;
use Rector\Set\ValueObject\SetList;
use Ssch\TYPO3Rector\Set\Typo3SetList;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;

return static function (ContainerConfigurator $containerConfigurator): void {
    // get parameters
    $parameters = $containerConfigurator->parameters();
    $parameters->set(Option::PATHS, [
        __DIR__.'/Classes',
        __DIR__.'/Tests',
        __DIR__.'/Configuration',
        __DIR__.'/Resources',
    ]);

    // Define what rule sets will be applied
    $containerConfigurator->import(SetList::CODING_STYLE);
    $containerConfigurator->import(SetList::CODE_QUALITY);
    $containerConfigurator->import(SetList::PHP_74);
    $containerConfigurator->import(Typo3SetList::TYPO3_104);
    $containerConfigurator->import(Typo3SetList::TYPOSCRIPT_CONDITIONS_104);
};

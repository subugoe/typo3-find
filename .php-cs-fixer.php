<?php
use TYPO3\CodingStandards\CsFixerConfig;

$finder = PhpCsFixer\Finder::create()
    ->exclude('vendor')
    ->exclude('node_modules')
    ->exclude('var')
    ->in(__DIR__);


$config = CsFixerConfig::create();

return $config
    ->setFinder($finder);

<?php

$EM_CONF[$_EXTKEY] = [
    'title' => 'Find',
    'description' => 'A frontend for Solr indexes',
    'version' => '3.1.1',
    'state' => 'stable',
    'category' => 'frontend',
    'shy' => 0,
    'priority' => '',
    'loadOrder' => '',
    'module' => '',
    'uploadfolder' => 0,
    'createDirs' => '',
    'modify_tables' => '',
    'clearcacheonload' => 1,
    'lockType' => '',
    'author' => 'Sven-S. Porst, Ingo Pfennigstorf',
    'author_email' => 'pfennigstorf@sub.uni-goettingen.de',
    'author_company' => 'SUB Göttingen',
    'dependencies' => '',
    'conflicts' => '',
    'constraints' => [
        'depends' => [
            'php' => '5.5.0-7.0.99',
            'typo3' => '7.6.0-8.99.99',
        ],
        'conflicts' => [],
        'suggests' => [],
    ],
    'autoload' => [
        'psr-4' => [
            ['Subugoe\\Find\\' => 'Classes'],
        ],
    ],
];

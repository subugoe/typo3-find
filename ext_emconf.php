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
            'php' => '7.2.0-7.4.99',
            'typo3' => '9.5.0-10.4.99',
            'felogin' => '9.5.0-10.4.99',
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

<?php

$EM_CONF[$_EXTKEY] = [
    'title' => 'Find',
    'description' => 'A frontend for Solr indexes',
    'version' => '3.1.1',
    'state' => 'stable',
    'category' => 'frontend',
    'clearCacheOnLoad' => true,
    'author' => 'Sven-S. Porst, Ingo Pfennigstorf',
    'author_email' => 'pfennigstorf@sub.uni-goettingen.de',
    'author_company' => 'SUB Göttingen',
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

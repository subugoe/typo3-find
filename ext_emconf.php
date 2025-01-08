<?php

$EM_CONF['find'] = [
    'title' => 'Find',
    'description' => 'A frontend for Solr indexes',
    'version' => '4.0.0',
    'state' => 'stable',
    'category' => 'frontend',
    'author' => 'Sven-S. Porst, Ingo Pfennigstorf',
    'author_email' => 'pfennigstorf@sub.uni-goettingen.de',
    'author_company' => 'SUB Göttingen',
    'constraints' => [
        'depends' => [
            'php' => '8.2.0-8.3.99',
            'typo3' => '12.4.0-12.4.99',
            'felogin' => '12.4.0-12.4.99',
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

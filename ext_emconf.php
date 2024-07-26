<?php

$EM_CONF['find'] = [
    'title' => 'Find',
    'description' => 'A frontend for Solr indexes',
    'version' => '3.1.1',
    'state' => 'stable',
    'category' => 'frontend',
    'author' => 'Sven-S. Porst, Ingo Pfennigstorf',
    'author_email' => 'pfennigstorf@sub.uni-goettingen.de',
    'author_company' => 'SUB Göttingen',
    'constraints' => [
        'depends' => [
            'php' => '8.0.0-8.1.99',
            'typo3' => '11.5.0-11.5.99',
            'felogin' => '11.5.0-11.5.99',
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

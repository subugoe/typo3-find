<?php

/***************************************************************
 * Extension Manager/Repository config file for ext "find".
 *
 * Auto generated 12-11-2013 18:35
 *
 * Manual updates:
 * Only the data in the array - everything else is removed by next
 * writing. "version" and "dependencies" must not be touched!
 ***************************************************************/

$EM_CONF[$_EXTKEY] = [
    'title' => 'Find',
    'description' => 'A frontend for Solr indexes',
    'version' => '1.0.1',
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
    'CGLcompliance' => '',
    'CGLcompliance_note' => '',
    'dependencies' => 't3jquery',
    'conflicts' => '',
    'constraints' => [
        'depends' => [
            'php' => '5.5.0-5.6.99',
            'typo3' => '6.2.0-7.99.99',
            't3jquery' => '2.3.3-0.0.0',
        ],
        'conflicts' => [],
        'suggests' => [],
    ],
];

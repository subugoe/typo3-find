<?php

return [
    'frontend' => [
        'Subugoe/Find/ajax/getentity' => [
            'target' => \Subugoe\Find\Ajax\GetEntity::class,
            'after' => [
                'typo3/cms-frontend/prepare-tsfe-rendering'
            ],
        ],
        'Subugoe/Find/ajax/autocomplete' => [
            'target' => \Subugoe\Find\Ajax\Autocomplete::class,
            'after' => [
                'typo3/cms-frontend/prepare-tsfe-rendering'
            ],
        ],
    ],
];

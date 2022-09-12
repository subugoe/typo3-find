<?php

defined('TYPO3_MODE') || exit;

$autoexec = static function () {
    \TYPO3\CMS\Extbase\Utility\ExtensionUtility::configurePlugin(
        'Find',
        'Find',
        [
            \Subugoe\Find\Controller\SearchController::class => 'index, detail, suggest',
        ],
        [
            \Subugoe\Find\Controller\SearchController::class => 'index, detail, suggest',
        ]
    );

    if (TYPO3_MODE === 'BE') {
        /*
         * Register icons
         */
        /** @var \TYPO3\CMS\Core\Imaging\IconRegistry $iconRegistry */
        $iconRegistry = \TYPO3\CMS\Core\Utility\GeneralUtility::makeInstance(\TYPO3\CMS\Core\Imaging\IconRegistry::class);
        $iconRegistry->registerIcon(
            'ext-find-ce-wizard',
            \TYPO3\CMS\Core\Imaging\IconProvider\FontawesomeIconProvider::class,
            ['name' => 'search']
        );
    }

    \TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addPageTSConfig('<INCLUDE_TYPOSCRIPT: source="FILE:EXT:find/Configuration/TSconfig/ContentElementWizard.tsconfig">');
};
$autoexec();
unset($autoexec);

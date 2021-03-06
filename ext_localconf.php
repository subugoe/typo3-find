<?php

if (!defined('TYPO3_COMPOSER_MODE') || TYPO3_COMPOSER_MODE === false) {
    require_once \TYPO3\CMS\Core\Utility\ExtensionManagementUtility::extPath('find').'.Build/vendor/autoload.php';
}

\TYPO3\CMS\Extbase\Utility\ExtensionUtility::configurePlugin(
    'Subugoe.find',
    'Find',
    [
        'Search' => 'index, detail, suggest',
    ],
    [
        'Search' => 'index, detail, suggest',
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

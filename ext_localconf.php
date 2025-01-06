<?php

use FriendsOfTYPO3\FontawesomeProvider\Imaging\IconProvider\FontawesomeIconProvider;
use Subugoe\Find\Controller\SearchController;
use TYPO3\CMS\Core\Imaging\IconRegistry;
use TYPO3\CMS\Core\Utility\ExtensionManagementUtility;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Extbase\Utility\ExtensionUtility;

defined('TYPO3') || exit;

$autoexec = static function () {
    ExtensionUtility::configurePlugin(
        'Find',
        'Find',
        [
            SearchController::class => 'index, detail, suggest',
        ],
        [
            SearchController::class => 'index, detail, suggest',
        ]
    );
    /*
     * Register icons
     */
    /** @var IconRegistry $iconRegistry */
    $iconRegistry = GeneralUtility::makeInstance(IconRegistry::class);
    $iconRegistry->registerIcon(
        'ext-find-ce-wizard',
        FontawesomeIconProvider::class,
        ['name' => 'search']
    );

    ExtensionManagementUtility::addPageTSConfig('<INCLUDE_TYPOSCRIPT: source="FILE:EXT:find/Configuration/TSconfig/ContentElementWizard.tsconfig">');
};
$autoexec();
unset($autoexec);

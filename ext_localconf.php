<?php

use FriendsOfTYPO3\FontawesomeProvider\Imaging\IconProvider\FontawesomeIconProvider;
use Subugoe\Find\Controller\SearchController;
use TYPO3\CMS\Core\Imaging\IconRegistry;
use TYPO3\CMS\Core\Utility\ExtensionManagementUtility;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Extbase\Utility\ExtensionUtility;

defined('TYPO3') || exit;

$autoexec = static function (): void {
    ExtensionUtility::configurePlugin(
        'Find',
        'Find',
        [
            SearchController::class => 'index, detail, suggest',
        ],
        [
            SearchController::class => 'index, detail, suggest',
        ],
        \TYPO3\CMS\Extbase\Utility\ExtensionUtility::PLUGIN_TYPE_CONTENT_ELEMENT
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
};
$autoexec();
unset($autoexec);

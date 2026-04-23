<?php

use Subugoe\Find\Controller\SearchController;
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
};
$autoexec();
unset($autoexec);

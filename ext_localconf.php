<?php
if (!defined('TYPO3_MODE')) {
    die('Access denied.');
}

if (!defined('TYPO3_COMPOSER_MODE') || TYPO3_COMPOSER_MODE === false) {
    require_once(\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::extPath('find') . 'vendor/autoload.php');
}

\TYPO3\CMS\Extbase\Utility\ExtensionUtility::configurePlugin(
    'Subugoe.' . $_EXTKEY,
    'Find',
    [
        'Search' => 'index, detail, suggest',
    ],
    [
        'Search' => 'index, detail, suggest',
    ]
);

// RealURL autoconfiguration
$GLOBALS['TYPO3_CONF_VARS']['SC_OPTIONS']['ext/realurl/class.tx_realurl_autoconfgen.php']['extensionConfiguration']['find'] = 'EXT:find/Classes/Hooks/RealUrl.php:Subugoe\\Find\\Hooks\\RealUrl->addRealUrlConfiguration';

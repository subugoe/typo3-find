<?php
if (!defined('TYPO3_MODE')) {
    die ('Access denied.');
}

require_once(\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::extPath('find') . 'vendor/autoload.php');

\TYPO3\CMS\Extbase\Utility\ExtensionUtility::configurePlugin(
    'Subugoe.' . $_EXTKEY, // The extension name (in UpperCamelCase) with vendor prefix
    'Find', // A unique name of the plugin in UpperCamelCase
    [ // An array holding the enabled controller-action-combinations
        'Search' => 'index, detail, suggest', // The first controller and its first action will be the default
    ],
    [ // An array holding the non-cachable controller-action-combinations
        'Search' => 'index, detail, suggest', // The first controller and its first action will be the default
    ]
);

// RealURL autoconfiguration
$GLOBALS['TYPO3_CONF_VARS']['SC_OPTIONS']['ext/realurl/class.tx_realurl_autoconfgen.php']['extensionConfiguration']['find'] = 'EXT:find/Classes/Hooks/RealUrl.php:Tx_Find_Hooks_RealUrl->addRealUrlConfiguration';

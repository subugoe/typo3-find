<?php
if (!defined('TYPO3_MODE')) {
    die ('Access denied.');
}

/**
 * Registers a Plugin to be listed in the Backend. You also have to configure the Dispatcher in ext_localconf.php.
 */
\TYPO3\CMS\Extbase\Utility\ExtensionUtility::registerPlugin(
    'Subugoe.' . $_EXTKEY, // The extension name (in UpperCamelCase) with vendor prefix
    'Find', // A unique name of the plugin in UpperCamelCase
    'Find' // A title shown in the backend dropdown field
);

\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addStaticFile($_EXTKEY, 'Configuration/TypoScript', 'Find');

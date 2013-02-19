<?php
if (!defined('TYPO3_MODE')) {
	die ('Access denied.');
}

/**
 * Registers a Plugin to be listed in the Backend. You also have to configure the Dispatcher in ext_localconf.php.
 */
Tx_Extbase_Utility_Extension::registerPlugin(
	$_EXTKEY, // The extension name (in UpperCamelCase) or the extension key (in lower_underscore)
	'Sublar', // A unique name of the plugin in UpperCamelCase
	'Solr Search' // A title shown in the backend dropdown field
);

?>
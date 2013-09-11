<?php
if (!defined('TYPO3_MODE')) {
	die ('Access denied.');
}

Tx_Extbase_Utility_Extension::configurePlugin(
	$_EXTKEY, // The extension name (in UpperCamelCase) or the extension key (in lower_underscore)
	'Find', // A unique name of the plugin in UpperCamelCase
	array ( // An array holding the enabled controller-action-combinations
		'Search' => 'index, detail, data, suggest', // The first controller and its first action will be the default
	),
	array ( // An array holding the non-cachable controller-action-combinations
		'Search' => 'index, detail, data, suggest', // The first controller and its first action will be the default
	)
);

// RealURL autoconfiguration
$GLOBALS['TYPO3_CONF_VARS']['SC_OPTIONS']['ext/realurl/class.tx_realurl_autoconfgen.php']['extensionConfiguration']['find'] = 'EXT:find/Classes/Hooks/RealUrl.php:Tx_Find_Hooks_RealUrl->addRealUrlConfiguration';
<?php
if (!defined('TYPO3_MODE')) {
	die ('Access denied.');
}

Tx_Extbase_Utility_Extension::configurePlugin(
	$_EXTKEY, // The extension name (in UpperCamelCase) or the extension key (in lower_underscore)
	'Sublar', // A unique name of the plugin in UpperCamelCase
	array ( // An array holding the controller-action-combinations that are accessible
		'Search' => 'index', // The first controller and its first action will be the default
	),
	array ( // An array holding the controller-action-combinations that are accessible
		'Search' => 'index', // The first controller and its first action will be the default
	)
);
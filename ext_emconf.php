<?php

/***************************************************************
 * Extension Manager/Repository config file for ext "sublar".
 *
 * Auto generated 21-11-2012 08:14
 *
 * Manual updates:
 * Only the data in the array - everything else is removed by next
 * writing. "version" and "dependencies" must not be touched!
 ***************************************************************/

$EM_CONF[$_EXTKEY] = array(
	'title' => 'Sublar',
	'description' => 'Solr Extension',
	'category' => 'frontend',
	'shy' => 0,
	'version' => '1.0.0',
	'dependencies' => 'extbase,fluid',
	'conflicts' => '',
	'priority' => '',
	'loadOrder' => '',
	'module' => '',
	'state' => 'alpha',
	'uploadfolder' => 0,
	'createDirs' => '',
	'modify_tables' => '',
	'clearcacheonload' => 1,
	'lockType' => '',
	'author' => 'Ingo Pfennigstorf',
	'author_email' => '',
	'author_company' => '',
	'CGLcompliance' => '',
	'CGLcompliance_note' => '',
	'constraints' => array(
		'depends' => array(
			'php' => '5.3.0-0.0.0',
			'typo3' => '4.7.0-0.0.0',
			'extbase' => '4.7.0-0.0.0',
			'fluid' => '4.7.0-0.0.0',
		),
		'conflicts' => array(
		),
		'suggests' => array(
		),
	),
	'_md5_values_when_last_written' => 'a:13:{s:17:"ext_localconf.php";s:4:"b27f";s:14:"ext_tables.php";s:4:"b406";s:14:"ext_tables.sql";s:4:"6404";s:44:"Classes/Controller/MitarbeiterController.php";s:4:"4685";s:34:"Classes/Domain/Model/Abteilung.php";s:4:"ed50";s:36:"Classes/Domain/Model/Mitarbeiter.php";s:4:"954d";s:49:"Classes/Domain/Repository/AbteilungRepository.php";s:4:"7e9d";s:51:"Classes/Domain/Repository/MitarbeiterRepository.php";s:4:"7849";s:31:"Configuration/Tca/Abteilung.php";s:4:"39ef";s:33:"Configuration/Tca/Mitarbeiter.php";s:4:"80af";s:38:"Configuration/TypoScript/constants.txt";s:4:"e107";s:34:"Configuration/TypoScript/setup.txt";s:4:"6858";s:49:"Resources/Private/Templates/Mitarbeiter/List.html";s:4:"42bc";}',
	'suggests' => array(
	),
);

?>
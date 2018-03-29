<?php

namespace Subugoe\Find\Controller;

/* * *************************************************************
 *  Copyright notice
 *
 *  (c) 2013
 *      Ingo Pfennigstorf <pfennigstorf@sub-goettingen.de>
 *      Sven-S. Porst
 *      Göttingen State and University Library
 *
 *  All rights reserved
 *
 *  This script is part of the TYPO3 project. The TYPO3 project is
 *  free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  The GNU General Public License can be found at
 *  http://www.gnu.org/copyleft/gpl.html.
 *
 *  This script is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  This copyright notice MUST APPEAR in all copies of the script!
 * ************************************************************* */

use Subugoe\Find\Service\ServiceProviderInterface;
use Subugoe\Find\Utility\ArrayUtility;
use Subugoe\Find\Utility\FrontendUtility;
use Subugoe\Find\Utility\LoggerUtility;
use TYPO3\CMS\Core\Utility\ArrayUtility as CoreArrayUtility;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Extbase\Mvc\Controller\ActionController;

class SearchController extends ActionController
{
    /**
     * @var array
     */
    protected $requestArguments;

    /**
     * @var ServiceProviderInterface
     */
    protected $searchProvider;

    /**
     * Initialisation and setup.
     */
    public function initializeAction()
    {
        ksort($this->settings['queryFields']);

        $this->initializeConnection($this->settings['activeConnection']);

        $this->requestArguments = $this->request->getArguments();
        $this->requestArguments = ArrayUtility::cleanArgumentsArray($this->requestArguments);
        $this->searchProvider->setRequestArguments($this->requestArguments);
        $this->searchProvider->setAction($this->request->getControllerActionName());
        $this->searchProvider->setControllerExtensionKey($this->request->getControllerExtensionKey());
    }

    /**
     * @param string $activeConnection
     */
    protected function initializeConnection($activeConnection)
    {
        $connectionConfiguration = $this->settings['connections'][$activeConnection];

        /* @var ServiceProviderInterface $searchProvider */
        $this->searchProvider = GeneralUtility::makeInstance($connectionConfiguration['provider'], $activeConnection, $this->settings);
        $this->searchProvider->connect();
    }

    /**
     * Index Action.
     */
    public function indexAction()
    {
        if (array_key_exists('id', $this->requestArguments)) {
            $this->forward('detail');
        } else {
            $this->searchProvider->setCounter();
            $this->response->addAdditionalHeaderData(
                FrontendUtility::addQueryInformationAsJavaScript(
                    $this->requestArguments['q'],
                    null,
                    $this->searchProvider->getRequestArguments(),
                    $this->settings
                )
            );
            $this->addStandardAssignments();
            $defaultQuery = $this->searchProvider->getDefaultQuery();

            $viewValues = [
                'arguments' => $this->searchProvider->getRequestArguments(),
                'config' => $this->searchProvider->getConfiguration(),
            ];

            CoreArrayUtility::mergeRecursiveWithOverrule($viewValues, $defaultQuery);
            $this->view->assignMultiple($viewValues);
        }
    }

    /**
     * Single Item View action.
     */
    public function detailAction()
    {
        $arguments = $this->searchProvider->getRequestArguments();
        if (array_key_exists('id', $arguments) && !empty($arguments['id'])) {
            $detail = $this->searchProvider->getDetail();

            if ($this->request->hasArgument('underlyingQuery')) {
                $underlyingQueryInfo = $this->request->getArgument('underlyingQuery');
                $this->response->addAdditionalHeaderData(
                    FrontendUtility::addQueryInformationAsJavaScript($underlyingQueryInfo['q'],
                        (int) $underlyingQueryInfo['position'], $arguments, $this->settings)
                );
            }
            $this->addStandardAssignments();

            $this->view->assignMultiple($detail);
            $this->view->assign('arguments', $arguments);
        } else {
            // id argument missing or empty
            LoggerUtility::logError(
                'find: Non-empty argument »id« is required for action »detail«.',
                ['arguments' => $arguments]
            );
            $this->forward('index');
        }
    }

    /**
     * Suggest/Autocomplete action.
     */
    public function suggestAction()
    {
        $results = $this->searchProvider->suggestQuery($this->searchProvider->getRequestArguments());
        $this->view->assign('suggestions', $results);
    }

    /**
     * Assigns standard variables to the view.
     */
    protected function addStandardAssignments()
    {
        $this->searchProvider->setConfigurationValue('extendedSearch', $this->searchProvider->isExtendedSearch());
        $this->searchProvider->setConfigurationValue(
            'uid',
            $this->configurationManager->getContentObject()->data['uid']
        );
        $this->searchProvider->setConfigurationValue('prefixID', 'tx_find_find');
        $this->searchProvider->setConfigurationValue('pageTitle', $GLOBALS['TSFE']->page['title']);
    }
}

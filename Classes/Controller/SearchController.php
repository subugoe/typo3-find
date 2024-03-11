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
use Psr\Http\Message\ResponseInterface;
use Psr\Log\LoggerInterface;
use Subugoe\Find\Service\ServiceProviderInterface;
use Subugoe\Find\Utility\ArrayUtility;
use Subugoe\Find\Utility\FrontendUtility;
use TYPO3\CMS\Core\Log\LogManagerInterface;
use TYPO3\CMS\Core\Utility\ArrayUtility as CoreArrayUtility;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Extbase\Http\ForwardResponse;
use TYPO3\CMS\Extbase\Mvc\Controller\ActionController;
use TYPO3\CMS\Extbase\Mvc\Exception\NoSuchArgumentException;
use TYPO3\CMS\Extbase\Mvc\Exception\StopActionException;

class SearchController extends ActionController
{
    protected array $requestArguments = [];

    protected ?object $searchProvider = null;

    private LoggerInterface $logger;

    public function __construct(LogManagerInterface $logManager)
    {
        $this->logger = $logManager->getLogger('find');
    }

    /**
     * @throws NoSuchArgumentException
     * @throws StopActionException
     */
    public function detailAction(string $id): ResponseInterface
    {
        $arguments = $this->searchProvider->getRequestArguments();
        $detail = $this->searchProvider->getDocumentById($id);
        $response = $this->responseFactory->createResponse();
        if ($this->request->hasArgument('underlyingQuery')) {
            $underlyingQueryInfo = $this->request->getArgument('underlyingQuery');
            $response->withAddedHeader('detail', FrontendUtility::addQueryInformationAsJavaScript(
                $underlyingQueryInfo['q'],
                $this->settings,
                (int) $underlyingQueryInfo['position'],
                $arguments
            ));
        }

        $this->addStandardAssignments();

        $this->view->assignMultiple($detail);
        $this->view->assignMultiple([
            'arguments' => $arguments,
            'config' => $this->searchProvider->getConfiguration(),
        ]);

        return $this->htmlResponse();
    }

    /**
     * Index Action.
     */
    public function indexAction(): ResponseInterface
    {
        if (array_key_exists('id', $this->requestArguments)) {
            return new ForwardResponse('detail');
        }

        $this->searchProvider->setCounter();
        $response = $this->responseFactory->createResponse();

        $response->withAddedHeader('index',
            FrontendUtility::addQueryInformationAsJavaScript(
                $this->searchProvider->getRequestArguments()['q'],
                $this->settings,
                null,
                $this->searchProvider->getRequestArguments()
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

        return $this->htmlResponse();
    }

    /**
     * Initialisation and setup.
     */
    protected function initializeAction(): void
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
     * Suggest/Autocomplete action.
     */
    public function suggestAction(): ResponseInterface
    {
        $results = $this->searchProvider->suggestQuery($this->searchProvider->getRequestArguments());
        $this->view->assign('suggestions', $results);

        return $this->htmlResponse();
    }

    /**
     * Assigns standard variables to the view.
     */
    protected function addStandardAssignments(): void
    {
        $this->searchProvider->setConfigurationValue('extendedSearch', $this->searchProvider->isExtendedSearch());
        $this->searchProvider->setConfigurationValue(
            'uid',
            $this->configurationManager->getContentObject()->data['uid']
        );
        $this->searchProvider->setConfigurationValue('prefixID', 'tx_find_find');
        $this->searchProvider->setConfigurationValue('pageTitle', $GLOBALS['TSFE']->page['title']);
    }

    /**
     * @param string $activeConnection
     */
    protected function initializeConnection($activeConnection): void
    {
        $connectionConfiguration = $this->settings['connections'][$activeConnection];

        /* @var ServiceProviderInterface $searchProvider */
        $this->searchProvider = GeneralUtility::makeInstance($connectionConfiguration['provider'], $activeConnection,
            $this->settings);
        $this->searchProvider->connect();
    }
}

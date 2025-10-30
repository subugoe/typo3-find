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
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use TYPO3\CMS\Backend\Search\LiveSearch\SearchProviderInterface;
use TYPO3\CMS\Core\Log\LogManagerInterface;
use TYPO3\CMS\Core\Page\AssetCollector;
use TYPO3\CMS\Core\Utility\ArrayUtility as CoreArrayUtility;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Extbase\Http\ForwardResponse;
use TYPO3\CMS\Extbase\Mvc\Controller\ActionController;
use TYPO3\CMS\Extbase\Mvc\Exception\NoSuchArgumentException;

class SearchController extends ActionController
{
    protected array $requestArguments = [];

    protected ?object $searchProvider = null;

    public function __construct(
        private readonly LoggerInterface $logger,
        private readonly AssetCollector  $assetCollector,
    )
    {

    }

    /**
     * @throws NoSuchArgumentException
     * @throws \JsonException
     */
    public function detailAction(string $id): ResponseInterface
    {
        $arguments = $this->searchProvider->getRequestArguments();
        $detail = $this->searchProvider->getDocumentById($id);
        if ($this->request->hasArgument('underlyingQuery')) {
            $underlyingQueryInfo = $this->request->getArgument('underlyingQuery');
            $underlyingQueryScriptTagContent = FrontendUtility::addQueryInformationAsJavaScript(
                $underlyingQueryInfo['q'] ?? '',
                $this->settings,
                (int) $underlyingQueryInfo['position'],
                $arguments
            );

            $this->assetCollector
                ->addInlineJavaScript('underlyingQueryVar', $underlyingQueryScriptTagContent, ['type' => 'text/javascript'], ['priority' => true]);
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
     * @throws \JsonException
     */
    public function indexAction(): ResponseInterface
    {
        if (array_key_exists('id', $this->requestArguments)) {
            return new ForwardResponse('detail');
        }

        $this->searchProvider->setCounter();

        $underlyingQueryScriptTagContent = FrontendUtility::addQueryInformationAsJavaScript(
            $this->searchProvider->getRequestArguments()['q'] ?? [],
            $this->settings,
            null,
            $this->searchProvider->getRequestArguments()
        );

        $this->assetCollector
            ->addInlineJavaScript('underlyingQueryVar', $underlyingQueryScriptTagContent, ['type' => 'text/javascript'], ['priority' => true]);

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
            $this->request->getAttribute('currentContentObject')->data['uid']
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

        $logger = $this->logger;

        /* @var ServiceProviderInterface $searchProvider */
        $this->searchProvider = GeneralUtility::makeInstance($connectionConfiguration['provider'], $activeConnection, $this->settings, $this->logger);
        $this->searchProvider->connect();
    }
}

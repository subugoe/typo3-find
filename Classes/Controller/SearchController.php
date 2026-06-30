<?php

declare(strict_types=1);

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
use Subugoe\Find\PageTitle\FindPageTitleProvider;
use Subugoe\Find\Service\ServiceProviderInterface;
use Subugoe\Find\Utility\ArrayUtility;
use Subugoe\Find\Utility\FrontendUtility;
use TYPO3\CMS\Core\Page\AssetCollector;
use TYPO3\CMS\Core\Utility\ArrayUtility as CoreArrayUtility;
use TYPO3\CMS\Extbase\Mvc\Controller\ActionController;

class SearchController extends ActionController
{
    private const string EXTENSION_KEY = 'find';

    public function __construct(
        private readonly AssetCollector $assetCollector,
        private readonly ServiceProviderInterface $searchProvider,
        private readonly FindPageTitleProvider $pageTitleProvider,
    ) {}

    /**
     * @throws \JsonException
     */
    public function detailAction(string $id): ResponseInterface
    {
        $detail = $this->searchProvider->getDocumentById($id);

        // Capture arguments and configuration AFTER the document fetch,
        // since getDocumentById() may update provider state.
        $arguments = $this->searchProvider->getRequestArguments();

        if ($this->request->hasArgument('underlyingQuery')) {
            $underlyingQueryInfo = $this->request->getArgument('underlyingQuery');

            if (!is_array($underlyingQueryInfo)) {
                $underlyingQueryInfo = [];
            }

            $underlyingQueryScriptTagContent = FrontendUtility::buildUnderlyingQueryJson(
                $underlyingQueryInfo['q'] ?? [],
                $this->settings,
                isset($underlyingQueryInfo['position']) ? (int)$underlyingQueryInfo['position'] : null,
                $arguments
            );

            if ($underlyingQueryScriptTagContent !== '') {
                $this->addUnderlyingQueryJavaScript($underlyingQueryScriptTagContent, $id);
            }
        }

        $this->assignStandardViewVariables();
        $this->view->assignMultiple($detail);
        $this->view->assignMultiple([
            'underlyingQuery' => $underlyingQueryScriptTagContent ?? '',
            'arguments'       => $arguments,
            'config'          => $this->searchProvider->getConfiguration(),
        ]);

        return $this->htmlResponse();
    }

    /**
     * @throws \JsonException
     */
    public function indexAction(): ResponseInterface
    {
        $requestArguments = $this->searchProvider->getRequestArguments();

        if (array_key_exists('id', $requestArguments)) {
            return $this->redirect('detail', null, null, ['id' => $requestArguments['id']]);
        }

        $this->searchProvider->setCounter();

        $underlyingQueryScriptTagContent = FrontendUtility::buildUnderlyingQueryJson(
            $requestArguments['q'] ?? [],
            $this->settings,
            null,
            $requestArguments
        );

        if ($underlyingQueryScriptTagContent !== '') {
            $this->addUnderlyingQueryJavaScript($underlyingQueryScriptTagContent);
        }

        $this->assignStandardViewVariables();

        // Run the query FIRST so createQueryForArguments() populates configuration
        $queryResult = $this->searchProvider->getDefaultQuery();

        $viewValues = [
            'arguments' => $requestArguments,
            'config'    => $this->searchProvider->getConfiguration(), // ← AFTER getDefaultQuery()
        ];

        CoreArrayUtility::mergeRecursiveWithOverrule($viewValues, $queryResult);
        $this->view->assignMultiple($viewValues);

        return $this->htmlResponse();
    }

    public function suggestAction(): ResponseInterface
    {
        $requestArguments = $this->searchProvider->getRequestArguments();

        $results = $this->searchProvider->suggestQuery([
            'q'          => $requestArguments['q'] ?? '',
            'dictionary' => $requestArguments['dictionary'] ?? '',
        ]);

        $this->view->assign('suggestions', $results);

        return $this->htmlResponse();
    }

    protected function initializeAction(): void
    {
        if (!empty($this->settings['queryFields']) && is_array($this->settings['queryFields'])) {
            ksort($this->settings['queryFields']);
        }

        $requestArguments = ArrayUtility::cleanArgumentsArray(
            $this->request->getArguments()
        );

        $this->searchProvider->setRequestArguments($requestArguments);
        $this->searchProvider->setAction($this->request->getControllerActionName());
        $this->searchProvider->setControllerExtensionKey(self::EXTENSION_KEY);

        $activeConnection = $this->settings['activeConnection'] ?? '';

        if ($activeConnection === '') {
            throw new \RuntimeException(
                'TypoScript setting "activeConnection" is not configured for the find extension.',
                1_700_000_010
            );
        }

        $this->initializeConnection($activeConnection);
    }

    protected function initializeConnection(string $activeConnection): void
    {
        $this->searchProvider->setConnectionName($activeConnection);
        $this->searchProvider->setSettings($this->settings);
        $this->searchProvider->connect();
    }

    /**
     * Writes standard runtime values into the provider configuration so that
     * they are available to templates via the »config« variable.
     */
    protected function assignStandardViewVariables(): void
    {
        $contentObject = $this->request->getAttribute('currentContentObject');
        $contentUid    = $contentObject !== null ? (int)($contentObject->data['uid'] ?? 0) : 0;

        $this->searchProvider->setConfigurationValue('extendedSearch', $this->searchProvider->isExtendedSearch());
        $this->searchProvider->setConfigurationValue('uid', $contentUid);
        $this->searchProvider->setConfigurationValue('prefixID', 'tx_find_find');
        $this->searchProvider->setConfigurationValue('pageTitle', $this->pageTitleProvider->getTitle());
    }

    /**
     * Adds the underlying-query data as an inline JS variable.
     *
     * The asset key is made unique per content element (and optionally per
     * record ID) so that multiple find plugins on the same page do not
     * overwrite each other, and so that `const` is not re-declared.
     */
    private function addUnderlyingQueryJavaScript(string $content, string $suffix = ''): void
    {
        $contentObject = $this->request->getAttribute('currentContentObject');
        $uid           = $contentObject !== null ? (int)($contentObject->data['uid'] ?? 0) : 0;
        $key           = 'underlyingQuery_' . $uid . ($suffix !== '' ? '_' . $suffix : '');

        $this->assetCollector->addInlineJavaScript(
            $key,
            sprintf('const underlyingQuery_%s = %s;', $uid, $content),
            [],
            ['priority' => true]
        );
    }
}

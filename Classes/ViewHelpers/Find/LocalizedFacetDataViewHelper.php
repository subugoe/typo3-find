<?php

namespace Subugoe\Find\ViewHelpers\Find;

/*******************************************************************************
 * Copyright notice
 *
 * Copyright 2019 Sven-S. Porst <ssp-web@earthlingsoft.net>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 ******************************************************************************/

use TYPO3\CMS\Extbase\Utility\LocalizationUtility;
use TYPO3Fluid\Fluid\Core\Rendering\RenderingContextInterface;
use TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper;

/**
 * View Helper to return localization data for facets and facet items in
 * the current result set using the extension’s standard facet
 * localizations.
 *
 * Returns an Array formed like
 * [
 *   'facets' => [
 *     'facetID1' => 'Facet 1 localised Name',
 *     'facetID2' => 'Facet 2 localised Name',
 *   ],
 *   'entries' => [
 *      'facetID1' => [
 *        'facetID1Entry1' => 'Facet 1 Entry 1 localized Name',
 *        …
 *      ]
 *   ]
 * ]
 *
 * To be used, e.g. to provide localized facet information to JavaScript
 * applications via data-attributes.
 */
class LocalizedFacetDataViewHelper extends AbstractViewHelper
{
    /**
     * Registers own arguments.
     */
    public function initializeArguments()
    {
        parent::initializeArguments();
        $this->registerArgument('data', 'Array', 'facet data', true);
        $this->registerArgument('settings', 'Array', 'find settings', true);
    }

    /**
     * @return array
     */
    public static function renderStatic(
        array $arguments,
        \Closure $renderChildrenClosure,
        RenderingContextInterface $renderingContext
    ) {
        $facetNames = [];
        $facetEntryNames = [];

        $baseKey = 'LLL:'.$arguments['settings']['languageRootPath'].'locallang-facets.xml:facet';
        foreach ($arguments['data'] as $facetID => $facetData) {
            $facetKey = $baseKey.'.'.$facetID;
            $localizedFacetName = LocalizationUtility::translate($facetKey, '', []);
            if (null !== $localizedFacetName) {
                $facetNames[$facetID] = $localizedFacetName;
            }

            $localizationsForFacet = [];
            foreach ($facetData->getValues() as $facetEntryID => $count) {
                $facetEntryKey = $facetKey.'.'.$facetEntryID;
                $localizedFacetEntryName = LocalizationUtility::translate($facetEntryKey, '', []);
                if (null !== $localizedFacetEntryName) {
                    $localizationsForFacet[$facetEntryID] = $localizedFacetEntryName;
                }
            }
            if (count($localizationsForFacet) > 0) {
                $facetEntryNames[$facetID] = $localizationsForFacet;
            }
        }

        return [
            'facets' => $facetNames,
            'entries' => $facetEntryNames,
        ];
    }
}

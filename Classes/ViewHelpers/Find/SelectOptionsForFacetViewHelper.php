<?php

namespace Subugoe\Find\ViewHelpers\Find;

/*******************************************************************************
 * Copyright notice
 *
 * Copyright 2013 Sven-S. Porst, Göttingen State and University Library
 *                <porst@sub.uni-goettingen.de>
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
use TYPO3\CMS\Fluid\Core\ViewHelper\AbstractViewHelper;

/**
 * View Helper to convert an array with facet information into an array suitable
 * for use as options for f:form.select.
 */
class SelectOptionsForFacetViewHelper extends AbstractViewHelper
{
    /**
     * Registers own arguments.
     */
    public function initializeArguments()
    {
        parent::initializeArguments();
        $this->registerArgument('values', 'array', 'values array for a facet', false, []);
        $this->registerArgument('showCount', 'boolean', 'include the item count for the facet in the label?', false,
            false);
        $this->registerArgument('leadingBlank', 'boolean', 'begin the select with a blank item? (for jquery.chosen)',
            false, false);
        $this->registerArgument('sortByName', 'boolean', 'sort the items alphabetically?', false, false);
        $this->registerArgument('sortPrefixSeparator', 'string',
            'sort the whole string but only keep the part after the separator for display', false, null);
        $this->registerArgument('localisationPrefix', 'string', 'prefix for the localisation key', false, '');
    }

    /**
     * @return array
     */
    public function render()
    {
        $result = [];

        // Start the select with a blank element?
        if ($this->arguments['leadingBlank']) {
            $result[''] = '';
        }

        $extensionName = $this->controllerContext->getRequest()->getControllerExtensionName();
        if (!empty($this->arguments['values'])) {
            foreach ($this->arguments['values'] as $item => $count) {
                // Localise item name.
                $localisationKey = $this->arguments['localisationPrefix'].$item;

                $localisedItem = LocalizationUtility::translate($localisationKey, $extensionName);
                if (!$localisedItem) {
                    $localisedItem = $item;
                }

                // Append count to item name?
                $result[$item] = $localisedItem.($this->arguments['showCount'] ? ' ('.$count.')' : '');
            }
        }

        // Sort the array?
        if ($this->arguments['sortByName']) {
            ksort($result);
        }

        // Strip sort prefixes.
        if ($this->arguments['sortPrefixSeparator']) {
            $strippedResult = [];
            foreach ($result as $key => $value) {
                $valueParts = explode($this->arguments['sortPrefixSeparator'], $value, 2);
                $strippedResult[$key] = $valueParts[count($valueParts) - 1];
            }
            $result = $strippedResult;
        }

        return $result;
    }
}

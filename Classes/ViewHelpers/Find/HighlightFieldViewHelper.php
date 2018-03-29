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
use TYPO3\CMS\Fluid\Core\ViewHelper\AbstractViewHelper;

/**
 * View Helper for styling the content of index document’s result fields.
 * Requires the query result object for finding the information as well as the
 * document and the field to work on.
 *
 * Expects to find the document’s id in the field »id« which can be overridden
 * using the »idKey« parameter.
 *
 * Tries to avoid issues with creating invalid markup by assuming the highlighted
 * parts of the string are marked by Unicode Private Use Area characters
 * \ueeee and \ueeef. Then replaces these by tags for an em.highlight element.
 * The highlighting tags can be configured using the highlightTagOpen and
 * highlightTagClose arguments.
 */
class HighlightFieldViewHelper extends AbstractViewHelper
{
    /**
     * Registers own arguments.
     */
    public function initializeArguments()
    {
        parent::initializeArguments();
        $this->registerArgument('results', '\Solarium\QueryType\Select\Result\Result', 'Query results', true);
        $this->registerArgument('document', '\Solarium\QueryType\Select\Result\Document', 'Result document to work on',
            true);
        $this->registerArgument('field', 'string', 'name of field in document to highlight', true);
        $this->registerArgument('alternateField', 'string',
            'name of alternate field in document to use for highlighting', false, null);
        $this->registerArgument('index', 'int', 'if the field is an array: index of the single element to highlight',
            false);
        $this->registerArgument('idKey', 'string', 'name of the field in document that is its ID', false, 'id');
        $this->registerArgument('highlightTagOpen', 'string', 'opening tag to insert to begin highlighting', false,
            '<em class="highlight">');
        $this->registerArgument('highlightTagClose', 'string', 'closing tag to insert to end highlighting', false,
            '</em>');
        $this->registerArgument('raw', 'boolean', 'whether to not HTML escape the output', false, false);
    }

    /**
     * @return string
     */
    public function render()
    {
        if ($this->arguments['document']) {
            $fields = $this->arguments['document']->getFields();
            $fieldContent = $fields[$this->arguments['field']];
            if (null !== $this->arguments['index']) {
                if (is_array($fieldContent) && count($fieldContent) > $this->arguments['index']) {
                    $fieldContent = $fieldContent[$this->arguments['index']];
                } else {
                    // TODO: error message
                }
            }

            return $this->highlightField($fieldContent);
        }

        return '';
    }

    /**
     * Returns string or array of strings with highlighted areas enclosed
     * by \ueeee and \ueeef.
     *
     * @param array|string $fieldContent content of the field to highlight
     *
     * @return array|string
     */
    protected function highlightField($fieldContent)
    {
        $highlightInfo = $this->getHighlightInfo();

        if (is_array($fieldContent)) {
            $result = [];
            foreach ($fieldContent as $singleField) {
                $result[] = $this->highlightSingleField($singleField, $highlightInfo);
            }
        } else {
            $result = $this->highlightSingleField($fieldContent, $highlightInfo);
        }

        return $result;
    }

    /**
     * Returns highlight information for the document and field configured in
     * our arguments.
     *
     * @return array
     */
    protected function getHighlightInfo()
    {
        $highlightInfo = [];
        $documentID = $this->arguments['document'][$this->arguments['idKey']];
        if ($documentID) {
            $highlighting = $this->arguments['results']->getHighlighting();

            if ($highlighting) {
                if ($this->arguments['alternateField']) {
                    $highlightInfo += $highlighting->getResult($documentID)->getField($this->arguments['alternateField']);
                } else {
                    $highlightInfo += $highlighting->getResult($documentID)->getField($this->arguments['field']);
                }
            }
        }

        return $highlightInfo;
    }

    /**
     * Returns $fieldString with highlighted areas enclosed by \ueeee and \ueeef.
     *
     * @param string $fieldString   the string to highlight
     * @param array  $highlightInfo information provided by the index’ highlighter
     *
     * @return string
     */
    protected function highlightSingleField($fieldString, $highlightInfo)
    {
        $result = null;

        foreach ($highlightInfo as $highlightItem) {
            $highlightItemStripped = str_replace(['\ueeee', '\ueeef'], ['', ''], $highlightItem);
            if (null !== strpos($fieldString, $highlightItemStripped)) {
                // HTML escape the text here if not explicitly configured to not do so.
                // Use f:format.raw in the template to avoid double escaping the HTML tags.
                if (!$this->arguments['raw']) {
                    $highlightItem = htmlspecialchars($highlightItem);
                }

                $highlightItemMarkedUp = str_replace(
                    ['\ueeee', '\ueeef'],
                    [$this->arguments['highlightTagOpen'], $this->arguments['highlightTagClose']],
                    $highlightItem);
                $result = str_replace($highlightItemStripped, $highlightItemMarkedUp, $fieldString);
                break;
            }
        }

        // If no highlighted string is present, use the original one.
        if (null === $result) {
            if ($this->arguments['raw']) {
                $result = $fieldString;
            } else {
                $result = htmlspecialchars($fieldString);
            }
        }

        return $result;
    }
}

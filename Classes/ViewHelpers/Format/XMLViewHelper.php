<?php

namespace Subugoe\Find\ViewHelpers\Format;

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
use TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper;

/**
 * View Helper for converting XML to formatted XML.
 *
 * Usage examples are available in Private/Partials/Test.html.
 */
class XMLViewHelper extends AbstractViewHelper
{
    protected $escapeOutput = true;

    public function initializeArguments(): void
    {
        parent::initializeArguments();
        $this->registerArgument('htmloutput', 'bool', 'Whether to output as HTML', false, false);
    }

    #[\Override]
    public function render(): string
    {
        $input = $this->renderChildren();
        $xml = new \DOMDocument();
        $xml->preserveWhiteSpace = false;
        $xml->formatOutput = true;
        $xml->encoding = 'UTF-8';

        libxml_use_internal_errors(true);
        $loaded = $xml->loadXML($input);
        libxml_clear_errors();

        if (!$loaded) {
            return htmlspecialchars($input ?? '', ENT_XML1 | ENT_QUOTES, 'UTF-8');
        }

        $output = $this->arguments['htmloutput'] ? $xml->saveHTML() : $xml->saveXML();

        return $output !== false ? $output : htmlspecialchars($input ?? '', ENT_XML1 | ENT_QUOTES, 'UTF-8');
    }
}

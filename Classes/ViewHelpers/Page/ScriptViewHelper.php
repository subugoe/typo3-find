<?php

namespace Subugoe\Find\ViewHelpers\Page;

/*******************************************************************************
 * Copyright notice
 * Copyright 2013 Sven-S. Porst, Göttingen State and University Library
 *                <porst@sub.uni-goettingen.de>
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 ******************************************************************************/
use TYPO3\CMS\Core\Page\PageRenderer;
use TYPO3\CMS\Core\Resource\Exception\FileDoesNotExistException;
use TYPO3\CMS\Core\Resource\Exception\InvalidFileException;
use TYPO3\CMS\Core\Resource\Exception\InvalidFileNameException;
use TYPO3\CMS\Core\Resource\Exception\InvalidPathException;
use TYPO3\CMS\Frontend\Resource\FilePathSanitizer;
use TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper;

/**
 * View Helper to dynamically add script resources to the output.
 *
 * Usage examples are available in Private/Partials/Test.html.
 */
class ScriptViewHelper extends AbstractViewHelper
{
    public function __construct(private readonly PageRenderer $pageRenderer, private readonly FilePathSanitizer $filePathSanitizer) {}

    public function initializeArguments(): void
    {
        $this->registerArgument('file', 'string', 'File to append as script');
        $this->registerArgument('name', 'string', 'Name to use', true);
    }

    /**
     * @throws InvalidPathException
     * @throws InvalidFileNameException
     * @throws InvalidFileException
     * @throws FileDoesNotExistException
     */
    #[\Override]
    public function render(): string
    {
        $name = $this->arguments['name'];

        $fileNameFromArguments = $this->arguments['file'];
        if ($fileNameFromArguments) {
            $scriptPath = $this->filePathSanitizer->sanitize($fileNameFromArguments);
            $this->pageRenderer->addJsFooterLibrary($name, $scriptPath);
        } else {
            $content = $this->renderChildren();
            $this->pageRenderer->addJsFooterInlineCode($name, $content);
        }

        return '';
    }
}

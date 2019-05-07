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
use TYPO3\CMS\Core\TypoScript\TemplateService;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Core\Utility\VersionNumberUtility;
use TYPO3\CMS\Frontend\Resource\FilePathSanitizer;
use TYPO3Fluid\Fluid\Core\Rendering\RenderingContextInterface;
use TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper;

/**
 * View Helper to dynamically add script resources to the output.
 *
 * Usage examples are available in Private/Partials/Test.html.
 */
class ScriptViewHelper extends AbstractViewHelper
{
    /**
     * @return PageRenderer
     */
    protected static function getPageRenderer()
    {
        return GeneralUtility::makeInstance(PageRenderer::class);
    }

    /**
     * @return TemplateService
     */
    protected static function getTypoScriptTemplateService()
    {
        return $GLOBALS['TSFE']->tmpl;
    }

    public function initializeArguments()
    {
        $this->registerArgument('file', 'string', 'File to append as script');
        $this->registerArgument('name', 'string', 'Name to use', true);
    }

    /**
     * @param array                     $arguments
     * @param \Closure                  $renderChildrenClosure
     * @param RenderingContextInterface $renderingContext
     *
     * @return string
     */
    public static function renderStatic(
        array $arguments,
        \Closure $renderChildrenClosure,
        RenderingContextInterface $renderingContext
    ) {
        $name = $arguments['name'];
        $pageRenderer = self::getPageRenderer();

        $typo3VersionConstraint = version_compare(VersionNumberUtility::getNumericTypo3Version(), '10.0.0', '<');

        if ($typo3VersionConstraint) {
            $scriptPath = static::getTypoScriptTemplateService()->getFileName($arguments['file']);
            if ($scriptPath) {
                $pageRenderer->addJsFooterLibrary($name, $scriptPath);
                return '';
            }
            $content = $renderChildrenClosure();
            $pageRenderer->addJsFooterInlineCode($name, $content);
            return '';
        } else {
            if ($fileNameFromArguments) {
                $scriptPath = GeneralUtility::makeInstance(FilePathSanitizer::class)->sanitize($fileNameFromArguments);
                $pageRenderer->addJsFooterLibrary($name, $scriptPath);
            }
            else {
                $content = $renderChildrenClosure();
                $pageRenderer->addJsFooterInlineCode($name, $content);
            }
            return '';
        }
    }
}

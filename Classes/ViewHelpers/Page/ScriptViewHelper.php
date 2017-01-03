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
use TYPO3\CMS\Fluid\Core\Rendering\RenderingContextInterface;
use TYPO3\CMS\Fluid\Core\ViewHelper\AbstractViewHelper;
use TYPO3\CMS\Fluid\Core\ViewHelper\Facets\CompilableInterface;

/**
 * View Helper to dynamically add script resources to the output.
 *
 * Usage examples are available in Private/Partials/Test.html.
 */
class ScriptViewHelper extends AbstractViewHelper implements CompilableInterface
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

    /**
     * @return void
     */
    public function initializeArguments()
    {
        $this->registerArgument('file', 'string', 'File to append as script');
        $this->registerArgument('name', 'string', 'Name to use', true);
    }

    /**
     * @return string
     */
    public function render()
    {
        return self::renderStatic(
            [
                'file' => $this->arguments['file'],
                'name' => $this->arguments['name'],
            ],
            $this->buildRenderChildrenClosure(),
            $this->renderingContext
        );
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
        $scriptPath = static::getTypoScriptTemplateService()->getFileName($arguments['file']);
        $name = $arguments['name'];

        $pageRenderer = self::getPageRenderer();
        if ($scriptPath) {
            $pageRenderer->addJsFooterLibrary($name, $scriptPath);

            return '';
        }

        $content = $renderChildrenClosure();
        $pageRenderer->addJsFooterInlineCode($name, $content);

        return '';
    }
}

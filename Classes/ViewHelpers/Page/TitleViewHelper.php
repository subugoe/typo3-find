<?php

namespace Subugoe\Find\ViewHelpers\Page;

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
 * View Helper to join the elements of an array into a string.
 *
 * Usage examples are available in Private/Partials/Test.html.
 */
class TitleViewHelper extends AbstractViewHelper
{
    /**
     * Registers own arguments.
     */
    public function initializeArguments()
    {
        parent::initializeArguments();
        $this->registerArgument('title', 'string', 'the title to set for the page', false, null);
    }

    /**
     * @return string
     */
    public function render()
    {
        $title = $this->arguments['title'];
        if (null === $title) {
            $title = $this->renderChildren();
        }

        /*
         * Hack-ish approach to deal with TYPO3 Caching problems.
         * 1. Apparently our changes to $GLOBALS['TSFE']->page['title'] only work for cached plugins
         * 2. I do not see a way to get correct results for the GET and POST parameters sent when the plugin is cached
         * 3. Manually replace the existing page title with the one we want if $GLOBALS['TSFE']->content is non-empty
         * Idea from: http://blog.bartlweb.net/2011/02/seitentitel-aus-einer-extension-heraus-veraendern/
         *
         * Apart from the general hackishness of this approach, it relies on the pre-set page title only
         * appearing once inside the <title> tag. Otherwise the order of the components in the page title will be wrong.
         */
        if ($GLOBALS['TSFE']->content) {
            $GLOBALS['TSFE']->content = preg_replace('/(<title>.*)'.$GLOBALS['TSFE']->page['title'].'(.*<\/title>)/',
                '$1'.$title.'$2', $GLOBALS['TSFE']->content);
        } else {
            $GLOBALS['TSFE']->page['title'] = $title;
        }
    }
}

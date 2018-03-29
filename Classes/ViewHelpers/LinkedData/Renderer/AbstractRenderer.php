<?php

namespace Subugoe\Find\ViewHelpers\LinkedData\Renderer;

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

use TYPO3\CMS\Core\Utility\GeneralUtility;

/**
 * Class AbstractRenderer.
 */
abstract class AbstractRenderer
{
    /**
     * @var array
     */
    protected $prefixes = [];

    /**
     * @var array
     */
    protected $usedPrefixes = [];

    /**
     * @param $type
     *
     * @return object
     */
    public static function instantiateSubclassForType($type)
    {
        if ('rdf' === $type) {
            $instance = GeneralUtility::makeInstance(RDFRenderer::class);
        } else {
            if ('json-ld' === $type) {
                $instance = GeneralUtility::makeInstance(JSONLDRenderer::class);
            } else {
                $instance = GeneralUtility::makeInstance(TurtleRenderer::class);
            }
        }

        return $instance;
    }

    /**
     * @param $prefixes
     */
    public function setPrefixes($prefixes)
    {
        $this->prefixes = $prefixes;
    }
}

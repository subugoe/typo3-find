<?php

declare(strict_types=1);

namespace Subugoe\Find\ViewHelpers\Data;

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
 * View Helper to return whether the variable is an array or array-like.
 *
 * Returns true for plain arrays and Traversable objects (e.g. ObjectStorage,
 * QueryResult, Solarium result sets).
 *
 * Usage examples:
 *   <f:if condition="{s:data.isArray(subject: myVar)}">…</f:if>
 *   <f:if condition="{s:data.isArray()}{myVar}</f:if>
 */
class IsArrayViewHelper extends AbstractViewHelper
{
    /**
     * This ViewHelper returns a boolean, never HTML — escaping is irrelevant
     * but disabling it avoids any unnecessary processing.
     */
    protected $escapeOutput = false;

    public function initializeArguments(): void
    {
        parent::initializeArguments();
        $this->registerArgument(
            'subject',
            'mixed',
            'The variable to inspect. Falls back to tag children if omitted.',
            false,
            null
        );
    }

    #[\Override]
    public function render(): bool
    {
        $subject = $this->arguments['subject'] ?? $this->renderChildren();

        return is_iterable($subject);
    }
}

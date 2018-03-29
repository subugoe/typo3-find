<?php

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

use TYPO3\CMS\Fluid\Core\ViewHelper\AbstractViewHelper;

/**
 * View Helper to create a new array with the given keys and values.
 *
 * Usage examples are available in Private/Partials/Test.html.
 */
class NewArrayViewHelper extends AbstractViewHelper
{
    protected $escapeOutput = false;

    /**
     * Register arguments.
     */
    public function initializeArguments()
    {
        parent::initializeArguments();
        $this->registerArgument('name', 'string', 'name of template variable to assign the result to', false, null);
        $this->registerArgument('array', 'array', 'existing array to add the new keys and values to', false, []);

        $this->registerArgument('keys', 'array', 'array of keys', false, null);
        $this->registerArgument('values', 'array', 'array of values', false, []);

        $this->registerArgument('global', 'boolean',
            'whether to make the variable available to all templates coming afterwards', false, false);
        $this->registerArgument('omitEmptyFields', 'boolean', 'omits empty fields', false, false);
    }

    /**
     * @return array
     */
    public function render()
    {
        $result = $this->arguments['array'];

        if ($this->arguments['keys']) {
            if (count($this->arguments['keys']) === count($this->arguments['values'])) {
                foreach ($this->arguments['keys'] as $index => $key) {
                    $value = $this->arguments['values'][$index];
                    if (!$this->arguments['omitEmptyFields'] || $value) {
                        $result[$key] = $value;
                    }
                }
            } else {
                $result = 'newArray View Helper: Number of keys and values must be the same.'.PHP_EOL.print_r($this->arguments,
                        true);
            }
        } else {
            foreach ($this->arguments['values'] as $value) {
                $result[] = $value;
            }
        }

        $variableName = $this->arguments['name'];
        if (null !== $variableName) {
            if ($this->templateVariableContainer->exists($variableName)) {
                $this->templateVariableContainer->remove($variableName);
            }
            $this->templateVariableContainer->add($variableName, $result);
            $result = $this->renderChildren();
            if (true !== $this->arguments['global']) {
                $this->templateVariableContainer->remove($variableName);
            }
        }

        return $result;
    }
}

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

use Psr\Log\LoggerInterface;
use TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper;

/**
 * View Helper to rearrange an array of columns into an array of rows.
 *
 * Usage examples are available in Private/Partials/Test.html.
 *
 * Example — transpose columns to rows:
 *   <s:data.transpose arrays="{name: {0:'Alice',1:'Bob'}, age: {0:30,1:25}}" name="rows">
 *     <f:for each="{rows}" as="row">
 *       {row.name} is {row.age}
 *     </f:for>
 *   </s:data.transpose>
 *   => "Alice is 30" / "Bob is 25"
 */
class TransposeViewHelper extends AbstractViewHelper
{
    protected $escapeOutput = false;

    public function __construct(private readonly LoggerInterface $logger) {}

    public function initializeArguments(): void
    {
        parent::initializeArguments();
        $this->registerArgument(
            'arrays',
            'array',
            'Array with keys: field names and values: arrays of column data',
            false,
            []
        );
        $this->registerArgument(
            'name',
            'string',
            'Variable name to assign the transposed row array to',
            true
        );
    }

    #[\Override]
    public function render(): mixed
    {
        $inputArrays  = $this->arguments['arrays'];
        $variableName = $this->arguments['name'];

        if (!is_array($inputArrays) || $inputArrays === []) {
            return $this->renderWithVariable($variableName, []);
        }

        // Normalize: ensure every value is an array and re-index numerically
        $normalized     = [];
        $rowCount       = null;
        $lengthMismatch = false;

        foreach ($inputArrays as $key => $column) {
            if ($column instanceof \Traversable) {
                $column = iterator_to_array($column, false);
            }

            $column       = is_array($column) ? array_values($column) : [];
            $currentCount = count($column);

            if ($rowCount === null) {
                $rowCount = $currentCount;
            } elseif ($currentCount !== $rowCount) {
                $lengthMismatch = true;
            }

            $normalized[$key] = $column;
        }

        if ($lengthMismatch) {
            $counts = array_map(count(...), $normalized);
            $info   = array_map(
                static fn(string|int $key, int $count): string => $key . ': ' . $count,
                array_keys($counts),
                $counts
            );

            $this->logger->warning(
                sprintf(
                    'TransposeViewHelper: The arrays passed in the »arrays« argument do not have identical lengths: (%s)',
                    implode(', ', $info)
                ),
                ['arrays' => $counts]
            );

            return $this->renderWithVariable($variableName, []);
        }

        if ($rowCount === null || $rowCount === 0) {
            return $this->renderWithVariable($variableName, []);
        }

        // Transpose columns → rows
        $rows = [];
        for ($rowIndex = 0; $rowIndex < $rowCount; $rowIndex++) {
            $row = [];
            foreach ($normalized as $key => $column) {
                $row[$key] = $column[$rowIndex];
            }

            $rows[] = $row;
        }

        return $this->renderWithVariable($variableName, $rows);
    }

    /**
     * Assigns $value to the template variable $name, renders children,
     * then cleans up.
     */
    private function renderWithVariable(string $name, array $value): mixed
    {
        $variableProvider = $this->renderingContext->getVariableProvider();

        if ($variableProvider->exists($name)) {
            $variableProvider->remove($name);
        }

        $variableProvider->add($name, $value);
        $output = $this->renderChildren();
        $variableProvider->remove($name);

        return $output;
    }
}

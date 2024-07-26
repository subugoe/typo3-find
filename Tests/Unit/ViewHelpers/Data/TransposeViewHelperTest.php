<?php

namespace Subugoe\Find\Tests\Unit\ViewHelpers\Data;

/* * *************************************************************
 *  Copyright notice
 *
 *  (c) 2015 Ingo Pfennigstorf <pfennigstorf@sub-goettingen.de>
 *
 *  All rights reserved
 *
 *  This script is part of the TYPO3 project. The TYPO3 project is
 *  free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  The GNU General Public License can be found at
 *  http://www.gnu.org/copyleft/gpl.html.
 *
 *  This script is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  This copyright notice MUST APPEAR in all copies of the script!
 * ************************************************************* */
use Nimut\TestingFramework\TestCase\ViewHelperBaseTestcase;
use PHPUnit\Framework\MockObject\MockObject;
use Subugoe\Find\ViewHelpers\Data\TransposeViewHelper;
use TYPO3Fluid\Fluid\Core\Variables\StandardVariableProvider;

/**
 * Test for Transpose ViewHelper.
 */
class TransposeViewHelperTest extends ViewHelperBaseTestcase
{
    public TransposeViewHelper|MockObject $fixture;

    /**
     * @var StandardVariableProvider
     */
    public $templateVariableContainer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->fixture = $this->getMockBuilder(TransposeViewHelper::class)->onlyMethods(['renderChildren'])->getMock();
        $this->injectDependenciesIntoViewHelper($this->fixture);
    }

    /**
     * @test
     * @doesNotPerformAssertions
     */
    public function arrayIsTransposed(): void
    {
        $arguments = [
            'arrays' => [
                'horus' => ['b:ehedeti', 'h:rdr'],
                'behedeti' => ['h:orus', 'h:rdr'],
            ],
            'name' => 'hrdr',
        ];
        $expected = [
            [
                'horus' => 'b:ehedeti',
                'behedeti' => 'h:orus',
            ],
            [
                'horus' => 'h:rdr',
                'behedeti' => 'h:rdr',
            ],
        ];

        $this->fixture->setArguments($arguments);
        $variableProvider = $this->renderingContext->getVariableProvider();
        $this->fixture->expects(self::at(0))->method('add')->with('hrdr', $expected);
        $this->fixture->expects(self::at(1))->method('remove')->with('hrdr');

        $this->fixture->initializeArgumentsAndRender();
    }

    /**
     * @test
     */
    public function anErrorIsReportedWhenArraysDoNotMatchInLength(): void
    {
        $arguments = [
            'arrays' => [
                'horus' => ['behedeti'],
                'behedeti' => ['hrdr', 'horus'],
            ],
        ];

        $this->fixture->setArguments($arguments);
        self::assertStringContainsStringIgnoringCase('The arrays passed in the »arrays« argument do not have identical numbers of values',
            $this->fixture->initializeArgumentsAndRender());
    }
}

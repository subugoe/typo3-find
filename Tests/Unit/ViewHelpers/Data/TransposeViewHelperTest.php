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

use Subugoe\Find\ViewHelpers\Data\TransposeViewHelper;
use TYPO3\CMS\Core\Tests\BaseTestCase;
use TYPO3\CMS\Fluid\Core\ViewHelper\TemplateVariableContainer;

/**
 * Test for Transpose ViewHelper.
 */
class TransposeViewHelperTest extends BaseTestCase
{
    /**
     * @var \Subugoe\Find\ViewHelpers\Data\TransposeViewHelper
     */
    public $fixture;

    /**
     * @var TemplateVariableContainer
     */
    public $templateVariableContainer;

    public function setUp()
    {
        parent::setUp();
        $this->fixture = $this->getAccessibleMock(TransposeViewHelper::class, ['renderChildren']);
        $this->fixture->initializeArguments();
    }

    /**
     * @test
     */
    public function arrayIsTransposed()
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
        $this->templateVariableContainer = $this->getAccessibleMock(TemplateVariableContainer::class, ['add', 'remove']);
        $this->templateVariableContainer->expects($this->at(0))->method('add')->with('hrdr', $expected);
        $this->templateVariableContainer->expects($this->at(1))->method('remove')->with('hrdr');
        $this->inject($this->fixture, 'templateVariableContainer', $this->templateVariableContainer);

        $this->fixture->render();
    }

    /**
     * @test
     */
    public function anErrorIsReportedWhenArraysDoNotMatchInLength()
    {
        $arguments = [
            'arrays' => [
                'horus' => ['behedeti'],
                'behedeti' => ['hrdr', 'horus'],
            ],
        ];

        $this->fixture->setArguments($arguments);
        $this->assertContains('The arrays passed in the »arrays« argument do not have identical numbers of values',
            $this->fixture->render());
    }
}

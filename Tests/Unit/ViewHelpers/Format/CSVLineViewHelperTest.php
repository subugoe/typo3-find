<?php

namespace Subugoe\Find\Tests\Unit\ViewHelpers\Format;

/* * *************************************************************
 *  Copyright notice
 *
 *  (c) 2015 Ingo Pfennigstorf <pfennigstorf@sub-goettingen.de>
 *      Goettingen State Library
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
use Subugoe\Find\ViewHelpers\Format\CSVLineViewHelper;

/**
 * CSV line viewhelper test.
 */
class CSVLineViewHelperTest extends ViewHelperBaseTestcase
{
    /**
     * @var CSVLineViewHelper
     */
    protected $fixture;

    protected function setUp(): void
    {
        parent::setUp();

        $this->fixture = $this->getMockBuilder(CSVLineViewHelper::class)
            ->addMethods(['dummy'])
            ->getMock();
        $this->injectDependenciesIntoViewHelper($this->fixture);
    }

    /**
     * @test
     */
    public function arrayIsRenderedAsCommaSeparatedValue(): void
    {
        $data = ['hrdr', 'behedeti', 'chub'];
        $fieldDelimiter = ',';
        $fieldEnclosure = '"';

        $this->fixture->setArguments([
            'data' => $data,
            'fieldDelimiter' => $fieldDelimiter,
            'fieldEnclosure' => $fieldEnclosure,
        ]);

        $expected = 'hrdr,behedeti,chub'.PHP_EOL;
        self::assertSame($expected, $this->fixture->initializeArgumentsAndRender());
    }

    /**
     * @test
     */
    public function specifyingADelimiterWorks(): void
    {
        $data = ['hrdr', 'behedeti', 'chub'];
        $fieldDelimiter = ';';
        $fieldEnclosure = '"';

        $this->fixture->setArguments([
            'data' => $data,
            'fieldDelimiter' => $fieldDelimiter,
            'fieldEnclosure' => $fieldEnclosure,
        ]);

        $expected = 'hrdr;behedeti;chub'.PHP_EOL;
        self::assertSame($expected, $this->fixture->initializeArgumentsAndRender());
    }

    /**
     * @test
     */
    public function valuesWithSpacesAreEnclosed(): void
    {
        $data = ['hrdr horus', 'behedeti', 'chub budan'];
        $fieldDelimiter = ';';
        $fieldEnclosure = '"';

        $this->fixture->setArguments([
            'data' => $data,
            'fieldDelimiter' => $fieldDelimiter,
            'fieldEnclosure' => $fieldEnclosure,
        ]);

        $expected = '"hrdr horus";behedeti;"chub budan"'.PHP_EOL;
        self::assertSame($expected, $this->fixture->initializeArgumentsAndRender());
    }

    /**
     * @test
     */
    public function specifyingAnEnclosureWrapsTheElements(): void
    {
        $data = ['hrdr horus', 'behedeti', 'chub budan'];
        $fieldDelimiter = ';';
        $fieldEnclosure = '/';

        $this->fixture->setArguments([
            'data' => $data,
            'fieldDelimiter' => $fieldDelimiter,
            'fieldEnclosure' => $fieldEnclosure,
        ]);

        $expected = '/hrdr horus/;behedeti;/chub budan/'.PHP_EOL;
        self::assertSame($expected, $this->fixture->initializeArgumentsAndRender());
    }
}

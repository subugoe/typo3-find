<?php

namespace Subugoe\Find\Tests\Unit\ViewHelpers\LinkedData;

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
use Subugoe\Find\ViewHelpers\Logic\AndViewHelper;
use TYPO3\CMS\Core\Tests\BaseTestCase;

/**
 * Tests for the AND viewhelper.
 */
class AndViewHelperTest extends BaseTestCase
{
    /**
     * @var AndViewHelper
     */
    protected $fixture;

    /**
     * @return array
     */
    public function conditionProvider()
    {
        return [
            [
                [
                    (1 === 1),
                ],
                true,
            ],
            [
                [(true === true)],
                true,
            ],
            [
                [
                    (true === true),
                    (1 === 1),
                    ('hrdr' === 'hrdr'),
                    ('hrdr' == 'hrdr'),
                    (true == 1),
                ],
                true,
            ],
            [
                [
                    (true === true),
                    (1 === 2),
                    ('hrdr' === 'hrdr'),
                    ('hrdr' == 'hrdr'),
                    (true == 1),
                ],
                false,
            ],
            [
                [
                    (1 === 2),
                ],
                false,
            ],
            [
                [
                    (true === true),
                    (1 === 1),
                    ('hrdr' === 'hrdr'),
                    ('hrdr' == 'hrdr'),
                    (true == 0),
                ],
                false,
            ],
        ];
    }

    public function setUp()
    {
        $this->fixture = $this->getMock(AndViewHelper::class, ['dummy']);
    }

    /**
     * @test
     * @dataProvider conditionProvider
     */
    public function conditionIsTrue($conditions, $expected)
    {
        $this->fixture->setArguments([
            'conditions' => $conditions,
        ]);

        $this->assertSame($expected, $this->fixture->render());
    }
}

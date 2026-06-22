<?php

namespace Subugoe\Find\Tests\Unit\ViewHelpers\Logic;

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

use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Test;
use Subugoe\Find\ViewHelpers\Logic\AndViewHelper;
use TYPO3\TestingFramework\Core\Unit\UnitTestCase;
use TYPO3Fluid\Fluid\Core\ViewHelper\ViewHelperInvoker;
use TYPO3Fluid\Fluid\View\TemplateView;

class AndViewHelperTest extends UnitTestCase
{
    public static function conditionProvider(): array
    {
        return [
            [
                [
                    1 === 1,
                ],
                true,
            ],
            [
                [true === true],
                true,
            ],
            [
                [
                    true === true,
                    1 === 1,
                    'hrdr' === 'hrdr',
                    'hrdr' === 'hrdr',
                    true == 1,
                ],
                true,
            ],
            [
                [
                    true === true,
                    1 === 2,
                    'hrdr' === 'hrdr',
                    'hrdr' === 'hrdr',
                    true == 1,
                ],
                false,
            ],
            [
                [
                    1 === 2,
                ],
                false,
            ],
            [
                [
                    true === true,
                    1 === 1,
                    'hrdr' === 'hrdr',
                    'hrdr' === 'hrdr',
                    true == 0,
                ],
                false,
            ],
        ];
    }

    #[Test]
    #[DataProvider(methodName: 'conditionProvider')]
    public function conditionIsTrue(array $conditions, bool $expected): void
    {
        $view = new TemplateView();
        $renderingContext = $view->getRenderingContext();

        $invoker = new ViewHelperInvoker();
        $result = $invoker->invoke(
            AndViewHelper::class,
            ['conditions' => $conditions],
            $renderingContext,
        );

        self::assertSame($expected, $result);
    }
}

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

use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Test;
use Subugoe\Find\ViewHelpers\Format\RegexpViewHelper;
use TYPO3\TestingFramework\Core\Unit\UnitTestCase;
use TYPO3Fluid\Fluid\Core\ViewHelper\ViewHelperInvoker;
use TYPO3Fluid\Fluid\View\TemplateView;

class RegexpViewHelperTest extends UnitTestCase
{
    public static function regexProvider(): array
    {
        return [
            ['behedeti', '/hed/', 'hrdr', false, 'behrdreti'],
            ['behedeti', '/beh/', 'hrdr', false, 'hrdredeti'],
            ['horus', '|ho|', 'sy', false, 'syrus'],
            ['ClubMate667', '/[a-zA-Z]*\d*/', 'Cola', false, 'ColaCola'],
            ['ClubMate667', '/\w*/', 'Cola', false, 'ColaCola'],

            ['ClubMate667', '\w*', 'Cola', true, 'ColaCola'],
            ['behedeti', 'hed', 'hrdr', true, 'behrdreti'],
            ['behedeti', 'beh', 'hrdr', true, 'hrdredeti'],
            ['horus', 'ho', 'sy', true, 'syrus'],
            ['ClubMate667', '[a-zA-Z]*[0-9]*', 'Cola', true, 'ColaCola'],
            ['behedeti', 'hed', '', true, 'beeti'],
            ['beあdeti', 'あ', '', true, 'bedeti'],

            ['behedeti', '/hed/', null, false, 1],
            ['behedeti', '/beh/', null, false, 1],
            ['horus', '|ho|', null, false, 1],
            ['ClubMate667', '/[a-zA-Z]*\d*/', null, false, 1],
            ['ClubMate667', '/\w*/', null, false, 1],
        ];
    }

    #[Test]
    #[DataProvider(methodName: 'regexProvider')]
    public function stringIsReplaced(string $string, string $match, ?string $replace, bool $useMBEreg, string|int $expected): void
    {

        $view = new TemplateView();
        $renderingContext = $view->getRenderingContext();

        $invoker = new ViewHelperInvoker();
        $result = $invoker->invoke(
            RegexpViewHelper::class,
            [
                'string' => $string,
                'match' => $match,
                'replace' => $replace,
                'useMBEreg' => $useMBEreg,
            ],
            $renderingContext,
        );

        self::assertSame($expected, $result);

    }
}

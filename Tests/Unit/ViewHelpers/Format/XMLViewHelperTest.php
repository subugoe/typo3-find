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
use Subugoe\Find\ViewHelpers\Format\XMLViewHelper;
use TYPO3\TestingFramework\Core\Unit\UnitTestCase;
use TYPO3Fluid\Fluid\Core\ViewHelper\ViewHelperInvoker;
use TYPO3Fluid\Fluid\View\TemplateView;

class XMLViewHelperTest extends UnitTestCase
{
    public static function stringProvider(): array
    {
        return [
            [
                '<a><b><c/></b><b>d</b></a>',
                false,
                '<?xml version="1.0"?>
<a>
  <b>
    <c/>
  </b>
  <b>d</b>
</a>' . PHP_EOL,
            ],
            ['<a><b><c/></b><b>d</b></a>', true, '<a><b><c></c></b><b>d</b></a>' . PHP_EOL],
        ];
    }

    #[Test]
    #[DataProvider(methodName: 'stringProvider')]
    public function xmlIsCorrectlyFormatted(string $string, bool $htmloutput, string $expected): void
    {
        $view = new TemplateView();
        $renderingContext = $view->getRenderingContext();

        $invoker = new ViewHelperInvoker();
        $result = $invoker->invoke(
            XMLViewHelper::class,
            ['htmloutput' => $htmloutput],
            $renderingContext,
            static fn(): string => $string,
        );

        self::assertSame($expected, $result);
    }
}

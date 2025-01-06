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
use Subugoe\Find\ViewHelpers\Format\StripViewHelper;
use TYPO3\CMS\Fluid\Core\Rendering\RenderingContext;
use TYPO3\TestingFramework\Core\BaseTestCase;

/**
 * Tests for the whitespace stripping viewhelper.
 */
class StripViewHelperTest extends BaseTestCase
{
    /**
     * @var StripViewHelper
     */
    protected $fixture;

    public static function stringProvider(): array
    {
        return [
            ['a', false, 'a'],
            ['  *spacious text*	', null, '*spacious text*'],
            ['  *spacious text*	', ' ', '*spacious text*	'],
            ['  *spacious text*	', '	', '  *spacious text*'],
        ];
    }

    protected function setUp(): void
    {
        parent::setUp();
        $this->fixture = $this->getAccessibleMock(StripViewHelper::class, null);
        $this->fixture->setRenderingContext($this->getMockBuilder(RenderingContext::class)->disableOriginalConstructor()->getMock());
    }

    #[Test]
    #[DataProvider('stringProvider')]
    public function whitespaceIsCorrectlyRemovedFromString($string, $strip, $expected): void
    {
        $this->fixture->setArguments([
            'string' => $string,
            'strip' => $strip,
        ]);

        self::assertSame($expected, $this->fixture->initializeArgumentsAndRender());
    }
}

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
use Nimut\TestingFramework\TestCase\ViewHelperBaseTestcase;
use PHPUnit\Framework\MockObject\MockObject;
use Subugoe\Find\Tests\Unit\ViewHelpers\MockRenderingContextTrait;
use Subugoe\Find\ViewHelpers\LinkedData\ItemViewHelper;
use TYPO3Fluid\Fluid\Core\Variables\StandardVariableProvider;

/**
 * Tests for the item viewhelper.
 */
class ItemViewHelperTest extends ViewHelperBaseTestcase
{
    use MockRenderingContextTrait;

    /**
     * @var ItemViewHelper
     */
    protected ItemViewHelper|MockObject $fixture;

    /**
     * @var StandardVariableProvider
     */
    protected $templateVariableContainer;

    /**
     * @return array
     */
    public function linkedDataProvider()
    {
        return [
            ['hrdr', 'is', 'thirsty', null, null, null, 'hrdr'],
        ];
    }

    protected function setUp(): void
    {
        parent::setUp();
        $this->fixture = $this->getMockBuilder(ItemViewHelper::class)
            ->addMethods(['dummy'])
            ->getMock();
        $this->templateVariableContainer = $this->getMockBuilder(StandardVariableProvider::class)
            ->onlyMethods(['add', 'get', 'remove', 'exists'])
            ->getMock();
        $this->injectDependenciesIntoViewHelper($this->fixture);
    }

    /**
     * @test
     * @dataProvider linkedDataProvider
     * @doesNotPerformAssertions
     */
    public function itemsAreAddedToContainer($subject, $predicate, $object, $objectType, $language, $name, $expected): void
    {
        $this->fixture->setArguments(
            [
                'subject' => $subject,
                'predicate' => $predicate,
                'object' => $object,
                'objectType' => $objectType,
                'language' => $language,
                'name' => $name,
            ]
        );
        $this->fixture->expects(self::once())->method('remove')->with($name);
        $this->fixture->expects(self::once())->method('add')->with($name)->willReturn('');
        $this->inject($this->fixture, 'templateVariableContainer', $this->renderingContext->getVariableProvider());

        $this->fixture->initializeArgumentsAndRender();

        self::markTestIncomplete('Todo');
    }
}

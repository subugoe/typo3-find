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

use Subugoe\Find\Tests\Unit\ViewHelpers\MockRenderingContextTrait;
use Subugoe\Find\ViewHelpers\LinkedData\ItemViewHelper;
use TYPO3\CMS\Core\Tests\BaseTestCase;
use TYPO3\CMS\Fluid\Core\ViewHelper\TemplateVariableContainer;

/**
 * Tests for the item viewhelper.
 */
class ItemViewHelperTest extends BaseTestCase
{
    use MockRenderingContextTrait;

    /**
     * @var ItemViewHelper
     */
    protected $fixture;

    /**
     * @var TemplateVariableContainer
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

    public function setUp()
    {
        $this->fixture = $this->getMock(ItemViewHelper::class, ['dummy']);
        $this->templateVariableContainer = $this->getMock(
            TemplateVariableContainer::class,
            ['add', 'get', 'remove', 'exists']
        );

        $this->createRenderingContextMock();
        $this->inject($this->fixture, 'renderingContext', $this->renderingContextMock);
    }

    /**
     * @test
     * @dataProvider linkedDataProvider
     */
    public function itemsAreAddedToContainer($subject, $predicate, $object, $objectType, $language, $name, $expected)
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
        $this->templateVariableContainer->expects($this->once())->method('remove')->with($name);
        $this->templateVariableContainer->expects($this->once())->method('add')->with($name)->will(
            $this->returnValue('')
        );
        $this->inject($this->fixture, 'templateVariableContainer', $this->templateVariableContainer);

        $this->fixture->render();

        $this->markTestIncomplete('Todo');
    }
}

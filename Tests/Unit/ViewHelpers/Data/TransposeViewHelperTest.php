<?php

namespace Subugoe\Find\Tests\Unit\ViewHelpers\Data;

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
        $this->fixture = $this->getMockBuilder(TransposeViewHelper::class)
            ->setMethods(['render'])
            ->getMock();
        $this->injectDependenciesIntoViewHelper($this->fixture);
    }

    /**
     * @test
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
            ['horus' => 'b:ehedeti', 'behedeti' => 'h:orus'],
            ['horus' => 'h:rdr', 'behedeti' => 'h:rdr'],
        ];

        $this->fixture->expects($this->any())
            ->method('render')
            ->with($arguments)
            ->willReturn(['transpose' => $expected]);
        $result = $this->fixture->render($arguments);
        $this->assertArrayHasKey('transpose', $result);
        $this->assertEquals($expected, $result['transpose']);
    }
}

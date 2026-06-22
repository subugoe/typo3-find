<?php

namespace Subugoe\Find\Tests\Unit\ViewHelpers\Data;

use PHPUnit\Framework\Attributes\Test;
use Psr\Log\NullLogger;
use Subugoe\Find\ViewHelpers\Data\TransposeViewHelper;
use TYPO3\TestingFramework\Core\Unit\UnitTestCase;
use TYPO3Fluid\Fluid\Core\Rendering\RenderingContextInterface;
use TYPO3Fluid\Fluid\View\TemplateView;

class TransposeViewHelperTest extends UnitTestCase
{
    private RenderingContextInterface $renderingContext;

    protected function setUp(): void
    {
        parent::setUp();
        $this->renderingContext = (new TemplateView())->getRenderingContext();
    }

    /**
     * Instantiate the ViewHelper directly (bypassing GeneralUtility::makeInstance)
     * so we can inject NullLogger via constructor.
     */
    private function makeViewHelper(): TransposeViewHelper
    {
        $vh = new TransposeViewHelper(new NullLogger());
        $vh->setRenderingContext($this->renderingContext);
        $vh->initializeArguments();
        return $vh;
    }

    /**
     * Invoke the ViewHelper and capture the variable set in the variable provider
     * via the renderChildren closure.
     */
    private function invokeAndCaptureVariable(array $arrays, string $name): array
    {
        $captured = [];
        $vh = $this->makeViewHelper();
        $vh->setArguments(['arrays' => $arrays, 'name' => $name]);

        // Override renderChildren by setting a closure on the view helper node
        // We capture the variable during the render call
        $variableProvider = $this->renderingContext->getVariableProvider();

        // Use a child node closure via renderChildren override
        $vh->setRenderChildrenClosure(function () use ($name, $variableProvider, &$captured): string {
            $captured = $variableProvider->get($name) ?? [];
            return '';
        });

        $vh->render();

        return $captured;
    }

    #[Test]
    public function arrayIsTransposed(): void
    {
        $result = $this->invokeAndCaptureVariable(
            [
                'horus'    => ['b:ehedeti', 'h:rdr'],
                'behedeti' => ['h:orus', 'h:rdr'],
            ],
            'hrdr'
        );

        self::assertSame(
            [
                ['horus' => 'b:ehedeti', 'behedeti' => 'h:orus'],
                ['horus' => 'h:rdr', 'behedeti' => 'h:rdr'],
            ],
            $result
        );
    }

    #[Test]
    public function emptyArraysResultInEmptyRows(): void
    {
        $result = $this->invokeAndCaptureVariable([], 'rows');
        self::assertSame([], $result);
    }

    #[Test]
    public function singleColumnIsTransposedToRows(): void
    {
        $result = $this->invokeAndCaptureVariable(
            ['name' => ['Alice', 'Bob', 'Charlie']],
            'rows'
        );

        self::assertSame(
            [
                ['name' => 'Alice'],
                ['name' => 'Bob'],
                ['name' => 'Charlie'],
            ],
            $result
        );
    }

    #[Test]
    public function mismatchedArrayLengthsReturnEmptyRows(): void
    {
        $result = $this->invokeAndCaptureVariable(
            [
                'name' => ['Alice', 'Bob'],
                'age'  => [30],
            ],
            'rows'
        );

        self::assertSame([], $result);
    }

    #[Test]
    public function variableIsRemovedFromProviderAfterRendering(): void
    {
        $this->invokeAndCaptureVariable(
            ['name' => ['Alice']],
            'rows'
        );

        self::assertFalse($this->renderingContext->getVariableProvider()->exists('rows'));
    }

    #[Test]
    public function traversableColumnsAreHandled(): void
    {
        $result = $this->invokeAndCaptureVariable(
            [
                'name' => new \ArrayIterator(['Alice', 'Bob']),
                'age'  => new \ArrayIterator([30, 25]),
            ],
            'rows'
        );

        self::assertSame(
            [
                ['name' => 'Alice', 'age' => 30],
                ['name' => 'Bob', 'age' => 25],
            ],
            $result
        );
    }
}

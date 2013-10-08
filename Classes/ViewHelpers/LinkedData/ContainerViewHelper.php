<?php
/*******************************************************************************
 * Copyright notice
 *
 * Copyright 2013 Sven-S. Porst, Göttingen State and University Library
 *                <porst@sub.uni-goettingen.de>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 ******************************************************************************/

namespace Subugoe\Find\ViewHelpers\LinkedData;



/**
 * View Helper to create a container for linked data output.
 * Add data by using the linkedDataItem View Helper inside it.
 */
class ContainerViewHelper extends \TYPO3\CMS\Fluid\Core\ViewHelper\AbstractViewHelper {

	/**
	 * Registers own arguments.
	 */
	public function initializeArguments () {
		parent::initializeArguments();
		$this->registerArgument('format', 'string', 'The linked data format to create', FALSE, 'turtle');
		$this->registerArgument('base', 'string', 'The base name', FALSE, NULL);
		$this->registerArgument('prefixes', 'array', 'The namespace names to use', FALSE, array());

		$this->registerArgument('name', 'string', 'The name of the template variable to store the data in', FALSE, 'linkedDataContainer');
	}


	/**
	 * @return string
	 */
	public function render () {
		$this->templateVariableContainer->add($this->arguments['name'], array());

		$this->renderChildren();
		$items = $this->templateVariableContainer->get($this->arguments['name'], $items);
		$this->templateVariableContainer->remove($this->arguments['name']);

		$LDRenderer = Renderer\AbstractRenderer::instantiateSubclassForType($this->arguments['format']);
		$LDRenderer->setPrefixes($this->arguments['prefixes']);
		$result = $LDRenderer->renderItems($items);

		return $result;
	}



}

?>
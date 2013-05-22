<?php

/* * *************************************************************
 *  Copyright notice
 *
 *  (c) 2013 Ingo Pfennigstorf <pfennigstorf@sub-goettingen.de>
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

/**
 * Test for ValueForKey ViewHelper
 */
class Tx_SolrFrontend_Tests_Unit_ViewHelpers_ValueForKeyViewHelperTest extends Tx_Phpunit_TestCase {

	/**
	 * @var Tx_SolrFrontend_ViewHelpers_ValueForKeyViewHelper
	 */
	public $fixture;

	public function setUp() {
		$this->fixture = new Tx_SolrFrontend_ViewHelpers_ValueForKeyViewHelper();
	}

	/**
	 * @test
	 */
	public function keyPicksTheRightValueFromTheArray() {
		$this->fixture->setArguments(array('array' => (array('a' => 'b', 'b' => 'c')), 'key' => 'a'));
		$this->assertSame('b', $this->fixture->render());
	}

	/**
	 * @test
	 */
	public function resultIsCorrectlyInterpretedAsJsonFromASimpleValue() {
		$this->fixture->setArguments(array('array' => (array('a' => 'b', 'b' => 'c')), 'key' => 'a', 'format' => 'json'));
		$this->assertSame('"b"', $this->fixture->render());
	}

	/**
	 * @test
	 */
	public function resultIsCorrectlyInterpretedAsTextFromASimpleValue() {
		$this->fixture->setArguments(array('array' => (array('a' => 'b', 'b' => 'c')), 'key' => 'a', 'format' => 'text'));
		$this->assertSame('b', $this->fixture->render());
	}

	/**
	 * @test
	 */
	public function providingANonexistingKeyReturnsNull() {
		$this->fixture->setArguments(array('array' => (array('a' => 'b', 'b' => 'c')), 'key' => 'c'));
		$this->assertNull($this->fixture->render());
	}

}
<?php

namespace Subugoe\Tests\Unit\Service;

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
use Subugoe\Find\Service\SolrServiceProvider;
use TYPO3\CMS\Core\Tests\BaseTestCase;

/**
 * Solr ServiceProvider Test.
 */
class SolrServiceProviderTest extends BaseTestCase
{
    /**
     * @var \Subugoe\Find\Service\SolrServiceProvider
     */
    protected $fixture;

    public function setUp()
    {
        $this->fixture = $this->getAccessibleMock(SolrServiceProvider::class, ['dummy'], ['default', []]);
    }

    /**
     * @test
     */
    public function setConfigurationAddsTheValueToConfigurationArray()
    {
        $key = 'foo';
        $value = 'bar';

        $this->fixture->setConfigurationValue($key, $value);
        $this->assertArrayHasKey($key, $this->fixture->getConfiguration());
    }

    /**
     * @test
     */
    public function setConfigurationAddsAKeyValuePairToAnExistingConfiguration()
    {
        $key = 'foo';
        $value = 'bar';

        $key1 = 'bar';
        $value1 = 'baz';

        $this->fixture->setConfigurationValue($key1, $value1);
        $this->fixture->setConfigurationValue($key, $value);
        $this->assertArrayHasKey($key, $this->fixture->getConfiguration());
        $this->assertArrayHasKey($key1, $this->fixture->getConfiguration());
    }
}

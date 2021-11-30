<?php

namespace Subugoe\Find\Service;

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

/**
 * Interface for search engine provider.
 */
interface ServiceProviderInterface
{
    /**
     * @param string $connectionName
     * @param array $settings
     */
    public function __construct(string $connectionName, array $settings);

    public function connect();

    public function getConfiguration();

    public function getDefaultQuery();

    public function getDocumentById(string $id);

    public function getRequestArguments();

    public function isExtendedSearch();

    /**
     * @param $query
     *
     * @return mixed
     */
    public function search($query);

    /**
     * @param string $actionName
     */
    public function setAction($actionName);

    /**
     * @param $key
     * @param $value
     *
     * @return mixed
     */
    public function setConfigurationValue($key, $value);

    /**
     * @param string $key
     */
    public function setControllerExtensionKey($key);

    public function setCounter();

    /**
     * @param array $requestArguments
     *
     * @return mixed
     */
    public function setRequestArguments($requestArguments);

    /**
     * @param $settings
     *
     * @return mixed
     */
    public function suggestQuery($settings);
}

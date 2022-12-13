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
    public function __construct(string $connectionName, array $settings);

    public function connect(): void;

    public function getConfiguration(): array;

    public function getDefaultQuery(): array;

    public function getDocumentById(string $id): array;

    public function getRequestArguments(): array;

    public function isExtendedSearch(): bool;

    /**
     * @param $query
     *
     * @return mixed
     */
    public function search($query);

    public function setAction(string $actionName): void;

    /**
     * @param $key
     * @param $value
     *
     * @return mixed
     */
    public function setConfigurationValue($key, $value): void;

    public function setControllerExtensionKey(string $key): void;

    public function setCounter(): void;

    public function setRequestArguments(array $requestArguments): void;

    public function suggestQuery(array $settings): array;
}

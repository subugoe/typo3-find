<?php

declare(strict_types=1);

namespace Subugoe\Find\Utility;

/* * *************************************************************
 *  Copyright notice
 *
 *  (c) 2015 Ingo Pfennigstorf <pfennigstorf@sub-goettingen.de>
 *      Göttingen State Library
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

class ArrayUtility
{
    /**
     * Recursively cleans an arguments array:
     * - Removes keys beginning with "__"
     * - Removes elements that are empty strings
     * Call this on $_GET, $_POST, or Extbase argument arrays before use.
     */
    public static function cleanArgumentsArray(array $array): array
    {
        foreach ($array as $key => $value) {
            if (is_string($key) && str_starts_with($key, '__') || $value === '') {
                unset($array[$key]);
            } elseif (is_array($value)) {
                $cleaned = self::cleanArgumentsArray($value);
                if ($cleaned === []) {
                    unset($array[$key]);
                } else {
                    $array[$key] = $cleaned;
                }
            }
        }

        return $array;
    }
}

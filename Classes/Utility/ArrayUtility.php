<?php

namespace Subugoe\Find\Utility;

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
 * Array Helper.
 */
class ArrayUtility
{
    /**
     * Removes all values from $array whose
     * * keys begin with __
     * * values are an empty string.
     *
     * Specifically aimed at the __hmac and __referrer keys introduced by Fluid
     * forms as well as the text submitted by empty search form fields.
     *
     * @param array $array
     *
     * @return array
     */
    public static function cleanArgumentsArray($array)
    {
        foreach ($array as $key => &$value) {
            if (0 === strpos($key, '__') || '' === $value) {
                unset($array[$key]);
            } else {
                if (is_array($value)) {
                    self::cleanArgumentsArray($value);
                }
            }
        }

        return $array;
    }
}

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
     *
     * - Removes string keys beginning with "__" (Extbase internal arguments
     *   such as __referrer and __trustedProperties).
     * - Removes elements whose value is an empty string.
     * - Removes sub-arrays that become empty after recursive cleaning.
     *
     * Only empty strings are removed from scalar values — null, false, 0,
     * and '0' are kept intentionally so that legitimate falsy query terms
     * (e.g. searching for the digit zero) are not silently discarded.
     *
     * Call this on $request->getArguments() or equivalent before passing
     * arguments to the search provider.
     */
    public static function cleanArgumentsArray(array $array): array
    {
        foreach ($array as $key => $value) {
            // Check the __ prefix condition and the empty-string condition
            // in explicit, separately parenthesised groups so that operator
            // precedence cannot cause either branch to accidentally apply
            // when only the other was intended.
            $isInternalKey  = is_string($key) && str_starts_with($key, '__');
            $isEmptyString  = $value === '';

            if ($isInternalKey || $isEmptyString) {
                unset($array[$key]);
            } elseif (is_array($value)) {
                $cleaned = self::cleanArgumentsArray($value);

                // Remove the key entirely if cleaning left an empty array,
                // so that callers do not have to guard against empty sub-arrays.
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

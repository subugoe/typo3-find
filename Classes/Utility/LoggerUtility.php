<?php

declare(strict_types=1);

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
 * Utility for converting exceptions into structured arrays suitable for
 * PSR-3 logger context parameters.
 *
 * All methods are static. This class must not be instantiated.
 */
final class LoggerUtility
{
    /**
     * Not instantiable — pure static utility class.
     */
    private function __construct() {}

    /**
     * Converts a Throwable into a structured array for use as PSR-3 logger
     * context data (e.g. the second argument to $logger->error()).
     *
     * The stack trace is included both as a structured array (for log
     * aggregators such as Sentry or Graylog that can index individual frames)
     * and as a pre-formatted string (for plain-text log backends).
     *
     * Previous exceptions in the chain are included by default up to
     * $maxDepth levels deep to prevent unbounded recursion on pathological
     * exception chains.
     *
     * @param \Throwable $exception       The exception to convert.
     * @param bool       $includePrevious Whether to include the previous
     *                                    exception chain. Defaults to true.
     * @param int        $maxDepth        Maximum chain depth to follow.
     *                                    Defaults to 10.
     *
     * @return array{
     *     class:    string,
     *     message:  string,
     *     code:     int|string,
     *     file:     string,
     *     line:     int,
     *     trace:    list<array<string,mixed>>,
     *     traceAsString: string,
     *     previous: array|null
     * }
     */
    public static function exceptionToArray(
        \Throwable $exception,
        bool $includePrevious = true,
        int $maxDepth = 10,
    ): array {
        $array = [
            // Include the class so log readers can distinguish exception types
            // without having to parse the message string.
            'class'         => $exception::class,
            'message'       => $exception->getMessage(),
            'code'          => $exception->getCode(),
            'file'          => $exception->getFile(),
            'line'          => $exception->getLine(),
            // Structured trace allows log aggregators to index individual frames.
            'trace'         => $exception->getTrace(),
            // Pre-formatted string for plain-text log backends.
            'traceAsString' => $exception->getTraceAsString(),
            'previous'      => null,
        ];

        $previous = $exception->getPrevious();

        if ($includePrevious && $maxDepth > 0 && $previous instanceof \Throwable) {
            $array['previous'] = self::exceptionToArray($previous, true, $maxDepth - 1);
        }

        return $array;
    }
}

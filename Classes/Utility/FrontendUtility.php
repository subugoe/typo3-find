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

/**
 * Utility for JavaScript and view helpers in the frontend.
 */
class FrontendUtility
{
    /**
     * Generates a JSON-encoded string representing the active query and its
     * paging/facet data, suitable for embedding as the `underlyingQuery`
     * JavaScript variable.
     *
     * @param array|string $query     Query parameter(s)
     * @param array        $settings  Complete plugin or extension settings
     * @param int|null     $position  Position in result list (1-based, null if not applicable)
     * @param array        $arguments Arguments array (request arguments or override)
     *
     * @return string JSON string or empty string if detail page paging is disabled
     *
     * @throws \JsonException
     */
    public static function addQueryInformationAsJavaScript(
        array|string $query,
        array $settings,
        ?int $position = null,
        array $arguments = []
    ): string {
        if (empty($settings['paging']['detailPagePaging'])) {
            return '';
        }

        // If the arguments contain an 'underlyingQuery' sub-array, unwrap it
        if (isset($arguments['underlyingQuery']) && is_array($arguments['underlyingQuery'])) {
            $arguments = $arguments['underlyingQuery'];
        }

        $underlyingQuery = ['q' => $query];

        if (!empty($arguments['facet']) && is_array($arguments['facet'])) {
            $underlyingQuery['facet'] = $arguments['facet'];
        }

        if ($position !== null) {
            $underlyingQuery['position'] = max(1, $position);
        }

        if (isset($arguments['count'])) {
            $underlyingQuery['count'] = (int)$arguments['count'];
        } elseif (isset($settings['paging']['perPage'])) {
            $underlyingQuery['count'] = (int)$settings['paging']['perPage'];
        }

        if (isset($arguments['sort']) && is_string($arguments['sort']) && $arguments['sort'] !== '') {
            $underlyingQuery['sort'] = $arguments['sort'];
        }

        return json_encode(
            $underlyingQuery,
            JSON_THROW_ON_ERROR | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT
        );
    }

    /**
     * Calculates index values for detail navigation based on a position key.
     *
     * Position is 1-based (first result = 1). The returned array provides:
     *   - positionIndex:     0-based index of the current document
     *   - previousIndex:     0-based Solr `start` value to fetch from
     *   - nextIndex:         0-based index of the row after the current document
     *   - resultIndexOffset: offset within the fetched window where the current document sits
     *
     * @param array $underlyingQueryInfo Array including at least a 'position' key (1-based).
     *
     * @return array{positionIndex: int, previousIndex: int, nextIndex: int, resultIndexOffset: int}
     */
    public static function getIndexes(array $underlyingQueryInfo): array
    {
        $position = max(1, (int)($underlyingQueryInfo['position'] ?? 1));

        $positionIndex = $position - 1;
        $previousIndex = max($positionIndex - 1, 0);
        $nextIndex = $position; // 0-based index of the document AFTER the current one

        // When the current document is the very first result, there is no previous
        // document, so the current document is at offset 0 in the fetched window.
        // Otherwise it is at offset 1 (the previous document is at 0).
        $resultIndexOffset = ($positionIndex === 0) ? 0 : 1;

        return [
            'positionIndex' => $positionIndex,
            'previousIndex' => $previousIndex,
            'nextIndex' => $nextIndex,
            'resultIndexOffset' => $resultIndexOffset,
        ];
    }
}

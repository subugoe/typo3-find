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
     * Builds a JSON-encoded string representing the active query and its
     * paging/facet data, suitable for embedding as the `underlyingQuery`
     * JavaScript variable via AssetCollector.
     *
     * Returns an empty string when detail-page paging is disabled in settings,
     * so callers can use a simple `!== ''` guard before injecting the JS.
     *
     * The `$arguments` parameter must already be at the correct nesting level —
     * i.e. the raw request arguments, NOT a nested `underlyingQuery` sub-array.
     * Unwrapping is the caller's responsibility.
     *
     * The `$query` value is always normalised to an array in the output so that
     * the JavaScript consumer always sees the same shape: `{ q: { … } }`.
     *
     * @param array|string $query     Query parameters, either as a field→value
     *                                array or a plain search string.
     * @param array        $settings  Complete plugin or extension settings.
     * @param int|null     $position  1-based position in the result list,
     *                                or null if not applicable.
     * @param array        $arguments Flat request-arguments array (not nested).
     *
     * @return string JSON string, or empty string if detail-page paging is off.
     *
     * @throws \JsonException
     */
    public static function buildUnderlyingQueryJson(
        array|string $query,
        array $settings,
        ?int $position = null,
        array $arguments = []
    ): string {
        if (empty($settings['paging']['detailPagePaging'])) {
            return '';
        }

        // Normalise query to array so the JS consumer always sees the same shape.
        // A plain string is wrapped under the key 'default'.
        $normalizedQuery = is_array($query) ? $query : ['default' => $query];

        $underlyingQuery = ['q' => $normalizedQuery];

        if (!empty($arguments['facet']) && is_array($arguments['facet'])) {
            $underlyingQuery['facet'] = $arguments['facet'];
        }

        // Position is 1-based; clamp defensively in case the caller passes 0 or less.
        if ($position !== null) {
            $underlyingQuery['position'] = max(1, $position);
        }

        // Prefer an explicit count from arguments, then fall back to the
        // configured perPage default. If neither is present, omit the key so
        // the JavaScript consumer can apply its own default.
        if (isset($arguments['count'])) {
            $underlyingQuery['count'] = (int)$arguments['count'];
        } elseif (isset($settings['paging']['perPage'])) {
            $underlyingQuery['count'] = (int)$settings['paging']['perPage'];
        }

        if (isset($arguments['sort'])
            && is_string($arguments['sort'])
            && $arguments['sort'] !== ''
        ) {
            $underlyingQuery['sort'] = $arguments['sort'];
        }

        // JSON_HEX_TAG and JSON_HEX_AMP prevent the JSON from breaking out of
        // an HTML <script> context. JSON_HEX_QUOT escapes double quotes for
        // safety inside HTML attributes. JSON_HEX_APOS is intentionally omitted:
        // it is only needed inside single-quoted HTML attributes, which this
        // output is never placed in.
        return json_encode(
            $underlyingQuery,
            JSON_THROW_ON_ERROR | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_QUOT
        );
    }

    /**
     * Calculates index values for detail-page navigation based on a 1-based
     * position within the result list.
     *
     * The returned array contains four values, all 0-based unless noted:
     *
     *   positionIndex     — 0-based index of the current document in the full
     *                       result list (= position − 1).
     *
     *   previousIndex     — 0-based Solr `start` value for the fetch window.
     *                       When the current document is the first result this
     *                       equals positionIndex; otherwise it is positionIndex − 1
     *                       so the previous document is included in the window.
     *
     *   nextIndex         — 0-based index of the document immediately after the
     *                       current one (= positionIndex + 1 = position).
     *                       Used both as the upper bound for setRows() and to
     *                       compute the human-readable "next result number"
     *                       (nextIndex + 1).
     *
     *   resultIndexOffset — index within the fetched window at which the current
     *                       document sits. 0 when the current document is the
     *                       first result (no previous document in the window),
     *                       1 otherwise (previous document occupies slot 0).
     *
     * If `position` is missing, zero, or negative it is clamped to 1 so that
     * the first result is always returned as a safe fallback.
     *
     * @param array $underlyingQueryInfo Must contain a 'position' key (1-based int).
     *
     * @return array{positionIndex: int, previousIndex: int, nextIndex: int, resultIndexOffset: int}
     */
    public static function getIndexes(array $underlyingQueryInfo): array
    {
        // Clamp to 1 as a safe fallback for missing or invalid position values.
        $position = max(1, (int)($underlyingQueryInfo['position'] ?? 1));

        // positionIndex is the 0-based index of the current document.
        $positionIndex = $position - 1;

        // previousIndex is the Solr `start` for the fetch window.
        // When the current document is the first result there is no predecessor,
        // so the window starts at positionIndex itself.
        $previousIndex = max($positionIndex - 1, 0);

        // nextIndex is the 0-based index of the document after the current one.
        // Numerically this equals $position (the 1-based current position).
        $nextIndex = $position;

        // resultIndexOffset is where the current document sits inside the window.
        // If there is a previous document in the window it occupies slot 0,
        // pushing the current document to slot 1.
        $resultIndexOffset = ($positionIndex === 0) ? 0 : 1;

        return [
            'positionIndex'     => $positionIndex,
            'previousIndex'     => $previousIndex,
            'nextIndex'         => $nextIndex,
            'resultIndexOffset' => $resultIndexOffset,
        ];
    }
}

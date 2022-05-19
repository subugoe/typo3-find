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

use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3Fluid\Fluid\Core\ViewHelper\TagBuilder;

/**
 * Utility for JavaScripts, Views, ...
 */
class FrontendUtility
{
    /**
     * Stores information about the active query in the »underlyingQuery« JavaScript variable.
     *
     * @param array    $query
     * @param int|null $position  of the record in the result list
     * @param array    $arguments overrides $this->requestArguments if set
     */
    public static function addQueryInformationAsJavaScript($query, array $settings, $position = null, $arguments = []): string
    {
        if ($settings['paging']['detailPagePaging']) {
            $scriptTag = GeneralUtility::makeInstance(TagBuilder::class, 'script');
            $scriptTag->addAttribute('type', 'text/javascript');

            if (array_key_exists('underlyingQuery', $arguments)) {
                $arguments = $arguments['underlyingQuery'];
            }

            $underlyingQuery = ['q' => $query];
            if (array_key_exists('facet', $arguments)) {
                $underlyingQuery['facet'] = $arguments['facet'];
            }

            if (null !== $position) {
                $underlyingQuery['position'] = $position;
            }

            if ($arguments['count']) {
                $underlyingQuery['count'] = $arguments['count'];
            }

            if ($arguments['sort']) {
                $underlyingQuery['sort'] = $arguments['sort'];
            }

            $scriptTag->setContent('var underlyingQuery = '.json_encode($underlyingQuery).';');

            return $scriptTag->render();
        }

        return '';
    }

    /**
     * @param $underlyingQueryInfo
     *
     * @return array
     */
    public static function getIndexes($underlyingQueryInfo)
    {
        return ['positionIndex' => $underlyingQueryInfo['position'] - 1, 'previousIndex' => max([$underlyingQueryInfo['position'] - 2, 0]), 'nextIndex' => $underlyingQueryInfo['position'], 'resultIndexOffset' => (0 === $underlyingQueryInfo['position'] - 1) ? 0 : 1];
    }
}

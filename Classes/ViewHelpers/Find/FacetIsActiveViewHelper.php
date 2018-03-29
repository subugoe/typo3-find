<?php

namespace Subugoe\Find\ViewHelpers\Find;

/* * *************************************************************
 *  Copyright notice
 *
 *  (c) 2013
 *      Ingo Pfennigstorf <pfennigstorf@sub-goettingen.de>
 *      Sven-S. Porst <porst@sub.uni-goettingen.de>
 *      Göttingen State and University Library
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
use TYPO3\CMS\Fluid\Core\ViewHelper\AbstractViewHelper;

/**
 * Determines whether a facet is selected or not.
 */
class FacetIsActiveViewHelper extends AbstractViewHelper
{
    /**
     * Register arguments.
     */
    public function initializeArguments()
    {
        parent::initializeArguments();
        $this->registerArgument('facetID', 'string', 'ID of the facet to determine the selection status of', true);
        $this->registerArgument('facetTerm', 'string',
            'Term of the facet item to determine the selection status of; if NULL any facet with the given facetID matches',
            false, null);
        $this->registerArgument('activeFacets', 'array', 'Array of active facets', false, []);
        $this->registerArgument('type', 'string', 'Query type [string, range]', false, 'string');
    }

    /**
     * @return bool
     */
    public function render()
    {
        foreach ($this->arguments['activeFacets'] as $facets) {
            foreach ($facets as $facetInfo) {
                if ($facetInfo['id'] === $this->arguments['facetID']
                    && ($facetInfo['term'] === $this->arguments['facetTerm'] || null === $this->arguments['facetTerm'])
                ) {
                    return true;
                }
            }
        }

        return false;
    }
}

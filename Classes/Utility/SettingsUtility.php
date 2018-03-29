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
 * Configurations and settings.
 */
class SettingsUtility
{
    /**
     * Returns the merged settings for the given name.
     * Uses settings.$settingName.default and adds
     * settings.$settingsName.$actionName to it.
     *
     * Settings array keys need to be non-numeric if they are supposed to be overriden.
     *
     * @param string $settingName the key of the subarray of $this->settings to work on
     * @param array  $settings
     * @param string $actionName
     *
     * @return array highlight configuration
     */
    public static function getMergedSettings($settingName, $settings, $actionName = 'index')
    {
        $config = [];

        if (array_key_exists($settingName, $settings)) {
            $setting = $settings[$settingName];

            if (array_key_exists('default', $setting)) {
                $config = $setting['default'];

                if (array_key_exists($actionName, $setting)) {
                    $actionConfig = $setting[$actionName];
                    $config = array_replace_recursive($config, $actionConfig);
                }
            }
        }

        return $config;
    }
}

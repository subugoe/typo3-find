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
 * Utility for merging action-specific TypoScript settings with their defaults.
 *
 * All methods are static. This class must not be instantiated.
 */
final class SettingsUtility
{
    /**
     * Not instantiable — pure static utility class.
     */
    private function __construct() {}

    /**
     * Returns the merged configuration for a named settings block.
     *
     * Given a settings structure such as:
     *
     *   plugin.tx_find.settings.highlight.default { … }
     *   plugin.tx_find.settings.highlight.detail  { … }
     *
     * calling getMergedSettings('highlight', $settings, 'detail') will return
     * the `default` array with the `detail` array merged on top of it via
     * array_replace_recursive(), so that action-specific keys override defaults
     * while unset keys fall back to the default value.
     *
     * Non-numeric array keys are required for overriding to work correctly,
     * because array_replace_recursive() matches keys by name — numeric keys
     * from TypoScript (10, 20, …) will be appended rather than replaced.
     *
     * If $actionName has no matching sub-key under $settingName, only the
     * default configuration is returned without error — this is intentional
     * so that actions without specific overrides still receive the defaults.
     *
     * If $settingName is absent from $settings, or if neither $settingName
     * nor its 'default' sub-key hold an array, an empty array is returned.
     *
     * @param string $settingName The top-level key in $settings to read from
     *                            (e.g. 'highlight', 'dataFields').
     * @param array  $settings    The full plugin settings array, typically
     *                            $this->settings from an Extbase controller.
     * @param string $actionName  The current controller action name used to
     *                            look up action-specific overrides.
     *                            Defaults to 'index'.
     *
     * @return array The merged configuration, or an empty array if the setting
     *               block is absent or misconfigured.
     */
    public static function getMergedSettings(
        string $settingName,
        array $settings,
        string $actionName = 'index',
    ): array {
        if (!array_key_exists($settingName, $settings)) {
            return [];
        }

        $setting = $settings[$settingName];

        // Guard against misconfigured TypoScript where the setting block is a
        // scalar rather than an array.
        if (!is_array($setting)) {
            return [];
        }

        $config = $setting['default'] ?? null;

        // Guard against a non-array 'default' value.
        if (!is_array($config)) {
            return [];
        }

        // Merge action-specific overrides on top of the defaults when present.
        if (array_key_exists($actionName, $setting) && is_array($setting[$actionName])) {
            $config = array_replace_recursive($config, $setting[$actionName]);
        }

        return $config;
    }
}

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
use TYPO3\CMS\Core\Messaging\FlashMessage;
use TYPO3\CMS\Core\Utility\GeneralUtility;

/**
 * Utility for logging purposes.
 */
class LoggerUtility
{
    /**
     * Returns an array that can be handled by devLog with the information from an exception.
     *
     * @param \Exception $exception
     *
     * @return array
     */
    public static function exceptionToArray($exception, $includePrevious = false)
    {
        $array = [
            'message' => $exception->getMessage(),
            'code' => $exception->getCode(),
            'file' => $exception->getFile(),
            'line' => $exception->getLine(),
            'trace' => $exception->getTraceAsString(),
        ];

        if ($includePrevious) {
            $array['previous'] = self::exceptionToArray($exception->getPrevious(), true);
        }

        return $array;
    }

    /**
     * Logs errors to both flashMessages and devLog.
     *
     * @param string $message   the message to display
     * @param array  $extraInfo additional data to pass to devLog
     */
    public static function logError($message, $extraInfo = null)
    {
        GeneralUtility::devLog($message, 'find', FlashMessage::ERROR, $extraInfo);
    }

    /**
     * @param $message
     * @param array $extraInfo
     */
    public static function logWarning($message, $extraInfo = null)
    {
        GeneralUtility::devLog($message, 'find', FlashMessage::WARNING, $extraInfo);
    }

    /**
     * @param $message
     * @param array $extraInfo
     */
    public static function logInfo($message, $extraInfo = null)
    {
        GeneralUtility::devLog($message, 'find', FlashMessage::INFO, $extraInfo);
    }
}

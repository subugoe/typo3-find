<?php

namespace Subugoe\Find\Service;

use TYPO3\CMS\Core\Log\LogManager;
use TYPO3\CMS\Core\Log\LogManagerInterface;
use TYPO3\CMS\Core\Utility\GeneralUtility;

abstract class AbstractServiceProvider implements ServiceProviderInterface
{
    /**
     * @var string
     */
    protected $connectionName;

    /**
     * @var array
     */
    protected $settings;

    /**
     * @var array
     */
    protected $requestArguments;

    /**
     * @var LogManagerInterface
     */
    protected $logger;

    /**
     * @param string $connectionName
     * @param array  $settings
     */
    public function __construct($connectionName, $settings)
    {
        $this->connectionName = $connectionName;
        $this->settings = $settings;
        $this->logger = GeneralUtility::makeInstance(LogManager::class)->getLogger('find');
    }

    /**
     * @return array
     */
    public function getRequestArguments()
    {
        return $this->requestArguments;
    }

    /**
     * @param array $requestArguments
     */
    public function setRequestArguments($requestArguments)
    {
        $this->requestArguments = $requestArguments;
    }
}

<?php

namespace Subugoe\Find\Service;

use TYPO3\CMS\Core\Log\LogManager;
use TYPO3\CMS\Core\Log\LogManagerInterface;
use TYPO3\CMS\Core\Utility\GeneralUtility;

abstract class AbstractServiceProvider implements ServiceProviderInterface
{
    protected string $connectionName;

    /**
     * @var LogManagerInterface
     */
    protected $logger;

    protected array $requestArguments = [];

    protected array $settings = [];

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

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

    public function __construct(string $connectionName, array $settings)
    {
        $this->connectionName = $connectionName;
        $this->settings = $settings;
        $this->logger = GeneralUtility::makeInstance(LogManager::class)->getLogger('find');
    }

    public function getRequestArguments(): array
    {
        return $this->requestArguments;
    }

    public function setRequestArguments(array $requestArguments): void
    {
        $this->requestArguments = $requestArguments;
    }
}

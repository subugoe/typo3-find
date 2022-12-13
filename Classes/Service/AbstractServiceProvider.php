<?php

namespace Subugoe\Find\Service;

use TYPO3\CMS\Core\Log\LogManager;
use TYPO3\CMS\Core\Log\LogManagerInterface;
use TYPO3\CMS\Core\Utility\GeneralUtility;

abstract class AbstractServiceProvider implements ServiceProviderInterface
{
    protected LogManagerInterface $logger;

    protected array $requestArguments = [];

    public function __construct(protected string $connectionName, protected array $settings)
    {
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

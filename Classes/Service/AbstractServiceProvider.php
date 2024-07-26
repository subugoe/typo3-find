<?php

namespace Subugoe\Find\Service;

use TYPO3\CMS\Core\Log\LogManager;
use TYPO3\CMS\Core\Log\LogManagerInterface;
use TYPO3\CMS\Core\Utility\GeneralUtility;

abstract class AbstractServiceProvider implements ServiceProviderInterface
{
    /**
     * @var LogManagerInterface
     */
    protected $logger;

    protected array $requestArguments = [];

    public function __construct(protected string $connectionName, protected array $settings)
    {
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

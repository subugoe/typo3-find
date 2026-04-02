<?php

namespace Subugoe\Find\Service;

use Psr\Log\LoggerInterface;

abstract class AbstractServiceProvider implements ServiceProviderInterface
{
    protected array $requestArguments = [];

    public function __construct(protected string $connectionName, protected array $settings, protected readonly LoggerInterface $logger)
    {
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

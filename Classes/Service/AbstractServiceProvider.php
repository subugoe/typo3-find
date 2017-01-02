<?php

namespace Subugoe\Find\Service;

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
     * @param string $connectionName
     * @param array  $settings
     */
    public function __construct($connectionName, $settings)
    {
        $this->connectionName = $connectionName;
        $this->settings = $settings;
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

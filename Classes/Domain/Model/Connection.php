<?php

declare(strict_types=1);

namespace Subugoe\Find\Domain\Model;

class Connection
{
    private string $searchProvider;

    private string $host;

    private int $port;

    private string $scheme;

    private string $core;

    private string $path;

    public function getSearchProvider(): string
    {
        return $this->searchProvider;
    }

    public function setSearchProvider(string $searchProvider): Connection
    {
        $this->searchProvider = $searchProvider;

        return $this;
    }

    public function getHost(): string
    {
        return $this->host;
    }

    public function setHost(string $host): Connection
    {
        $this->host = $host;

        return $this;
    }

    public function getPort(): int
    {
        return $this->port;
    }

    public function setPort(int $port): Connection
    {
        $this->port = $port;

        return $this;
    }

    public function getScheme(): string
    {
        return $this->scheme;
    }

    public function setScheme(string $scheme): Connection
    {
        $this->scheme = $scheme;

        return $this;
    }

    public function getCore(): string
    {
        return $this->core;
    }

    public function setCore(string $core): Connection
    {
        $this->core = $core;

        return $this;
    }

    public function getPath(): string
    {
        return $this->path;
    }

    public function setPath(string $path): Connection
    {
        $this->path = $path;

        return $this;
    }
}

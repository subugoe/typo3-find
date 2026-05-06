<?php

declare(strict_types=1);

namespace Subugoe\Find\PageTitle;

use TYPO3\CMS\Core\PageTitle\AbstractPageTitleProvider;

class FindPageTitleProvider extends AbstractPageTitleProvider
{
    public function setTitle(string $title): void
    {
        $this->title = $title;
    }
}

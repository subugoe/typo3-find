<?php

declare(strict_types=1);

namespace Subugoe\Find\PageTitle;

use TYPO3\CMS\Core\PageTitle\AbstractPageTitleProvider;
use TYPO3\CMS\Core\Site\SiteFinder;
use TYPO3\CMS\Frontend\Controller\TypoScriptFrontendController;

class FindPageTitleProvider extends AbstractPageTitleProvider
{
    public function __construct(
        private readonly SiteFinder $siteFinder,
    ) {
    }

    public function setTitle(string $title): void
    {
        $this->title = $title;
    }

    public function getTitle(): string
    {
        $site = $this->siteFinder->getSiteByPageId($this->getTypoScriptFrontendController()->page['uid']);
        $titles = [
            $this->getTypoScriptFrontendController()->page['title'],
            $site->getAttribute('websiteTitle'),
        ];

        // do something
        return implode(' - ', $titles);
    }

    private function getTypoScriptFrontendController(): TypoScriptFrontendController
    {
        return $GLOBALS['TSFE'];
    }
}

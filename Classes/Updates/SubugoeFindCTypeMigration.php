<?php

declare(strict_types=1);

namespace Subugoe\Find\Updates;

use TYPO3\CMS\Install\Attribute\UpgradeWizard;
use TYPO3\CMS\Install\Updates\AbstractListTypeToCTypeUpdate;

#[UpgradeWizard('subugoeFindCTypeMigration')]
final class SubugoeFindCTypeMigration extends AbstractListTypeToCTypeUpdate
{
    public function getTitle(): string
    {
        return 'Migrate "Subugoe Find" plugins to content elements.';
    }

    public function getDescription(): string
    {
        return 'The "Subugoe Find" plugins are now registered as content element. Update migrates existing records and backend user permissions.';
    }

    /**
     * This must return an array containing the "list_type" to "CType" mapping
     *
     * @return array<string, string>
     */
    protected function getListTypeToCTypeMapping(): array
    {
        return [
            'find_find' => 'find_find',
        ];
    }
}

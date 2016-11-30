define([
    'dataFixer/core/fixPageData',
    'dataFixer/plugins/deprecatedSiteModelMigrater',
    'dataFixer/plugins/fixBackgroundData',
    'dataFixer/imageService/imageTransformDataFixers',
    'dataFixer/helpers/anchorCyclesHelper',
    'dataFixer/plugins/routerTableTempMigration'
], function (fixPageData, deprecatedSiteModelMigrater, fixBackgroundData, imageTransformDataFixers, anchorCyclesHelper, routerTableTempMigration) {
    'use strict';

    /**
     * @exports dataFixer/dataFixer
     */
    return {
        fix: fixPageData,
        deprecatedSiteModelMigrater: deprecatedSiteModelMigrater,
        fixBackgroundData: fixBackgroundData,
        imageTransformDataFixers: imageTransformDataFixers,
        anchorCyclesHelper: anchorCyclesHelper,
        routerTableTempMigration:routerTableTempMigration
    };
});

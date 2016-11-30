define([
    'core',
    'wixappsCore',
    'wixappsBuilder/comps/appPart2',
    'wixappsBuilder/proxies/fieldBoxProxy',
    'wixappsBuilder/proxies/fieldProxy',
    'wixappsBuilder/proxies/textFieldProxy',
    'wixappsBuilder/core/appRepo',
    'wixappsBuilder/core/builderDataHandler',
    'wixappsBuilder/core/appPart2DataFetchingStateManager',
    'wixappsBuilder/util/viewsTemplatesUtils',
    'wixappsBuilder/util/viewsTemplatesData',
    'wixappsBuilder/util/fieldBoxProxyUtils',
    'wixappsBuilder/util/appbuilderUrlUtils',


    // side effects only.
    'wixappsBuilder/util/fontUtils',
    'wixappsBuilder/core/appPart2DataRequirementsChecker',
    'wixappsBuilder/core/appPart2PreviewDataRequirementsChecker',
    'wixappsBuilder/core/appPart2StyleCollector'
], function (/** core */core, /** wixappsCore */wixapps, appPart2, fieldBox, field, textField, appRepo, builderDataHandler,
             appPart2DataFetchingStateManager, viewsTemplatesUtils, viewsTemplatesData, fieldBoxProxyUtils, appbuilderUrlUtils) {
    'use strict';

    core.compRegistrar.register('wixapps.integration.components.AppPart2', appPart2);

    wixapps.proxyFactory.register('FieldBox', fieldBox);
    wixapps.proxyFactory.register('Field', field);
    wixapps.proxyFactory.register('TextField', textField);

    /**
     * @class wixappsBuilder
     */
    return {
        appRepo: appRepo,
        builderDataHandler: builderDataHandler,
        dataFetchingStateManager: appPart2DataFetchingStateManager,
        viewsTemplatesUtils: viewsTemplatesUtils,
        fieldBoxProxyUtils: fieldBoxProxyUtils,
        viewsTemplatesData: viewsTemplatesData,
        resolveImageData: appbuilderUrlUtils.resolveImageData
    };
});

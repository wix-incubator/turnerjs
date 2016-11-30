define([
    "wixappsCore/core/viewsRenderer",
    "wixappsCore/core/viewsCustomizer",
    "wixappsCore/core/proxyFactory",
    "wixappsCore/core/logicFactory",
    "wixappsCore/core/styleCollector",
    "wixappsCore/core/styleData",
    "wixappsCore/core/ViewContextMap",
    "wixappsCore/core/wixappsDataHandler",
    "wixappsCore/core/wixappsLogger",

    "wixappsCore/proxies/mixins/baseProxy",
    "wixappsCore/proxies/mixins/inputProxy",
    "wixappsCore/core/typesConverter",
    "wixappsCore/util/videoThumbDataHandler",
    "wixappsCore/proxies/mixins/baseCompositeProxy",
    "wixappsCore/util/spacersCalculator",
    "wixappsCore/core/wixappsConfiguration",
    'wixappsCore/core/linksConverter',
    'wixappsCore/util/localizer',
    'wixappsCore/core/expressions/functionLibrary',
    'wixappsCore/util/viewsUtils',
    'wixappsCore/util/memoizedViewsUtils',
    'wixappsCore/util/richTextUtils',
    'wixappsCore/util/wixappsUrlParser',
    'wixappsCore/util/typeNameResolver',
    'wixappsCore/util/styleMapping',
    'wixappsCore/core/expressions/expression',

    "wixappsCore/proxies/proxyMap",
    "wixappsCore/core/wixappsDataAspect"

    // require for side effects
], function(viewsRenderer, viewsCustomizer, proxyFactory, logicFactory, styleCollector, styleData, ViewContextMap, wixappsDataHandler, wixappsLogger, baseProxy, inputProxy,
            typesConverter, videoThumbDataHandler, baseCompositeProxy, spacersCalculator, wixappsConfiguration, linksConverter, localizer, FunctionLibrary, viewsUtils, memoizedViewsUtils, richTextUtils, wixappsUrlParser,
            typeNameResolver, styleMapping, expression) {
    'use strict';

    /**
     * @class wixappsCore
     */
    return {
        viewsRenderer: viewsRenderer,
        viewsCustomizer: viewsCustomizer,
        proxyFactory: proxyFactory,
        baseProxy: baseProxy,
        inputProxy: inputProxy,
        baseCompositeProxy: baseCompositeProxy,
        typesConverter: typesConverter,
        logicFactory: logicFactory,
        ViewContextMap: ViewContextMap,
        wixappsDataHandler: wixappsDataHandler,
        wixappsLogger: wixappsLogger,
        videoThumbDataHandler: videoThumbDataHandler,
        styleCollector: styleCollector,
        spacersCalculator: spacersCalculator,
        wixappsConfiguration: wixappsConfiguration,
        linksConverter: linksConverter,
        localizer: localizer,
        FunctionLibrary: FunctionLibrary,
        viewsUtils: viewsUtils,
        memoizedViewsUtils: memoizedViewsUtils,
        wixappsUrlParser: wixappsUrlParser,
        typeNameResolver: typeNameResolver,
        styleData: styleData,
        richTextUtils: richTextUtils,
        convertStringToPrimitive: expression.convertStringToPrimitive,
        styleMapping: styleMapping,
        expression: {
            evaluate: expression.evaluate,
            isExpression: expression.isExpression
        }
    };
});

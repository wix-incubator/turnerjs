define(['layout',
    'tpa/layout/gluedWidgetPatcher',
    'tpa/layout/gluedWidgetMeasurer',
    'tpa/layout/tpaSectionPatcher',
    'tpa/layout/tpaMeasurer',
    'tpa/layout/tpaGluedWidgetPlacement',
    'tpa/layout/mobileSafariPatcher'
], function (/** layout.layout */ layout,
             GluedWidgetPatcher,
             GluedWidgetMeasurer,
             tpaSectionPatcher,
             tpaMeasurer,
             tpaGluedWidgetPlacement,
             mobileSafariPatcher) {
    'use strict';

    var gluedWidgetPatcher = new GluedWidgetPatcher(tpaGluedWidgetPlacement);
    var gluedWidgetMeasurer = new GluedWidgetMeasurer(tpaGluedWidgetPlacement);

    layout.registerCustomMeasure('wysiwyg.viewer.components.tpapps.TPAWidget', tpaMeasurer.measureTPA);
    layout.registerCustomMeasure('wysiwyg.viewer.components.tpapps.TPASection', tpaMeasurer.measureTPA);
    layout.registerCustomMeasure('wysiwyg.viewer.components.tpapps.TPAMultiSection', tpaMeasurer.measureTPA);
    layout.registerCustomMeasure('wysiwyg.viewer.components.tpapps.TPAGluedWidget', gluedWidgetMeasurer.measureGluedWidget);

    layout.registerRequestToMeasureDom('wysiwyg.viewer.components.tpapps.TPAWidget');
    layout.registerRequestToMeasureDom('wysiwyg.viewer.components.tpapps.TPAGluedWidget');
    layout.registerRequestToMeasureDom('wysiwyg.viewer.components.tpapps.TPASection');
    layout.registerRequestToMeasureDom('wysiwyg.viewer.components.tpapps.TPAMultiSection');
    layout.registerRequestToMeasureChildren('wysiwyg.viewer.components.tpapps.TPASection', [['iframe']]);
    layout.registerRequestToMeasureChildren('wysiwyg.viewer.components.tpapps.TPAMultiSection', [['iframe']]);
    layout.registerRequestToMeasureChildren('wysiwyg.viewer.components.tpapps.TPAWidget', [['iframe']]);

    layout.registerSAFEPatcher('wysiwyg.viewer.components.tpapps.TPAGluedWidget', gluedWidgetPatcher.patchGluedWidget);
    layout.registerSAFEPatcher('wysiwyg.viewer.components.tpapps.TPAMultiSection', tpaSectionPatcher.patchTPASection);
    layout.registerSAFEPatcher('wysiwyg.viewer.components.tpapps.TPASection', tpaSectionPatcher.patchTPASection);
    layout.registerSAFEPatcher('wysiwyg.viewer.components.tpapps.TPAWidget', mobileSafariPatcher.patchWidth);

    ['wysiwyg.viewer.components.WixAdsMobile', 'wysiwyg.viewer.components.WixAdsDesktop'].forEach(function (compClass) {
        layout.registerRequestToMeasureChildren(compClass, [['desktopWADTop'], ['desktopWADBottom'], ['mobileWADTop']]);
        layout.registerCustomMeasure(compClass, gluedWidgetMeasurer.measureWixAdComponent);
    });

    return {};
});

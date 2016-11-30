define(['layout', 'tpa', 'cloud/layout/cloudGluedWidgetPlacement'], function (/** layout.layout */ layout, tpa, cloudGluedWidgetPlacement) {
    'use strict';

    var gluedWidgetPatcher = new tpa.GluedWidgetPatcher(cloudGluedWidgetPlacement);

    layout.registerCustomMeasure('wysiwyg.viewer.components.cloud.CloudWidget', tpa.tpaMeasurer.measureTPA);
    layout.registerCustomMeasure('wysiwyg.viewer.components.cloud.CloudPage', tpa.tpaMeasurer.measureTPA);

    layout.registerRequestToMeasureDom('wysiwyg.viewer.components.cloud.CloudWidget');
    layout.registerRequestToMeasureDom('wysiwyg.viewer.components.cloud.CloudGluedWidget');
    layout.registerRequestToMeasureDom('wysiwyg.viewer.components.cloud.CloudPage');
    layout.registerRequestToMeasureChildren('wysiwyg.viewer.components.cloud.CloudPage', [['iframe']]);

    layout.registerSAFEPatcher('wysiwyg.viewer.components.cloud.CloudGluedWidget', gluedWidgetPatcher.patchGluedWidget);
    layout.registerSAFEPatcher('wysiwyg.viewer.components.cloud.CloudPage', tpa.tpaSectionPatcher.patchTPASection);

    return {};
});

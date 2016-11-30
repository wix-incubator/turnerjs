
//don't remove aspects so that they will register
/*eslint no-unused-vars:0*/
define([
        'tpa/components/tpaWidget',
        'tpa/components/tpaSection',
        'tpa/components/tpaMultiSection',
        'tpa/components/tpaWorker',
        'tpa/components/tpaGluedWidget',
        'tpa/aspects/tpaAspectCollector',
        'tpa/mixins/tpaUrlBuilderMixin',
        'tpa/mixins/tpaCompApiMixin',
        'tpa/layout/tpaLayout',
        'tpa/components/tpaPreloaderOverlay',
        'tpa/components/tpaUnavailableMessageOverlay',
        'tpa/layout/gluedWidgetPatcher',
        'tpa/layout/tpaMeasurer',
        'tpa/layout/tpaSectionPatcher',
        'tpa/mixins/tpaCompBaseMixin',
        'tpa/common/tpaPostMessageCommon',
        'tpa/handlers/tpaHandlers',
        'tpa/common/TPAUrlBuilder',
        'tpa/common/TPABaseUrlBuilder',
        'tpa/utils/tpaStyleUtils',
        'tpa/utils/tpaUtils',
        'tpa/utils/gluedWidgetMeasuringUtils',
        'tpa/services/tpaPreviewEditorCommunicationService',
        'tpa/common/tpaBi',
        'tpa/utils/sitePages'
    ], function(
        tpaWidget,
        tpaSection,
        tpaMultiSection,
        tpaWorker,
        tpaGluedWidget,
        tpaAspectCollector,
        tpaUrlBuilder,
        tpaCompApi,
        tpaLayout,
        tpaPreloaderOverlay,
        tpaUnavailableMessageOverlay,
        gluedWidgetPatcher,
        tpaMeasurer,
        tpaSectionPatcher,
        tpaCompBase,
        tpaPostMessageCommon,
        tpaHandlers,
        TPAUrlBuilder,
        TPABaseUrlBuilder,
        tpaStyleUtils,
        tpaUtils,
        gluedWidgetMeasuringUtils,
        tpaPreviewEditorCommunicationService,
        tpaBi,
        sitePages
    ) {

    'use strict';

    return {
        widget: tpaWidget,
        section: tpaSection,
        multiSection: tpaMultiSection,
        worker: tpaWorker,
        gluedWidget: tpaGluedWidget,
        gluedWidgetMeasuringUtils: gluedWidgetMeasuringUtils,
        tpaMixins: {
            tpaUrlBuilder: tpaUrlBuilder,
            tpaCompApi: tpaCompApi,
            tpaCompBase: tpaCompBase
        },
        GluedWidgetPatcher: gluedWidgetPatcher,
        tpaMeasurer: tpaMeasurer,
        tpaSectionPatcher: tpaSectionPatcher,
        tpaHandlers: tpaHandlers,
        common: {
            tpaPostMessageCommon: tpaPostMessageCommon,
            TPAUrlBuilder: TPAUrlBuilder,
            styleUtils: tpaStyleUtils,
            TPABaseUrlBuilder: TPABaseUrlBuilder,
            utils: tpaUtils,
            bi: tpaBi
        },
        services: {
            tpaPreviewEditorCommunicationService: tpaPreviewEditorCommunicationService
        },
        tpaStyleUtils: tpaStyleUtils,
        sitePages: sitePages
    };
});

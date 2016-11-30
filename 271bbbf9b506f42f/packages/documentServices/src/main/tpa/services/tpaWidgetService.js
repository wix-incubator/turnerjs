define(['lodash',
    'documentServices/component/component',
    'documentServices/structure/structure',
    'documentServices/componentDetectorAPI/componentDetectorAPI',
    'documentServices/tpa/services/appInstallationAndDeletionEvents',
    'documentServices/tpa/services/installedTpaAppsOnSiteService',
    'documentServices/tpa/services/clientSpecMapService',
    'documentServices/tpa/services/tpaComponentCommonService',
    'documentServices/tpa/compStructure',
    'documentServices/tpa/services/tpaWidgetLayoutService',
    'documentServices/documentMode/documentModeInfo'], function(_, component, structure, componentDetectorAPI, appInstallationAndDeletionEvents, installedTpaAppsOnSiteService,
                                                                clientSpecMapService, tpaComponentCommonService, compStructure, tpaWidgetLayoutHelper, documentModeInfo) {

    'use strict';

    var isGlued = function(widgetData) {
        return _.has(widgetData, 'gluedOptions') && !_.isNull(widgetData.gluedOptions);
    };

    var addWidgetAfterProvision = function (ps, componentToAddPointer, options, responseDefinitionData, completeCallback, onError) {
        options = options || {};
        var invokeAddAppCallbacks = true;
        if (_.isBoolean(options.invokeAddAppCallbacks)) {
            invokeAddAppCallbacks = options.invokeAddAppCallbacks;
        }

        var applicationId = responseDefinitionData.applicationId;
        var widgetId = options.widgetId || getDefaultWidgetId(ps, responseDefinitionData);
        var widgetData = responseDefinitionData.widgets && responseDefinitionData.widgets[widgetId];
        var pageId = options.pageId || ps.siteAPI.getFocusedRootId();

        if (!widgetId || !pageId || !widgetData) {
            throw new Error('invalid params');
        }

        var componentDefinition;
        var shouldSetContainerToMasterPage = false;
        var layout;

        if (options.componentDefinition) {
            componentDefinition = options.componentDefinition;
        } else {
            var defaultSize = {
                width: widgetData.defaultWidth,
                height: widgetData.defaultHeight
            };
            if (options.layout) {
                _.defaults(options.layout, defaultSize);
            }

            layout = {
                width: widgetData.defaultWidth || 0,
                height: widgetData.defaultHeight || 0,
                defaultPosition: widgetData.defaultPosition || _.get(options, 'layout.defaultPosition') || {}
            };

            if (widgetData.defaultShowOnAllPages ||
                options.showOnAllPages
            ) {
                shouldSetContainerToMasterPage = true;
            }

            if (layout.defaultPosition.region === 'header' || layout.defaultPosition.region === 'footer' || isGlued(widgetData)) {
                pageId = 'masterPage';
                shouldSetContainerToMasterPage = false;
            }

            if (isGlued(widgetData)) {
                componentDefinition = compStructure.getGluedWidgetStructure(applicationId, widgetData, layout, options.styleId);
            } else {
                componentDefinition = compStructure.getWidgetStructure(applicationId, widgetData.widgetId, tpaWidgetLayoutHelper.getCompLayoutFrom(ps, layout, options.layout), options.styleId);
            }

        }

        var firstAdd = !installedTpaAppsOnSiteService.isApplicationIdExists(ps, applicationId);
        if (firstAdd && clientSpecMapService.hasSections(ps, responseDefinitionData)) {
            if (clientSpecMapService.hasMainSection(ps, responseDefinitionData)) {
                if (_.isFunction(onError)) {
                    onError();
                }
                return;
            }
            tpaComponentCommonService.addHiddenPages(ps, responseDefinitionData);
        }

        var pagePointer = ps.pointers.components.getPage(pageId, documentModeInfo.getViewMode(ps));
        var containerPointer = pagePointer;
        if (options.parentContainerRef &&
            ps.pointers.isSamePointer(ps.pointers.components.getPageOfComponent(options.parentContainerRef), pagePointer)){
            containerPointer = options.parentContainerRef;
        }

        component.add(ps, componentToAddPointer, containerPointer, componentDefinition);
        if (widgetData.canBeStretched && widgetData.shouldBeStretchedByDefault && !options.dontStretch) {
            structure.setDock(ps, componentToAddPointer, {left: {vw: 0}, right: {vw: 0}});
        }

        if (firstAdd && invokeAddAppCallbacks) {
            appInstallationAndDeletionEvents.invokeAddAppCallbacks(responseDefinitionData.appDefinitionId);
        }

        tpaComponentCommonService.setPrefetchPageBehaviorIfNeeded(ps, componentToAddPointer, responseDefinitionData);

        ps.setOperationsQueue.executeAfterCurrentOperationDone(function () {
            if (shouldSetContainerToMasterPage) {
                ps.setOperationsQueue.runSetOperation(function () {
                    structure.setContainer(ps, componentToAddPointer, componentToAddPointer, ps.pointers.components.getPage('masterPage', documentModeInfo.getViewMode(ps)));
                });
            } else if (_.get(layout, 'defaultPosition.region') === 'header') {
                ps.setOperationsQueue.runSetOperation(function () {
                    structure.setContainer(ps, componentToAddPointer, componentToAddPointer, componentDetectorAPI.getSiteHeader(ps));
                });
            }

            if (options.callback) {
                options.callback({
                    comp: componentToAddPointer
                });
            }
        });

        if (completeCallback) {
            completeCallback(ps);
        }
    };

    var getDefaultWidgetId = function(privateServices, appData){
        var appWidgets = _.filter(appData.widgets, function (widget){
            return _.isNull(widget.appPage) || _.isUndefined(widget.appPage);
        });

        return (appWidgets && !_.isEmpty(appWidgets) && appWidgets[0].widgetId) || null;
    };

    var deleteWidget = function (ps, compPointer, applicationId, onComplete) {
        deleteHiddenSectionsIfNeeded(ps, applicationId, function() {
            component.remove(ps, compPointer, onComplete);
        });
    };

    var deleteHiddenSectionsIfNeeded = function (ps, applicationId, onComplete) {
        var appData = clientSpecMapService.getAppData(ps, applicationId);
        var hasMainSection = clientSpecMapService.hasMainSection(ps, appData);
        if (!hasMainSection) {
            var installedWidgets = installedTpaAppsOnSiteService.getWidgetsByAppId(ps, applicationId);
            var isLastInstalledWidget = installedWidgets && installedWidgets.length === 1;
            if (isLastInstalledWidget) {
                tpaComponentCommonService.deleteHiddenSections(ps, applicationId, onComplete);
            } else {
                onComplete();
            }
        } else {
            onComplete();
        }
    };

    var duplicateWidget = function(ps, compPointer, pageId) {
        pageId = pageId || ps.siteAPI.getFocusedRootId(ps);
        var pagePointer = ps.pointers.components.getPage(pageId, documentModeInfo.getViewMode(ps));

        if (!pagePointer) {
            throw new Error('no such component');
        }
        var dupCompPointer = component.getComponentToDuplicateRef(ps, compPointer, pagePointer);
        component.duplicate(ps, dupCompPointer, compPointer, pagePointer);
        // TODO: this method should probably return a ref to the new comp (see component.duplicateComponent)
    };

    return {
        isGlued: isGlued,
        addWidgetAfterProvision: addWidgetAfterProvision,
        deleteWidget: deleteWidget,
        duplicateWidget: duplicateWidget
    };
});

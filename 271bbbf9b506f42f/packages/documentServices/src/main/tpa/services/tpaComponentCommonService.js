define(['lodash',
        'utils',
        'bluebird',
        'documentServices/page/page',
        'documentServices/page/pageData',
        'documentServices/component/component',
        'documentServices/structure/structure',
        'documentServices/actionsAndBehaviors/actionsAndBehaviors',
        'documentServices/documentMode/documentModeInfo',
        'documentServices/tpa/services/clientSpecMapService',
        'documentServices/tpa/services/installedTpaAppsOnSiteService',
        'documentServices/tpa/compStructure',
        'documentServices/tpa/constants'
], function(_, utils, Promise, page, pageData, component, structure, actionsAndBehaviors, documentModeInfo, clientSpecMapService, installedTpaAppsOnSiteService, compStructure, tpaConstants) {

    'use strict';

    var getSectionPointer = function (ps, sectionId, containerPointer) {
        var viewMode = ps.pointers.components.getViewMode(containerPointer);
        return ps.pointers.components.getUnattached(sectionId, viewMode);
    };

    var getPageUriSEO = function (ps, name) {
        var invalidUrlCharacters = /[^A-Za-z0-9-]/g;
        return pageData.getValidPageUriSEO(ps, '', name.replace(invalidUrlCharacters, '-').toLowerCase() || 'blank');
    };

    //hidden sub-pages
    var addSubSection = function (ps, widgetData, applicationId) {
        var sectionTitle = widgetData.appPage.name;
        var sectionId = tpaConstants.TYPE.TPA_MULTI_SECTION + "_" + utils.guidUtils.getUniqueId();
        _.assign(widgetData, {
            applicationId: applicationId
        });
        var pageUriSEO = getPageUriSEO(ps, sectionTitle);
        var serializedPage = compStructure.getSubSectionStructure(ps, widgetData, sectionId, pageUriSEO);
        var pageToAddPointer = page.getPageIdToAdd(ps, sectionTitle, serializedPage);
        widgetData.name = sectionTitle;

        addPageAndSection(ps, pageToAddPointer, sectionId, applicationId, widgetData, serializedPage, widgetData.widgetId, tpaConstants.COMP_TYPES.TPA_MULTI_SECTION, tpaConstants.DATA_TYPE.TPA_MULTI_SECTION, null);
    };

    var addHiddenPages = function (ps, appData) {
        var sections = clientSpecMapService.getAppSections(ps, appData);
        sections = _.sortBy(sections, 'appPage.order');

        _.forEach(sections, function (widget) {
            if (widget.appPage.hidden && widget.appPage.id) {
                addSubSection(ps, widget, appData.applicationId);
            }
        });
    };

    var addPageAndSection = function (ps, pageToAddPointer, sectionId, applicationId, appPage, pageStructure, widgetId, tpaSectionCompType, tpaSectionDataType, styleId) {
        var sectionPointer = getSectionPointer(ps, sectionId, pageToAddPointer);
        var sectionComponentDefinition = {
            "componentType": tpaSectionCompType,
            "type": "Component",
            "id": sectionPointer.id,
            "style": styleId || tpaConstants.STYLE.TPA_SECTION,
            "skin": tpaConstants.SKINS.TPA_SECTION,
            "layout": {
                "x": 0,
                "y": 0,
                "width": 980,
                "height": 500
            },
            "data": {
                "type": tpaSectionDataType,
                "applicationId": applicationId + '',
                "metaData": {
                    isPreset: true,
                    schemaVersion: '1.0',
                    isHidden: false
                },
                "widgetId": widgetId
            }
        };

        if (appPage.appPage && appPage.appPage.fullPage){
            var docked = {top: {px: 0}, right: {px: 0}, bottom: {px: 0}, left: {px: 0}};
            _.assign(sectionComponentDefinition.layout, {fixedPosition: true, docked: docked});
        } else if (appPage.canBeStretched && appPage.shouldBeStretchedByDefault) {
            _.assign(sectionComponentDefinition.layout, {docked: {left: {vw: 0}, right: {vw: 0}}});
        }

        page.add(ps, pageToAddPointer, appPage.name, pageStructure);
        component.add(ps, sectionPointer, pageToAddPointer, sectionComponentDefinition);
    };

    var deleteHiddenSections = function (ps, applicationId, completeCallback) {
        var hiddenPages = installedTpaAppsOnSiteService.getHiddenSections(ps, applicationId);

        var promises = _.map(hiddenPages, function (hiddenPage) {
            return deleteHiddenPagePromise(ps, hiddenPage);
        });

        Promise.all(promises).then(function () {
            completeCallback(ps);
        }, function (privateServices, error) {
            completeCallback(privateServices, error);
        });
    };

    var deleteHiddenPagePromise = function(ps, hiddenPage){
        return new Promise(function (resolve, reject) {
            page.remove(ps, hiddenPage.pageId, function(privateServices, err) {
                if (err) {
                    reject(privateServices, err);
                } else {
                    resolve(privateServices);
                }
            });
        });
    };

    var setPrefetchPageBehaviorIfNeeded = function(ps, widgetPointer, appData) {
        var tpaWidgetIdToPreFetch = clientSpecMapService.getSectionsWidgetIdsToPreFetch(appData);

        if (_.isEmpty(tpaWidgetIdToPreFetch)) {
            return;
        }

        var hiddenSections = installedTpaAppsOnSiteService.getHiddenSections(ps, appData.applicationId);

        if (_.isEmpty(hiddenSections)) {
            return;
        }

        var pageIdsToFetch = _(hiddenSections)
            .filter(function(hiddenSection) {
                return _.includes(tpaWidgetIdToPreFetch, hiddenSection.widgetId);
            })
            .map('pageId')
            .value();

        var pagePointer = ps.pointers.components.getPage(_.first(pageIdsToFetch), documentModeInfo.getViewMode(ps));
        var behaviorDefinition = actionsAndBehaviors.getBehaviorDefinition(ps, 'prefetchPages');
        var actionDefinition = actionsAndBehaviors.getActionDefinition(ps, 'screenIn');

        behaviorDefinition.params.prefetchFilters.id = pageIdsToFetch;

        removeExistingBehavior(ps, widgetPointer);

        actionsAndBehaviors.updateBehavior(ps,
            widgetPointer,
            actionDefinition,
            pagePointer,
            behaviorDefinition
        );
    };

    var removeExistingBehavior = function(ps, widgetPointer) {
        var existingBehaviors = actionsAndBehaviors.getBehaviors(ps, widgetPointer);
        var behaviorToRemove = _.find(existingBehaviors, {'behavior': {name: 'prefetchPages'}});

        if (behaviorToRemove) {
            actionsAndBehaviors.removeComponentSingleBehavior(ps, widgetPointer, behaviorToRemove, behaviorToRemove.action.name);
        }
    };

    return {
        addHiddenPages: addHiddenPages,
        deleteHiddenSections: deleteHiddenSections,
        addPageAndSection: addPageAndSection,
        getPageUriSEO: getPageUriSEO,
        setPrefetchPageBehaviorIfNeeded: setPrefetchPageBehaviorIfNeeded
    };

});

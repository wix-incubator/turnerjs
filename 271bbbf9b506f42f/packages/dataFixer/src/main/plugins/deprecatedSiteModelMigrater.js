/**
 * Created by avim on 8/27/2014.
 */
define(['lodash', 'coreUtils', 'dataFixer/core/fixPageData'], function (_, coreUtils, fixPageData) {
    'use strict';
    function componentClass(compType) {
        switch (compType) {
            case "wysiwyg.viewer.components.WSiteStructure":
                return "Document";
            case "mobile.core.components.Page":
                return "Page";
            case "wixapps.integration.components.Area":
            case "mobile.core.components.Container":
            case "wysiwyg.viewer.components.HeaderContainer":
            case "wysiwyg.viewer.components.FooterContainer":
            case "wysiwyg.viewer.components.PagesContainer":
            case "wysiwyg.viewer.components.ScreenWidthContainer":
            case "wysiwyg.viewer.components.StripContainer":
                return "Container";
        }
        return "Component";
     }
    /*eslint no-unused-vars:0*/

    function tagStartHandler(siteModel, state, tagName, attrs, unary) {
        var attrsDict = _(attrs)
            .pluck('name')
            .invoke('toLowerCase')
            .zipObject(_.pluck(attrs, 'value'))
            .value();
        if (componentClass(attrsDict.comp) === "Page") {
            state.page = attrsDict.id;
        }
        siteModel.pagesData[state.page] = siteModel.pagesData[state.page] || {
            structure: {},
            data: {},
            theme_data: {}
        };
        var structure = siteModel.pagesData[state.page].structure = siteModel.pagesData[state.page].structure || {};
        if (_.has(state.childrenIndex, state.page)) {
            for (var i = 0; i < state.childrenIndex[state.page].length; i++) {
                structure = structure.components[state.childrenIndex[state.page][i]];
            }
            var newStructure = {};
            state.childrenIndex[state.page].push(structure.components.length);
            structure.components.push(newStructure);
            structure = newStructure;
        } else {
            state.childrenIndex[state.page] = [];
        }
        structure.componentType = attrsDict.comp;
        structure.type = componentClass(attrsDict.comp);
        structure.id = attrsDict.id;
        structure.components = [];
        structure.skin = attrsDict.skin;
        structure.styleId = attrsDict.styleid;
        if (attrsDict.dataquery) {
            structure.dataQuery = attrsDict.dataquery;
        }
        structure.propertyQuery = attrsDict.propertyquery;
        structure.layout = {
            width: parseInt(attrsDict.width, 10),
            height: parseInt(attrsDict.height, 10),
            x: parseInt(attrsDict.x, 10),
            y: parseInt(attrsDict.y, 10),
            anchors: siteModel.wixAnchors[attrsDict.id] || []
        };
    }

    function tagEndHandler(siteModel, state, tagName) {
        if (state.childrenIndex[state.page].length === 0) {
            state.page = "masterPage";
        } else {
            state.childrenIndex[state.page].pop();
        }
    }

    function migrateSiteModel(siteModel) {
        siteModel.pagesData = {};
        var mainPageData = _.get(siteModel, 'wixData.document_data.SITE_STRUCTURE.mainPage') || _.get(siteModel, 'wixData.document_data.masterPage.mainPage');
        var mainPageId = mainPageData && mainPageData.slice(1);

        siteModel.pagesData.masterPage = {data:siteModel.wixData};
        siteModel.pagesData.masterPage.structure = {};


        var state = {'page': 'masterPage', childrenIndex: {}};

        coreUtils.htmlParser(siteModel.wixHtmlRaw, {
            start: tagStartHandler.bind(undefined, siteModel, state),
            end: tagEndHandler.bind(undefined, siteModel, state)
        });

        var pagesList = _.keys(siteModel.pagesData);
        var pagesListWithoutMaster = _.without(pagesList, "masterPage");
        siteModel.pagesData.masterPage.data.document_data.MAIN_MENU = siteModel.pagesData.masterPage.data.document_data.MAIN_MENU || {items: [], type: 'Menu', id: 'MAIN_MENU', metaData: {}};

        _.forEach(pagesList, function (pageId) {
            siteModel.pagesData[pageId] = fixPageData(siteModel.pagesData[pageId], pagesListWithoutMaster, siteModel.requestModel, siteModel.currentUrl, siteModel.urlFormatModel);
        });
        siteModel.publicModel.pageList = {
            mainPageId:mainPageId,
            pages: _.map(pagesListWithoutMaster, function (pageId) {
                return _.chain(siteModel)
                .get(['pagesData', 'masterPage', 'data', 'document_data', pageId])
                    .pick(['title', 'pageUriSEO'])
                    .assign({pageId: pageId})
                    .value();
            })
        };
    }

    return migrateSiteModel;

});

'use strict';
/**
 * Created by avim on 4/27/16.
 */
const santaRequire = require('../common/node-santa-require')();
const siteDataFromModel = require('../common/siteDataFromModel');
const documentServices = santaRequire('documentServices');
const core = santaRequire('core');
const coreUtils = santaRequire('coreUtils');
const _ = santaRequire('lodash');

const PAGES_NONE = 'PAGES_NONE';
const PAGES_ONE = 'PAGES_ONE';
const PAGES_ALL = 'PAGES_ALL';


function createDSAndRead(siteDataWrapper, readFlags) {
    const ds = new documentServices.Site(
        documentServices.configs.siteInfo,
        siteDataWrapper,
        null,
        _.noop);
    return _.mapValues(readFlags,
        (args, flag) => READ_FLAGS[flag].func.apply(null, [ds, args]));
}

function createDocumentServicesAndRead(siteModel, readFlags) {
    var fullSiteData = siteDataFromModel(santaRequire, siteModel);
    var siteDataWrapper = core.SiteDataAPI.createSiteDataAPIAndDal(fullSiteData, coreUtils.ajaxLibrary.ajax);
    return createDSAndRead(siteDataWrapper, readFlags);
}

function createDocumentServicesFromPublicModelsAndRead(publicModels, readFlags) {
    return new Promise((resolve, reject) => {
        var fullSiteData = siteDataFromModel(santaRequire, publicModels);
        var siteDataWrapper = core.SiteDataAPI.createSiteDataAPIAndDal(fullSiteData, coreUtils.ajaxLibrary.ajax);
        var pagesList = _.reduce(readFlags, function (acc, flagArgs, flagName) {
            switch (READ_FLAGS[flagName].pages) {
                case PAGES_NONE:
                    return acc;
                case PAGES_ALL:
                    return _.map(publicModels.publicModel.pageList.pages, 'pageId');
                case PAGES_ONE:
                    return _.union(acc, _(flagArgs).map('pageId').compact().value());
            }
        }, []);

        pagesList = _.reject(pagesList, 'masterPage');
        if (_.isEmpty(pagesList)) {
            pagesList = [publicModels.publicModel.pageList.mainPageId];
        }
        Promise.all(pagesList.map((pageId) =>
            new Promise((resolvePage) => {
                siteDataWrapper.siteDataAPI.loadPage({pageId}, resolvePage);
            })
        )).then(() => {
            var result = createDSAndRead(siteDataWrapper, readFlags);
            resolve(result);
        })
        .catch((e) => reject(e));
    });
}

function getCompInfo(ds, compRef) {
    let styleId = ds.components.style.getId(compRef);
    let style = styleId ? ds.theme.styles.get(styleId) : null;
    return {
        data: ds.components.data.get(compRef),
        style: style ? _.get(style, 'style.properties', null) : null,
        skin: ds.components.skin.get(compRef),
        properties: ds.components.properties.get(compRef),
        layout: _.attempt(ds.components.layout.get, compRef)
    };
}

const READ_FLAGS = {
    COLORS: {
        pages: PAGES_NONE,
        func: (ds) => ds.theme.colors.getAll()
    },
    HOME_PAGE: {
        pages: PAGES_NONE,
        func: (ds) => ds.homePage.get()
    },
    PAGES_DATA: {
        pages: PAGES_ALL,
        func: (ds) => ds.pages.getPagesData()
    },
    FONTS: {
        pages: PAGES_NONE,
        func: (ds) => ds.theme.fonts.getAll()
    },
    SPECIFIC_COMPS: {
        pages: PAGES_ONE,
        func: (ds, selectors) =>
            _.map(selectors, (selector) =>
                getCompInfo(ds, ds.components.get.byId(selector.compId, selector.pageId)))
    },
    IS_PUBLISHED: {
        pages: PAGES_NONE,
        func: (ds) => ds.generalInfo.isSitePublished()
    },
    URL_FORMAT: {
        pages: PAGES_NONE,
        func: (ds) => ds.generalInfo.urlFormat.get()
    },
    FILTERED_COMPS: {
        pages: PAGES_ALL,
        func: (ds, selectors) => {
            const pagesData = ds.pages.getPagesData();
            return _(selectors)
                .map((selector) => {
                    const page = _.find(pagesData, selector.page);
                    if (!page) {
                        return null;
                    }
                    const pageId = page.id;
                    const pageComponents = ds.components.getAllComponents(pageId);
                    const matcher = _.matches(selector.comp);
                    return _(pageComponents)
                        .map((compRef) => getCompInfo(ds, compRef))
                        .filter(matcher)
                        .value();
                })
                .flatten()
                .compact()
                .value();
        }
    }
};

module.exports = {
    READ_FLAGS: _.keys(READ_FLAGS),
    readFromEditorModel: createDocumentServicesAndRead,
    readFromPublicModel: createDocumentServicesFromPublicModelsAndRead
};

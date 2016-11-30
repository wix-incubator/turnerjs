/* global sendErrorOrQueue:false */

function getDefaultWixappsModel() {
    return {appbuilder: {metadata: {appbuilder_metadata: {requestedPartNames: []}}}};
}

function convertSiteModel(rendererModel, publicModel) {
    function getPagesDataFromSiteAsJson(siteJson){
        var initialPagesData = {
            masterPage: siteJson.masterPage
        };

        return siteJson.pages.reduce(function(accum, val){
            accum[val.structure.id] = val;
            return accum;
        }, initialPagesData);
    }
    var siteModel = {
        publicModel: publicModel,
        urlFormatModel: rendererModel.urlFormatModel,
        serviceTopology: window.serviceTopology,
        santaBase: window.santaBase,
        configUrls: window.configUrls,
        rendererModel: rendererModel,
        componentGlobals: window.componentGlobals,
        serverAndClientRender: window.serverAndClientRender,
        adData: window.adData,
        mobileAdData: window.mobileAdData,
        googleAnalytics: window.googleAnalytics,
        googleRemarketing: window.googleRemarketing,
        facebookRemarketing: window.facebookRemarketing,
        yandexMetrika: window.yandexMetrika,
        wixData: window.wixData,
        wixapps: window.wixapps || getDefaultWixappsModel(),
        wixBiSession: window.wixBiSession,
        pagesData: window.pagesData,
        svgShapes: window.svgShapes,
        contactforms_metadata: {},
        renderFlags: {}
    };
    siteModel.siteHeader = {id: siteModel.rendererModel.siteId, userId: siteModel.rendererModel.userId}; // required
    siteModel.siteId = siteModel.rendererModel.siteId; // required
    siteModel.viewMode = siteModel.rendererModel.previewMode ? 'preview' : 'site'; // required
    if (window.siteAsJson) {
        movePageDataToMaster(window.siteAsJson);
        siteModel.pagesData = getPagesDataFromSiteAsJson(window.siteAsJson);
    }
    if (window.documentServicesModel) {
        siteModel.documentServicesModel = window.documentServicesModel;
    }
    return siteModel;
}

function movePageDataToMaster(siteAsJson) {
    var masterData = siteAsJson.masterPage.data.document_data;

    function move(ref, to, from) {
        if (!get(from, ref)) {
            return;
        }

        if (!get(to, ref)) {
            set(to, ref, get(from, ref));
        }
        remove(from, ref);
    }

    function get(parentData, ref){
        return ref && parentData[ref.replace('#', '')];
    }

    function set(parentData, ref, dataToSet){
        if (ref){
            parentData[ref.replace('#', '')] = dataToSet;
        }
    }

    function remove(parentData, ref){
        if (ref){
            delete parentData[ref.replace('#', '')];
        }
    }

    function moveMediaRef(masterPageDocumentData, pageData, mediaRef){
        // Image or WixVideo
        var media = get(pageData, mediaRef);
        move(mediaRef, masterPageDocumentData, pageData);
        // Image
        move(media.posterImageRef, masterPageDocumentData, pageData);
    }

    siteAsJson.pages.forEach(function(page) {
        if (!page.structure){
            return;
        }

        var pageData = page.data.document_data;
        var pageId = page.structure.id;
        var desktopBg, mobileBg;

        // Pages or AppPages
        var pageItem = get(pageData, pageId);
        move(pageId, masterData, pageData);

        if (pageItem && pageItem.pageBackgrounds && pageItem.pageBackgrounds.desktop.ref) {
            // BackgroundImage or BackgroundMedia
            desktopBg = get(pageData, pageItem.pageBackgrounds.desktop.ref);
            mobileBg = get(pageData, pageItem.pageBackgrounds.mobile.ref);
            move(pageItem.pageBackgrounds.desktop.ref, masterData, pageData);
            move(pageItem.pageBackgrounds.mobile.ref, masterData, pageData);

            var wixBiSession = window.wixBiSession || {};

            //BackgroundMedia
            if (desktopBg) {
                if (desktopBg.mediaRef) {
                    moveMediaRef(masterData, pageData, desktopBg.mediaRef);
                }
                //Image
                move(desktopBg.imageOverlay, masterData, pageData);
            } else {
                sendErrorOrQueue({errorName: 'MISSING_DESKTOP_BACKGROUND_ITEM', errorCode: 112001, severity: 30}, pageItem.id);
            }

            if (mobileBg) {
                if (mobileBg.mediaRef) {
                    moveMediaRef(masterData, pageData, mobileBg.mediaRef);
                }
                //Image
                move(mobileBg.imageOverlay, masterData, pageData);
            } else {
                sendErrorOrQueue({errorName: 'MISSING_MOBILE_BACKGROUND_ITEM', errorCode: 112002, severity: 30}, pageItem.id);
            }
        }
    });
}

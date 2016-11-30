define(['wixappsCore'], function (wixapps) {
    'use strict';

    var wixappsDataHandler = wixapps.wixappsDataHandler;

    function setPackageLoadingState(siteData, appService) {
        wixappsDataHandler.setPackageMetadata({loading: true}, siteData, appService.type);
    }

    function clearPackageLoadingState(siteData, appService) {
        wixappsDataHandler.setPackageMetadata({loading: false}, siteData, appService.type);
    }

    function setPackageAsErroneous(siteData, appService) {
        clearPackageLoadingState(siteData, appService);
        wixappsDataHandler.setPackageMetadata({error: true}, siteData, appService.type);
    }

    function setPartLoadingState(siteData, appService, partName) {
        wixappsDataHandler.setCompMetadata({loading: true}, siteData, appService.type, partName);
    }

    function clearPartLoadingState(siteData, appService, partName) {
        wixappsDataHandler.setCompMetadata({loading: false}, siteData, appService.type, partName);
    }

    function setPartAsErroneous(siteData, appService, partName) {
        clearPartLoadingState(siteData, appService, partName);
        wixappsDataHandler.setCompMetadata({error: true}, siteData, appService.type, partName);
    }

    function hasPartLoadedSuccessfully(siteData, appService, partName) {
        var metadata = wixappsDataHandler.getCompMetadata(siteData, appService.type, partName);
        return metadata.loading === false && !metadata.error;
    }

    function hasPackageLoadedSuccessfully(siteData, appService) {
        var metadata = wixappsDataHandler.getPackageMetadata(siteData, appService.type);
        return metadata.loading === false && !metadata.error;
    }

    function isPartErroneous(siteData, appService, partName) {
        var metadata = wixappsDataHandler.getCompMetadata(siteData, appService.type, partName);
        return !!metadata.error;
    }

    function isPackageErroneous(siteData, appService) {
        var metadata = wixappsDataHandler.getPackageMetadata(siteData, appService.type);
        return !!metadata.error;
    }

    return {
        clearPackageLoadingState: clearPackageLoadingState,
        setPackageAsErroneous: setPackageAsErroneous,
        clearPartLoadingState: clearPartLoadingState,
        setPartAsErroneous: setPartAsErroneous,
        setPartLoadingState: setPartLoadingState,
        setPackageLoadingState: setPackageLoadingState,
        hasPartLoadedSuccessfully: hasPartLoadedSuccessfully,
        hasPackageLoadedSuccessfully: hasPackageLoadedSuccessfully,
        isPartErroneous: isPartErroneous,
        isPackageErroneous: isPackageErroneous
    };
});
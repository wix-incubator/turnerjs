define(['jquery', 'bluebird'], function ($, Promise) {
    'use strict';
    var deferred, takeSnapshotFlag = false, saveBaseImageFlag = false, name = '', cssSelector = '';

    var takeSnapshot = function (snapshotName, elementCssSelector, saveBaseImage) {
        $('.jasmine_html-reporter').css({'display': 'none'});
        takeSnapshotFlag = true;
        saveBaseImageFlag = !!saveBaseImage;
        name = snapshotName;
        cssSelector = elementCssSelector;
        deferred = Promise.pending();
        return deferred.promise;
    };

    var shouldITakeSnapshot = function () {
        var valueToReturn = {
            shouldTakeSnap: takeSnapshotFlag,
            shouldSaveBaseImage: saveBaseImageFlag,
            elementCssSelector: cssSelector,
            imageName: name
        };
        takeSnapshotFlag = false;
        return valueToReturn;
    };

    var imageCompareEnded = function (compareData) {
        takeSnapshotFlag = false;
        saveBaseImageFlag = false;
        name = '';
        deferred.resolve(compareData);
    };

    window.imageCompare = {
        imageCompareEnded: imageCompareEnded,
        takeSnapshot: takeSnapshot,
        shouldITakeSnapshot: shouldITakeSnapshot
    };

    return window.imageCompare;
});

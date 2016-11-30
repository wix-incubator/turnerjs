define(['jquery', 'lodash', 'bluebird'], function ($, _, Promise) {
    'use strict';

    var waitForDomElement = function (selector, tries, timeout, errorMessage, options) {
        return new Promise(function (resolve, reject) {
            var checkSelector = setInterval(function () {
                tries--;
                if ($(selector).length) {
                    if (options && options.delay) {
                        _.delay(function () {
                            resolve({
                                result: 'ok',
                                dom: $(selector)
                            });
                        }, options.delay);
                    } else {
                        resolve({
                            result: 'ok',
                            dom: $(selector)
                        });
                    }
                    clearInterval(checkSelector);
                } else if (tries === 0) {
                    reject({
                        result: errorMessage
                    });
                    clearInterval(checkSelector);
                }
            }, timeout);
        });
    };

    var waitForDomElementWithinPreview = function (selector, tries, timeout, errorMessage, options) {
        return new Promise(function (resolve, reject) {
            var checkSelector = setInterval(function () {
                tries--;
                if ($(selector, frames.preview.contentDocument).length) {
                    if (options && options.delay) {
                        _.delay(function () {
                            resolve({
                                result: 'ok',
                                dom: $(selector, frames.preview.contentDocument)
                            });
                        }, options.delay);
                    } else {
                        resolve({
                            result: 'ok',
                            dom: $(selector, frames.preview.contentDocument)
                        });
                    }
                    clearInterval(checkSelector);
                } else if (tries === 0) {
                    reject({
                        result: errorMessage
                    });
                    clearInterval(checkSelector);
                }
            }, timeout);
        });
    };

    var waitForSelectedComponent = function(editorAPI, tries, timeout, errorMessage) {
        return new Promise(function (resolve, reject) {
            var checkSelected = setInterval(function () {
                tries--;
                var selectedComponent = editorAPI.selection.getSelectedComponents()[0];
                if (selectedComponent) {
                    resolve({
                        result: 'ok',
                        compRef: selectedComponent
                    });
                    clearInterval(checkSelected);
                } else if (tries === 0) {
                    reject({
                        result: errorMessage
                    });
                    clearInterval(checkSelected);
                }
            }, timeout);
        });
    };

    var closeWelcomeScreen = function() {
        var welcomePanel = $('.welcome-screen-panel');
        if (welcomePanel.length >= 0) {
            welcomePanel.find('.close').click();
        }
    };

    return {
        waitForDomElement: waitForDomElement,
        waitForDomElementWithinPreview: waitForDomElementWithinPreview,
        waitForSelectedComponent: waitForSelectedComponent,
        closeWelcomeScreen: closeWelcomeScreen
    };
});

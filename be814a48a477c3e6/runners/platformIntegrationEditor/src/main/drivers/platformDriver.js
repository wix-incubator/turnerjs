define([
    'lodash',
    'bluebird',
    'jquery'
], function (_, Promise, $) {
    'use strict'

    var platform, editorAPI

    function init(_platform, global) {
        platform = _platform
        editorAPI = global.rendered.editorAPI

        _.assign(driver, {
            components: {
                add: _.partial(platform.api.components.add, editorAPI)
            },
            editor: {
                openComponentPanel: openComponentPanel,
                openPagesPanel: openPagesPanel,
                openMediaPanel: openMediaPanel,
                openModalPanel: openModalPanel,
                openLinkPanel: openLinkPanel,
                openToolPanel: openToolPanel,
                openFullStagePanel: openFullStagePanel,
                openHelpPanel: openHelpPanel,
                closePanel: function (appData, token) { _.partial(platform.api.editor.closePanel, editorAPI)(appData, token) }
            },
            controllers: {
                listControllers: _.partial(platform.api.controllers.listControllers, editorAPI),
                listAllControllers: _.partial(platform.api.controllers.listAllControllers, editorAPI),
                listConnectableControllers: function (appData, token, options) { return _.partial(platform.api.controllers.listConnectableControllers, editorAPI)(appData, token, options)},
                listConnections: function (appData, token, options) { return _.partial(platform.api.controllers.listConnections, editorAPI)(appData, token, options)},
                connect: function (appData, token, options) { return  _.partial(platform.api.controllers.connect, editorAPI)(appData, token, options)},
                disconnect: function (appData, token, options) { return  _.partial(platform.api.controllers.disconnect, editorAPI)(appData, token, options)},
                getData: function (appData, token, options) { return _.partial(platform.api.controllers.getData, editorAPI)(appData, token, options)},
                saveConfiguration: function (appData, token, options) { return _.partial(platform.api.controllers.saveConfiguration, editorAPI)(appData, token, options)},
                setDisplayName: function (appData, token, options) { return _.partial(platform.api.controllers.setDisplayName, editorAPI)(appData, token, options)}
            },
            vfs: {
                listChildren: function (appData, token, options) { return _.partial(platform.api.vfs.listChildren, editorAPI)(appData, token, options) },
                readFile: function (appData, token, options) { return _.partial(platform.api.vfs.readFile, editorAPI)(appData, token, options) },
                writeFile: function (appData, token, options) { return _.partial(platform.api.vfs.writeFile, editorAPI)(appData, token, options) }
            },
            history: { add: function (appData, token, options) { return _.partial(platform.api.history.add, editorAPI)(appData, token, options) }},
            routers: {
                get: function (appData, token, options) { return _.partial(platform.api.routers.get, editorAPI)(appData, token, options)},
                getByPage: _.partial(platform.api.routers.get, editorAPI),
                getByPrefix: _.partial(platform.api.routers.get, editorAPI),
                remove: function (appData, token, options) {
                    return new Promise(function (resolve) {
                        _.partial(platform.api.routers.remove, editorAPI)(appData, token, options);
                        editorAPI.waitForChangesApplied(function () {
                            resolve();
                        });
                    });
                },
                update: function (appData, token, options) {
                    return new Promise(function (resolve) {
                        _.partial(platform.api.routers.update, editorAPI)(appData, token, options);
                        editorAPI.waitForChangesApplied(function () {
                            resolve();
                        });
                    });
                },
                add: function (appData, token, options) {
                    return new Promise(function (resolve) {
                        var routerRef = _.partial(platform.api.routers.add, editorAPI)(appData, token, options);
                        editorAPI.waitForChangesApplied(function () {
                            resolve(routerRef);
                        });
                    });
                },
                pages: {
                    listConnectablePages: _.partial(platform.api.routers.pages.listConnectablePages, editorAPI),
                    add: function (appData, token, options) {
                        return new Promise(function (resolve) {
                            var pageRef = _.partial(platform.api.routers.pages.add, editorAPI)(appData, token, options);
                            editorAPI.waitForChangesApplied(function () {
                                resolve(pageRef);
                            });
                        });
                    },
                    delete: function (appData, token, options) {
                        return new Promise(function (resolve) {
                            _.partial(platform.api.routers.pages.delete, editorAPI)(appData, token, options);
                            editorAPI.waitForChangesApplied(function () {
                                resolve();
                            });
                        });
                    },
                    disconnect: function (appData, token, options) {
                        return new Promise(function (resolve) {
                            _.partial(platform.api.routers.pages.disconnect, editorAPI)(appData, token, options);
                            editorAPI.waitForChangesApplied(function () {
                                resolve();
                            });
                        });
                    },
                    connect: function (appData, token, options) {
                        return new Promise(function (resolve) {
                            var pageRef = _.partial(platform.api.routers.pages.connect, editorAPI)(appData, token, options);
                            editorAPI.waitForChangesApplied(function () {
                                resolve(pageRef);
                            });
                        });
                    }
                }
            },
            pages: {
                rename: function (appData, token, options) {
                    return new Promise(function (resolve) {
                        var error =  _.partial(platform.api.pages.rename, editorAPI)(appData, token, options);
                        editorAPI.waitForChangesApplied(function () {
                            resolve(error);
                        });
                    });
                },
                getCurrent: _.partial(platform.api.pages.getCurrent, editorAPI),
                navigateTo: _.partial(platform.api.pages.navigateTo, editorAPI)
            },
            platform: editorAPI.platform
        })
    }


    function waitForDomElement(selector, tries, timeBetweenTries, errorMessage) {
        return new Promise(function (resolve, reject) {
            var checkSelector = setInterval(function () {
                tries--
                var elements = $(selector)
                if (elements.length) {
                    resolve({
                        result: 'ok',
                        dom: elements
                    })
                    clearInterval(checkSelector)
                } else if (tries === 0) {
                    reject({
                        result: errorMessage
                    });
                    clearInterval(checkSelector)
                }
            }, timeBetweenTries)
        })
    }

    function openComponentPanel(appData, token, data) {
        platform.api.editor.openComponentPanel(editorAPI, appData, token, data);
        return waitForDomElement('.comp-panel-frame', 10, 1000, 'platform comp panel did not load in time')
    }

    function openPagesPanel(token, data) {
        platform.api.editor.openPagesPanel(editorAPI, token, data);
        return waitForDomElement('.page-settings-panel', 10, 2000, 'pages panel did not load in time')
    }

    function openModalPanel(appData, token, data) {
        platform.api.editor.openModalPanel(editorAPI, appData, token, data);
        return waitForDomElement('.focus-panel-frame', 10, 1000, 'platform comp panel did not load in time')
    }

    function openMediaPanel(token, data) {
        platform.api.editor.openMediaPanel(editorAPI, token, data);
        return waitForDomElement('#mediaGalleryFrame', 10, 1000, 'media gallery frame did not load in time')
    }

    function openLinkPanel(token, data) {
        platform.api.editor.openLinkPanel(editorAPI, token, data);
        return waitForDomElement('.tool-panel-frame-container', 10, 1000, 'platform link panel did not load in time')
    }

    function openToolPanel(appData, token, data) {
        platform.api.editor.openToolPanel(editorAPI, appData, token, data);
        return waitForDomElement('.tool-panel-frame', 10, 1000, 'platform link panel did not load in time')
    }

    function openHelpPanel(appData, token, data) {
        platform.api.editor.openHelpPanel(editorAPI, appData, token, data);
        return waitForDomElement('.help-panel-frame', 10, 1000, 'platform link panel did not load in time')
    }

    function openFullStagePanel(appData, token, data) {
        platform.api.editor.openFullStagePanel(editorAPI, appData, token, data);
        return waitForDomElement('.tool-panel-frame', 10, 1000, 'platform link panel did not load in time')
    }

    var driver = {init: init}
    return driver
})



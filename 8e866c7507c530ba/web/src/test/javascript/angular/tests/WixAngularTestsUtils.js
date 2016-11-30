(function () {
    window.TestsUtils = {
        mocks: {
            imageUtils: function () {
                return {
                    getUrlForPyramid: function () {
                    }
                };
            },
            editorData: function () {
                return {
                    getDataByQuery: function (query, dataSource) {
                        return query;
                    }
                };
            },
            configManager: function () {
                return {
                    webThemeDir: 'testsThemeDir'
                };
            },
            editorTheme: function () {
                return {
                    getPreviewThemeProperty: function () {
                    },
                    getPropertiesAccordingToType: function () {
                    },
                    getProperty: function () {
                    }
                };
            },
            editorResources: function ($sce) {
                return {
                    topology: {
                        skins: '/html-client/skins/src/main',
                        tpa: '/tpa'
                    },
                    getAngularPartialPath: function (str) {
                        if (str[0] !== '/') {
                            str = '/' + str;
                        }
                        return $sce.trustAsResourceUrl('angular' + str.toLowerCase());
                    },
                    translate: function () {
                        return '';
                    },
                    getMediaStaticUrl: function () {
                    },
                    isPreview: function() {
                        return false;
                    }
                };
            },
            ngIncludeUtils: function() {
                return {
                    listenForAllIncludeLoaded: function() {}
                };
            },
            mathUtils: function () {
                var percentFromValue = function (min, max, value) {
                    return value;
                };

                var valueFromPercent = function (min, max, percent) {
                    return percent;
                };

                var normalizeNumberToStepAndRange = function (input, step, min, max, noFloats) {
                    input = Number(input);
                    return input;
                };

                return {
                    percentFromValue: percentFromValue,
                    valueFromPercent: valueFromPercent,
                    normalizeNumberToStepAndRange: normalizeNumberToStepAndRange
                };
            },
            editorCommands: function () {
                var editorCommands = {
                    listenToCommand: function (name, scope, callback) {
                        scope.$on(name, callback);
                    },
                    executeCommand: function () {
                    }
                };
                return editorCommands;
            },
            editorComponent: function () {
                return {
                    EDIT_MODE: {
                        "CURRENT_PAGE": "CURRENT_PAGE",
                        "MASTER_PAGE": "MASTER_PAGE",
                        "PREVIEW": "PREVIEW"
                    },
                    getEditedComponent: function () {
                        return {
                            MINIMUM_X_DEFAULT: -2000,
                            MAXIMUM_X_DEFAULT: 2000,
                            MINIMUM_Y_DEFAULT: -1000,
                            MAXIMUM_Y_DEFAULT: 40000,
                            $className: 'className',
                            fireEvent: function (eventName) {
                            },
                            trigger: function (eventName) {
                            },
                            getComponentProperties: function () {
                            },
                            getStyle: function () {
                                return {};
                            },
                            getDataItem: function () {
                            },
                            getSizeLimits: function () {
                            },
                            getX: function () {
                                return 0;
                            },
                            getY: function () {
                                return 0;
                            },
                            getBoundingX: function () {
                                return 0;
                            },
                            getBoundingY: function () {
                                return 0;
                            },
                            isHorizResizable: function () {
                            },
                            isVertResizable: function () {
                            },
                            _mediaGalleryCallback: function (rawData) {
                            },
                            getBehaviors: function () {
                            }
                        };
                    },
                    getComponentData: function () {
                        return {
                            data: {
                                getLegacyDataItem: function () {
                                    return {};
                                }
                            },
                            property: {
                                getLegacyDataItem: function () {
                                    return {};
                                }
                            }
                        };
                    },
                    getLegacyPanel: function () {
                        return {
                            insertInto: function (element) {
                            },
                            $logic: {
                                dispose: function () {
                                }
                            },
                            dispose: function () {
                            }
                        };
                    }
                };
            },
            propertyPanelNavigation: function () {
                return {
                    getPanelPath: function () {

                    }
                };
            },
            galleryService: function () {
                return {
                    openOrganizeImages: function () {
                    }
                };
            },
            linkRenderer: function () {
                return {
                    renderLinkForPropertyPanel: function (dataQuery) {
                        return dataQuery + '_MOCK_LINK';
                    }
                };
            },
            editorUtils: function () {
                return {
                    getPositionRelativeToWindow: function () {
                        return {
                            x: 0,
                            y: 0
                        };
                    }
                };
            },
            componentLayout: function () {
                return {
                    setSelectedCompPositionSize: function (coordinates) {
                    },
                    getSelectedCompLayoutData: function() {
                        return {
                            x: 0,
                            y: 0,
                            width: 0,
                            height: 0
                        };
                    },
                    getComponentScope: function() {
                        return 'CURRENT_PAGE';
                    }
                };
            },
            dialogService: function () {
                return {
                    open: function () {
                    },
                    CONSTS: {
                        BUTTONS_SET: '',
                        POSITION: '',
                        TYPES: ''
                    }
                };
            },
            colorDialog: function () {
                return {
                    openOpacityDialog: function () {
                    },
                    openColorSelectorDialog: function () {
                    }
                };
            },
            dialogWindows: function () {
                return {
                    open: function () {
                    },
                    close: function () {
                    }
                };
            },
            StackedMap: function () {
                function StackedMap() {
                    this.stack = [];
                }

                StackedMap.prototype = {
                    add: function () {
                    },
                    get: function () {
                    },
                    getByIndex: function () {
                    },
                    keys: function () {
                    },
                    top: function () {
                    },
                    remove: function () {
                    },
                    removeTop: function () {
                    },
                    length: function () {
                    }
                };
                return StackedMap;
            }
        }
    };
}());
(function initW() {
    'use strict';


    var editedComponent;

    var dummyDataItem = {
        _data: {
            item1: 'item1',
            item2: 'item2',
            item3: 'item3'
        },
        set: jasmine.createSpy('set'),
        _schema: {
            item1: null,
            item2: null
        },
        on: jasmine.createSpy('on'),
        offByListener: jasmine.createSpy('offByListener'),
        getType: jasmine.createSpy('getType').and.returnValue('compType')
    };

    function DataManagerMock() {
        this.getDataByQuery = jasmine.createSpy('getDataByQuery').and.returnValue(dummyDataItem);
        this.addDataItem = jasmine.createSpy('addDataItem').and.callFake(function (id, dataObj) {
            var fakeDI = {
                _data: dataObj,
                on: jasmine.createSpy('on')
            };
            return fakeDI;
        });
        this.addDataItemWithUniqueId = jasmine.createSpy('addDataItemWithUniqueId').and.callFake(function (prefix, dataObj) {
            var dataandId =
            {
                id: prefix,
                dataObject: {

                    _data: dataObj,
                    on: jasmine.createSpy('on')
                }
            };
            return dataandId;
        });
        this.createDataItem = jasmine.createSpy('createDataItem').and.callFake(function (dataObj, type) {
            var fakeDI = {
                _data: dataObj,
                on: jasmine.createSpy('on')
            };
            return fakeDI;
        });
    }

    var themeManager = new DataManagerMock();
    themeManager.getProperty = jasmine.createSpy();

    var previewManagers =
    {
        Data: new DataManagerMock(),
        Theme: themeManager,
        Components: {
            getComponentInformation: function (className) {
                return {
                    'get': function (s) {
                        if (s === 'helpIds') {
                            return {
                                componentPanel: className + '_helpId'
                            };
                        }

                        return '';
                    }
                };
            }
        }
    };


    window.LOG = {
        reportEvent: function () {
        },
        reportError: function () {
        }
    };

    window.wixErrors = {};
    window.wixEvents = {};

    window.Constants = window.Constants || {};

    Constants.CoreEvents = {
        CLICK: 'click',
        KEY_DOWN: 'keydown',
        KEY_UP: 'keyup',
        KEY_PRESS: 'keypress',
        COPY: 'copy',
        CUT: 'cut',
        BLUR: 'blur',
        FOCUS: 'focus',
        PASTE: 'paste',
        MOUSE_OVER: 'mouseover',
        MOUSE_OUT: 'mouseout',
        MOUSE_ENTER: 'mouseenter',
        MOUSE_LEAVE: 'mouseleave',
        MOUSE_DOWN: 'mousedown',
        MOUSE_UP: 'mouseup',
        MOUSE_MOVE: 'mousemove',
        MOUSE_WHEEL: 'mousewheel',
        CHANGE: 'change',
        INPUT: 'input',
        INPUT_CHANGE: 'inputChanged',
        RESIZE: 'resize',
        SCROLL: 'scroll'
    };

    window.W = {
        Utils: {
            getPositionRelativeToWindow: function () {
            }
        },
        Experiments: {
            getAllDefinedExperimentIds: function () {
                return [];
            },
            getRunningExperimentIds: function () {
                return [];
            }
        },
        isExperimentOpen: function (experiment) {
            return true;
        },
        AngularManager: {
            execute: function (f) {
                f();
            },
            executeExperiment: function (expName, f) {
                f();
            }
        },
        AngularLoader: {
            _promise: Q.defer(),
            getAngularLoadingDeferredPromise: function () {
                return this._promise;
            },
            registerAdditionalModule: function () {
            },
            getAdditionalModules: function () {
                return [
                    {name: 'PagesBackgroundCustomizer', dependencies: []},
                    {name: 'EditorUserPanel', dependencies: ['angularEditor']}
                ];
            }
        },
        UndoRedoManager: {
            startTransaction: function () {
            },
            endTransaction: function () {
            }
        },
        Resources: {
            resources: {
                topology: {wysiwyg: '//static.parastorage.com/services/web/1.000.1'},
                angularPath: ''
            },
            get: function (bundleName, key) {
                return key;
            }
        },
        Classes: {
            getClass: function (className, callback) {
                if (callback) {
                    callback(null);
                }
            }
        },
        Commands: {
            executeCommand: function (commandName, cmdParams, source) {
            },
            registerCommandAndListener: function (commandName) {
            }
        },
        Components: {
            createComponent: jasmine.createSpy('createComponent').and.returnValue('')
        },
        Config: {
            getMediaStaticUrl: function () {
                return '';
            },
            getServiceTopologyProperty: function () {
                return '';
            }
        },
        Data: new DataManagerMock(),
        Theme: new DataManagerMock(),

        Editor: {
            getEditedComponent: function () {
                if (!editedComponent) {
                    var className = 'my.very.nice.component';
                    editedComponent = jasmine.createSpyObj('component', ['getComponentProperties', 'getDataItem', 'getOriginalClassName']);
                    editedComponent.getDataItem.and.returnValue(dummyDataItem);
                    editedComponent.getOriginalClassName.and.returnValue(className);
                    editedComponent.$className = className;
                    editedComponent.getHelpId = function () {
                        return 'someHelpId';
                    };
                }
                return editedComponent;
            },

            EDIT_MODE: {
                "CURRENT_PAGE": "CURRENT_PAGE",
                "MASTER_PAGE": "MASTER_PAGE",
                "PREVIEW": "PREVIEW"
            },
            getDataPanel: jasmine.createSpy('getDataPanel').and.returnValue({
                logic: {},
                skin: {}
            }),
            getComponentScope: function () {
            }
        },
        Preview: {
            getPreviewManagers: function () {
                return previewManagers;
            }
        },

        EditorDialogs: {
            closeDialogByTypeId: function (dialogRes, dlgTypeId) {
            },
            closeDialogIfOutsideClick: function () {
            }
        }

    };

    window.resource = {
        getResources: function (arrRes, callback) {
        },

        getResourceValue: function (resourceName, callback) {
            callback(null);
        }
    };


    window.getDummyDataItem = function () {
        return dummyDataItem;
    };


}());
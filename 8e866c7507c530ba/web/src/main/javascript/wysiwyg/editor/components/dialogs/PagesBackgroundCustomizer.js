define.component('wysiwyg.editor.components.dialogs.PagesBackgroundCustomizer', function (compDefinition) {
        /** @type core.managers.component.ComponentDefinition */
        var def = compDefinition;

        def.inherits('core.components.base.BaseComp');

        def.resources(['W.Preview', 'W.EditorDialogs', 'W.BackgroundManager', 'scriptLoader', 'W.Resources', 'W.UndoRedoManager', 'W.Commands']);

        def.binds(['getPagesSelection', '_onDialogClosing']);

        def.skinParts({
            container: {type: 'htmlElement'}
        });

        def.statics({
            NUMBER_OF_PAGE_LEVELS_TO_SEARCH: 5,
            SELECT_ALL_DEFAULT_TRANSLATION: "Select All"
        });

        def.states({
            'visibility': [ "VISIBLE", "INVISIBLE"]
        });

        def.methods({
            initialize: function (compId, viewNode, args) {
                this.parent(compId, viewNode, args);
                this._pagesModel = null;
                this._totalNumOfPages = 0;
                this._numberOfSelectedPages = 0;
                this._dialogWindow = args.dialogWindow;
                this._dialogWindow.addEvent('onDialogClosing', this._onDialogClosing);
            },

            _onDialogClosing: function (params) {
                if (params && params.result === this.resources.W.EditorDialogs.DialogButtons.OK) {
                    var selectedPages = this._getSelectedPageNodes(this._pagesModel);
                    this.resources.W.UndoRedoManager.startTransaction();
                    this._setBackgroundToPages(selectedPages);
                    this.resources.W.UndoRedoManager.endTransaction();
                    this._reportBIDialogOK(selectedPages);
                } else {
                    this._reportBIDialogCancel(params);
                }
            },

            _reportBIDialogOK: function (selectedPages) {
                var numberOfSelectedPages = 0;
                if (selectedPages && selectedPages.length >= 0) {
                    numberOfSelectedPages = selectedPages.length;
                }
                var numberOfUnselectedPages = this._totalNumOfPages - numberOfSelectedPages;
                var eventParams = {'i1': numberOfSelectedPages, 'i2': numberOfUnselectedPages};
                LOG.reportEvent(wixEvents.BGPP_ADD_TO_OTHER_PAGES_OK_DIALOG, eventParams);
            },

            _reportBIDialogCancel: function (params) {
                var e = params.event;
                var closeParamValue = '';
                if (e && e.key == 'esc') {
                    closeParamValue = 'esc-key';
                } else if (e && e.target && e.target.getAttribute('skinpart') === 'x') {
                    closeParamValue = 'X-button';
                } else {
                    closeParamValue = 'cancel-button';
                }
                LOG.reportEvent(wixEvents.BGPP_ADD_TO_OTHER_PAGES_CANCEL_DIALOG, {'i1': closeParamValue});
            },

            _getSelectedPageNodes: function (pageModel) {
                var $this = this;
                var _getSelectedPageNodesHelper = function (selectedPageNodes) {
                    if (!pageModel || pageModel.length < 1) {
                        return null;
                    }
                    for (var i = 0; i < pageModel.length; i++) {
                        if (pageModel[i].isSelected) {
                            selectedPageNodes.push(pageModel[i]);
                        }
                        if (pageModel[i].children && pageModel[i].children.length > 0) {
                            var selectedChildren = $this._getSelectedPageNodes(pageModel[i].children);
                            if (selectedChildren && selectedChildren.length > 0) {
                                selectedPageNodes.append(selectedChildren);
                            }
                        }
                    }
                    return selectedPageNodes;
                };
                return _getSelectedPageNodesHelper([]);
            },

            _setBackgroundToPages: function (selectedPages) {
                if (selectedPages && selectedPages.length > 0) {
                    selectedPages = this._removeCurrentPageIdFromSelection(selectedPages);
                    var bgManager = this.resources.W.BackgroundManager;
                    var newCustomBackground = bgManager.getCurrentlyShowingBackground();
                    var device = this.resources.W.Config.env.$viewingDevice;
                    var oldCustomBgs = {};
                    var oldCustomBgsOnDevice = {};
                    oldCustomBgs[device] = oldCustomBgsOnDevice;
                    for (var pageNodeIndex = 0; pageNodeIndex < selectedPages.length; pageNodeIndex++) {
                        var pageId = selectedPages[pageNodeIndex].pageId;
                        var oldCustomBGForPageOnDevice = bgManager.getCustomBGForPageOnDevice(pageId, device);
                        this._updatePageBGRecordOnDevice(oldCustomBgsOnDevice, pageId, device, oldCustomBGForPageOnDevice);
                        bgManager.setCustomBGOnDevicePage(pageId, device, newCustomBackground);
                        bgManager.enableCustomBG(pageId, device);
                    }

                    var commandParameter = {oldValue: oldCustomBgs, newValue: newCustomBackground,
                        isBatchBgChange: true, 'device': device};
                    this.resources.W.Commands.executeCommand('WEditorCommands.SetCustomBackgroundsBatch', commandParameter);
                }
            },

            _updatePageBGRecordOnDevice: function (pageBGsRecordMap, pageId, device, customBg) {
                var record = {'value': null, isCustom: false};
                var bgManager = this.resources.W.BackgroundManager;
                if (customBg && customBg.ref) {
                    record.value = bgManager.getBackgroundOnPageAndDevice(pageId, device);
                    record.value = record.value ? record.value.toString() : record.value;
                    record.isCustom = !!customBg.custom;
                    record.isPreset = !!customBg.isPreset;
                }
                pageBGsRecordMap[pageId] = record;
            },

            _removeCurrentPageIdFromSelection: function (selectedPages) {
                var currentPageId = this.resources.W.Preview.getPreviewManagers().Viewer.getCurrentPageId();
                return selectedPages.filter(function (i) {
                    return currentPageId !== i.pageId;
                });
            },

            _initAngularModule: function () {
                var $this = this;
                var initModule = function () {
                    var app = window.angular.module('PagesBackgroundCustomizer', []);
                    app.controller('PagesBackgroundCustomizerCtrlr', ['$scope',
                        function ($scope) {
                            $scope.choose = function ($event, node) {
                                node.isSelected = !node.isSelected;
                                $this._numberOfSelectedPages += node.isSelected ? 1 : -1;
                                $scope.areAllSelected = ($this._totalNumOfPages === $this._numberOfSelectedPages + 1);
                            };

                            $scope.chooseAll = function () {
                                $scope.areAllSelected = !$scope.areAllSelected;
                                $this._numberOfSelectedPages = $scope.areAllSelected ? $this._totalNumOfPages - 1 : 0;
                                var previewManagers = $this.resources.W.Preview.getPreviewManagers();
                                var currentPageId = previewManagers.Viewer.getCurrentPageId() || null;
                                $this._selectAll($scope.pages, $scope.areAllSelected, currentPageId);
                                $this._pagesModel = $scope.pages;
                                $this.reportBISelectAll($scope.areAllSelected);
                            };

                            $this._createPageItemModel();
                            $scope.pages = $this._pagesModel;
                            $scope.areAllSelected = false;
                            $scope.selectAllTitle = $this._getSelectAllTitle();
                        }]);
                    $this._bootstrapAngular();
                    $this.setState("VISIBLE", 'visibility');
                };

                resource.getResources(['angularResource'], function (resources) {
                    resources.angularResource.Resource({
                        'scriptloader': $this.resources.scriptLoader,
                        'onComplete': initModule
                    });
                });
            },

            _getSelectAllTitle: function () {
                return this.resources.W.Resources.get('EDITOR_LANGUAGE',
                    'BACKGROUND_EDITOR_CUSTOM_COPY_TO_ALL_PAGES',
                    this.SELECT_ALL_DEFAULT_TRANSLATION);
            },

            _createPageItemModel: function () {
                var pagesData = this.resources.W.Preview.getPreviewManagers().Data.getDataByQuery("#MAIN_MENU");
                var items = pagesData.getItems();
                var pagesTreeModel = [];
                this._pagesModel = this._createTreeModel(items, pagesTreeModel, this.NUMBER_OF_PAGE_LEVELS_TO_SEARCH);
                this._totalNumOfPages = this._getNumberOfPageNodes(this._pagesModel, 0);
            },

            _createTreeModel: function (items, treeModel, levelsToSearch) {
                if (!items || items.length === 0 || levelsToSearch === 0) {
                    return treeModel;
                }
                var currentPageId = this.resources.W.Preview.getPreviewManagers().Viewer.getCurrentPageId();
                var homePageId = this._getHomePageId();
                homePageId = homePageId && homePageId.indexOf("#") === 0 ? homePageId.substr(1) : homePageId;
                for (var i = 0; i < items.length; i++) {
                    var pageItem = items[i];
                    var node = this._createPageTreeNode(pageItem, homePageId, currentPageId);
                    var subPages = pageItem.get("items");
                    if (subPages && subPages.length > 0) {
                        node.children = this._createTreeModel(subPages, [], levelsToSearch - 1);
                    }
                    treeModel.push(node);
                }
                return treeModel;
            },

            _getNumberOfPageNodes: function (pagesNodeModel, accumulator) {
                if (pagesNodeModel && pagesNodeModel.length && _.isArray(pagesNodeModel)) {
                    for (var i = 0; i < pagesNodeModel.length; i++) {
                        accumulator++;
                        if (pagesNodeModel[i].children) {
                            accumulator += this._getNumberOfPageNodes(pagesNodeModel[i].children, 0);
                        }
                    }
                    return accumulator;
                } else {
                    return accumulator;
                }
            },

            _getHomePageId: function () {
                var previewData = this.resources.W.Preview.getPreviewManagers().Data;
                return previewData.dataMap.SITE_STRUCTURE.get('mainPage');
            },

            _createPageTreeNode: function (pageItem, homePageId, currentPageId) {
                var previewData = this.resources.W.Preview.getPreviewManagers().Data;
                var pageRefId = pageItem.get("refId");
                var pageDataItem = previewData.getDataByQuery(pageRefId);
                var pageTitle = pageDataItem.get("title");
                var pageId = pageDataItem.get("id");
                var isPageHomePage = (homePageId === pageId);
                var isCurrentPage = pageId === currentPageId;
                return {'title': pageTitle,
                    'children': null,
                    'isHomePage': isPageHomePage,
                    'isSelected': false,
                    'pageId': pageId,
                    'pageDataRef': pageRefId,
                    'isCurrentPage': isCurrentPage};
            },

            _selectAll: function (pagesModel, selection, pageIdToKeepUnselected) {
                if (pagesModel && pagesModel.length > 0) {
                    for (var i = 0; i < pagesModel.length; i++) {
                        var isNodeIdEqualToNeverSelectedId = pageIdToKeepUnselected === pagesModel[i].pageId;
                        pagesModel[i].isSelected = (selection && !isNodeIdEqualToNeverSelectedId);
                        if (pagesModel[i].children && pagesModel[i].children.length > 0) {
                            this._selectAll(pagesModel[i].children, selection, pageIdToKeepUnselected);
                        }
                    }
                }
            },

            isRenderNeeded: function (invalidations) {
                return invalidations.isInvalidated([this.INVALIDATIONS.FIRST_RENDER]);
            },

            _onRender: function (renderEvent) {
                var invalidations = renderEvent.data.invalidations;
                if (invalidations.isInvalidated([this.INVALIDATIONS.FIRST_RENDER])) {
                    this.setState("INVISIBLE", 'visibility');
                    // create the angular inner module.
                    this._initAngularModule();
                }
            },

            _bootstrapAngular: function () {
                var containerNode = this.getSkinPart("container");
                window.angular.bootstrap(containerNode, ['PagesBackgroundCustomizer']);
            },

            getPagesSelection: function () {
                return this._pagesModel;
            },

            reportBISelectAll: function (areAllSelected) {
                LOG.reportEvent(wixEvents.BGPP_ADD_TO_ALL_PAGES);
            }
        });
    });

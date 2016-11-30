define.Class('wysiwyg.editor.managers.undoredomanager.CustomBackgroundChange', function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.inherits('wysiwyg.editor.managers.undoredomanager.BaseChange');

    def.resources(['W.Commands', 'W.BackgroundManager', 'W.Preview', 'W.Config']);

    def.methods({
        getPreliminaryActions:function (data) {
            if(data && data.sender) {
                var urmPreliminaryActions = W.UndoRedoManager._constants.PreliminaryActions;
                var senderClassName = data.sender.getOriginalClassName();
                if (senderClassName === 'wysiwyg.editor.components.panels.BackgroundDesignPanel') {
                    return [urmPreliminaryActions.OPEN_BACKGROUND_DESIGN_PANEL];
                } else if (senderClassName === 'wysiwyg.editor.components.panels.BackgroundEditorPanel') {
                    return [urmPreliminaryActions.OPEN_BACKGROUND_EDITOR_PANEL];
                }
            }
            return null ;
        },

        startListen:function () {
            var editorCmdManager = this.resources.W.Commands;
            editorCmdManager.registerCommand('WEditorCommands.SetCustomBackground') ;
            editorCmdManager.registerCommandListenerByName('WEditorCommands.SetCustomBackground', this, this._onChange);

            editorCmdManager.registerCommand('WEditorCommands.SetCustomBackgroundsBatch') ;
            editorCmdManager.registerCommandListenerByName('WEditorCommands.SetCustomBackgroundsBatch', this, this._onBatchCustomBGChange);

            var previewManagers = this.resources.W.Preview.getPreviewManagers();
            previewManagers.Commands.registerCommandListenerByName('WPreviewCommands.CustomBackgroundChanged', this, this._onChange);
        },

        stopListen:function () {
            this.resources.W.Commands.unregisterListener(this);
        },

        undo: function (changeData) {
            if(changeData.isBatchBgChange) {
                this._undoBatchChanges(changeData);
            } else {
                this._handleSingleBGPageUndo(changeData);
            }
        },

        _handleSingleBGPageUndo: function (changeData) {
            var previewManagers = this.resources.W.Preview.getPreviewManagers();
            var pageId = previewManagers.Viewer.getCurrentPageId();
            var device = changeData.device || previewManagers.Config.env.getCurrentFrameDevice();
            if (changeData && changeData.oldValue) {
                this._applySingleBgRecord(changeData.oldValue, changeData.isCustom, changeData.isPreset, pageId, device, true);
            } else if (changeData && changeData.isCustom !== null && changeData.pageId) {
                this._applySingleBgRecord(null, !changeData.isCustom, changeData.isPreset, changeData.pageId, device, false);
            }
        },

        _undoBatchChanges: function (changeData) {
            this._applyBatchChanges(changeData, true) ;
        },

        redo: function (changeData) {
            if(changeData) {
                if(changeData.isBatchBgChange) {
                    this._redoBatchChanges(changeData);
                } else {
                    this._handleSingleBGPageRedo(changeData);
                }
            }
        },

        _redoBatchChanges: function (changeData) {
            this._applyBatchChanges(changeData, false) ;
        },

        _applyBatchChanges: function(changeData, isApplyingOldChanges) {
            var device, pageId;
            var oldBgsPerDevicePerPage = changeData.oldValue;
            for (device in oldBgsPerDevicePerPage) {
                var pagesIds = oldBgsPerDevicePerPage[device];
                for (pageId in pagesIds) {
                    var record = pagesIds[pageId];
                    if(isApplyingOldChanges) {
                        this._applySingleBgRecord(record.value, record.isCustom, record.isPreset, pageId, device, false);
                    } else {
                        this._applySingleBgRecord(changeData.newValue, record.isCustom, false, pageId, device, false);
                    }
                }
            }
            this.resources.W.Preview.getPreviewManagers().Commands.executeCommand('WPreviewCommands.CustomBackgroundChanged');
        },

        _handleSingleBGPageRedo: function (changeData) {
            var pageId ;
            if (changeData.newValue && changeData.oldValue) {
                this._setCustomBackgroundToCurrentPageAndDevice(changeData);
            } else if (changeData.isCustom !== null) {
                pageId = this.resources.W.Preview.getPreviewManagers().Viewer.getCurrentPageId();
                var device = this.resources.W.Config.env.getCurrentFrameDevice();
                if (changeData.isCustom) {
                    this.resources.W.BackgroundManager.enableCustomBG(pageId, device, true);
                } else {
                    this.resources.W.BackgroundManager.disableCustomBG(pageId, device, true);
                }
            }
        },

        _applySingleBgRecord: function (bgValue, isCustom, isPreset, pageId, device, isFireBgChanged) {
            if(isFireBgChanged) {
                this.resources.W.BackgroundManager.setCustomBGOnDevicePageAndUpdateUI(pageId, device, bgValue, true);
            } else {
                this.resources.W.BackgroundManager.setCustomBGOnDevicePage(pageId, device, bgValue);
            }
            if(isCustom !== null && isCustom !== undefined) {
                if (!isCustom) {
                    this.resources.W.BackgroundManager.disableCustomBG(pageId, device, true);
                } else {
                    this.resources.W.BackgroundManager.enableCustomBG(pageId, device, true);
                }
            }
            if(isPreset) {
                this.resources.W.BackgroundManager.setPresetOnPageDevice(pageId, device, isPreset);
            }
        },

        _setCustomBackgroundToCurrentPageAndDevice: function(changeData) {
            var bgCssValue      = changeData.newValue ;
            var previewManagers = this.resources.W.Preview.getPreviewManagers();
            var currentPageId   = changeData.pageId || previewManagers.Viewer.getCurrentPageId() ;
            var device          = changeData.device || previewManagers.Config.env.getCurrentFrameDevice();
            this.resources.W.BackgroundManager.setCustomBGOnDevicePageAndUpdateUI(currentPageId, device, bgCssValue, true) ;
        },

        _onChange: function (data) {
            var changeData = null ;
            if (data && data.oldValue) {
                changeData = {
                    type:       this.className,
                    newValue:   data.newValue,
                    oldValue:   data.oldValue,
                    pageId:     data.pageId,
                    device:     data.device,
                    isCustom:   data.isCustom,
                    isPreset:   data.isPreset,
                    sender:     data.sender
                };
            } else if(data && data.isCustom !== null) {
                changeData = {
                    type:       this.className,
                    newValue:   null,
                    oldValue:   null,
                    pageId:     data.pageId,
                    device:     data.device,
                    isCustom:   data.isCustom,
                    isPreset:   data.isPreset,
                    sender:     data.sender
                };
            }
            if(changeData && (!!changeData.oldValue || !!changeData.newValue)) {
                this._recordDataChange(changeData);
            }
            return changeData ;
        },

        _onBatchCustomBGChange: function(data) {
            var changeData = null ;
            if (data && data.isBatchBgChange) {
                changeData = {
                    type:               this.className,
                    newValue:           data.newValue,
                    oldValue:           data.oldValue,
                    device:             data.device,
                    isBatchBgChange:    true,
                    sender:             data.sender
                };
                this._recordDataChange(changeData);
            }
            return changeData ;
        },

        _recordDataChange: function (changeData) {
            if(changeData) {
                this.fireEvent(Constants.UrmEvents.DATA_CHANGE_RECORDED, changeData);
            }
        }
    });
});

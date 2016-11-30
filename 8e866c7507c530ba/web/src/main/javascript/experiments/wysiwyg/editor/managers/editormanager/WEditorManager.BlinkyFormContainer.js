define.experiment.Class('wysiwyg.editor.managers.editormanager.WEditorManager.BlinkyFormContainer', function (def, strategy) {
    def.methods({
        doDeleteComponent: function (component, omitTransactionRecording, omitDeletedListUpdate) {

//            if (this.resources.W.Preview.getViewerMode()!==Constants.ViewerTypesParams.TYPES.DESKTOP) {
//                omitTransactionRecording = true;
//            }

            if (!component.isDeleteableRecurse()) {
                return;
            }
            omitTransactionRecording = omitTransactionRecording || !!component.IS_DEAD;

            var oldParentComp = component.getParentComponent();
            var deletedComponentLayoutData = {
                height: component.getPhysicalHeight(),
                y: component.getY()
            };

            var changedComponents = this.injects().Editor.getAllSelectedComponents(component);
            var changedComponentNodes = changedComponents.map(function (comp) {
                return comp.getViewNode();
            });
            var changedComponentData = this.injects().CompSerializer.serializeComponents(changedComponentNodes, true);

            var changedComponentIds = changedComponents.map(function (changedComp) {
                return changedComp.getComponentId();
            });

            var oldChildIdList = oldParentComp.getChildComponents().map(function (component) {
                return component.getLogic().getComponentId();
            });

            // Mark all custom styles data items as clean (not dirty)
            var changedComponentsWithCustomStyles = this._getComponentsWithCustomStyles(changedComponents);
            var compsAndCustomStyleIdLists = this._getCompsAndCustomStyleIdLists(changedComponentsWithCustomStyles);
            var currentStyle;

            for (var i = 0, j = changedComponentsWithCustomStyles.length; i < j; i++) {
                currentStyle = changedComponentsWithCustomStyles[i].getStyle();
                currentStyle.getDataItem().markDataAsClean();
            }

            var styleData = {
                data: {
                    subType: 'StyleChangeByDelete',
                    changedComponentIds: compsAndCustomStyleIdLists.componentIds,
                    oldState: {style: compsAndCustomStyleIdLists.styleIds},
                    newState: {style: null}
                }
            };

            var zOrderData = {
                subType: 'zOrderChangeByDelete',
                changedComponentIds: changedComponentIds,
                oldState: {children: oldChildIdList},
                newState: {children: oldChildIdList}
            };

            var addDeleteData = {
                //This is the line added by ViewerRefactor.New
                componentData: changedComponentData,
                data: {
                    changedComponentIds: changedComponentIds,
                    oldState: {
                        parentId: oldParentComp._compId,
                        changedComponentData: changedComponentData
                    },
                    newState: {parentId: null,
                        changedComponentData: null
                    }
                }
            };

            if (omitDeletedListUpdate || (this._editedComponent.EDITOR_META_DATA && this._editedComponent.EDITOR_META_DATA.mobile && this._editedComponent.EDITOR_META_DATA.mobile.dontOpenPanelOnDelete === true)) {
                addDeleteData.omitDeletedListUpdate = true;
            }

            if (this.getComponentScope(this._editedComponent) === this.EDIT_MODE.MASTER_PAGE) {
                addDeleteData.isMasterPageComp = true;
            }

            var animationState = this._getAllSelectedComponentsBehaviors(changedComponents);

            var animationData = {
                data: {
                    subType: 'AnimationChangeByDelete',
                    changedComponentIds: changedComponentIds,
                    oldState: animationState,
                    newState: animationState
                }

            };

            if (!omitTransactionRecording) {
                this.injects().UndoRedoManager.startTransaction();
            }

            this.injects().Commands.executeCommand('WEditorCommands.ComponentStyleChanged', styleData);
            this.injects().Commands.executeCommand('WEditorCommands.ComponentBehaviorsChanged', animationData);

            this.injects().Preview.getPreviewManagers().Commands.executeCommand('WViewerCommands.ComponentZIndexChanged', {editedComponent: this._editedComponent, urmData: zOrderData});

            component.dispose();

            this.injects().Preview.getPreviewManagers().Layout.reportDeleteComponent(oldParentComp, true);
            if (component === this._editedComponent) {
                this.clearSelectedComponent();
            }

            if (this.resources.W.Config.env.isViewingSecondaryDevice()) {
                this._adjustPageComponentsToFillDeletedComponentSpace(oldParentComp, deletedComponentLayoutData);
            }

            this.fireEvent('onComponentDelete', addDeleteData);

            if (!omitTransactionRecording) {
                this.injects().UndoRedoManager.endTransaction();
            }

            if (!this.arePageCompsDraggableToFooter()) {
                this.onComponentChanged(true);
            }
        },

        doDeleteSelectedComponent: function (omitTransactionRecording, omitDeletedListUpdate) {
            this.doDeleteComponent(this._editedComponent, omitTransactionRecording, omitDeletedListUpdate);
        },

        getAllSelectedComponents: function (component) {
            if (!component) {
                return [];
            }

            var changedComps;
            if (component.isMultiSelect) {
                changedComps = component.getSelectedComps();
            }
            else {
                changedComps = [component];
            }
            return changedComps;
        }
    });
});

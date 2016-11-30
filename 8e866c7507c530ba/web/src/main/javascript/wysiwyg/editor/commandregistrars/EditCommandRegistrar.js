/**@class  wysiwyg.editor.commandregistrars.EditCommandRegistrar*/
define.Class('wysiwyg.editor.commandregistrars.EditCommandRegistrar', function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.resources(['W.Commands', 'W.Config', 'W.Preview', 'W.EditorDialogs']);

    /**@lends wysiwyg.editor.commandregistrars.EditCommandRegistrar*/
    def.methods({
        initialize: function () {
        },

        registerCommands: function () {
            var cmdmgr = this.resources.W.Commands;

            // Edit commands:
            // --------------
            this._copyCommand = cmdmgr.registerCommandAndListener("EditCommands.Copy", this, this._onCopy);
            this._pasteCommand = cmdmgr.registerCommandAndListener("EditCommands.Paste", this, this._onPaste);
            this._cutCommand = cmdmgr.registerCommandAndListener("EditCommands.Cut", this, this._onCut);
            this._duplicateCommand = cmdmgr.registerCommandAndListener("EditCommands.Duplicate", this, this._onDuplicate);
            this._deleteSelectedComponentCommand = cmdmgr.registerCommandAndListener("WEditorCommands.WDeleteSelectedComponent", this, this._confirmAndDeleteSelectedComponent);

            this._undoCommand = cmdmgr.registerCommandAndListener("WEditorCommands.Undo", this, this._onUndo);
            this._redoCommand = cmdmgr.registerCommandAndListener("WEditorCommands.Redo", this, this._onRedo);

            this._moveTopCommand = cmdmgr.registerCommandAndListener("WEditorCommands.MoveTop", this, this._onMoveTop);
            this._moveBottomCommand = cmdmgr.registerCommandAndListener("WEditorCommands.MoveBottom", this, this._onMoveBottom);
            this._moveForwardCommand = cmdmgr.registerCommandAndListener("WEditorCommands.MoveForward", this, this._onMoveForward);
            this._moveBackCommand = cmdmgr.registerCommandAndListener("WEditorCommands.MoveBack", this, this._onMoveBack);

            this._traverseComponentsCommand = cmdmgr.registerCommandAndListener("WEditorCommands.TraverseComponents", this, this._onTraverseComponents);
            this._traverseComponentsReverseCommand = cmdmgr.registerCommandAndListener("WEditorCommands.TraverseComponentsReverse", this, this._onTraverseComponentsReverse);
            this._showEditorVersionCommand = cmdmgr.registerCommandAndListener("WEditorCommands.showEditorVersion", this, this._showEditorVersion);
            this._showRunningExperimentsCommand = cmdmgr.registerCommandAndListener("WEditorCommands.showRunningExperiments", this, this._showRunningExperiments);
            this._openExperimentsControlCommand = cmdmgr.registerCommandAndListener("WEditorCommands.openExperimentsControlCommand", this, this._openExperimentsControlCommand);
            this._showFlyingMussa = cmdmgr.registerCommandAndListener("WEditorCommands.ShowFlyingMussa", this, this._showFlyingMussa);
            this._initiateKittiesAndPigs = cmdmgr.registerCommandAndListener("WEditorCommands.ShowFlyingKittensAndPigsWithBeards", this, this._initiateKittiesAndPigs);

            cmdmgr.registerCommandAndListener("WEditorCommands.SetUndoButton", this, this._onSetUndoButton);
            cmdmgr.registerCommandAndListener("WEditorCommands.SetRedoButton", this, this._onSetRedoButton);
            cmdmgr.registerCommandAndListener("EditCommands.EnableEditCommandsOnEditorModeSwitch", this, this._enableEditCommandsOnEditorModeSwitch);
            cmdmgr.registerCommandAndListener("WEditorCommands.WHideSelectedComponent", this, this._confirmAndHideSelectedComponent);
            cmdmgr.registerCommandAndListener("EditCommands.Lock", this, this._lock);
            cmdmgr.registerCommandAndListener("EditCommands.Unlock", this, this._unlock);

            cmdmgr.registerCommand("WEditorCommands.StartCapturingUndoRedoButtons");
            cmdmgr.registerCommand("WEditorCommands.StopCapturingUndoRedoButtons");
        },
        //Experiment URM.New was promoted to feature on Mon Jul 30 15:17:44 IDT 2012
        setKeyboardEvents: function () {
            var ib = W.InputBindings;

            ib.addBinding(["ctrl+v", "command+v"], { command: this._pasteCommand, commandParameter: 'keyboard' });
            ib.addBinding(["ctrl+c", "command+c"], { command: this._copyCommand, commandParameter: 'keyboard' });
            ib.addBinding(["ctrl+x", "command+x"], { command: this._cutCommand, commandParameter: 'keyboard' });
            ib.addBinding(["ctrl+d", "command+d"], { command: this._duplicateCommand, commandParameter: 'keyboard'  });
            ib.addBinding(["ctrl+shift+[", "command+shift+["], { command: this._moveBottomCommand, commandParameter: 'keyboard' });
            ib.addBinding(["ctrl+shift+]", "command+shift+]"], { command: this._moveTopCommand, commandParameter: 'keyboard' });
            ib.addBinding(["ctrl+[", "command+["], { command: this._moveBackCommand, commandParameter: 'keyboard' }); // '<'
            ib.addBinding(["ctrl+]", "command+]"], { command: this._moveForwardCommand, commandParameter: 'keyboard' }); // '>'
            ib.addBinding(["del", "backspace"], { command: this._deleteSelectedComponentCommand, commandParameter: 'keyboard' });
            ib.addBinding(["ctrl+z", "command+z"], { command: this._undoCommand, commandParameter: 'keyboard' });
            ib.addBinding(["ctrl+y", "command+y", "ctrl+shift+z", "command+shift+z"], { command: this._redoCommand, commandParameter: 'keyboard' });

            ib.addBinding(["ctrl+m", "command+m"], { command: this._traverseComponentsCommand });
            ib.addBinding(["ctrl+shift+m", "command+shift+m"], { command: this._traverseComponentsReverseCommand });
            ib.addBinding(["ctrl+shift+alt+v", "command+shift+alt+v"], {command: this._showEditorVersionCommand});
            ib.addBinding(["ctrl+shift+alt+e", "command+shift+alt+e"], {command: this._showRunningExperimentsCommand});
            ib.addBinding(["ctrl+shift+alt+d", "command+shift+alt+d"], {command: this._openExperimentsControlCommand}); //with no need for the mode=debug or experiment=dev
            ib.addBinding(["i l o v e w i x"], {command: this._showFlyingMussa});
            ib.addBinding(["i l o v e p i g s"], {command: this._initiateKittiesAndPigs})
        },

        enableEditCommands: function (isEnabled, isMobileEditorMode) {
            isEnabled = !!isEnabled; // convert to boolean
            var commands = [
                this._deleteSelectedComponentCommand,
                this._moveTopCommand,
                this._moveBottomCommand,
                this._moveForwardCommand,
                this._moveBackCommand,

                this._traverseComponentsCommand,
                this._traverseComponentsReverseCommand
            ];
            var i;
            for (i = commands.length - 1; i >= 0; --i) {
                commands[i].setState(isEnabled);
            }
        },

        _enableEditCommandsOnEditorModeSwitch: function(params) {
            this.enableEditCommands(params.isEnabled, params.isMobileEditorMode);
        },

        //############################################################################################################
        //# E D I T   C O M M A N D S
        //############################################################################################################

        _onCopy: function (param, cmd) {
            if(this.resources.W.Config.env.isViewingSecondaryDevice()){
                this._clipboardActionsRestrictedNotification();
                return;
            }
            var editedComp = W.Editor.getEditedComponent();
            if (!(editedComp && editedComp.isDeleteableRecurse())) {
                return;
            }
            W.ClipBoard.setClip(editedComp);
            LOG.reportEvent(wixEvents.COPY_COMMAND, {c1:param}); // param = source (keyboard, fpp, mainBar)
        },

        _onPaste: function (param, cmd) {
            if(this.resources.W.Config.env.isViewingSecondaryDevice()){
                this._clipboardActionsRestrictedNotification();
                return;
            }
            if (W.Editor.getEditingScope()) {
                W.ClipBoard.paste();
                LOG.reportEvent(wixEvents.PASTE_COMMAND, {c1:param}); // param = source (keyboard, fpp, mainBar)
            }
        },

        _onCut: function (param, cmd) {
            if(this.resources.W.Config.env.isViewingSecondaryDevice()){
                this._clipboardActionsRestrictedNotification();
                return;
            }
            var editedComp = W.Editor.getEditedComponent();
            if (!(editedComp && editedComp.isDeleteableRecurse())) {
                return;
            }

            this.injects().UndoRedoManager.startTransaction();
            W.ClipBoard.setClip(editedComp);
            W.Editor.doDeleteSelectedComponent();
        },

        _onDuplicate: function (param, cmd) {
            if(this.resources.W.Config.env.isViewingSecondaryDevice()){
                this._clipboardActionsRestrictedNotification();
                return;
            }
            var editedComp = W.Editor.getEditedComponent();
            if (!(editedComp && editedComp.isDeleteableRecurse())) {
                return;
            }
            W.ClipBoard.duplicateComp(editedComp, editedComp.getParentComponent().getViewNode());
        },

        // when in mobile editor mode delete is actually hide - so don't show prompt message (TPA+WIXAPPS)
        _shouldPromptForDelete: function () {
            return this.resources.W.Config.env.isViewingDesktopDevice();
        },
        //Experiment URM.New was promoted to feature on Mon Jul 30 15:17:44 IDT 2012
        _onUndo: function (source) {
            source = source || "source_not_specified";
            LOG.reportEvent(wixEvents.UNDO_REDO, {c1:'undo', c2:source});
            W.UndoRedoManager.undo();
        },
        //Experiment URM.New was promoted to feature on Mon Jul 30 15:17:44 IDT 2012
        _onRedo: function (source) {
            source = source || "source_not_specified";
            LOG.reportEvent(wixEvents.UNDO_REDO, {c1:'redo', c2:source});
            W.UndoRedoManager.redo();
        },

        _onMoveTop: function (source) {
            source = source || "source_not_specified";
            LOG.reportEvent(wixEvents.MOVE_FORWARD_BACK_TOP_BOTTOM, {c1:'top', c2:source});
            this._onZIndexChange(W.Editor.Z_INDEX_CHANGE_TYPES.TOP);
        },

        _onMoveBottom: function (source) {
            source = source || "source_not_specified";
            LOG.reportEvent(wixEvents.MOVE_FORWARD_BACK_TOP_BOTTOM, {c1:'bottom', c2:source});
            this._onZIndexChange(W.Editor.Z_INDEX_CHANGE_TYPES.BOTTOM);
        },

        _onMoveForward: function (source) {
            source = source || "source_not_specified";
            LOG.reportEvent(wixEvents.MOVE_FORWARD_BACK_TOP_BOTTOM, {c1:'forward', c2:source});
            this._onZIndexChange(W.Editor.Z_INDEX_CHANGE_TYPES.FORWARD);
        },

        _onMoveBack: function (source) {
            source = source || "source_not_specified";
            LOG.reportEvent(wixEvents.MOVE_FORWARD_BACK_TOP_BOTTOM, {c1:'back', c2:source});
            this._onZIndexChange(W.Editor.Z_INDEX_CHANGE_TYPES.BACK);
        },


        //Experiment TraverseComps.New was promoted to feature on Wed Oct 10 16:26:49 IST 2012

        _onTraverseComponents: function () {
            this._traverseComponents(true);
        },


        //Experiment TraverseComps.New was promoted to feature on Wed Oct 10 16:26:49 IST 2012

        _onTraverseComponentsReverse: function () {
            this._traverseComponents(false);
        },

        _onZIndexChange: function (changeType) {
            var node = W.Editor.getEditedComponent();
            if (!node) {
                return;
            }
            var parentLogic = node.getParentComponent();
            this.injects().UndoRedoManager.startTransaction();

            parentLogic.moveChild(node, changeType);
            this.injects().UndoRedoManager.endTransaction();

        },


        //Experiment TraverseComps.New was promoted to feature on Wed Oct 10 16:26:49 IST 2012
        _traverseComponents: function (traverseForward) {
            var curPageNode = this.injects().Preview.getPreviewManagers().Viewer.getCurrentPageNode();
            var curPageSerializedData = this.injects().CompSerializer.serializeComponent(curPageNode, false);
            var pageSubComponentIds = this._getSubComponentIds(curPageSerializedData, []);

            var siteStructureNode = this.injects().Preview.getPreviewManagers().Viewer.getSiteNode();
            var siteStructureSerializedData = this.injects().CompSerializer.serializeComponent(siteStructureNode, false);
            var masterComponentIds = this._getSubComponentIds(siteStructureSerializedData, [], ["wysiwyg.viewer.components.PagesContainer"]);

            var allVisibleComponentsIds;
            if(this.resources.W.Config.env.isViewingSecondaryDevice()){
                allVisibleComponentsIds = [].concat(pageSubComponentIds).concat(masterComponentIds);
            } else
            {
                allVisibleComponentsIds = ["PAGES_CONTAINER"].concat(pageSubComponentIds).concat(masterComponentIds);
            }

            var curEditedComponent = this.injects().Editor.getEditedComponent();
            var prefix = curEditedComponent._idPrefix || "";
            var traverseToCompId;
            if (!curEditedComponent) {
                traverseToCompId = allVisibleComponentsIds[0];
            }
            else {
                var curEditedComponentIndex = allVisibleComponentsIds.indexOf(prefix + curEditedComponent.getID());

                if (traverseForward) {
                    traverseToCompId = curEditedComponentIndex != allVisibleComponentsIds.length - 1 ? allVisibleComponentsIds[curEditedComponentIndex + 1] : allVisibleComponentsIds[0];
                }
                else {
                    traverseToCompId = curEditedComponentIndex !== 0 ? allVisibleComponentsIds[curEditedComponentIndex - 1] : allVisibleComponentsIds[allVisibleComponentsIds.length - 1];
                }

            }
            var compElem = siteStructureNode.getElementById(traverseToCompId) || siteStructureNode.getElementById(prefix + traverseToCompId);
            if(compElem){
                this.injects().Editor.setSelectedComp(compElem.getLogic());
                if(this.resources.W.Config.env.isViewingDesktopDevice()){
                    this.injects().Editor.openComponentPropertyPanels(false, false, true);
                }
            }
        },


        //Experiment TraverseComps.New was promoted to feature on Wed Oct 10 16:26:49 IST 2012

        _getSubComponentIds: function (componentSerializedData, subComponentIds, componentTypesToIgnore) {
            subComponentIds.push(componentSerializedData.id);
            var subComponents = componentSerializedData.components;
            if (!subComponents) {
                return;
            }
            var i;
            for (i = 0; i < subComponents.length; i++) {

                if (componentTypesToIgnore && componentTypesToIgnore.indexOf(subComponents[i].componentType) > -1) {
                    continue;
                }
                this._getSubComponentIds(subComponents[i], subComponentIds);
            }

            //return subComponents without the component itself:
            return subComponentIds.slice(1, subComponentIds.length);
        },

        _onSetUndoButton: function (param, cmd) {
            this._undoCommand.setState(param);
        },

        _onSetRedoButton: function (param, cmd) {
            this._redoCommand.setState(param);
        },

        _showEditorVersion: function () {
            var versions = LOG.getAllArtifactsVersions(null, true);
            var text = '';
            for (var key in versions) {
                text += key + ': ' + versions[key] + '<br/>';
            }
            W.EditorDialogs.openPromptDialog(
                'Editor Versions',
                text,
                '',
                W.EditorDialogs.DialogButtonSet.OK,
                function () {
                }
            );
        },
        _showRunningExperiments: function () {
            var experiments = W.Experiments.getRunningExperimentIds().sort();
            var col1 = experiments.splice(0,Math.round(experiments.length/2)).join('<br/>'); //Math.round so that if ther's an odd number of experiments, the first column has 1 more than the second one
            var col2 = experiments.join('<br/>');
            var html = '<table><tr><td style="padding-right: 10px;">' + col1 + '</td><td>' + col2 + '</td></tr></table>';
            W.EditorDialogs.openPromptDialog(
                'Running Experiments',
                html,
                '',
                W.EditorDialogs.DialogButtonSet.OK,
                function () {
                }
            );
        },
        _openExperimentsControlCommand: function() {
            this.resources.W.EditorDialogs.openExperimentsDialog();
        },

        _confirmAndHideSelectedComponent: function() {
            var selectedCompsIds = null ;
            var editedComponent = W.Editor.getEditedComponent() ;
            if(editedComponent.getSelectedComps) {
                var selectedComps = editedComponent.getSelectedComps() ;
                if(selectedComps) {
                    selectedCompsIds = selectedComps.map(function(comp){
                        return comp.getID() ;
                    }) ;
                }
            } else {
                selectedCompsIds = [editedComponent.getComponentId()] ;
            }
            selectedCompsIds = selectedCompsIds.toString() ;
            this._confirmAndDeleteSelectedComponentHelper(wixEvents.MOBILE_EDITOR_HIDE_COMPONENT, {c1: selectedCompsIds}) ;
        },

        _clipboardActionsRestrictedNotification: function(){
            // TODO: This image is a placeholder! Please replace
            var icon = {x: 0, y: 0, width: 59, height: 58, url: 'icons/no_copy_msg.png'};

            // TODO: No help screen id available
            var helpId = null;

            W.EditorDialogs.openNotificationDialog("RestrictClipBoardActions", "COPY_PASTE_MOBILE_RESTRICT_NOTIF_TITLE", "COPY_PASTE_MOBILE_RESTRICT_NOTIF_BODY", 440, 80, icon, true, helpId, 1);
        },

        _confirmAndDeleteSelectedComponent: function(){
            var editedComponent = W.Editor.getEditedComponent();
            var isInDesktopEditor = this.injects().Config.env.isViewingDesktopDevice();
            var event;
            var params = {c1: editedComponent.className};

            if (W.TPA.isTPASectionComponent(editedComponent) && isInDesktopEditor) {
                this._showSectionDeleteInfoPopup();
                return;
            }

            if (!!editedComponent.getComponentId) {
                params.i1 = editedComponent.getComponentId();
            }
            if(this.resources.W.Config.env.isViewingSecondaryDevice()){
                event = wixEvents.MOBILE_EDITOR_HIDE_COMPONENT;
            } else {
                event = wixEvents.COMPONENT_REMOVED;

                if(editedComponent.className === 'wixapps.integration.components.AppPart') {
                    var partDef = editedComponent.getPartDef();
                    params.c2 = partDef && partDef.id;
                }
            }
            this._confirmAndDeleteSelectedComponentHelper(event, params) ;
        },
        _confirmAndDeleteSelectedComponentHelper: function (event, eventParams) {
            var editedComponent = W.Editor.getEditedComponent();
            if (!W.Editor.canDeleteSelectedComponent()) {
                return;
            }

            // when in mobile editor mode, delete is actually hide - so don't show prompt message (TPA+WIXAPPS)
            var popupTitle = W.Resources.get('EDITOR_LANGUAGE', 'DELETE_COMPONENT_TITLE'),
                tpaComponents = this._getTpaComponents(editedComponent),
                that = this;

            var popupContent = this._getDeletePopupContent(editedComponent, tpaComponents);

            if (popupContent) {
                this._showDeletePopup(popupTitle, popupContent, function onDelete() {
                    that._reportDeleteBIEvent(tpaComponents, event, editedComponent);
                });
            } else {
                W.Editor.doDeleteSelectedComponent();
                this._reportDeleteBIEvent(tpaComponents, event, editedComponent);
            }
        },
        /**
         * Filters TPA components from an array (or single) of components.
         * @param editedComponent Single component of array of components
         * @returns Array of TPA components.
         * @private
         */
        _getTpaComponents: function(editedComponent) {
            if (editedComponent.isTpa) {
                return [editedComponent];
            }

            if (editedComponent.IS_CONTAINER) {
                var tpaCompsInContainer = this._getTpaCompsFromContainer(editedComponent);
                return tpaCompsInContainer;
            }

            if (editedComponent.isMultiSelect) {
                var tpaComponents = [];
                var compArr = editedComponent.getSelectedComps();
                var that = this;

                if (compArr && _.isArray(compArr)) {
                    compArr.forEach(function (comp) {
                        if (comp.isTpa) {
                            tpaComponents.push(comp);
                        } else if (comp.IS_CONTAINER) {
                            tpaCompsInContainer = that._getTpaCompsFromContainer(comp);
                            tpaComponents = tpaComponents.concat(tpaCompsInContainer);
                        }
                    });
                }

                return tpaComponents;
            }

            return [];
        },
        /**
         * Gets as input a container component. Returns all TPA components from inside of it.
         * @param container
         * @private
         */
        _getTpaCompsFromContainer: function (container) {
            var childComponents = [];
            var tpaComponents = [];
            container.getDescendantComponentsRecurse(container, childComponents);

            // Filter all TPA components and return their logic
            childComponents.forEach(function (comp) {
                var compLogic = comp.getLogic();
                if (compLogic.isTpa) {
                    tpaComponents.push(compLogic);
                }
            });

            return tpaComponents;
        },

        /**
         * Calculates the selection to be deleted, and returns the right content for the popup.
         * If no popup is needed, content is returned undefined.
         * @param editedComponent The selection to delete
         * @param tpaComponents TPA widgets to BI report
         * @returns String Delete popup content
         * @private
         */
        _getDeletePopupContent: function (editedComponent, tpaComponents) {
            // If in mobile, it's not delete but hide - so no popup is needed
            if (!this._shouldPromptForDelete()) {
                return;
            }

            var tpaPremiumComponents = tpaComponents.filter(function(tpaComp) {
                return tpaComp.isPremiumApp();
            });

            var numOfTpaPremiumComponents = tpaPremiumComponents.length;
            if (numOfTpaPremiumComponents > 0) {
                return W.Resources.get('EDITOR_LANGUAGE',
                    editedComponent.isMultiSelect || editedComponent.IS_CONTAINER ?
                        'DELETE_TPA_COMPONENT_IN_CONTAINER_TEXT' : 'DELETE_TPA_COMPONENT_TEXT');
            }

            // Let's check if the selection includes wix app
            var wixAppsInSelection = [];
            if (editedComponent.isMultiSelect) {
                wixAppsInSelection = editedComponent.getSelectedComps().filter(function (comp) {
                    return comp.isWixApps2;
                });
            }

            if (editedComponent.isWixApps2 || wixAppsInSelection.length > 0) {
                /**
                 * @type {WixAppsEditorManager2}
                 */
                var appsEditor2 = W.AppsEditor2;
                return appsEditor2.localize('DELETE_APPLICATION_CONTENT');
            }
        },

        /**
         * Reports on delete BI event
         * @param deletedTPAComponents Reported TPA components
         * @param event
         * @param editedComponent
         * @private
         */
        _reportDeleteBIEvent: function (deletedTPAComponents, event, editedComponent) {
            var compsToReportArr = [];
            if (editedComponent.isMultiSelect) {
                compsToReportArr = editedComponent.getSelectedComps();
            } else {
                compsToReportArr.push(editedComponent);
            }

            var eventsParams = compsToReportArr.map(function(comp) {
                var params = {c1: comp.className};

                if (!!comp.getComponentId) {
                    params.i1 = comp.getComponentId();
                }
                if(comp.className === 'wixapps.integration.components.AppPart') {
                    var partDef = comp.getPartDef();
                    params.c2 = partDef && partDef.id;
                }

                return params;
            });

            eventsParams.forEach(function(params) {
                LOG.reportEvent(event, params);
            });

            // report tpa removal
            deletedTPAComponents.forEach(function (tpaComponent) {
                var appData = tpaComponent.getAppData();

                if (!appData) {
                    return;
                }

                var compId = tpaComponent.getComponentId();
                var tpaEventParams = {
                    c1: appData.appDefinitionName,
                    g1: appData.appDefinitionId
                };

                if (compId) {
                    tpaEventParams.c2 = compId;
                }

                if (appData.demoMode) {
                    tpaEventParams.i2 = 'template-app';
                }

                LOG.reportEvent(wixEvents.APPS_FLOW_APP_REMOVED_FROM_STAGE, tpaEventParams);
            });
        },

        _showFlyingMussa: function(){
            var horizontalSpeed = 10;
            var rightPosition = -200;
            var mussaHeight = 72;
            var windowSize = W.Utils.getWindowSize();
            var verticalTakeOffPosition = mussaHeight + Math.random() * (windowSize.height-(mussaHeight*2));
            var verticalLandingPosition = mussaHeight + Math.random() * (windowSize.height-(mussaHeight*2));
            var verticalInterval = Math.abs(verticalTakeOffPosition - verticalLandingPosition);
            var verticalSpeed = verticalInterval * (horizontalSpeed / windowSize.width);
            if (verticalLandingPosition < verticalTakeOffPosition){
                verticalSpeed = verticalSpeed * (-1);
            }
            var interval;
            var topPosition = verticalTakeOffPosition;
            var oImg = document.createElement("div");
            var mussaPositionIndex = 0;
            var mussaSrc = 'url(' + W.Theme.getProperty("WEB_THEME_DIRECTORY")+ 'easterEggs/superman_sprite.png)';
            var spriteSize = {
                height: 3608,
                width: 143
            };
            oImg.setStyles({
                'position': 'fixed',
                'top' : verticalTakeOffPosition + 'px',
                'right' : rightPosition + 'px',
                'width': '143px',
                'height': mussaHeight + 'px',
                'backgroundImage' : mussaSrc,
                'backgroundPosition': '0 ' +  mussaPositionIndex + 'px;'
            });
            document.body.appendChild(oImg);

            interval = setInterval(function(){
                rightPosition += horizontalSpeed;
                topPosition += verticalSpeed;
                oImg.setStyles({
                    'right' : rightPosition + 'px',
                    'top' : topPosition + 'px',
                    'backgroundPosition' : '0 -' +  mussaPositionIndex + 'px'
                });
                mussaPositionIndex = (mussaPositionIndex + 82) % spriteSize.height;
                if (rightPosition > windowSize.width + spriteSize.width){
                    clearInterval(interval);
                    clearTimeout(timeoutTicket);
                    oImg.parentElement.removeChild(oImg);
                }
            }, 33);
            var animationTimeLimit = 33 *(10 + (windowSize.width + spriteSize.width) / horizontalSpeed);
            var timeoutTicket = setTimeout(function(){
                clearInterval(interval);
                oImg.parentElement.removeChild(oImg);
            },animationTimeLimit);
        },

        _initiateKittiesAndPigs: function(){
            this._loadEasterEggStylesheet();
            this._playNyanAudio();
            this._showFlyingNyanCats(20);
            this._showPigsWithBeard(15);
        },

        _loadEasterEggStylesheet: function() {
            var linkElem = document.createElement('link');
            linkElem.setAttribute('rel', 'stylesheet');
            linkElem.setAttribute('href', W.Theme.getProperty("WEB_THEME_DIRECTORY") + 'easterEggs/flyingKittensAndPigsWithBeards.css');
            document.head.appendChild(linkElem);
        },

        _playNyanAudio: function(){
            var audioElement = document.createElement('audio');
            audioElement.setAttribute('src', W.Theme.getProperty("WEB_THEME_DIRECTORY")+ 'easterEggs/nyan_sound.mp3');
            audioElement.setAttribute('autoplay', 'true');
            document.body.appendChild(audioElement);
            var volumeFadeOutInterval;
            setTimeout(function(){
                volumeFadeOutInterval = setInterval(function(){
                    audioElement.volume -= 0.02;
                }, 100);
            }, 20000);
            setTimeout(function(){
                clearInterval(volumeFadeOutInterval);
                audioElement.parentNode.removeChild(audioElement);
            }, 25000);
        },

        _showPigsWithBeard: function(count) {
            var pigHeight = 565;
            var pigWidth = 776;
            var windowSize = W.Utils.getWindowSize();
            var pImg = document.createElement("div");
            var pImgSrc = 'url(' + W.Theme.getProperty("WEB_THEME_DIRECTORY")+ 'easterEggs/bearded-pig-776x565.png)';
            var yPos = Math.floor(Math.random() * (windowSize.height - pigHeight));
            var xPos = Math.floor(Math.random() * (windowSize.width - pigWidth));

            pImg.setStyles({
                'position': 'fixed',
                'top' : yPos + 'px',
                'left' : xPos + 'px',
                'width': pigWidth +'px',
                'height': pigHeight + 'px',
                'backgroundImage' : pImgSrc,
                'backgroundPosition': '0px',
                'background-size': 'cover'
            });
            document.body.appendChild(pImg);
            setTimeout(function(){
                pImg.parentElement.removeChild(pImg);
            }, 1000);
            if (count) {
                setTimeout(this._showPigsWithBeard.bind(this, count-1), 1000)
            }
        },

        _showFlyingNyanCats: function(count) {
            var kittyHeight = 361;
            var kittyWidth = 430;
            var windowSize = W.Utils.getWindowSize();
            var verticalTakeOffPosition = Math.random() * (windowSize.height - kittyHeight);
            var kImg = document.createElement("div");
            var kImgSrc = 'url(' + W.Theme.getProperty("WEB_THEME_DIRECTORY")+ 'easterEggs/flying-Jo-361x430.png)';
            var xPos = (-1)*(kittyWidth);

            kImg.setAttribute('class', 'kittyStyleClass');
            kImg.setStyles({
                'position': 'fixed',
                'top' : verticalTakeOffPosition + 'px',
                'left' : xPos + 'px',
                'width': kittyWidth +'px',
                'height': kittyHeight + 'px',
                'backgroundImage' : kImgSrc
            });

            setTimeout(function(){
                kImg.parentElement.removeChild(kImg);
            }, 20000);

            document.body.appendChild(kImg);
            if (count > 0) {
                setTimeout(this._showFlyingNyanCats.bind(this, count-1), 500);
            }

        },

        _lock: function (params, cmd) {
            if(!params){
                return;
            }
            var compEditBox = W.Editor.getComponentEditBox();
            compEditBox.lockComponent(params['source'], params['components']);
        },

        _unlock: function (params, cmd) {
            if(!params){
                return;
            }
            var compEditBox = W.Editor.getComponentEditBox();
            compEditBox.unlockComponent(params['source'], params['components']);
        },

        _showSectionDeleteInfoPopup: function () {
            var editedComponent = W.Editor.getEditedComponent();
            var appName = editedComponent.getAppData().appDefinitionName;
            var popupTitle = W.Resources.get('EDITOR_LANGUAGE', 'DELETE_SECTION_POPUP_TITLE');
            var popupContent = W.Resources.get('EDITOR_LANGUAGE', 'DELETE_SECTION_POPUP_CONTENT').replace('%s', appName);

            this._showDeletePopup(popupTitle, popupContent, null, W.EditorDialogs.DialogButtonSet.OK);
        },

        _showDeletePopup: function (title, content, onDeleted, buttonSet) {
            W.EditorDialogs.openPromptDialog(
                    title || "No title defined",
                    content || "No content defined",
                "",
                    buttonSet || W.EditorDialogs.DialogButtonSet.DELETE_CANCEL,
                function (result) {
                    if (result.result == 'DELETE') {
                        W.Editor.doDeleteSelectedComponent();
                        if (onDeleted) {
                            onDeleted();
                        }
                    }
                }
            );
        }
    });
});

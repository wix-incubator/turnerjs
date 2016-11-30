//W.Experiments.registerExperimentClass(
//    'WalkMe', 'New',
//    {
//        name: 'experiments.wysiwyg.editor.commandregistrars.EditorCommandRegistrarWalkMeNew',
//        Class: {
//
//            Extends: "wysiwyg.editor.commandregistrars.EditorCommandRegistrar",
//            Binds: [],
//
//            registerCommands : function() {
//                var cmdmgr = W.Commands;
//
//                // General editor commands:
//                //-------------------------
//                this._gridCommand = cmdmgr.registerCommandAndListener("EditCommands.ToggleGridLines", this, this._onGrid);
//                this._setEditModeCommand = cmdmgr.registerCommandAndListener("WEditorCommands.WSetEditMode", this, this._onSetEditMode);
//                this._walkMeThroughCommand = cmdmgr.registerCommandAndListener("WEditorCommands.ShowWalkThru", this, this._onWalkThru);
//            },
//
//            /**
//             * Show the WalkMe menu
//             */
//            _onWalkThru:function() {
//                try {
//                    wmjQuery("#walkme-menu-closed").click();
//                    LOG.reportEvent(wixEvents.WALK_ME_BUTTON_CLICKED);
//
//                } catch(e) {
//                    LOG.reportError(wixErrors.WALK_ME_FAILED_TO_LOAD);
//                }
//            }
//        }
//
//    });
//

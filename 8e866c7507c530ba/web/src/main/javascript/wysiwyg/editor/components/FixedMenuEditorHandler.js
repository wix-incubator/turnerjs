define.Class('wysiwyg.editor.components.FixedMenuEditorHandler', function(classDefinition) {
    /**type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.resources(['W.Editor', 'W.Preview', 'W.EditorDialogs', 'W.UndoRedoManager']);

    def.binds(['_onMenuOutOfViewDialogClosed', '_onMenuRepositionedDialogClosed', '_onFixedPositionChanged', '_setCheckBoxAccordingToPosition']);

    def.statics({
        DIALOG_ARGS: {
            icon: {x: 0, y: 0, width: 85, height: 95,  url:"mobile/menu_out_of_view.png"},
            MENU_OUT_OF_VIEW: {
                title: 'MOBILE_FIXED_TINY_MENU_OUT_OF_VIEW_TITLE',
                description: 'MOBILE_FIXED_TINY_MENU_OUT_OF_VIEW_DESCRIPTION',
                buttonSet: [
                    {
                        label: 'GOT_IT',
                        color: Constants.DialogWindow.BUTTON_COLOR.BLUE,
                        align: Constants.DialogWindow.BUTTON_ALIGN.RIGHT
                    }
                ]
            },
            MENU_REPOSITIONED: {
                title: 'MOBILE_FIXED_TINY_MENU_REPOSITIONED_TITLE',
                description: 'MOBILE_FIXED_TINY_MENU_REPOSITIONED_DESCRIPTION',
                buttonSet: [
                    {
                        label: 'GOT_IT',
                        color: Constants.DialogWindow.BUTTON_COLOR.BLUE,
                        align: Constants.DialogWindow.BUTTON_ALIGN.RIGHT
                    },
                    {
                        label: 'UNCHECK',
                        color: Constants.DialogWindow.BUTTON_COLOR.GRAY,
                        align: Constants.DialogWindow.BUTTON_ALIGN.LEFT
                    }
                ]
            }
        }
    });
    
    def.methods({
        initialize: function(menuInstance){
            this._menu = menuInstance;
            this._originalMenuCoordinates = null;

            this._menu.on('menuOutOfView', this, this._onMenuOutOfView);
            this._applyMenuEditorPartUI(this._menu.isFixedPositioned());
        },

        _onMenuOutOfView: function() {
            var dialogArgs = this.DIALOG_ARGS.MENU_OUT_OF_VIEW;
            var icon = this.DIALOG_ARGS.icon;

            this._menu.off('menuOutOfView', this, this._onMenuOutOfView);
            this.resources.W.EditorDialogs.openPromptDialogWithIcon(dialogArgs.description, dialogArgs.buttonSet, icon, this._onMenuOutOfViewDialogClosed, dialogArgs.title, dialogArgs.buttonSet[0].label, null, 120, true, 'menuOutOfView', 'OUT_OF_VIEW_DIALOG_FixedPositionMenu');
        },

        _fixMenuPosition: function(originalPosition) {
            var dialogArgs = this.DIALOG_ARGS.MENU_REPOSITIONED;
            var icon = this.DIALOG_ARGS.icon;
            this._originalMenuCoordinates = originalPosition;

            this._moveMenuToDefaultLocation();
            this.resources.W.EditorDialogs.openPromptDialogWithIcon(dialogArgs.description, dialogArgs.buttonSet, icon, this._onMenuRepositionedDialogClosed, dialogArgs.title, dialogArgs.buttonSet[0].label, null, 130, false);
        },

        _moveMenuToDefaultLocation: function() {
            this.resources.W.Editor.doDeleteSelectedComponent(true, true);
            W.Commands.executeCommand('WEditorCommands.ReaddDeletedMobileComponent', {id: this._menu.getComponentId(), pageId: 'masterPage'});
        },

        _applyMenuEditorPartUI: function(isFixed) {
            var editLayer = this.resources.W.Editor.getEditorUI().getSkinPart('editLayer');
            if (isFixed) {
                editLayer.registerComponentToAreaHighLight(this._menu);
            }
            else {
                editLayer.unRegisterComponentToAreaHighLight(this._menu);
            }
        },

        _onFixedPositionChanged: function(evt, dontReportBi) {
            var value = evt.value;
            var position = value ? 'fixed' : 'absolute';

            this._menu.setPos(position);
            this._applyMenuEditorPartUI(value);
            this._fixMenuPositionIfNeeded(value);
            if (!dontReportBi) {
                LOG.reportEvent(wixEvents.TINY_MENU_FIXED_POSITION, {i1: Number(value)});
            }
        },

        _setCheckBoxAccordingToPosition: function(checkBox) {
            this._checkBox = checkBox;
            this._checkBox.setChecked(this._menu.isFixedPositioned());
        },

        _fixMenuPositionIfNeeded: function(isMenuFixed) {
            var shouldRepositionMenu = this._menu.getGlobalPosition().y > this._menu.FIXED_POSITION_MAX_Y;
            var parent = this._menu.getParentSiteSegmentContainer();
            var originalPosition = {
                y: this._menu.getY(),
                x: this._menu.getX(),
                parentId: parent && parent.getComponentId()
            };

            if (isMenuFixed && shouldRepositionMenu) {
                this._fixMenuPosition(originalPosition);
            }
        },

        _onMenuOutOfViewDialogClosed: function() {
            this._menu.on('menuOutOfView', this, this._onMenuOutOfView);
        },

        _onMenuRepositionedDialogClosed: function(didUserApprove) {
            this._updateMenuInstance();
            if (!didUserApprove) {
                this._moveMenuToOriginalScope();
                this._repositionMenu();
                LOG.reportEvent(wixEvents.TINY_MENU_UNCHECK_FIXED);
            }
            this._onFixedPositionChanged({value: didUserApprove}, true);
        },

        _updateMenuInstance: function() {
            this._menu = this.resources.W.Editor.getEditedComponent();
        },

        _moveMenuToOriginalScope: function() {
            var siteSegmentContainerNode =  this._getSiteSegmentContainerNode();
            this.resources.W.Editor.getComponentEditBox().addEditedComponentToContainer(siteSegmentContainerNode);
        },

        _getSiteSegmentContainerNode: function() {
            //might be redundant
            if (this._originalMenuCoordinates.parentId) {
                return this.resources.W.Preview.getCompByID(this._originalMenuCoordinates.parentId);
            }
            return this.resources.W.Editor.getScopeNode(this.resources.W.Editor.EDIT_MODE.MASTER_PAGE);
        },

        _repositionMenu: function() {
            this._menu.setX(this._originalMenuCoordinates.x);
            this._menu.setY(this._originalMenuCoordinates.y);
            this.resources.W.Editor.getComponentEditBox().fitToComp();
        }
    });
});

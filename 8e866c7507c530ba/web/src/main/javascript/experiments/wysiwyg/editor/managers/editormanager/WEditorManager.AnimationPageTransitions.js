define.experiment.Class('wysiwyg.editor.managers.editormanager.WEditorManager.AnimationPageTransitions', function (classDefinition, experimentStrategy) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    var strategy = experimentStrategy;

    def.methods({
        /**
         * @override
         */
        setEditMode:function (mode) {
            if (!this._isValidEditorMode(mode)) {
                return;
            }

            var oldEditMode = this._editMode;
            this._editMode = mode;

            switch (mode) {
                case Constants.EditorStates.EDIT_MODE.CURRENT_PAGE:
                    var viewer = this.resources.W.Preview.getPreviewManagers().Viewer;
                    this.setEditingScope(viewer.getCurrentPageId());
                    this.setKeysEnabled(true);
                    break;
                case Constants.EditorStates.EDIT_MODE.MASTER_PAGE:
                    this.setEditingScope("SITE_STRUCTURE");
                    this.setKeysEnabled(true);
                    break;
                case Constants.EditorStates.EDIT_MODE.PREVIEW:
                    this.clearSelectedComponent();
                    this.setKeysEnabled(false);
                    break;
            }

            this._fireEditorModeChanged(mode, oldEditMode);
        },

        _onPageTransitionEnded: function() {
            this._createEditorUnlockTimer();
            this._editorUI.setState('normal', 'cursor');
        }
    });
});


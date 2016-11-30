define.experiment.Class('wysiwyg.editor.managers.editormanager.WEditorManager.LandingPages', function (def, strategy) {

    def.methods({
        _lockEditorBeforeTransition: strategy.remove(),
        _unlockEditorAfterTransition: strategy.remove(),
        _registerCommands: strategy.after(function (){
            this.resources.W.Commands.registerCommandAndListener("WEditorCommands.LandingPageAdded", this, this._showLandingPagesDialogIfNeeded);
        }),
        _showLandingPagesDialogIfNeeded: function(){
            var icon = {x: 0, y: 0, width: 175, height: 153, url: 'icons/landing-animation.gif'};
            this.resources.W.EditorDialogs.openNotificationDialog("Landing_Pages", "LANDING_PAGES_NOTIFICATION_TITLE", "LANDING_PAGES_NOTIFICATION_TEXT", 566, 90, icon, true, '/node/23094', 1);
        },
        _lockEditor: function(time){
            window.setPreloaderState('invisibleLockEditor');
            this.setKeysEnabled(false);
            this._editorUnlockTimer = this._createEditorUnlockTimer(time || 1000);
        },
        _unlockEditor: function(){
            this.setKeysEnabled(true);
            window.setPreloaderState('ready');
        },
        _createEditorUnlockTimer: function(time){
            window.clearTimeout(this._editorUnlockTimer);
            return window.setTimeout(this._unlockEditor.bind(this), time || 200);
        },
        //Experiment HourGlass.New was promoted to feature on Wed Oct 24 12:08:57 IST 2012
        _onPageTransitionStarted: function() {
            this._lockEditor(5000);
            this._editorUI.setState('progress', 'cursor');
        },
        //Experiment HourGlass.New was promoted to feature on Wed Oct 24 12:08:57 IST 2012
        _onPageTransitionEnded: function() {
            window.scrollTo(0, 0); // fix scrolling issue of transition
            this._createEditorUnlockTimer();
            this._editorUI.setState('normal', 'cursor');
        }
    });
});


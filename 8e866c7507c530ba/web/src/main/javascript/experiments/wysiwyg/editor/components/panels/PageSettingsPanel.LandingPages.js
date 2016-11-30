/**
 * @Class wysiwyg.editor.components.panels.PageSettingsPanel
 * @extends wysiwyg.editor.components.panels.base.AutoPanel
 */
define.experiment.component('wysiwyg.editor.components.panels.PageSettingsPanel.LandingPages', function(def){


    function notifyLandingPageChecked(val){
        this.resources.W.Preview.getPreviewManagers().Commands.executeCommand('Viewer.ToggleLandingPageMode', {toLanding: val});
        this.resources.W.Commands.executeCommand('WEditorCommands.LandingPageChecked', {toLanding: val});
    }

    def.methods(/*** @lends wysiwyg.editor.components.panels.PageSettingsPanel.prototype */{
        /**
         *
         * @private
         */
        _showLayoutSettings: function(config){
            if(config.hideLayoutSettings){
                return;
            }
            this.addInputGroupField(function(panel){
                //note: 'this' here is the inputGroup!
                this.addLabel(this._translate('PAGE_SETTINGS_LAYOUT_TITLE', 'Page Layout'), null, 'bold', null, null, null, null, {padding: '0px 0px 0.4em'});
                panel._addLandingPageCheckbox(this);
            });
            this.addBreakLine('12px');
        },
        /**
         *
         * @param autoPanelComp
         * @private
         */
        _addLandingPageCheckbox: function(autoPanelComp){
            var panel = this;
            var landingPageCheckboxHook = _.debounce(function landingPageCheckboxHook(val){
                panel.resources.W.Editor.clearSelectedComponent();
                panel.resources.W.Editor._lockEditor(1100); //hack... :( - we don't want the user to click the checkbox before the toggle is done
                _.defer(function() {
                    notifyLandingPageChecked.call(panel, val);
                }); //first let this function return, so the current page can be considered a landing page for the gridlines to work. Ugly, unfortunately.

                var valForBI = val ? 1 : 0;
                LOG.reportEvent(wixEvents.LANDING_PAGE_TOGGLED_IN_PAGE_SETTINGS, {i1: valForBI, c1: panel._currentPageId});
                return val;
            }, 1100, true);
            autoPanelComp.addCheckBoxField(this._translate('PAGE_SETTINGS_LANDING_PAGE_CHECKBOX'), "Page_Settings_LandingPage_ttid")
                .bindHooks(landingPageCheckboxHook)
                .bindToField('isLandingPage');
        }
    });
});
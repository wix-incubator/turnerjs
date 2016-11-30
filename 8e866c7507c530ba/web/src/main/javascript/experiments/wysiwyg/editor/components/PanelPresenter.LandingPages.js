define.experiment.component("wysiwyg.editor.components.PanelPresenter.LandingPages", function(def) {

    def.methods({
        _showMobileMenuPropertyPanel: function() {
            if(W.Preview.getPreviewManagers().Viewer.isCurrentPageLandingPage()){
                var icon = {x: 0, y: 0, width: 175, height: 153, url: 'icons/landing-animation.gif'};
                W.EditorDialogs.openNotificationDialog("Landing_Pages", "LANDING_PAGES_CANT_EDIT_TINY_MENU_TITLE", "LANDING_PAGES_CANT_EDIT_TINY_MENU_IN_MOBILE", 566, 90, icon, true);
                return;
            }

            W.Editor.setSelectedComp(W.Preview.getCompLogicById('TINY_MENU'));
            if (W.Editor.getEditedComponent()) {
                W.Editor.openComponentPropertyPanels();
            }
        }
    });
});
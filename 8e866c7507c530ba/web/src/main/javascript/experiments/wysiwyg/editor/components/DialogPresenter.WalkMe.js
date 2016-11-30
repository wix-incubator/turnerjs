define.experiment.component('wysiwyg.editor.components.DialogPresenter.WalkMe', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;

    def.methods({
        _showFirstTimeInEditorHelp:function () {
            // show intro only in NEW SITE (rather than in EDIT SITE)
            var showIntro = !this.resources.W.CookiesManager.getCookie('showHtmlEditorIntro');
            var isNewSite = this.resources.W.Config.getDocumentType().toLowerCase() === 'template';

            // use url param noIntro to hide the video introduction
            var hideIntro = this.resources.W.Utils.getQueryParam('noIntro');

            if (showIntro && !hideIntro && isNewSite) {
                if (window.wixEditorLangauge == "en") {
                    this.resources.W.Editor.addEvent('WALK_ME_LOADED', function(walkMe){
                        walkMe.showFirstTimeWelcomeScreen();
                    });
                } else {
                    this.resources.W.Commands.executeCommand('WEditorCommands.ShowHelpDialog', 'FirstTimeInEditor');
                }
                this.resources.W.CookiesManager.setCookieParam('showHtmlEditorIntro', false);
            }
        }
    });
});
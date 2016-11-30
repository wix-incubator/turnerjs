define.component("wysiwyg.editor.components.DialogPresenter", function(componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition ;

    def.inherits('core.components.base.BaseComp') ;

    def.resources(["W.Editor", "W.Commands", "W.Config", "W.CookiesManager", "W.Utils"]) ;

    def.binds(["_showFirstTimeInEditorHelp"]);

    def.skinParts({
        dialogLayer : {type : 'htmlElement'}
    }) ;

    def.methods({
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args) ;
            this._editorManager = this.resources.W.Editor ;
            this._setDialogViewToManager = _.once(this._setDialogViewToManager.bind(this)) ;
            this.resources.W.Editor.addEvent(Constants.EditorEvents.SITE_LOADED, this._showFirstTimeInEditorHelp);
        },

        _onRender: function (renderEvent) {
            this.parent(renderEvent);

            this._setDialogViewToManager() ;
        },

        _setDialogViewToManager: function() {
            this._editorManager.setDialogLayer(this._skinParts.dialogLayer);
        },

        show: function() {
            this.$view.uncollapse() ;
        },

        hide: function() {
            this.$view.collapse() ;
        },

        _showFirstTimeInEditorHelp: function () {
            // show intro only in NEW SITE (rather than in EDIT SITE)
            var showIntro = !(this.resources.W.CookiesManager.getCookie('showHtmlEditorIntro'));
            var isNewSite = this.resources.W.Config.getDocumentType().toLowerCase() === "template";

            // use url param noIntro to hide the video introduction
            var hideIntro = this.resources.W.Utils.getQueryParam('noIntro') || W.Experiments.isExperimentOpen('CancelIntroVideo');

            if (showIntro && !hideIntro && isNewSite) {
                this.resources.W.Commands.executeCommand('WEditorCommands.ShowIntroDialog');
                this.resources.W.CookiesManager.setCookieParam('showHtmlEditorIntro', false);
            }
        }
    }) ;
}) ;

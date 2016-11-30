define.experiment.Class('wysiwyg.viewer.managers.PageManager.LandingPageSupport', function(classDefinition, strategy){
    //"use strict";
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.resources(strategy.merge(['W.Commands']));
    def.binds(strategy.merge(['_hideSiteNode']));

    def.methods({
        _createMasterPage: function(){
            var masterPageHandler = new this.imports.MasterPageHandler(this._dataResolver, this._viewerName);

            this._propagateEvents(masterPageHandler);

            var nodesPromise = masterPageHandler.loadMasterSignatureHtml();
            nodesPromise.then(this._hideSiteNode);
            this._masterPageHandler = masterPageHandler;

            return nodesPromise;
        },
        _hideSiteNode: function(nodes){
           nodes.rootCompNode.setStyle('opacity', 0);
        }
    });
});

//W.Experiments.registerExperimentTrait("RefactorLinkUtils", "New", {
//    name: "experiments.core.components.traits.LinkableComponentRefactorLinkUtils",
//
//    trait: {
//        Extends: "core.components.traits.LinkableComponent",
//        Binds: [],
//
//        initialize: function() {
//            var linkUtils = W.Utils.linkUtils;
//
//            var componentRender = this.render.bind(this);
//
//            this.render = function(){
//                componentRender();
//                var dataItem = this.getDataItem();
//
//                linkUtils.renderLinks.call(this, dataItem, this._skinParts["link"]);
//                if(W.Viewer.getEditorMode() == 'PREVIEW'){
//                    // if first render happens in preview mode, render links accordingly
//                    // this happens in galleries zoom mode, for instance
//                    linkUtils.linkableComponentEditModeChanged.call(this, 'PREVIEW', dataItem, this._skinParts["link"]);
//                }
//            }.bind(this);
//
//            this.injects().Commands.registerCommandListenerByName("WPreviewCommands.WEditModeChanged", this, linkUtils.linkableComponentEditModeChanged.bind(this));
//        }
//    }
//});

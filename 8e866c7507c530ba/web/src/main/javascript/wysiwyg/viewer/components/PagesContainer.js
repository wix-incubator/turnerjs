/**
 * @class wysiwyg.viewer.components.PagesContainer
 */
define.component('wysiwyg.viewer.components.PagesContainer', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.viewer.components.SiteSegmentContainer');

    def.utilize(['core.components.Page']);

    def.resources(['W.Viewer']);

    def.fields({
        EDITOR_META_DATA: {
            general: {
                settings: true,
                design: true,
                animation: false,
                background: true
            },
            mobile: {
                allInputsHidden: true
            }
        }
    });

    def.methods({

        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this.setMaxH(this.imports.Page.MAX_HEIGHT);
            this._resizableSides = [];
        },

        isAnchorable: function() {
            return {to:{allow:true,allowBottomBottom:false,lock:Constants.BaseComponent.AnchorLock.BY_THRESHOLD},from:{allow:true,lock:Constants.BaseComponent.AnchorLock.ALWAYS}};
        },

        isContainer: function() {
            return false;
        },

        layoutMinHeight: function() {
            var currentPage = this.resources.W.Viewer.getCurrentPageNode();
            if (currentPage && currentPage.$logic) {
                return currentPage.$logic.getHeight();
            } else {
                return 0;
            }
        }

    });
});
/**
 * @class wysiwyg.viewer.components.SiteSegmentContainer
 */
define.component('wysiwyg.viewer.components.SiteSegmentContainer', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.viewer.components.ScreenWidthContainer');

    def.skinParts({
        inlineContent: { type: 'htmlElement'},
        screenWidthBackground: {type: 'htmlElement'},
        bg: {type: 'htmlElement'},
        centeredContent: {type: 'htmlElement'}
    });

    def.statics({
        EDITOR_META_DATA: {
            general: {
                settings: true,
                design: true,
                animation: false
            },
            mobile: {
                allInputsHidden: true
            }
        }
    });

    def.methods({

        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._resizableSides = [Constants.BaseComponent.ResizeSides.TOP,Constants.BaseComponent.ResizeSides.BOTTOM];
        },

        useLayoutOnDrag: function() {
            return true;
        },

        useLayoutOnResize: function() {
            return true;
        },

        isDeleteable: function() {
            return false;
        },

        isAnchorable: function() {
            return {to:{allow:true,lock:Constants.BaseComponent.AnchorLock.BY_THRESHOLD},from:{allow:true,lock:Constants.BaseComponent.AnchorLock.ALWAYS}};
        },

        canMoveToOtherScope: function() {
            return false;
        },

        isMultiSelectable: function() {
            return false;
        },

        isDraggable: function() {
            return false;
        },

        isDuplicatable: function() {
            return false;
        },

//        /*override*/
        initComponentLayoutPosition: function(useAbsolute){
            var isMobile = W.Config.env.$viewingDevice === Constants.ViewerTypesParams.TYPES.MOBILE;
            if (useAbsolute && (this._view.hasAttribute("pos") === false || isMobile)) //This will be removed once we have some valid layout data
            {
                //Set position to absolute (unless position is already relative)
                if (this._view.getStyle("position") != "relative") {
                    this._view.setStyle("position", "absolute");
                }
            } else {
                var componentPosition = this._view.getAttribute("pos");
                if (componentPosition) {
                    this._view.setStyle("position", componentPosition);
                }
            }
        },

        /*override*/
        _applyLayoutPosition_: function(optionalOverride) {
            var isMobile = W.Config.env.$viewingDevice === Constants.ViewerTypesParams.TYPES.MOBILE;
            var position = isMobile ? 'absolute' : optionalOverride || this._$pos;

            if(position === "fixed"){
                this.$view.setStyle('position','fixed');
                this.$view.addClass('fixedPosition');
            } else if(position === "absolute"){ // && this.$view.hasClass('fixedPosition')
                this.$view.setStyle('position','absolute');
                this.$view.removeClass('fixedPosition');
            }
        }
    });
});
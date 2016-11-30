define.component('wysiwyg.previeweditorcommon.components.FeedbackQuickTour', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.common.components.QuickTour');

    def.resources(['W.Resources']);

    def.skinParts({
        overlayWrapper: {type:'htmlElement'},
        slidesWrapper: {type:'htmlElement'},
        overlay: {type:'htmlElement'},
        frame: {type:'htmlElement'},
        closeBtn: {type:'htmlElement'}
    });

    def.fields({
        QUICK_TOUR_ITEM_TYPE: "wysiwyg.previeweditorcommon.components.FeedbackQuickTourItem",
        QUICK_TOUR_ITEM_SKIN: "wysiwyg.previeweditorcommon.FeedbackQuickTourItemSkin"
    });

    def.methods({
        initialize: function(compId, viewNode, args) {
            if (args.feedbackPanel){
                this._feedbackPanel = args.feedbackPanel;
            }
            this.parent(compId, viewNode, args);
            this.SLIDES_DATA =  [
                {
                    id:"FEEDBACK_PANEL",
                    relPos:{x:-20, y:-450},
                    frameRelBounds:{x:-5,y:-5,w:10,h:10},
                    getSlideElement: function(ctx){
                        return {
                            element:ctx._feedbackPanel.getSkinPart('newComment').$view,
                            bounds:{x:0,y:0,w:0,h:0}
                        };
                    }
                }
            ];
        },

        _onRender: function (renderEvent) {
            var invalidation = renderEvent.data.invalidations;
            if (invalidation.isInvalidated([this.INVALIDATIONS.FIRST_RENDER])) {
                this._previousBodyOverflow = document.body.style.overflow;
                document.body.style.overflow = "hidden";

                this._skinParts.closeBtn.on("click", this, this._onCloseBtnClick);
                this._skinParts.closeBtn.innerHTML = this._translate('FEEDBACK_REVIEW_INTRO_BUTTON');
                this._setSlide(0);
            }
        },


        // =========================================================================
        // Handle close button

        _onCloseBtnClick: function () {
            this.trigger('quickTourClosed');
            this.dispose();
        },

        _translate: function (key, fallback) {
            return this.resources.W.Resources.get('FEEDBACK_REVIEW', key, fallback);
        }
    });
});


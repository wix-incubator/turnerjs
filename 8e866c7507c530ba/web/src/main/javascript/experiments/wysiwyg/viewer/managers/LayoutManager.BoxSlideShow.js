define.experiment.Class('wysiwyg.viewer.managers.LayoutManager.BoxSlideShow', function (classDefinition, experimentStrategy) {
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;
    def.fields({
        LOCK_THRESHOLD: 70,
        DEFAULT_MARGIN: 10,
        SUGGEST_ANCHOR_MARGIN: 20,
        FLAG_DIRTY_TOP: 1,
        FLAG_DIRTY_BOTTOM: 2,
        STOP_LAYOUT_ACTION: false
    });
    def.methods({
        _getAnchoredH: function (anchor) {
            var pusherBoundingH = anchor.fromComp.getBoundingHeight();
            var expectedH = anchor.fromComp.getBoundingY() + pusherBoundingH;
            if (anchor.locked) {
                expectedH += anchor.distance;
            } else if ((!this.resources.W.Viewer.isPageComponent(anchor.toComp.getOriginalClassName())) && (this.resources.W.Viewer.canHaveFatherHeight(anchor.toComp))) {
                expectedH += this.DEFAULT_MARGIN;
            }
            if (anchor.type == anchor.ANCHOR_BOTTOM_BOTTOM) {
                expectedH -= anchor.toComp.getBoundingY();
            } else if (anchor.type == anchor.ANCHOR_BOTTOM_PARENT && anchor.toComp.getInlineContentContainer) {
                if (this._isInlineContentNonZeroSize(anchor.toComp)) {
                    expectedH = expectedH + this._getContainerMarginHeight(anchor.toComp);
                }
            }
            return expectedH;
        },
        _setAnchorableDistance: function (anchor, wantedDistance) {
            /*Temp fix for box - until lifecycle refactor for NBC comps*/
            if ((anchor.toComp.$className === "wysiwyg.common.components.boxslideshow.viewer.BoxSlideShow" && anchor.fromComp.$className === "wysiwyg.common.components.boxslideshowslide.viewer.BoxSlideShowSlide" ) ||
                (anchor.toComp.$className === "wysiwyg.common.components.boxslideshowslide.viewer.BoxSlideShowSlide" && anchor.fromComp.$className === "wysiwyg.common.components.boxslideshowslide.viewer.BoxSlideShowSlide" )) {
                anchor.distance = 0;
                return;
            }
            var from = anchor.fromComp;
            var to = anchor.toComp;
            if (from.isAnchorable().from.distance !== undefined) {
                wantedDistance = from.isAnchorable().from.distance;
            } else if (to.isAnchorable().to.distance !== undefined) {
                wantedDistance = to.isAnchorable().to.distance;
            }
            anchor.distance = wantedDistance;
        },
        updateChildAnchors: function (comp) {
            if (comp && comp.getChildComponents) {
                var childList = comp.getChildComponents();
                if (!this._validateNodesRendered(childList)) {
                    return;
                }
                if (childList.length > 0) {
                    this._updateAnchors(childList[0].getLogic(), [], true);
                } else {
                    this._clearReverseAnchorsByScope(comp.getReverseAnchors(), true);
                }
                this.checkAndUpdateChildOfChildIfNeeded(comp);
            }
        },
        checkAndUpdateChildOfChildIfNeeded: function (comp) {
            if (comp.waitTillMeasureToPreformLayoutChanges()) {
                if (comp && comp.getChildComponents) {
                    var childList = comp.getChildComponents();
                    childList.map(function (item) {
                        this.updateChildAnchors(item.$logic);
                    }.bind(this));
                }
            }
        },
        updateLayoutAction: function (value) {
            this.STOP_LAYOUT_ACTION = value;
        },
        _updateLayout: function () {
            if (this.STOP_LAYOUT_ACTION) {
                return;
            }
            this._nextRenderId = null;
            var rootComp = this._getLayoutRootComp();
            this._measureInvalidatedComps(rootComp);
            this._enforceAnchorsRecurse(rootComp);
            this.fireEvent("UpdateLayoutDone");
        }


    });

});
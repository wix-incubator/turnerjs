define.experiment.Class('wysiwyg.viewer.managers.LayoutManager.NBC_FixMeasureBug', function(classDefinition, experimentStrategy){
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.methods({
        _isInlineContentNonZeroSize: function (container) {
            return container.NEW_BASE_COMP ? (container.getInlineContentContainer().$measure.height > 0) :(container.getInlineContentContainer().getSize().y > 0);
        },

        _getContainerMarginHeight: function(comp) {
            var compHeight = comp.NEW_BASE_COMP ? comp.getInlineContentContainer().$measure.height :comp.getInlineContentContainer().getSize().y;
            return comp.getPhysicalHeight() - compHeight;
        },
        _createToParentAnchor: function (childElement, parentElement) {
            var childElementY = childElement.getBoundingY();
            var childElementH = childElement.getBoundingHeight();
            var parentElementH = parentElement.NEW_BASE_COMP ? parentElement.getInlineContentContainer().$measure.height :parentElement.getInlineContentContainer().getSize().y;
            var anchor = new this._AnchorClass();
            anchor.type = anchor.ANCHOR_BOTTOM_PARENT;
            anchor.fromComp = childElement;
            anchor.toComp = parentElement;
            this._setAnchorableDistance(anchor, parentElementH - childElementY - childElementH);
            this._setAnchorableIsLocked(anchor);
            anchor.topToTop = childElementY;
            anchor.originalValue = parentElementH;
            return anchor;
        }
    });

});
define.experiment.Class('wysiwyg.viewer.managers.LayoutManager.FixBottomTopAnchor', function(classDefinition, experimentStrategy){
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.methods({
        _getMaxAnchoredY: function (pushedElement, minimum) {
            var _getAnchoredY = this._getAnchoredY;
            var maxExpectedY = minimum;
            pushedElement.getReverseAnchors().forEach(function (rAnchor) {
                if (rAnchor.type != rAnchor.ANCHOR_BOTTOM_TOP && rAnchor.type != rAnchor.ANCHOR_TOP_TOP) {
                    return;
                }
                if (rAnchor.type == rAnchor.ANCHOR_BOTTOM_TOP && !rAnchor.locked) {
                    maxExpectedY = Math.max(rAnchor.originalValue, maxExpectedY);
                }
                var rAnchorExpectedY = _getAnchoredY(rAnchor);
                maxExpectedY = Math.max(rAnchorExpectedY, maxExpectedY);
            });
            return maxExpectedY;
        }
    });

});
define.experiment.Class('wysiwyg.editor.managers.MouseComponentModifier.ProportionalScaling', function (classDefinition, experimentStrategy) {
    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.methods({

        startResize: strategy.after(function(resizeProperties, event) {

            // Handle keep proportions
            var isCorner = ['topLeft','bottomRight','topRight','bottomLeft'].indexOf(resizeProperties) > -1;
            var isRotated = this._editedComponent.getAngle() ? true : false;
            if (!isRotated && isCorner && this._editedComponent.EDITOR_META_DATA && this._editedComponent.EDITOR_META_DATA.general && this._editedComponent.EDITOR_META_DATA.general.proportionalResize) {

                this._resizeStartComponentGeometry.proportionalResize = true;
                this._resizeStartComponentGeometry.resizeType = resizeProperties;
                this._resizeStartComponentGeometry.proportion = this._resizeStartComponentGeometry.height / this._resizeStartComponentGeometry.width;
            }
        }),

        // TODO: remove if snapToResize experiment is merged or open!!
//        _setSelectedCompPositionSize: strategy.before(function(params) {
//            this._fixCoordinatesAccordingToRatioIfNeeded(params, {});
//        }),

        _fixCoordinatesAccordingToRatioIfNeeded: strategy.before(function(targetCompCoordinates, snapValues){
            // TODO: do some magic

            if(this._resizeStartComponentGeometry && this._resizeStartComponentGeometry.proportionalResize) {

//                if(snapValues && snapValues.height) {
//                    targetCompCoordinates.width = Math.round(targetCompCoordinates.height * 1/(this._resizeStartComponentGeometry.proportion));
//                } else {
                    targetCompCoordinates.height = Math.round(targetCompCoordinates.width * this._resizeStartComponentGeometry.proportion);
//                }

                var anchor;
                if(this._resizeStartComponentGeometry.resizeType == "topLeft") {
                    anchor = this._getRectCorner(this._resizeStartComponentGeometry, "bottomRight");

                    targetCompCoordinates.x = anchor.x - targetCompCoordinates.width;
                    targetCompCoordinates.y = anchor.y - targetCompCoordinates.height;
                } else
                if(this._resizeStartComponentGeometry.resizeType == "topRight") {
                    anchor = this._getRectCorner(this._resizeStartComponentGeometry, "bottomLeft");
                    targetCompCoordinates.x = anchor.x;
                    targetCompCoordinates.y = anchor.y - targetCompCoordinates.height;
                } else
                if(this._resizeStartComponentGeometry.resizeType == "bottomLeft") {
                    anchor = this._getRectCorner(this._resizeStartComponentGeometry, "topRight");
                    targetCompCoordinates.x = anchor.x - targetCompCoordinates.width;
                    targetCompCoordinates.y = anchor.y;
                } else
                if(this._resizeStartComponentGeometry.resizeType == "bottomRight") {
                    anchor = this._getRectCorner(this._resizeStartComponentGeometry, "topLeft");
                    targetCompCoordinates.x = anchor.x;
                    targetCompCoordinates.y = anchor.y;
                }
            }
        }),

        _getRectCorner: function(target, cornerType) {
//            available corner types: topLeft, topRight, bottomLeft, bottomRight
            var point = {x:0, y:0};
            if(target && target.hasOwnProperty("x") && target.hasOwnProperty("y") && target.hasOwnProperty("width") && target.hasOwnProperty("height")) {
                if(cornerType==="topLeft") {
                    point.x = target.x;
                    point.y = target.y;
                } else
                if(cornerType==="topRight") {
                    point.x = target.x + target.width;
                    point.y = target.y;
                } else
                if(cornerType==="bottomLeft") {
                    point.x = target.x;
                    point.y = target.y + target.height;
                } else
                if(cornerType==="bottomRight") {
                    point.x = target.x + target.width;
                    point.y = target.y + target.height;
                }
            }
            return point;
        },

        _resizeMouseUpHandler: strategy.after(function() {
            this._resizeStartComponentGeometry = null;
        })
    });

});

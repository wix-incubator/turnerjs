/** @class wysiwyg.editor.components.StaticGridLines */
define.experiment.component('wysiwyg.editor.components.StaticGridLines.LandingPageSupport', function (def, strategy) {

    def.methods({

        _registerCommandListeners: strategy.after(function () {
            this.resources.W.Preview.getPreviewManagersAsync(function(previewManagers){
                previewManagers.Commands.registerCommandAndListener('Viewer.ToggleLandingPageMode', this, this._toggleLandingPageMode);
            }, this);
        }),

        /**
         * makes sure to redraw the gridlines when navigating between landing/nonlanding and vice versa
         * @param params
         * @param {boolean} params.toLanding
         * @private
         */
        _toggleLandingPageMode: function(params){
            if(this._gridLinesTurnedOn) {
                if(params.toLanding){
                    this.hideHorizontalGridLines(true);
                } else {
                    this.showHorizontalGridLines();
                }
                this.showVerticalGridLines();
            }
        },

        /**
         * The horizontal gridlines needed to be handled here for landing page mode, since this is how the gridlines are actually toggled- and when turning the gridlines on/off, we want to make sure it works in landing pages too.
         * Therefore the  'showAllGridLines' really means 'showAllRelevantGridLines'
         */
        showAllGridLines: function() {
            this._gridLinesTurnedOn = true;
            if(this._shouldShowHorizontalGridlines()){
                this.showHorizontalGridLines();
            } else {
                this.hideHorizontalGridLines(true);
            }
            this.showVerticalGridLines();
        },

        /**
         * @returns {boolean}
         * @private
         */
        _shouldShowHorizontalGridlines: function(){
            return !this.resources.W.Preview.getPreviewManagers().Viewer.isCurrentPageLandingPage();
        },

        /**
         *
         * @param {boolean} [forceHide]
         */
        hideVerticalGridLines: function(forceHide) {
            if (forceHide || !this._gridLinesTurnedOn) {
                this.setState('verticalDisabled', 'verticalGridLines');
            }
        },

        /**
         *
         * @param {boolean} [forceHide]
         */
        hideHorizontalGridLines: function(forceHide) {
            if (forceHide || !this._gridLinesTurnedOn) {
                this.setState('horizontalDisabled', 'horizontalGridLines');
            }
        }
    });
});

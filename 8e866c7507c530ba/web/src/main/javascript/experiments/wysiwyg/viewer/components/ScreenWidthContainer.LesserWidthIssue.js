define.experiment.component('wysiwyg.viewer.components.ScreenWidthContainer.LesserWidthIssue', function(def) {
    def.methods({
        _stretchBackgroundAndCenterContent: function() {
            var view = this._view;
            var screenSize =  $(document).getSize();
            var componentSize = view.getSize();
            var docWidth = this.resources.W.Viewer.getDocWidth();
            // The minus is on the outside of the round do it will round up
            var left = this._isMobileView? 0 : -Math.round((screenSize.x-docWidth)/2);
            var width = this._isMobileView? docWidth : Math.max(docWidth, screenSize.x);

            if (left > 0) {
                left = 0;
            }

            this._skinParts.screenWidthBackground.setStyles({
                "position":"absolute",
                "width": width + "px",
                "height": componentSize.y + "px",
                "left":left});
        }
    });
});

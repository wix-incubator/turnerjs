define.Class("wysiwyg.editor.components.BreadCrumb", function (componentDefinition) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.statics({
        BREADCRUMB_SIZE_LIMIT: 10
    }) ;

    def.methods({
        initialize: function() {
            this._history = [] ;
        },

        getBreadcrumbLength: function() {
            return this._history.length ;
        },

        getCrumbAtIndex: function(index) {
            if(index < 0 || index >= this._history.length) {
                return null ;
            } else {
                return this._history[index] ;
            }
        },

        getBreadcrumbDepth: function () {
            var len = this._history.length;
            var depth = 0;
            for (var i = len - 1; i >= 0; --i) {
                var link = this._history[i];
                if (link.canGoBack) {
                    ++depth;
                }
                else { // no back function on a panel means that the back browsing can't continue
                    break;
                }
            }
            return depth ;
        },

        /**
         * Returns the last link in the history chain. (the Current crumb in the trail).
         */
        popCrumb: function() {
            var length = this._history.length ;
            if (length > 0) {
                return this._history.pop();
            }
            return null;
        },

        /**
         * @returns the previous link in the history chain. (the Previous crumb in the trail).
         */
        popPreviousCrumb: function() {
            // take out the current!
            this.popCrumb() ;
            // return the previous
            return this.popCrumb() ;
        },

        pushCrumb: function(historyLink) {
            if (historyLink && !this._isEqualToLastCrumb(historyLink)) {
                this._history.push(historyLink);
                // limit the history size
                if (this._history.length > this.BREADCRUMB_SIZE_LIMIT) {
                    this._history.splice(0, 1);
                }
            }
        },

        clearCrumb: function() {
            this._history = [];
        },

        _isEqualToLastCrumb: function(crumbToCompare) {
            crumbToCompare = crumbToCompare || null ;
            return _.isEqual(this._getLastCrumb(), crumbToCompare) ;
        },

        _getLastCrumb: function() {
            if(this.getBreadcrumbLength() > 0) {
                return this._history[this.getBreadcrumbLength() - 1] ;
            } else {
                return null ;
            }
        }
    }) ;
}) ;
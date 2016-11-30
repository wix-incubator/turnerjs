define.experiment.Class('wysiwyg.editor.managers.MouseComponentModifier.SitePagesValidation', function (classDefinition, experimentStrategy) {
    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.methods({
        addComponentToContainer: strategy.after(function() {
			/* Temporarily disabling this code to switch for a different one in SiteValidator.SitePagesValidation.js */
			//
            //if(!this._isValidating) {
            //    this._validateChangeScopeTransaction();
            //}
        }),

        _validateChangeScopeTransaction: function() {
            this._isValidating = true;

            var editedComponent = W.Editor.getSelectedComp(),
                parentComponent = editedComponent.getParentComponent(),
                sitePagesView = this.resources.W.Preview.getPreviewManagers().Viewer.getCompByID("SITE_PAGES");

            if(parentComponent.isInstanceOfClass(sitePagesView.$logic.$className)) {
                W.Editor.moveCurrentComponentToOtherScope();
                var stackTraceString = this._getModifiedStackTrace();
                LOG.reportError(wixErrors.CORRUPT_SITE_NONPAGE_CHILD_ADDED_TO_PAGEGROUP, 'MouseComponentModifier', '_validateChangeScopeTransaction', stackTraceString);
            }

            this._isValidating = false;
        },

        _getModifiedStackTrace: function() {
            var stackTrace;

            try {
                Error.stackTraceLimit = 15;
                throw new Error();
            } catch(e) {
                stackTrace = e.stack;
            }

            try {
                stackTrace = _.map(stackTrace.split(" at ").splice(5), function(stackItem) {
                    return _.first(stackItem.split(" "));
                }).join("\n\tat ");
            } catch(e) {
                stackTrace = "Could not split stack";
            }
            return stackTrace;
        }
    });
});

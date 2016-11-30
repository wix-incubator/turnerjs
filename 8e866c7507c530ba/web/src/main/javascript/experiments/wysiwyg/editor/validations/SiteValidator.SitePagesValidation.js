/**
 * @class wysiwyg.editor.validations.SiteValidator
 */
define.experiment.newClass('wysiwyg.editor.validations.SiteValidator.SitePagesValidation', function (classDefinition) {

    var def = classDefinition;

    def.inherits('bootstrap.managers.BaseManager');

    def.resources(['W.UndoRedoManager', 'W.Preview', 'W.Editor']);

    var undoTransactionTypesToLog = ["wysiwyg.editor.managers.undoredomanager.PositionChange", "wysiwyg.editor.managers.undoredomanager.ScopeChange"],
        transactionPropertiesToKeep = ['type','changedComponentIds'];

    def.methods({
        /**
         * @constructs
         */
        initialize: function () {
			if (this._isInternetExplorer11()) { //The bug only appears on IE11, and therefore we'll only attach the DOM listener when we identify it.
				this.resources.W.Preview.getPreviewManagersAsync(this._addMutationObserverOnSitePages, this);
			}
        },

		_isInternetExplorer11: function() {
			var userAgent = navigator.userAgent;
			var ieIndicatorRegEx = /Trident\//;
			var isIE11 = ieIndicatorRegEx.test(userAgent);
			return isIE11;

		},

        _addMutationObserverOnSitePages: function(previewW) {
            if('MutationObserver' in window) {
                var sitePagesView =  previewW.Viewer.getCompByID("SITE_PAGES"),
                    observer = new MutationObserver(this._onSitePagesChildListChange.bind(this)),
                    target = sitePagesView.$logic._skinParts.inlineContent, // We want the pages which are the direct children of this skinPart
                    options = { childList: true };

                observer.observe(target, options);
            }
        },
        /**
         *
         * @param {MutationRecord[]} mutationRecords
         * @private
         */
        _onSitePagesChildListChange: function(mutationRecords) {
            var changes = [];
			var corruptedComps = [];

            _.forEach(mutationRecords, function(/** MutationRecord **/record) {
                if(record.addedNodes.length > 0) {
                    _.forEach(record.addedNodes, function(node) {
                        if(node.$logic && !node.$logic.isInstanceOfClass('core.components.Page')) {
							corruptedComps.push(node.$logic);
                            changes = this._getChangesFromUndoStack();
                            LOG.reportError(wixErrors.CORRUPT_SITE_NONPAGE_CHILD_ADDED_TO_PAGEGROUP, 'SiteValidation', '_onSitePagesChildListChange', JSON.stringify(changes));
                        }
                    }, this);
                }
            }, this);

			if (corruptedComps.length > 0) {
				this._moveNonPageComponentsBackToPage(corruptedComps);
				LOG.reportError(wixErrors.FIXED_NONPAGE_CHILDREN_MOVED_BACK_TO_PAGE, 'SiteValidation', '_onSitePagesChildListChange');
			}
        },

		_moveNonPageComponentsBackToPage: function(components) {
			_.forEach(components, function(comp) {
				W.Editor.setSelectedComp(comp);
				W.Editor.moveCurrentComponentToOtherScope();
			});
		},

        _getChangesFromUndoStack: function(numOfChanges) {
            //undoTransactionTypesToLog and transactionPropertiesToKeep are defined as in a closure to the class, since they are both currently singletons
            return _.chain(W.UndoRedoManager._undoStack)
                .first(numOfChanges || 2)
                .pluck('transaction')
                .map(function(changes){
                    var dataToLog;
                    return _.reduce(changes, function(result, change){
                        if(_.contains(undoTransactionTypesToLog, change.type)){
                            dataToLog = _.pick(change, transactionPropertiesToKeep);
                            dataToLog.type = dataToLog.type.split('.').pop();
                            result.push(dataToLog);
                        }
                        return result;
                    }, []);
                })
                .value();
        }
    });
});


/**
 * @typedef {{
 *      addedNodes: 'Elements',
 *      attributeName: '?string',
 *      attributeNameSpace: '?string',
 *      nextSibling: '?Element',
 *      oldValue: {},
 *      previousSibling: '?Element',
 *      removedNodes: 'Elements',
 *      target: 'Element',
 *      type: 'DOMString'
 *
 * }} MutationRecord
 *
 */

/**@class wysiwyg.viewer.managers.viewer.ViewerDomDisplayReadyEventsCollector */
define.Class('wysiwyg.viewer.managers.viewer.ViewerDomDisplayReadyEventsCollector', function(classDefinition){
    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.binds(['_onNeverDomDisplayReady']);

    def.methods({
        initialize: function(errorCode, _handleNodeDomDisplayReadyEventFunction){
            this.errorCode = errorCode;
            this._handleNodeDomDisplayReadyEvent = _handleNodeDomDisplayReadyEventFunction;
        },

        _waitForDomDisplayReady: function(timeout){
            var nodesToWaitForReady = _.filter(document.querySelectorAll('[comp]'), function(comp){
                return comp.$logic;
            });
            var promises = this._getNodesDomDisplayReadyPromises(nodesToWaitForReady);
            this._nodesDomDisplayReadyPromises = promises;

            var deferred = Q.defer();

            Q.allSettled(_.map(promises, function(promise){
                    return promise.promise;
                })).then(function(){
                    deferred.resolve();
                });

            return deferred.promise.timeout(timeout);
        },

        _getNodesDomDisplayReadyPromises: function(nodesToWaitForReady){
            var self = this;
            return _.map(nodesToWaitForReady, function(node){
                var deferred = Q.defer();
                if (node.$logic.isReadyForDomDisplay()){
                    self._handleNodeDomDisplayReadyEvent(node);
                    deferred.resolve();
                } else {
                    node.addEvent(Constants.ComponentEvents.DOM_DISPLAY_READY, function(){
                        self._handleNodeDomDisplayReadyEvent(this);
                        deferred.resolve();
                    });
                }
                var promise = {
                    'promise': deferred.promise,
                    'nodeId': node.getAttribute('id'),
                    'comp': node.getAttribute('comp')
                };

                return promise;
            });
        },

        _onNeverDomDisplayReady: function(){
            var unfulfilledPromises = _.map(_.filter(this._nodesDomDisplayReadyPromises, function(promise) {
                return !promise.promise.isFulfilled() || promise.promise.isPending();
            }), function(node) {
                return {
                    'nodeId': node.nodeId,
                    'comp': node.comp
                };
            });

            this._unfulfilledPromises = unfulfilledPromises;
            LOG.reportError(this.errorCode, this.className, '_onNeverDomDisplayReady', JSON.stringify(unfulfilledPromises));
        },

        getUnfulfilledPromises: function(){
            return this._unfulfilledPromises;
        }
    });
});

/**
 * Created by shaharz on 3/9/14.
 */
define.Class('wysiwyg.viewer.components.classes.TextModifierBase', function(classDefinition) {
    var def = classDefinition;

    def.methods({

        initialize: function(initialValue, parentNode) {
            this._parentNode = parentNode;
            this._cache = [];
        },

        emptyCache: function() {
            this._cache = [];
        },

        updateDomAccordingToNewValue: function() {
            this._updateCache();
            _.forEach(this._cache, function(nodeColorObj) {
                this._updateNodeNewValue(nodeColorObj.node, nodeColorObj.value);
            }, this);
        },

        /*
         should be overridden
         */
        _getNodeDesktopValue: function(node) {
        },

        /*
         should be overridden
         */
        _updateNodeNewValue: function(node, value) {

        },

        _updateCache: function() {
            if (_.isEmpty(this._cache)) {
                this._populateCache(this._parentNode);
            }
        },

        _populateCache: function(parentNode) {
            if (parentNode.children) {
                for (var childIndex = 0; childIndex< parentNode.children.length; childIndex++) {
                    var child = parentNode.children[childIndex];
                    this._populateCache(child);
                    var value = this._getNodeDesktopValue(child);
                    if (value) {
                        this._cache.push({value: value, node: child});
                    }
                }
            }
        }
    });
});
define.experiment.newClass('wysiwyg.common.components.dropdownmenu.viewer.traits.MenuDataHandler.Dropdownmenu', function(classDefinition) {
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.methods({

        initialize: function() {
            this._hrefToDataNodeMap = {};
        },

        _handleFirstDataChange: function() {
            this.parent();
            this._updateHrefToDataNodeMap();
        },

        _updateHrefToDataNodeMap: function(dataNodes) {
            var href, dataNodes = dataNodes || this._menuDataNP.get('items');
            _.forEach(dataNodes, function(dataNode) {
                href = this.resources.W.Data.getDataByQuery(dataNode.get('link')).get('pageId');
                this._hrefToDataNodeMap[href] = dataNode;
                if (dataNode.get('items').length) {
                    this._updateHrefToDataNodeMap(dataNode.get('items'));
                }
            }, this);
        }

    });
});
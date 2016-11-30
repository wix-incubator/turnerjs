define.experiment.Class('wysiwyg.common.components.verticalmenu.viewer.traits.MenuDataHandler.CustomSiteMenu', function (classDefinition, experimentStrategy) {

    var def = classDefinition;

    def.methods({

        isItemVisible: function(itemDataNode) {
            return itemDataNode.get('isVisible');
        },

        _getAllMenuLinkDataItems: function(menuDataItems) {
            var dataItems = [];

            _.forEach(menuDataItems, function(dataItem) {
                var linkedDataItem = dataItem.getLinkedDataItem(),
                    subItems = dataItem.get('items');

                if(linkedDataItem){
                    dataItems.push(linkedDataItem);
                }

                if(subItems && subItems.length) {
                    dataItems.push.apply(dataItems, this._getAllMenuLinkDataItems(subItems));
                }
            }, this);

            return dataItems;
        }
    });
});
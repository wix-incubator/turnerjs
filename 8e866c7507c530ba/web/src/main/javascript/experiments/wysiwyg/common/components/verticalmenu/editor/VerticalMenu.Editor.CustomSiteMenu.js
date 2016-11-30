define.experiment.component('Editor.wysiwyg.common.components.verticalmenu.viewer.VerticalMenu.CustomSiteMenu', function (componentDefinition, experimentStrategy) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition,
        strategy = experimentStrategy;

    def.methods({

        _onRender: strategy.after(function (renderEvent) {
            if(this._getRefIdDataChange(renderEvent)){
                this._handleFirstDataChange();
                this._handleSkinChange();
            }
        }),

        _getRefIdDataChange: function (renderEvent) {
            var invalidationObj = renderEvent.data.invalidations.getInvalidationByType(this.INVALIDATIONS.DATA_CHANGE);
            var dataChangeRequest = invalidationObj && invalidationObj[0];
            return dataChangeRequest && dataChangeRequest.field === 'menuRef';
        }
    });

});
define.experiment.component('wysiwyg.editor.components.inputs.MobileOrDesktopViewSelectorButton.ExitMobileModeEditorToggle', function(componentDefinition){
    /**@type core.managers.component.ClassDefinition*/
    var def = componentDefinition;

    def.methods({

        _onAllSkinPartsReady: function(){
            this.parent();
            var iconFullPath = this._getIconUrl(this._iconURL);

            this._skinParts.icon.setStyles({
                'background': 'url(' + iconFullPath + ') no-repeat 50% 50%',
                'width'     : parseInt(this._iconSize.width, 10) + 'px',
                'height'    : parseInt(this._iconSize.height, 10) + 'px'
            });
            this.setWidth(this._iconSize.width + 70);
            // EXPERIMENT MOD: height = 50 instead of 70
            this.setHeight(this._iconSize.height + 50);

            this._skinParts.content.addEvent(Constants.CoreEvents.CLICK, this._fireContentClickEvent);

        }
    });
});
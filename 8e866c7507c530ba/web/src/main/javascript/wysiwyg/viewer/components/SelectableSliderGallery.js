define.component("wysiwyg.viewer.components.SelectableSliderGallery", function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;

    def.skinParts({
        'imageItem':{ type:'wysiwyg.viewer.components.Displayer', repeater:true, container:'itemsContainer', dataRefField:'items' },
        'itemsContainer':{ type:'htmlElement'},
        'swipeLeftHitArea':{ type:'htmlElement' },
        'swipeRightHitArea':{ type:'htmlElement' }
    });

    def.inherits('wysiwyg.viewer.components.SliderGallery');

    def.fields({
        _selectedItem:null
    });

    def.methods({
        initialize:function (compId, viewNode, args) {
            this._expandEnabled = false;
            this._initialSelectedIndex = 0;
            if (args.selectedIndex) {
                this._initialSelectedIndex = args.selectedIndex;
            }
            this.parent(compId, viewNode, args);
        },
        _setupDisplayer:function (displayer, index) {
            this.parent(displayer);
            if (this._selectedItem) {
                if (this._selectedItem === displayer) {
                    this.setSelectedState(displayer);
                }
            }
            else if (index === this._initialSelectedIndex) {
                this.setSelectedState(displayer);
            }
            displayer.addEvent('itemSelected', function () {
                this.setSelectedState(displayer);
                this.fireEvent('imageSelected', displayer.getDataItem());
            }.bind(this));
        },

        setSelectedState:function (newSelected) {
            if (this._selectedItem) {
                if (this._selectedItem === newSelected) {
                    return;
                }
                this._selectedItem.setSelected(false);
            }
            this._selectedItem = newSelected;
            this._selectedItem.setSelected(true);
        }
    });
});

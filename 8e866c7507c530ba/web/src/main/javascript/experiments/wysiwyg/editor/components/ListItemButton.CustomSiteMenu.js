define.experiment.newComponent('wysiwyg.editor.components.ListItemButton.CustomSiteMenu', function (componentDefinition) {

    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.WButton');

    def.resources(['W.Resources']);

    def.skinParts({
        icon: {'type': 'htmlElement', optional: 'true'},
        label: {'type': 'htmlElement'},
        desc: {'type': 'htmlElement', optional: 'true'}
    });
    def.methods({
        setParameters: function (args) {
            this.parent(args);
            this._description = args.desc;
        },

        render: function(){
            this.parent();
            this.setDescription(this._description);
        },

        setDescription: function(description){
            if(description && this._skinParts.desc){
                this._skinParts.desc.set('html', this.resources.W.Resources.getCur(description, description));
            }
        },

        _renderIcon: function(){
            if (this._iconSrc) {
                var iconFullPath = this._getIconUrl(this._iconSrc);

                if (!isNaN(this._spriteOffset.x)) {
                    this._spriteOffset.x += 'px';
                }
                if (!isNaN(this._spriteOffset.y)) {
                    this._spriteOffset.y += 'px';
                }

                var bgString = [
                        'url(' + iconFullPath + ')',
                    'no-repeat',
                    this._spriteOffset.x,
                    this._spriteOffset.y
                ].join(' ');

                this._skinParts.icon.setStyle('background', bgString);
                this._skinParts.icon.uncollapse();
                this.setState('hasIcon');
            } else {
                this._skinParts.icon.setStyle('background', '');
                this._skinParts.icon.collapse();
                this.setState('noIcon');
            }

            if(this._iconSize){
                if (this._iconSize.width && !isNaN(this._iconSize.width)) {
                    this._iconSize.width += 'px';
                }
                if (this._iconSize.height && !isNaN(this._iconSize.height)) {
                    this._iconSize.height += 'px';
                }

                if(this._iconSize.width && this._iconSize.height){
                    this._skinParts.icon.setStyles({
                        width: this._iconSize.width,
                        height: this._iconSize.height
                    });
                    this._skinParts.label.setStyle('margin-left', this._iconSize.width);
                } else if(this._iconSize.width){
                    this._skinParts.icon.setStyles({
                        width: this._iconSize.width
                    });
                    this._skinParts.label.setStyle('margin-left', this._iconSize.width);
                } else {
                    this._skinParts.icon.setStyles({
                        height: this._iconSize.height
                    });
                }
            }
            if (this._iconSize && this._iconSize.width && this._iconSize.height) {
                if (!isNaN(this._iconSize.width)) {
                    this._iconSize.width += 'px';
                }
                if (!isNaN(this._iconSize.height)) {
                    this._iconSize.height += 'px';
                }
                this._skinParts.icon.setStyles({
                    width: this._iconSize.width,
                    height: this._iconSize.height
                });
                this._skinParts.label.setStyle('margin-left', this._iconSize.width);
            }
        }
    });

});

define.component('wysiwyg.editor.components.panels.StaticPalettePanel', function (componentDefinition) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('core.components.Button');
    def.utilize([]);
    def.binds([]);
    def.skinParts({
        label: {type: 'htmlElement'},
        colors: {type: 'htmlElement'}
    });
    def.dataTypes(['', 'list']);
    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            args = args || {};
            this._paletteName = args['paletteName'];
            this._colors = Object.filter(args, function (value, key) {
                return key != 'paletteName' && key != 'type' && key != 'paletteTags';
            });
            this._colorHeight = args.height || '100%';
            //this._colorWidth  = args.width || '0';
        },

        render: function () {
            this._skinParts.label.set('text', this._paletteName);
            //var colors = this._data.getData();
            //delete this.colorFields['paletteName'];
            // delete this.colorFields['type'];


            this._colorsCount = 5;
            this._addColor(this._colors['color_13']);
            this._addColor(this._colors['color_19']);
            this._addColor(this._colors['color_23']);
            this._addColor(this._colors['color_29']);
            this._addColor(this._colors['color_33']);
            //            this._colorsCount = 0;
            //            for (var col in this._colors) {
            //                if (col) {
            //                    this._colorsCount++;
            //                }
            //            }
            //
            //            for (var color in this._colors) {
            //                if (color) {
            //                    this._addColor(this._colors[color]);
            //                }
            //            }
        },

        //        _onClick:function(e){
        //            var themeManager = this.injects().Preview.getPreviewManagers().Theme;
        //            for (var color in this._colors) {
        //                if (color) {
        //                    themeManager.setProperty(color, this._colors[color]);
        //                }
        //            }
        //            this.parent();
        //        },

        getColors: function () {
            return this._colors;
        },

        /** @override */
        _onDataChange: function () {
        },

        /**
         * add a div color to the component
         * @param color
         */
        _addColor: function (color) {
            var colorComp = new Element('div', {
                styles: {
                    'display': 'inline-block',
                    'background-color': color,
                    'height': this._colorHeight,
                    'width': 100 / this._colorsCount + '%'
                }
            });

            this._skinParts.colors.adopt(colorComp);
        }
    });

});

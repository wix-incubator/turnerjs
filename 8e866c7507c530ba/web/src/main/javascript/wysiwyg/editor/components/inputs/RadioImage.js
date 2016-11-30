define.component('wysiwyg.editor.components.inputs.RadioImage', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;


    def.binds(['_onImageClick']);

    def.inherits("wysiwyg.editor.components.inputs.Radio");

    def.skinParts({
        radioContainer: {type: 'htmlElement'},
        label:  {type: 'htmlElement'},
        radio: {type: 'htmlElement'},
        radioImage: {type: 'htmlElement'},
        radioIcon: {type: 'htmlElement'}
    });

    def.states({'label': ['hasLabel', 'noLabel'], 'display': ['inline', 'block']});

    def.methods({
        /**
         * @override
         * ImageRadio extends Radio
         * Initialize Input
         * @param compId
         * @param viewNode
         * @param args
         * Optional args:
         * labelText: the value of the label to show above/next to the field
         * name: the field name attribute
         * value: the radio buttons value to be returned
         * image: the background image, expected to be a sprite of 3 states ordered vertically : idle|hovered|selected
         * dimensions: an object in the form of {w:number, h:number} that defines the visible dimensions of a single icon
         *
         * Note: image and icon path should be the relative path from the WEB_THEME_DIRECTORY if they are internal. If
         * the path is absolute, it will not be modified (no WEB_THEME_DIRECTORY prefix will be added)
         */
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._icon = args.icon || '';
            this._image = args.image || '';
            this._dimensions = args.dimensions || {w:0, h:0};
            this._basePath =  this.injects().Theme.getProperty("WEB_THEME_DIRECTORY");
        },
        /**
         * @override
         */
        render: function() {
            //Set Image
            this.setBackground(this._image, this._icon , this._dimensions);

            this.parent();
        },
        /**
         * @override
         * Check or un-check the box
         * @param value True/False
         */
        setChecked: function (value) {
            this.parent(value);

            if (value) {
                this._skinParts.radioImage.addClass('selected');
            } else {
                this._skinParts.radioImage.removeClass('selected');
            }
        },

        /**
         * When the resource is absolute, returns the resource, otherwise using the base web theme directory
         * as a base resource
         */
        _getResourcePath: function (resource) {
            return resource && resource.match(/^(http:\/\/).*/) ? resource : this._basePath + '/' + resource;
        },


        /**
         * Set the background image and the emulate radio button click
         * @param {String} image
         * @param {Object} dimensions
         */
        setBackground: function(image, icon, dimensions){
            var element = this._skinParts.radioImage;
            var iconElement = this._skinParts.radioIcon;
            if (image && dimensions){
                element.setStyles({
                    'width': dimensions.w,
                    'height': dimensions.h,
                    'backgroundImage': 'url(' + this._getResourcePath(image) + ')'
                });
            }
            if (icon && dimensions){
               iconElement.setStyles({
                   'width': dimensions.w,
                   'height': dimensions.h,
                   'backgroundImage': 'url(' + this._getResourcePath(icon) + ')'
               });
            }else{
                iconElement.collapse();
            }
//            element.addEvent('click', function(e){
//                this.setChecked(true);
//            }.bind(this));
        },

        /**
         * @override
         * Assign change events
         */
        _listenToInput: function() {
            this.parent();
            this._skinParts.radioImage.addEvent('click', this._onImageClick);
        },
        /**
         * @override
         * Remove change events
         */
        _stopListeningToInput: function() {
            this.parent();
            this._skinParts.radioImage.removeEvent('click', this._onImageClick);
        },

        _onImageClick: function() {
            this.setChecked(true);
        }

    });
});

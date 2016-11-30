define.component('wysiwyg.editor.components.inputs.CheckBoxImage', function(classDefinition) {
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.inherits('wysiwyg.editor.components.inputs.CheckBox');

    def.binds(['_onImageClick']);

    def.states({
        'label': ['hasLabel', 'noLabel'],
        'display': ['inline', 'block']
    });

    def.skinParts({
        checkBoxContainer: {type: 'htmlElement'},
        label:  {type: 'htmlElement'},
        checkBox: {type: 'htmlElement'},
        checkBoxImage: {type: 'htmlElement'},
        checkBoxIcon: {type: 'htmlElement'}
    });

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
         * value: the checkBox buttons value to be returned
         * image: the background image, expected to be a sprite of 3 states ordered vertically : idle|hovered|selected
         * dimensions: an object in the form of {w:number, h:number} that defines the visible dimensions of a single icon
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
                this._skinParts.checkBoxImage.addClass('checked');
            } else {
                this._skinParts.checkBoxImage.removeClass('checked');
            }
        },
        /**
         * Set the background image and the emulate checkBox button click
         * @param {String} image
         * @param {String} icon
         * @param {Object} dimensions
         */
        setBackground: function(image, icon, dimensions){
            var element = this._skinParts.checkBoxImage;
            var iconElement = this._skinParts.checkBoxIcon;
            if (image && dimensions) {
                element.setStyles({
                    'width': dimensions.w,
                    'height': dimensions.h,
                    'backgroundImage': 'url(' + this._basePath + image + ')'
                });
            }
            if (icon && dimensions){
                iconElement.setStyles({
                    'width': dimensions.w,
                    'height': dimensions.h,
                    'backgroundImage': 'url(' + this._basePath + icon + ')'
                });
            }else{
                iconElement.collapse();
            }
        },

        _onImageClick: function(e){
            this.toggleChecked();
            e.preventDefault();
            this._skinParts.checkBox.fireEvent(Constants.CoreEvents.CHANGE, e);
        },

        /**
         * @override
         * Assign change events
         */
        _listenToInput: function() {
            this.parent();
            this._skinParts.checkBoxImage.addEvent(Constants.CoreEvents.CLICK, this._onImageClick);
        },
        /**
         * @override
         * Remove change events
         */
        _stopListeningToInput: function() {
            this.parent();
            this._skinParts.checkBoxImage.removeEvent(Constants.CoreEvents.CLICK, this._onImageClick);
        }
    });
});

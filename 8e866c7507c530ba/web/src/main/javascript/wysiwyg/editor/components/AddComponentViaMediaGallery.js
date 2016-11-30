define.Class('wysiwyg.editor.components.AddComponentViaMediaGallery', function (classDefinition) {
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.resources(['W.CommandsNew']);

    def.utilize([
        'wysiwyg.editor.components.addviamediagallery.WPhotoStrategy',
        'wysiwyg.editor.components.addviamediagallery.ClipArtStrategy',
        'wysiwyg.editor.components.addviamediagallery.DocumentMediaStrategy',
        'wysiwyg.editor.components.addviamediagallery.ShapeStrategy',
        'wysiwyg.editor.components.addviamediagallery.SingleAudioPlayerStrategy',
        'wysiwyg.editor.components.addviamediagallery.AudioPlayerStrategy'
    ]);

    def.statics({
        NO_DATA_ERROR: "no data was returned from media gallery for ",
        UNKNOWN_COMPONENT: "unknown component",
        STRATEGY_REGEX: /(\w+)Strategy/
    });

    def.fields({
        _strategies: null,
        _strategy: null
    });

    def.binds([
        '_openMediaGalleryCallback'
    ]);

    def.methods({
        openMediaGallery: function (options) {
            var commandArgs;
           
            if (!options) {
                throw "no options passed to openMediaGallery";
            }

            this._pickStrategyFor(options.compType);
            this._strategy.options = options;

            commandArgs = this._strategy.getMediaGalleryCommandArgs();
            commandArgs.callback = this._openMediaGalleryCallback;

            W.Commands.executeCommand('WEditorCommands.OpenMediaFrame', commandArgs);
            this._reportAddButtonClick(options.compType);
        },

        _pickStrategyFor: function (compType) {
            this._initializeStrategies();
            this._strategy = this._strategies[compType] || null;

            if (!this._strategy) {
                throw "no strategy found for " + compType;
            }
        },

        _initializeStrategies: function () {
            var key, match;

            if (this._strategies) {
                return;
            }

            this._strategies = {};

            for (key in this.imports) {
                match = key.match(this.STRATEGY_REGEX);
                if (match) {
                    this._strategies[match[1]] = new this.imports[key]();
                }
            }
        },

        _openMediaGalleryCallback: function (galleryData) {
            var itemsCount = 1;

            if (!galleryData) {
                var errorMessage = this.NO_DATA_ERROR + this._getCompType();
                LOG.reportError(errorMessage, this.$className, '_openMediaGalleryCallback');
                return;
            }

            if (_.isArray(galleryData)) {
                galleryData.forEach(function (item) {
                    this._addComponentFromRawData(item);
                }, this);

                itemsCount = galleryData.length;
            } else {
                this._addComponentFromRawData(galleryData);
            }

            this._reportImagesAdded(this._getCompType(), itemsCount);
        },

        _getCompType: function () {
            var compType;

            if (this._strategy && this._strategy.options) {
                compType = this._strategy.options.compType;
            }

            return compType || this.UNKNOWN_COMPONENT;
        },

        _addComponentFromRawData: function (rawData) {
            var preset = this._strategy.getDefaultPreset();
            var data =   this._strategy.extractMediaGalleryData(rawData);
            var layout = this._strategy.computeLayout(rawData);

            _.extend(preset.compData.data, data);
            _.extend(preset.compData.layout, layout);

            if (typeof this._strategy.applyToPreset === "function") {
                this._strategy.applyToPreset(preset);
            }

            this.resources.W.CommandsNew.executeCommand("WEditorCommands.AddComponent", preset);
        },

        _reportImagesAdded: function (compType, numberOfImageItems) {
            LOG.reportEvent(wixEvents.IMAGE_ADDED_VIA_MEDIA_GALLERY, {i1: numberOfImageItems, c1: compType});
        },

        _reportAddButtonClick: function (compType) {
            LOG.reportEvent(wixEvents.ADD_IMAGE_BUTTON_CLICK, {c1: compType});
        }
    });
});

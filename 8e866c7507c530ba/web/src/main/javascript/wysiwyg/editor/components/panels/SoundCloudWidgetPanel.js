define.component('wysiwyg.editor.components.panels.SoundCloudWidgetPanel', function (componentDefinition) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');
    def.utilize([]);
    def.binds(["_extractURLFromEmbed"]);
    def.traits(['core.editor.components.traits.DataPanel']);
    def.skinParts({
        content: {type: 'htmlElement'}
    });
    def.dataTypes(['SoundCloudWidget']);
    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
        },

        _createFields: function () {
            var panel = this;
            this.addInputGroupField(function () {
                this.addSubmitInputField(this._translate("SOUNDCLOUD_EMBED_TITLE"), this._translate("SOUNDCLOUD_EMBED_PH"), 0, 1024, this._translate("SOUNDCLOUD_UPDATE"), null, {validators: [panel._extractURLFromEmbed]}, null, "SoundCloud_Embed_Code_ttid");
                this.addCheckBoxField(this._translate("SOUNDCLOUD_SHOW_ARTWORK")).bindToField("showArtWork");
                this.addCheckBoxField(this._translate("SOUNDCLOUD_AUTOPLAY")).bindToField("autoPlay");
            });
            this.addAnimationButton();

        },

        _extractURLFromEmbed: function (value) {
            var success = false;
            var url = this.validateEmbed(value);
            if (url != undefined && url != "") {
                success = true;
            }

            if (success) {
                this._data.set("url", url);
                return "";
            }
            else {
                return this._translate("SOUNDCLOUD_INVALID_EMBED_CODE");
            }
        },

        validateEmbed: function (value) {
            var url;
            var result;
            var urlBase = "http://w.soundcloud.com/player/?url=";
            if (/^<iframe.*<\/iframe>\s*$/.test(value)) {
                if ((value.indexOf("http://w.soundcloud.com/player/") != -1) ||
                    (value.indexOf("https://w.soundcloud.com/player/") != -1)) {
                    result = /src=[\"\']([^'"]*)[\"\']/.exec(value);
                    if (result) {
                        url = result[1];
                    }
                }
            } else
            // flash embed
            if (/^<object.*<\/span>\s*$/.test(value)) {
                if (value.indexOf("https://player.soundcloud.com/player.swf") != -1) {
                    result = /src=[\"\']([^'"]*)[\"\']/.exec(value);
                    if (result) {
                        result = /url=(.*)/.exec(result[1]);
                        if (result) {
                            url = urlBase + result[1];
                        }
                    }
                }
            }
            return url;
        }
    });
});
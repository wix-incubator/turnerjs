define.component('wysiwyg.viewer.components.LazySocialPanel', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');

    def.binds(['onHover']);

    def.skinParts({
        "placeHolder": {type: "htmlElement"},
        "fbLike": {type: "htmlElement"},
        "twitterShare": {type: "htmlElement"},
        "googlePlus": {type: "htmlElement"}
    });

    def.methods({
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);

            var itemTitle = "";
            if (this.injects().Viewer.getCurrentPageNode()) {
                itemTitle = this.injects().Viewer.getCurrentPageNode().getLogic().getDataItem().getData().title;
            }

            var itemUrl = location.href;

            this._buttons = {
                fbLike: {
                    type: "wysiwyg.viewer.components.WFacebookLike",
                    skin: "skins.core.FacebookLikeSkin",
                    data: null,
                    args: {
                        propObj: {
                            layout: "button_count"
                        }
                    }
                },
                twitterShare: {
                    type: "wysiwyg.viewer.components.WTwitterTweet",
                    skin: "mobile.core.skins.TwitterTweetSkin",
                    data: this.injects().Data.createDataItem({
                        "defaultText": itemTitle + " ~ ",
                        "accountToFollow": "",
                        "type": "TwitterTweet"
                    }, "TwitterTweet"),
                    args: null
                },
                googlePlus: {
                    type: "wysiwyg.viewer.components.WGooglePlusOne",
                    skin: "mobile.core.skins.GooglePlusOneSkin",
                    data: null,
                    args: {
                        'annotation': 'small_bubble',
                        'size': 'medium',
                        'width': {
                            w: 50,
                            h: 15
                        }
                    }
                }
            };
        },

        render: function() {
            this._skinParts.placeHolder.addEvent("mouseover", this.onHover);
        },

        onHover: function() {
            this._skinParts.placeHolder.removeEvent("mouseover", this.onHover);
            this._skinParts.placeHolder.dispose();
            this._addService(this._buttons.twitterShare, this._skinParts.twitterShare);
            this._addService(this._buttons.fbLike, this._skinParts.fbLike);
            //this._addService(this._buttons.googlePlus, this._skinParts.googlePlus);
        },

        _addService: function(args, targetSkinPart) {
            this.injects().Components.createComponent({
                type: args.type,
                skin: args.skin,
                data: args.data,
                args: args.args
            }).insertInto(targetSkinPart);
        }
    });
});
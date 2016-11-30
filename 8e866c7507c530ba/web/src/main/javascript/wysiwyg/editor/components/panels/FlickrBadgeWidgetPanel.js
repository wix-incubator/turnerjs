/**
 * @Class "wysiwyg.editor.components.panels.FlickrBadgeWidgetPanel
 * @extends wysiwyg.editor.components.panels.base.AutoPanel
 */
define.component('wysiwyg.editor.components.panels.FlickrBadgeWidgetPanel', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("wysiwyg.editor.components.panels.base.AutoPanel");

    def.traits(['core.editor.components.traits.DataPanel']);

    def.utilize(["external_apis.flickr.FlickrAPI"]);

    def.binds(["_onGetUserIDComplete", "_getUserID"]);

    def.skinParts({
        content: {type: 'htmlElement'}
    });

    def.dataTypes(['FlickrBadgeWidget']);

    def.fields({
        _userNameInput: undefined,
        _tagsInput: undefined,
        _userNameValue: undefined,
        _firstRun: true,
        _userNameInputCB: undefined
    });

    /**
     * @lends "wysiwyg.editor.components.panels.FlickrBadgeWidgetPanel
     */
    def.methods({
        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
        },

        _createFields: function(){
            var panel = this;

            var whichImagesOptions = [
                {label:this._translate("FLICKR_SHOW_ITEM_LATEST") , value:"latest"},
                {label:this._translate("FLICKR_SHOW_ITEM_RANDOM") , value:"random"}
            ];

            var bg = 'radiobuttons/radio_button_states.png';
            var bgDimensions = {w: '35px', h: '33px'};

            var imageCountOptions  = [
                {value:"1" , image: bg, dimensions: bgDimensions, icon: 'radiobuttons/flickr/flickr1.png'},
                {value:"3" , image: bg, dimensions: bgDimensions, icon: 'radiobuttons/flickr/flickr3.png'},
                {value:"5" , image: bg, dimensions: bgDimensions, icon: 'radiobuttons/flickr/flickr5.png'},
                {value:"10", image: bg, dimensions: bgDimensions, icon: 'radiobuttons/flickr/flickr10.png'}
            ];
            var orientationOptions = [
                {label:this._translate("FLICKR_LAYOUT_ITEM_VERT")  , value:"v"},
                {label:this._translate("FLICKR_LAYOUT_ITEM_HORZ"), value:"h"}
            ];
            var imageSizeOptions   = [
                {value:"s", image: bg, dimensions: bgDimensions, icon: 'radiobuttons/flickr/flickr_square.png'},
                {value:"t", image: bg, dimensions: bgDimensions, icon: 'radiobuttons/flickr/flickr_thumb.png'},
                {value:"m", image: bg, dimensions: bgDimensions, icon: 'radiobuttons/flickr/flickr_large.png'}
            ];

            var tagOptions  = [];

            var hasUserID = this._data.get("userId") != undefined && this._data.get("userId") != "";

            if (hasUserID){
                this._firstRun = false;
                tagOptions.push({
                    label: "All",
                    value: ""
                });
                tagOptions.push({
                    label: this._data.get("tag"),
                    value: this._data.get("tag")
                });
            }

            this.addInputGroupField(function(){
                var userNamePlaceholder = this._translate("FLICKR_USERNAME_PLACEHOLDER");
                this.addSubmitInputField(this._translate("FLICKR_USERNAME"), userNamePlaceholder, 0, 30, this._translate("GENERAL_UPDATE"), null, null, panel._getUserID)
                    .bindToField('userName')
                    .runWhenReady(function(logic){
                        panel._userNameInput = logic;
                    });
            });

            this.addInputGroupField(function(){
                this.addComboBoxField(this._translate("FLICKR_TAG_TITLE"), tagOptions, 'latest', 2, "Flickr_Gallery_Display_by_tag_ttid").bindToField('tag')
                    .runWhenReady(function(logic){
                        panel._tagsInput = logic;
                        if (hasUserID){
                            panel._getTags();
                        }
                    });
                this.addComboBoxField(this._translate("FLICKR_SHOW_TITLE"), whichImagesOptions, 'latest', 2, "Flickr_Gallery_Show_ttid").bindToField('whichImages');
                this.addComboBoxField(this._translate("FLICKR_LAYOUT_TITLE"), orientationOptions, 'v', 2).bindToField('layoutOrientation');

                this.addRadioImagesField(this._translate("FLICKR_GALLERY_SIZE"), imageCountOptions, '3', null, 'inline').bindToField('imageCount');
                this.addRadioImagesField(this._translate("FLICKR_IMAGE_SIZE"), imageSizeOptions, 't', 3, 'inline').bindToField('imageSize');

            });

            this.addAnimationButton();
        },

        _getUserID:function( e, changeEventHandler ){
            var flickrAPI;
            var dataProvider;

            this._userNameInputCB = {event:e, handler:changeEventHandler};
            // clear tags input
            dataProvider = W.Data.createDataItem({items:[{label:"", value:""}], type:"list"});
            this._tagsInput.bindToDataProvider(dataProvider);

            // call flickr
            this._userNameValue = this._userNameInput.getValue();
            flickrAPI      = new this.imports.FlickrAPI();
            flickrAPI.getUserID(this._userNameValue, (this._onGetUserIDComplete).bind(this));
        },

        _onGetUserIDComplete:function(success, result){
            if (success){
                this._userID = result;
                this._data.set("userName",  this._userNameValue);
                this._data.set("userId",    result);
                this._getTags();
                this._userNameInput.resetInvalidState();
                this._userNameInputCB.handler(this._userNameInputCB.event);
            }
            else{
                this._userNameInput.showValidationMessage(result);
            }
        },

        _getTags:function(){
            var flickrAPI;
            flickrAPI   = new this.imports.FlickrAPI();
            flickrAPI.getTags(this._data.get("userId"), (this._onGetTagsComplete).bind(this));
        },

        _onGetTagsComplete:function(success, result){
            if (success){
                var dataProvider;
                var tagsList;
                tagsList = [];
                tagsList.push({
                    label: "All",
                    value: ""
                });
                for (var key in result){
                    if (result[key].hasOwnProperty("_content")){
                        tagsList.push({
                                label:result[key]._content,
                                value:result[key]._content}
                        );
                    }
                }
                dataProvider = W.Data.createDataItem({items:tagsList, type:"list"});
                this._tagsInput.bindToDataProvider(dataProvider);
                if(!this._firstRun){
                    this._tagsInput.setValue(this._data.get("tag"));
                }
            }
            else{
                this._tagsInput.showValidationMessage(result);
            }

        }
    });
});
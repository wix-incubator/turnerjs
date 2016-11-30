/**@class wysiwyg.viewer.components.EbayItemsBySeller */
define.component('wysiwyg.viewer.components.EbayItemsBySeller', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');

    def.skinParts({
        iFrameHolder:{type:'htmlElement'}
    });

    def.propertiesSchemaType('EbayItemsBySellerProperties');

    def.binds([ '_applyThemeColors' ]);

    def.states([ 'hasContent', 'noContent' ]);

    def.dataTypes(['EbayItemsBySeller']);

    def.fields({
        _renderTriggers:[
            Constants.DisplayEvents.MOVED_IN_DOM,
            Constants.DisplayEvents.ADDED_TO_DOM,
            Constants.DisplayEvents.DISPLAYED,
            Constants.DisplayEvents.DISPLAY_CHANGED]
    });

    def.statics({
        EDITOR_META_DATA:{
            general:{
                settings:true,
                design:true
            }
        }
    });

    /**
     * @lends wysiwyg.viewer.components.EbayItemsBySeller
     */
    def.methods({
        initialize:function (compId, viewNode, args) {
            args = args || {};
            this.parent(compId, viewNode, args);
            this.addEvent("resizeEnd", this._onResizeEnd);
            this._iframe = null;
        },
        options:{
            width:0,
            height:0,
            url:""
        },
        render:function () {
            var sellerId = this._data.get('sellerId');

            // set the status to having or not having content
            this.setState(sellerId ? 'hasContent' : 'noContent');

            if (sellerId) {
                var options = this._createUrl(sellerId, this._data.get('registrationSite'), this._prepareOptions());
                var iframe = this._createIFrame(options.width, options.height);
                this.injects().Utils.prepareIFrameForWrite(iframe, function (iframe, doc) {
                    doc.write('<html><body style="margin:0px;"><div><script type="text/javascript" src="' + options.url + '"></script></div></body></html>');
                    iframe.setStyles({height:options.height, width:options.width});
                });
            }
        },

        isInvisibleInStaticHtml: function(){
            return true;
        },

        _onStyleReady:function () {
            this.parent();
            this._style.addEvent(Constants.StyleEvents.PROPERTY_CHANGED, this._applyThemeColors);
        },

        dispose:function () {
            this._style.removeEvent(Constants.StyleEvents.PROPERTY_CHANGED, this._applyThemeColors);
            this.parent();
        },

        _applyThemeColors:function (changeEvent) {
            var effectedProps = ['fontColor', 'borderColor', 'headerColor', 'backgroundColor', 'linkColor'];
            for (var propertyId in changeEvent.properties) {
                if (effectedProps.indexOf(propertyId) > -1) {
                    this._renderIfReady();
                    return;
                }
            }
        },

        _onResizeEnd:function () {
            this._renderIfReady();
        },

        _prepareOptions:function () {
            var skinMgr = this.injects().Skins;
            var skinClassName = this._skin.className;
            var fontColor = skinMgr.getSkinParamValue(skinClassName, 'fontColor', this._style).getHex(false);
            var borderColor = skinMgr.getSkinParamValue(skinClassName, 'borderColor', this._style).getHex(false);
            var headerColor = skinMgr.getSkinParamValue(skinClassName, 'headerColor', this._style).getHex(false);
            var backgroundColor = skinMgr.getSkinParamValue(skinClassName, 'backgroundColor', this._style).getHex(false);
            var linkColor = skinMgr.getSkinParamValue(skinClassName, 'linkColor', this._style).getHex(false);
            return {
                width:this._view.getWidth(),
                height:this._view.getHeight(),
                headerImage:this.getComponentProperty('headerImage'),
                fontColor:fontColor.replace('#', ''),
                borderColor:borderColor.replace('#', ''),
                headerColor:headerColor.replace('#', ''),
                backgroundColor:backgroundColor.replace('#', ''),
                linkColor:linkColor.replace('#', '')
            };
        },

        _createUrl:function (id, registrationSite, options) {

            // calculate number of items (100 is header and footer, 70 is a single item's height)
            var itemCount = Math.floor((options.height - 100) / 70);

            var siteIdMap = {
                'Australia':'15',
                'Austria':'16',
                'Belgium_Dutch':'123',
                'Belgium_French':'23',
                'Canada':'2',
                'CanadaFrench':'210',
                'China':'223',
                'eBayMotors':'100',
                'France':'71',
                'Germany':'77',
                'HongKong':'201',
                'India':'203',
                'Ireland':'205',
                'Italy':'101',
                'Malaysia':'207',
                'Netherlands':'146',
                'Philippines':'211',
                'Poland':'212',
                'Singapore':'216',
                'Spain':'186',
                'Sweden':'218',
                'Switzerland':'193',
                'Taiwan':'196',
                'UK':'3',
                'US':'0',
                findId:function (country) {
                    var ret = this[country];
                    if (!ret) {
                        ret = 0;
                    }
                    return ret;
                }
            };

            var url = this.urlCreator("http://lapi.ebay.com/ws/eBayISAPI.dll")
                .addParam("EKServer")
                .addParam("ai", "aj|kvpqvqlvxwkl")
                .addParam("bdrcolor", options.borderColor)
                .addParam("fntcolor", options.fontColor)
                .addParam("hdrcolor", options.headerColor)
                .addParam("hdrimage", options.headerImage)
                .addParam("lnkcolor", options.linkColor)
                .addParam("tbgcolor", options.backgroundColor)
                .addParam("si", id)
                .addParam("sid", id)
                .addParam("num", itemCount)
                .addParam("width", options.width)
                .addParam("cid", "0")
                .addParam("eksize", "1")
                .addParam("encode", "UTF-8")
                .addParam("endcolor", "FF0000")
                .addParam("endtime", "y")
                .addParam("fbgcolor", "FFFFFF")
                .addParam("fs", "0")
                .addParam("hdrsrch", "n")
                .addParam("img", "y")
                .addParam("logo", "6")
                .addParam("numbid", "n")
                .addParam("paypal", "n")
                .addParam("popup", "y")
                .addParam("prvd", "9")
                .addParam("r0", "3")
                .addParam("shipcost", "y")
                .addParam("siteid", siteIdMap.findId(registrationSite))
                .addParam("sort", "MetaEndSort")
                .addParam("sortby", "endtime")
                .addParam("sortdir", "asc")
                .addParam("srchdesc", "n")
                .addParam("title", "")
                .addParam("tlecolor", "FFFFFF")
                .addParam("tlefs", "0")
                .addParam("tlfcolor", "000000")
                .addParam("toolid", "10004")
                .addParam("track", "5335838312");

            options.url = url.toString();
            return options;
        },

        _createIFrame:function (width, height) {
            var newIFrame = new IFrame();
            newIFrame.width = this.options.width;
            newIFrame.height = this.options.height;

            // insert or replace
            if (this._iframe) {
                newIFrame.replaces(this._iframe);
            }
            else {
                newIFrame.insertInto(this._skinParts.iFrameHolder);
            }

            // store the frame for future reference
            this._iframe = newIFrame;
            return newIFrame;
        },

        urlCreator: function (baseUrl) {
            return {
                _baseUrl: baseUrl,
                _params: [],
                addParam: function (key, value) {
                    this._params.push({key: key, value: value});
                    return this;
                },
                toString: function () {
                    var ret = [];
                    ret.push(this._baseUrl);
                    if (this._params.length > 0) {
                        ret.push('?');
                    }
                    for (var i = 0; i < this._params.length; i++) {
                        var pair = this._params[i];
                        if (i > 0) {
                            ret.push('&');
                        }
                        ret.push(pair.key);
                        if (pair.value) {
                            ret.push('=');
                            ret.push(encodeURIComponent(pair.value));
                        }
                    }
                    return ret.join('');
                }
            };
        }
    });

});


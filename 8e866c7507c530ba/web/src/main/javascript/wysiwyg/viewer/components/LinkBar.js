define.component('wysiwyg.viewer.components.LinkBar', function (componentDefinition) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('core.components.BaseRepeater');

    def.binds(['_setComponentSize']);

    def.resources(['W.Config']);

    def.dataTypes(['ImageList']);

    def.skinParts({
        'imageItem': { type: 'wysiwyg.viewer.components.LinkBarItem', repeater: true, container: 'itemsContainer', dataRefField: 'items', argObject: {unit: 'px'} },
        'itemsContainer': { type: 'htmlElement' }
    });

    def.propertiesSchemaType('LinkBarProperties');

    def.statics({
        EDITOR_META_DATA: {
            general: {
                settings: true,
                design: false
            },
            custom: [
                {
                    label: 'SOCIAL_BAR_MNG_ICONS',
                    command: 'WEditorCommands.OpenListEditDialog',
                    commandParameter: {
                        galleryConfigID: 'social_icons',
                        source: 'fpp',
                        startingTab: 'free'
                    },
                    commandParameterDataRef: 'SELF'
                }
            ],
            dblClick: {
                command: 'WEditorCommands.OpenListEditDialog',
                commandParameter: {
                    galleryConfigID: 'social_icons',
                    source: 'dblclick',
                    startingTab: 'free'
                },
                commandParameterDataRef: 'SELF'
            }
        }
    });

    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._resizableSides = [];
            this.setMaxH(9999);
            this.setMaxW(9999);

            this._isMobileView = false;
            if (this.resources.W.Config.env.getCurrentFrameDevice() === Constants.ViewerTypesParams.TYPES.MOBILE) {
                this._isMobileView = true;
            }
        },

        _onDataChange: function (dataItem) {
            this.parent();
        },

        render: function () {
            this._iconSize = this.getComponentProperty('iconSize') || 30;
            this._orientation = this.getComponentProperty('orientation');
            this._spacing = this.getComponentProperty('spacing');
            this._bgScale = this.getComponentProperty('bgScale');

            this._setComponentSize();
        },

        _processDataRefs: function (dataRefs) {
            return dataRefs;
        },

        _onRepeaterReady: function (repeaterData) {
            this._itemsAmount = repeaterData.itemsAmount;
            this._items = repeaterData.readyItemsLogic;
        },

        _setComponentSize: function () {
            var w = 0;
            var h = 0;
            var isHoriz = (this._orientation === "HORIZ");

            for (var i = 0; i < this._items.length; i++) {
                var itemLogic = this._items[i];

                var itemViewNode = itemLogic.getViewNode();

                var marginBetweenItems = this._spacing;
                if (i == this._items.length - 1) { //last item
                    marginBetweenItems = 0;
                }

                itemLogic.setSize(this._iconSize, marginBetweenItems, this._bgScale, isHoriz);


                var itemOffsetWidth = itemViewNode.offsetWidth;
                var itemOffsetHeight = itemViewNode.offsetHeight;

                if (isHoriz) {
                    itemViewNode.setStyle("display", "inline-block");
                    h = Math.max(h, itemOffsetHeight);
                    w += itemOffsetWidth;
                }
                else {
                    itemViewNode.setStyle("display", "block");
                    h += itemOffsetHeight;
                    w = Math.max(w, itemOffsetWidth);
                }
            }

            if (this._isMobileView) {
                var mobileWidth = this._items.length < 6 ? (this._items.length * (this._iconSize + this._spacing)) : 300;
                this.setWidth(mobileWidth, true);
                var numOfLines = Math.floor(this._items.length / 7) + 1;
                h = numOfLines * (this._iconSize);
                // Ugly hack to handle "vertical" case for mobile - just swap the "height" + "width" values
                if (!isHoriz) {
                    this.setWidth(h, true);
                    h = mobileWidth - this._spacing; // Remove bottom spacing
                }
            } else {
                this.setWidth(w + 5, true); // 5 => fixes/hacks the situation on browser zoom where the component got a "reish" layout
            }
            this.setHeight(h, true);

            this._wCheckForSizeChangeAndFireAutoSized(3);
        }
    });
});
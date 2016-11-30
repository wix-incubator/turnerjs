define(['lodash'], function (_) {
    "use strict";
    var counter = 0;
    var lastTimestamp = 0;
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    var random = {
        string: function (length) {
            if (length === undefined) {
                length = 6;
            }
            return _.times(length, function () {
                return chars.charAt(_.random(0, chars.length));
            });
        },
        number: function (min, max) {
            if (min === undefined) {
                min = -1000;
            }
            if (max === undefined) {
                max = 1000;
            }
            return _.random(min, max);
        },
        boolean: function () {
            return Boolean(_.now() % 2);
        },
        id: function (prefix) {
            var now = _.now();
            lastTimestamp = now;
            var suffix = (now === lastTimestamp) ? String(++counter) : "";

            prefix = prefix ? prefix.replace(/[^A-Za-z0-9_-]/g, "") : "";
            return prefix + now.toString(36) + suffix;
        }
    };

    function resolveRef(fieldName, refResolvers, baseItem) {
        if (!_.has(refResolvers, fieldName)) {
            throw "Error: must pass getDataItemRef value for field [" + fieldName + "]";
        }
        var refValue = refResolvers[fieldName];
        if (_.isFunction(refValue)) {
            refValue = refValue(baseItem);
        }

        if (typeof refValue !== 'string') {
            refValue = getDataItemRef(refValue);
        }

        if (refValue.charAt(0) !== "#") {
            refValue = "#" + refValue;
        }
        return refValue;
    }

    function applyFieldOverrideMap(baseItem, resolvers) {
        _.forEach(resolvers, function (resolver, key) {
            baseItem[key] = _.isFunction(resolver) ? resolver(baseItem) : resolver;
        });
        return baseItem;
    }

    function getDataItemRef(item) {
        return "#" + item.id;
    }

    function addDataToSiteData(context, item, shouldAddToCurrentPage) {
        if (context && context.siteData) {
            var pageToAddTo = shouldAddToCurrentPage ? context.siteData.pageId : null;
            context.siteData.addData(item, pageToAddTo);
        }
    }

    function addPropertiesToSiteData(context, item) {
        if (context && context.siteData) {
            context.siteData.addData(item);
        }
    }

    function overrideAndAddToSiteData(base, overrideMap) {
        base.id = random.id(base.type);
        applyFieldOverrideMap(base, overrideMap);

        addDataToSiteData(this, base);
        return base;
    }

    /**
     * @lends SiteDataMockData
     */
    var dataMocks = {
        schemas: {
            componentDefinitionBuilder: function () {
                var definition = {};

                function DefinitionMapBuilder() {
                }

                DefinitionMapBuilder.prototype.build = function () {
                    return definition;
                };

                /**
                 *
                 * @param {String} componentType
                 * @param {String[]?} dataTypes
                 * @param {String|String[]?} propertyTypes
                 * @param {object?} styles
                 * @returns {DefinitionMapBuilder}
                 */
                DefinitionMapBuilder.prototype.addComponent = function (componentType, dataTypes, propertyTypes, styles) {
                    var compDefinition = {
                        skins: [],
                        styles: styles || {}
                    };

                    if (dataTypes) {
                        compDefinition.dataTypes = dataTypes;
                    }

                    if (_.isString(propertyTypes)) {
                        compDefinition.propertyType = propertyTypes;
                    }

                    if (_.isArray(propertyTypes)) {
                        compDefinition.propertyTypes = propertyTypes;
                    }

                    definition[componentType] = compDefinition;

                    return this;
                };

                DefinitionMapBuilder.prototype.setDefaultPropertiesType = function (type) {
                    definition.defaultPropertiesType = type;
                    return this;
                };

                return new DefinitionMapBuilder();
            },
            jsonSchemaBuilder: function () {
                var schema = {};

                function DataSchemaBuilder() {
                }

                DataSchemaBuilder.prototype.build = function () {
                    return schema;
                };

                /**
                 *
                 * @param {String} name The data type's name
                 * @param {object} data The data the it's properties will define the properties types in the schema
                 * @param {object?} defaultData The default data for each of the properties of the data schema
                 * @param {object?} requiredFields object with property name set to true for required properties
                 * @returns {DataSchemaBuilder}
                 */
                DataSchemaBuilder.prototype.addSchema = function (name, data, defaultData, requiredFields) {
                    schema[name] = {
                        type: 'object',
                        properties: _.mapValues(data, function (value, key) {
                            var property = {
                                type: typeof value
                            };
                            var defaultValue = _.get(defaultData, key);
                            if (defaultValue) {
                                property.default = defaultValue;
                            } else if (_.get(requiredFields, key)) {
                                property.required = true;
                            }

                            return property;
                        })
                    };

                    return this;
                };

                return new DataSchemaBuilder();
            }
        },
        utils: {
            toRef: function (data) {
                if (_.isArray(data)) {
                    return _.map(data, getDataItemRef);
                }
                return getDataItemRef(data);
            }
        },
        skins: {
            skinBuilder: function () {
                var skin = {};

                function SkinBuilder() {
                }

                SkinBuilder.prototype.build = function () {
                    return skin;
                };

                SkinBuilder.prototype.addParam = function (name, defaultValue, type) {
                    _.set(skin, ['params', name], type);
                    _.set(skin, ['paramsDefaults', name], defaultValue);
                    return this;
                };

                SkinBuilder.prototype.addCss = function (selector, cssDefinitions) {
                    var skinSelector = selector.replace(/\./g, '%_').replace(/#/g, '%');
                    _.set(skin, ['css', skinSelector], cssDefinitions);

                    return this;
                };

                return new SkinBuilder();
            }
        },

        rssButtonData: function (overrideMap) {
            var base = {
                "type": "RssButton",
                "metaData": {
                    "isPreset": true,
                    "schemaVersion": "1.0",
                    "isHidden": false
                },
                "link": null,
                "image": null
            };

            base.id = random.id(base.type);
            applyFieldOverrideMap(base, overrideMap);

            addDataToSiteData(this, base);
            return base;
        },

	    selectableListData: function (overrideMap) {
		    var base = {
			    "type": "SelectableList",
			    "value": "",
			    "options": []
		    };

		    base.id = random.id(base.type);
		    applyFieldOverrideMap(base, overrideMap);
		    addDataToSiteData(this, base);
		    return base;
	    },

	    selectOptionData: function (overrideMap) {
		    var base = {
			    "type": "SelectOption",
			    "value": "",
			    "text": "",
			    "disabled": null
		    };

		    base.id = random.id(base.type);
		    applyFieldOverrideMap(base, overrideMap);
		    addDataToSiteData(this, base);
		    return base;
	    },

        imageData: function (overrideMap, shouldAddToCurrentPage) {
            var base = {
                "type": "Image",
                "link": null,
                "title": "My mock image title",
                "description": "My mock image description",
                "uri": "fb2cfede96be3d1ceebe8f3274af2433.jpg",
                "width": 722,
                "height": 1100,
                "alt": "My mock image alt",
                "originalImageDataRef": null
            };
            base.id = random.id(base.type);
            applyFieldOverrideMap(base, overrideMap);
            if (overrideMap) {
                if (overrideMap.link) {
                    base.link = resolveRef("link", overrideMap, base);
                }
                if (overrideMap.originalImageDataRef) {
                    base.originalImageDataRef = resolveRef("originalImageDataRef", overrideMap, base);
                }
            }

            addDataToSiteData(this, base, shouldAddToCurrentPage);
            return base;
        },
        contactFormData: function (overrideMap) {
            var base = {
                type: "ContactForm",
                addressFieldLabel: "Address",
                bccEmailAddress: "",
                emailFieldLabel: "Email",
                errorMessage: "Please add a valid email.",
                messageFieldLabel: "Message",
                nameFieldLabel: "Name",
                onSubmitBehavior: "message",
                phoneFieldLabel: "Phone",
                subjectFieldLabel: "Subject",
                submitButtonLabel: "Send",
                successMessage: "Success! Message received.",
                textDirection: "left",
                toEmailAddress: "",
                validationErrorMessage: "Please add required info."
            };
            base.id = random.id(base.type);
            applyFieldOverrideMap(base, overrideMap);
            if (overrideMap && overrideMap.link) {
                base.link = resolveRef("link", overrideMap, base);
            }
            return base;
        },
        subscribeFormData: function (overrideMap) {
            var base = {
                type: "ContactForm",
                addressFieldLabel: "Address",
                bccEmailAddress: "",
                emailFieldLabel: "Email",
                errorMessage: "Please add a valid email.",
                messageFieldLabel: "Message",
                nameFieldLabel: "Name",
                onSubmitBehavior: "message",
                phoneFieldLabel: "Phone",
                subjectFieldLabel: "Subject",
                submitButtonLabel: "Send",
                successMessage: "Success! Message received.",
                textDirection: "left",
                toEmailAddress: "",
                validationErrorMessage: "Please add required info."
            };
            base.id = random.id(base.type);
            applyFieldOverrideMap(base, overrideMap);
            if (overrideMap && overrideMap.link) {
                base.link = resolveRef("link", overrideMap, base);
            }
            return base;
        },
        imageProperties: function (overrideMap) {
            var base = {
                "type": "WPhotoProperties",
                "displayMode": "fill",
                "onClickBehavior": "goToLink"
            };
            applyFieldOverrideMap(base, overrideMap);
            base.id = random.id(base.type);

            addPropertiesToSiteData(this, base);
            return base;
        },

        boxSlideShowProperties: function (overrideMap) {
            var base = {
                type: "BoxSlideShowProperties",
                transition: 'SlideHorizontal',
                autoPlay: false,
                autoPlayInterval: 2,
                direction: 'RTL',
                pauseAutoPlayOnMouseOver: false,
                transDuration: 1,
                shouldHideOverflowContent: true,
                flexibleBoxHeight: false,
                showNavigationButton: true,
                navigationButtonSize: 21,
                navigationButtonMargin: 0,
                showNavigationDots: true,
                navigationDotsAlignment: 'center',
                navigationDotsSize: 6,
                navigationDotsMargin: 0,
                navigationDotsGap: 0
            };

            base.id = random.id(base.type);
            applyFieldOverrideMap(base, overrideMap);

            addPropertiesToSiteData(this, base);
            return base;
        },

        sliderGalleryProperties: function (overrideMap) {
            var base = {
                type: "SliderGalleryProperties",
                imageMode: 'clipImage',
                margin: 15,
                maxSpeed: 5,
                aspectRatio: 1,
                aspectRatioPreset: '4:3',
                loop: true,
                showCounter: true,
                expandEnabled: true,
                goToLinkText: 'Go to link',
                galleryImageOnClickAction: 'zoomMode'
            };

            base.id = random.id(base.type);
            applyFieldOverrideMap(base, overrideMap);

            addPropertiesToSiteData(this, base);
            return base;
        },

	    comboBoxInputProperties: function (overrideMap) {
		    var base = {
			    type: "ComboBoxInputProperties",
			    placeholder: null,
			    size: null
		    };

		    base.id = random.id(base.type);
		    applyFieldOverrideMap(base, overrideMap);

		    addPropertiesToSiteData(this, base);
		    return base;
	    },

        imageList: function (overrideMap) {
            var base = {
                "type": "ImageList",
                "items": null
            };
            applyFieldOverrideMap(base, overrideMap);
            base.id = random.id(base.type);
            base.items = overrideMap.items;

            _.forEach(base.items, function (item) {
                addDataToSiteData(this, item);
            });

            addDataToSiteData(this, base);
            return base;
        },

        linkBarProperties: function (overrideMap) {
            var base = {
                "type": "LinkBarProperties",
                "gallery": "social_icons",
                "iconSize": 30,
                "spacing": 5,
                "bgScale": 1,
                "orientation": "HORIZ"
            };
            base = applyFieldOverrideMap(base, overrideMap);
            base.id = random.id(base.type);

            addPropertiesToSiteData(this, base);
            return base;
        },

        externalLinkData: function (overrideMap) {
            var base = {
                "type": "ExternalLink",
                "url": "http://www.wix.com",
                "target": "_blank"
            };
            base.id = random.id(base.type);
            applyFieldOverrideMap(base, overrideMap);

            addDataToSiteData(this, base);
            return base;
        },

        anchorData: function (overrideMap) {
            var base = {
                type: 'Anchor',
                compId: null,
                name: null
            };
            base.id = random.id(base.type);
            applyFieldOverrideMap(base, overrideMap);

            addDataToSiteData(this, base);
            return base;
        },

        emailLinkData: function (overrideMap) {
            var base = {
                type: 'EmailLink',
                recipient: 'x@example.com',
                subject: 'This is a subject',
                body: "",
                render: {}
            };
            return overrideAndAddToSiteData.call(this, base, overrideMap);
        },

        documentLinkData: function(overrideMap) {
            var base = {
                "type": "DocumentLink",
                "docId": "",
                "name": ""
            };
            return overrideAndAddToSiteData.call(this, base, overrideMap);
        },

        phoneLinkData: function(overrideMap) {
            var base = {
                type: 'PhoneLink',
                phoneNumber: ''
            };
            return overrideAndAddToSiteData.call(this, base, overrideMap);
        },

        anchorLinkData: function (overrideMap) {
            var base = {
                type: 'AnchorLink',
                anchorName: 'Scroll to Bottom',
                pageId: null,
                anchorDataId: null
            };
            var knownAnchorNames = {
                SCROLL_TO_TOP: 'Top of Page',
                SCROLL_TO_BOTTOM: 'Bottom of Page'
            };
            var anchorName = knownAnchorNames[_.get(overrideMap, 'anchorDataId')];
            if (anchorName) {
                base = _.assign(base, {anchorName: anchorName, pageId: _.get(overrideMap, 'pageId') || '#masterPage'});
            }
            if (!_.has(base, 'pageId')) {
                base.pageId = this.siteData.getFocusedRootId();
            }
            return overrideAndAddToSiteData.call(this, base, overrideMap);
        },

        pageLinkData: function (overrideMap) {
            var pageOverride = overrideMap && overrideMap.pageId ? {id: overrideMap.pageId} : {};
            var base = {"type": "PageLink"};

            if (!_.has(overrideMap, 'pageId')) {
                var pageData = this.pageData(pageOverride);
                base.pageId = pageData.id;
            }

            return overrideAndAddToSiteData.call(this, base, overrideMap);
        },

        dynamicPageLinkData: function(overrideMap) {
            var base = {
                "type": 'DynamicPageLink',
                "routerId": '',
                "innerRoute": '',
                "anchorDataId": null
            };
            return overrideAndAddToSiteData.call(this, base, overrideMap);
        },

        pageData: function (overrideMap) {
            var base = {
                "type": "Page",
                "hideTitle": true,
                "icon": "",
                "descriptionSEO": "",
                "metaKeywordsSEO": "",
                "pageTitleSEO": "",
                "pageUriSEO": "",
                "hidePage": false,
                "underConstruction": false,
                "tpaApplicationId": 0,
                "pageSecurity": {"requireLogin": false},
                "indexable": true,
                "isLandingPage": false
            };

            base.id = random.id(base.type);
            base.title = base.id;
            applyFieldOverrideMap(base, overrideMap);

            addDataToSiteData(this, base);
            return base;
        },

        buttonData: function(overrideMap) {
            var linkData;
            var linkItem = _.get(overrideMap, 'link', {});
            var linkType = _.get(linkItem, 'type');
            switch (linkType) {
                case 'AnchorLink':
                    linkData = dataMocks.anchorLinkData(linkItem);
                    break;
                case 'EmailLink':
                    linkData = dataMocks.emailLinkData(linkItem);
                    break;
                case 'ExternalLink':
                    linkData = dataMocks.externalLinkData(_.get(overrideMap, 'link'));
                    break;
                case 'PageLink':
                default:
                    linkItem.type = 'PageLink';
                    linkData = dataMocks.pageLinkData(linkItem);
                    break;
            }
            var base = {
                "type": 'LinkableButton',
                "link": '#' + linkData.id.replace('#', ''),
                "label": "MY BUTTON"
            };
            base.id = random.id('buttonData');
            applyFieldOverrideMap(base, overrideMap);

            return base;
        },
        styledTextData: function(overrideMap) {
            var linkList = _.map(_.get(overrideMap, 'linkList'), function(linkItem){
                var linkType = _.get(linkItem, 'type');
                switch (linkType) {
                    case 'AnchorLink':
                        return dataMocks.anchorLinkData(linkItem);
                    case 'EmailLink':
                        return dataMocks.emailLinkData(linkItem);
                    case 'ExternalLink':
                        return dataMocks.externalLinkData(linkItem);
                    case 'PageLink':
                    default:
                        return dataMocks.pageLinkData(_.assign({}, linkItem, {type:'PageLink'}));
                }
            }) || [];
            var base = {
                "type": 'StyledText',
                "styleMapId": 'CK_EDITOR_PARAGRAPH_STYLES',
                "linkList": linkList,
                "text": '<p class="font_8">base text</p>'
            };
            base.id = random.id('styledTextData');
            var _overrideMap = _.cloneDeep(overrideMap);
            delete _overrideMap.linkList;
            applyFieldOverrideMap(base, _overrideMap);

            return base;
        },

        basicMenuItemData: function (overrideMap) {
            var base = {
                type: 'BasicMenuItem',
                isVisible: true,
                isVisibleMobile: true,
                label: "Basic Menu Item",
                items: [],
                link: null
            };
            return overrideAndAddToSiteData.call(this, base, overrideMap);
        },

        menuItemData: function (overrideMap) {
            var id = random.id('menu');
            var base = {
                "type": "BasicMenuItem",
                "label": "Label " + id,
                "isVisible": true,
                "isVisibleMobile": true,
                link: null,
                items: []
            };
            base.id = id;
            applyFieldOverrideMap(base, overrideMap);

            addDataToSiteData(this, base);
            return base;
        },

        customMenuData: function (overrideMap) {
            var base = {
                id: "CUSTOM_MAIN_MENU",
                type: "CustomMenu",
                name: "Custom Main Menu",
                items: []
            };

            applyFieldOverrideMap(base, overrideMap);
            addDataToSiteData(this, base);
            return base;
        },

        menuData: function (overrideMap) {
            var base = {
                "type": "Menu",
                "id": "MAIN_MENU",
                "items": null
            };
            applyFieldOverrideMap(base, overrideMap);
            addDataToSiteData(this, base);
            return base;
        },

        skypeCallButtonData: function (overrideMap) {
            var base = {
                "type": "SkypeCallButton",
                "skypeName": "",
                "buttonType": "call"
            };
            base.id = random.id(base.type);
            applyFieldOverrideMap(base, overrideMap);

            addDataToSiteData(this, base);
            return base;
        },
        skypeCallButtonProperties: function (overrideMap) {
            var base = {
                "type": "SkypeCallButtonProperties",
                "imageSize": "medium",
                "imageColor": "blue"
            };
            base.id = random.id(base.type);
            applyFieldOverrideMap(base, overrideMap);

            addPropertiesToSiteData(this, base);
            return base;
        },

        imageButtonData: function (overrideMap, storage) {
            var refs = {};

            if (overrideMap.defaultImage) {
                refs.defaultImage = random.id("defaultImage");
                storage[refs.defaultImage] = overrideMap.defaultImage;
            }

            if (overrideMap.hoverImage) {
                refs.hoverImage = random.id("hoverImage");
                storage[refs.hoverImage] = overrideMap.hoverImage;
            }

            if (overrideMap.activeImage) {
                refs.activeImage = random.id("activeImage");
                storage[refs.activeImage] = overrideMap.activeImage;
            }

            if (overrideMap.link) {
                refs.link = dataMocks.externalLinkData(overrideMap.link);
                storage[refs.link.id] = refs.link;
            }

            return _.assign(overrideMap, {
                "id": random.id("ImageButton"),
                "type": "ImageButton"
            }, refs);
        },
        imageButtonProperties: function (overrideMap) {
            var base = {
                "type": "ImageButtonProperties",
                "transition": "fade"
            };
            applyFieldOverrideMap(base, overrideMap);

            base.id = random.id(base.type);
            return base;
        },
        buttonProperties: function (overrideMap) {
            var base = {
                type: 'ButtonProperties',
                align: 'center',
                margin: 0
            };

            base.id = random.id(base.type);
            applyFieldOverrideMap(base, overrideMap);

            addDataToSiteData(this, base);

            return base;
        },
        defaultProperties: function (overrideMap) {
            var base = {
                isHidden: false
            };

            base.id = random.id(base.type);
            applyFieldOverrideMap(base, overrideMap);

            addDataToSiteData(this, base);

            return base;
        },
        imageButtonStyle: function (overrideMap) {
            var base = {
                width: 96,
                height: 96
            };
            applyFieldOverrideMap(base, overrideMap);

            return base;
        },

        appPart2Data: function (overrideMap) {
            var base = {
                "type": "AppBuilderComponent",
                "appInnerID": "2",
                "appPartName": "apppartigrs7ixu3"
            };
            base.id = random.id(base.type);

            if (this.siteData) {
	            var appService = _.find(this.siteData.rendererModel.clientSpecMap, {type: 'appbuilder'});
                base.appInnerID = appService.applicationId;
            }

            applyFieldOverrideMap(base, overrideMap);

            addDataToSiteData(this, base);
            return base;
        },

        appPartData: function (overrideMap) {
            var base = {
                "type": "AppPart",
                "appLogicCustomizations": [],
                "appLogicParams": {
                    "collectionId": {
                        "type": "AppPartParam",
                        "value": "Menus"
                    },
                    "itemId": {
                        "type": "AppPartParam",
                        "value": "SampleMenu2"
                    }
                },
                "appInnerID": "15",
                "appPartName": "1660c5f3-b183-4e6c-a873-5d6bbd918224",
                "viewName": "Center"
            };
            applyFieldOverrideMap(base, overrideMap);
            base.id = random.id(base.type);

            addDataToSiteData(this, base);
            return base;
        },

        // TODO: update according to schemas
        textInputProperties: function (overrideMap) {
            var base = {
                type: 'TextInputProperties',
                tabIndex: undefined,
                autoComplete: 'off',
                label: undefined,
                required: undefined,
                isDisabled: undefined,
                autoFocus: undefined,
                readOnly: undefined,
                placeholder: undefined
            };
            applyFieldOverrideMap(base, overrideMap);
            base.id = random.id(base.type);

            addDataToSiteData(this, base);
            return base;
        },

        textInputData: function (overrideMap) {
            var base = {
                type: 'Text',
                formGroup: undefined,
                textType: 'text',
                value: '',
                name: undefined,
                maxLength: undefined,
                min: undefined,
                max: undefined,
                pattern: undefined
            };
            applyFieldOverrideMap(base, overrideMap);
            base.id = random.id(base.type);

            addDataToSiteData(this, base);
            return base;
        },

        backgroundMediaDataWithImage: function (overrideMap, shouldAddToCurrentPage) {
            var base = {
                "id": random.id('background-media'),
                "type": "BackgroundMedia",
                "metaData": {
                    "isPreset": false,
                    "schemaVersion": "1.0",
                    "isHidden": false
                },
                "mediaRef": null,
                "color": "#FAFAFA",
                "colorOpacity": 1,
                "alignType": "center",
                "fittingType": "fill",
                "scrollType": "none",
                "colorOverlay": "",
                "colorOverlayOpacity": 0,
                "imageOverlay": null
            };
            var imageDataItem = this.imageData(null, shouldAddToCurrentPage);
            base.mediaRef = getDataItemRef(imageDataItem);
            applyFieldOverrideMap(base, overrideMap);

            addDataToSiteData(this, base, shouldAddToCurrentPage);

            return base;
        },

        backgroundMediaDataWithVideo: function (overrideMap, shouldAddToCurrentPage) {
            var base = {
                "id": random.id('background-media'),
                "type": "BackgroundMedia",
                "metaData": {
                    "isPreset": false,
                    "schemaVersion": "1.0",
                    "isHidden": false
                },
                "mediaRef": null,
                "color": "#FAFAFA",
                "colorOpacity": 1,
                "alignType": "center",
                "fittingType": "fill",
                "scrollType": "none",
                "colorOverlay": "",
                "colorOverlayOpacity": 0,
                "imageOverlay": null
            };
            var videoDataItem = this.wixVideoData(null, shouldAddToCurrentPage);
            base.mediaRef = getDataItemRef(videoDataItem);
            var imageOverlayDataItem = this.imageData(null, shouldAddToCurrentPage);
            base.imageOverlay = getDataItemRef(imageOverlayDataItem);
            applyFieldOverrideMap(base, overrideMap);
            addDataToSiteData(this, base, shouldAddToCurrentPage);

            return base;
        },



        backgroundMediaDataNoImage: function (overrideMap, shouldAddToCurrentPage) {
            var base = {
                "id": random.id('background-media'),
                "type": "BackgroundMedia",
                "metaData": {
                    "isPreset": false,
                    "schemaVersion": "1.0",
                    "isHidden": false
                },
                "mediaRef": null,
                "color": "#FAFAFA",
                "colorOpacity": 1,
                "alignType": "center",
                "fittingType": "fill",
                "scrollType": "none",
                "colorOverlay": "",
                "colorOverlayOpacity": 0,
                "imageOverlay": null
            };
            applyFieldOverrideMap(base, overrideMap);

            addDataToSiteData(this, base, shouldAddToCurrentPage);

            return base;
        },

        stripContainerDataWithImage: function (overrideMap, shouldAddToCurrentPage) {
            var base = {
                id: random.id('strip-container'),
                type: "StripContainer",
                background: null
            };
            var backgroundMediaDataItem = this.backgroundMediaDataWithImage(null, shouldAddToCurrentPage);
            base.background = getDataItemRef(backgroundMediaDataItem);
            base = applyFieldOverrideMap(base, overrideMap);

            addDataToSiteData(this, base, shouldAddToCurrentPage);

            return base;
        },

        stripContainerDataNoImage: function (overrideMap, shouldAddToCurrentPage) {
            var base = {
                id: random.id('strip-container'),
                type: "StripContainer",
                background: null
            };
            var backgroundMediaDataItem = this.backgroundMediaDataNoImage(null, shouldAddToCurrentPage);
            base.background = getDataItemRef(backgroundMediaDataItem);
            base = applyFieldOverrideMap(base, overrideMap);

            addDataToSiteData(this, base, shouldAddToCurrentPage);

            addDataToSiteData(this, base);
            return base;
        },

        globalImageQualityData: function (overrideMap, addToSite) {
            var base = {
                "id": "IMAGE_QUALITY",
                "type": "GlobalImageQuality",
                "quality": 90,
                "unsharpMask": {
                    "amount": 1,
                    "radius": 1,
                    "threshold": 1
                }
            };
            applyFieldOverrideMap(base, overrideMap);
            if (addToSite) {
                addDataToSiteData(this, base);
            }

            return base;
        },

        controllerData: function (overrideMap, shouldAddToCurrentPage) {
            var base = {
                type: 'AppController',
                applicationId: 'dataBindingId',
                controllerType: 'DataSet'
            };
            base.id = random.id(base.type);
            base = applyFieldOverrideMap(base, overrideMap);

            addDataToSiteData(this, base, shouldAddToCurrentPage);

            return base;
        },

        wixVideoData: function (overrideMap, shouldAddToCurrentPage) {
            var base = {
                "type": "WixVideo",
                "title": "Hara Seret",
                "videoId": "video0001",
                "qualities": {quality: "1080p", width: 1920, height: 1080, formats: ['mp4']},
                "posterImageRef": "",
                "opacity": 1,
                "duration": 60,
                "loop": true,
                "autoplay": false,
                "preload": "auto",
                "controls": true,
                "mute": true,
                "artist": {name: "the best", id: "no.1"}
            };
            base.id = random.id(base.type);
            var imageDataItem = this.imageData(null, shouldAddToCurrentPage);
            base.posterImageRef = getDataItemRef(imageDataItem);
            applyFieldOverrideMap(base, overrideMap);
            addDataToSiteData(this, base, shouldAddToCurrentPage);
            return base;
        }

    };

    return dataMocks;
});

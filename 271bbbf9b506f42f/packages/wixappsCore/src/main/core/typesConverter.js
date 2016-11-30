define(["lodash", 'wixappsCore/core/linksConverter'], function (_, /** wixappsCore.linksConverter */linksConverter) {
    'use strict';

    /**
     * @class wixappsCore.typesConverter
     */
    function getPageLink(getDataById, pageId) {
        if (!pageId) {
            return null;
        }

        var pageLinkData = linksConverter({
            _type: 'wix:PageLink',
            pageId: pageId
        }, getDataById);

        return _.omit(pageLinkData, 'id');
    }

    return {
        richText: function (data, links, siteData, refDataMap) {
            return {
                type: "StyledText",
                text: _.isString(data) ? data : data.text,
                linkList: _.map(links, function (linkData) {
                    return linksConverter(linkData, siteData.getDataByQuery.bind(siteData));
                }),
                innerCompsData: refDataMap
            };
        },

        image: function (data, dataResolver, serviceTopology, packageName, imageQuality) {
            data = dataResolver(data, serviceTopology, packageName);
            var imageData = {
                type: "Image",
                uri: data.src,
                title: data.title,
                width: parseInt(data.width, 10),
                height: parseInt(data.height, 10)
            };

            if (!_.isEmpty(imageQuality)){
                imageData.quality = imageQuality;
            }

            return imageData;
        },

        videoThumb: function (data, dataResolver, serviceTopology) {
            var imageData = {
                src: data.imageSrc,
                title: '',
                width: 480,
                height: 360
            };

            return this.image(imageData, dataResolver, serviceTopology);
        },

        table: function (columnsDefinition) {
            return {
                type: 'Table',
                columnsStyle: _.map(columnsDefinition, function (def, index) {
                    if (!def.item) {
                        throw 'missing definition for item in column ' + index;
                    }

                    return def.item.styleData;
                })
            };
        },

        video: function (data) {
            return {
                type: "Video",
                videoId: data.videoId,
                videoType: data.videoType
            };
        },

        linkableButton: function (data, siteData) {
            var link = data && (data.linkId ? siteData.getDataByQuery(data.linkId) : getPageLink(siteData.getDataByQuery.bind(siteData), data.pageId));
            var label = _.isString(data) ? data : data && data.label;
            return {
                type: "LinkableButton",
                label: _.unescape(label),
                link: link || null
            };
        },

        selectableList: function (data) {
	        return {
		        type: 'SelectableList',
		        options: _.map(data.items, function (item) {
                    return {
	                    type: 'SelectOption',
	                    value: item.value,
	                    text: _.isFunction(item.getText) ? item.getText(data.selectedValue) : item.text,
	                    disabled: item.enabled === false,
	                    description: item.description
                    };
                }),
		        value: data.selectedValue
            };
        },

        text: function (data, maxLength) {
            var compData = {
                type: 'TextInput',
                value: _.unescape(data)
            };

            if (maxLength) {
                compData.maxLength = maxLength;
            }

            return compData;
        },

        numeric: function (data) {
            return {
                type: 'NumericStepper',
                value: _.unescape(data)
            };
        },

        icon: function (data, dataResolver, serviceTopology, packageName) {
            data = dataResolver(data, serviceTopology, packageName);
            return {
                "type": "Icon",
                "url": data.src,
                "width": data.width,
                "height": data.height,
                "title": data.title
            };
        },

        link: linksConverter,

        imageList: function (data, dataResolver, serviceTopology, siteData) {
            var imageQuality = siteData.getGlobalImageQuality();
            return {
                "type": "ImageList",
                "items": _.map(data.items, function (item) {
                    return _.merge(this.image(item, dataResolver, serviceTopology, imageQuality), {
                        "description": item.description || "",
                        "link": this.link(item.link, siteData)
                    });
                }, this)
            };
        }
    };
});

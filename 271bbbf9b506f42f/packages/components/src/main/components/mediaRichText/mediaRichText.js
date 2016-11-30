define([
    'lodash',
    'utils',
    'reactDOM',
    'reactDOMServer',
    'santaProps',
    'textCommon',
    'components/bi/errors',
    'components/components/mediaRichText/galleryHelpers/galleryHelpers'
], function (_, /** utils */ utils, ReactDOM, ReactDOMServer, santaProps, textCommon, errors, galleryHelpers) {
    'use strict';

    var htmlParser = utils.htmlParser;
    var textUtils = textCommon.textComponentsUtils;

    var customTagsRenderedToHtmlMap = {
        'wline': 'div'
    };

    function shouldRenderAsWixComponent(tagName, attributes) {
        return !_.has(customTagsRenderedToHtmlMap, tagName) && _.findWhere(attributes, {name: 'wix-comp'});
    }

    function convertToValidHtmlTag(tagName) {
        return customTagsRenderedToHtmlMap[tagName] || tagName;
    }

    function getMeasuredTextWidth() {
        var measureMap = this.props.siteData.measureMap;
        if (measureMap) {
            this._lastMeasuredWidth = measureMap.width[this.props.id];
        }

        return this._lastMeasuredWidth;
    }

    function _getCompJsonWhichMayThrow(compJsonString, src){
        var compJson = JSON.parse(compJsonString.replace(/&quot;/g, "\""));
        compJson.url = src;
        return compJson;
    }

    function getCompJsonObject(compJsonString, src) {
        try {
            return _getCompJsonWhichMayThrow(compJsonString, src);
        } catch (e) {
            this.props.siteAPI.reportBI(
                errors.MEDIA_RICH_TEXT_WRONG_COMP_DATA,
                {
                    wixCompJson: compJsonString,
                    errorDesc: e.message,
                    errorStack: e.stack
                }
            );
            return undefined;
        }
    }

    function calcInnerContainerIdFromDataQuery(dataquery) {
        return "innerContainer_" + dataquery.replace("#", "");
    }

    function calcInnerIdFromDataQuery(dataquery) {
        return "innerComp_" + dataquery.replace("#", "");
    }

    function setInnerCompCommonStyleDefinitions(props, compJson) {
        var style = props.style;
        style.marginTop = '10px';
        style.marginBottom = '10px';
        style.marginLeft = compJson.marginLeft;
        style.marginRight = compJson.marginRight;
        style.position = 'static';
    }

    function calcInnerComponentStyleByFloatValue(compJson, props) {
        var style = props.style;
        if (compJson.floatValue) {
            style.float = compJson.floatValue;
            style.display = '';
            style.clear = '';
        } else {
            style.display = compJson.display;
            style.clear = 'both';
            style.float = '';
        }
    }

    function addItemPropAttribute(compJson, props) {
        if (_.has(compJson, 'post-cover-photo')) {
            props.addItemProp = true;
        }
    }

    function validateAndFixVideoCompData(props, compJson) {
        props.compProp = {
            showControls: 'temp_show',
            enablejsapi: 1
        };

        addItemPropAttribute(compJson, props);

        return props;
    }

    function validateAndFixImageCompData(linkList, props, compJson) {
        props.compProp = {
            displayMode: 'fitWidthStrict'
        };
        var linkDataQuery = _.get(props, 'structure.linkDataQuery');
        if (linkDataQuery) {
            var id = linkDataQuery.slice(1);
            props.compData.link = _.find(linkList, {id: id});
        }
        addItemPropAttribute(compJson, props);

        return props;
    }

    function convertImagesToQueriesAndPatchGetDataByQuery(objToPatch) {
        // Implementation when there is no style (omitting title and description)
        objToPatch.compData.items = _.map(objToPatch.compData.items, function(imageData) {
            return _.assign({galleryData: objToPatch.compData}, imageData);
        });
    }


    /**
     * @class components.MediaRichText
     * @extends {ReactCompositeComponent}
     * @property {comp.properties} props
     */

    return {
        displayName: "MediaRichText",
        mixins: [textCommon.textCompMixin],
        allowIframes: true,
        //used from the textCompMixin
        convertCompDataTextToHTML: function (nextProps) {
            this.innerComponents = {};
            this.componentDataQueryList = _.clone(nextProps.compData.componentDataList || []);

            this._compData = nextProps.compData;
            this._componentHtml = textUtils.convertDataQueryLinksIntoHtmlAnchors(this._componentHtml, nextProps.compData.linkList, _.partialRight(utils.linkRenderer.renderLink, nextProps.siteData, nextProps.rootNavigationInfo));
            this._componentHtml = this._convertComponentsPlaceHoldersToRenderedComponents(this._componentHtml);
            this._componentHtml = textUtils.mobileTextTransformIfNeeded(
                this._componentHtml,
                {
                    brightness: _.get(nextProps, 'compProp.brightness'),
                    isMobileView: nextProps.siteData.isMobileView(),
                    scale: _.get(nextProps, 'structure.layout.scale'),
                    fontGetter: nextProps.siteData.getFont.bind(nextProps.siteData),
                    colorGetter: nextProps.siteData.getColor.bind(nextProps.siteData)
                }
            );
        },
        _addToCompDataListIfMissing: function (dataQuery) {
            if (!_.includes(this.componentDataQueryList, dataQuery)) {
                this.componentDataQueryList.push(dataQuery);
            }
        },

        _convertComponentsPlaceHoldersToRenderedComponents: function (text) {
            var output = [];

            htmlParser(text, {
                start: function (tagName, attributes, isSingleton, tag) {
                    if (shouldRenderAsWixComponent(tagName, attributes)) {
                        var attrObj = _.reduce(attributes, function (result, attr) {
                            result[attr.name] = attr.value;
                            return result;
                        }, {});
                        var compJson = getCompJsonObject.call(this, attrObj["wix-comp"], attrObj.src);

                        if (compJson) {
                            this._handleInnerComps(compJson, output, tag);
                        }
                    } else {
                        tag = tag.replace('<' + tagName, '<' + convertToValidHtmlTag(tagName));
                        output.push(tag);
                    }
                }.bind(this),
                chars: function (str) {
                    output.push(str);
                },
                end: function (tagName) {
                    output.push("</" + convertToValidHtmlTag(tagName) + ">");
                }
            });

            return output.join("");
        },
        _validateAndFixGalleryCompData: function (defaultBasicProps, compJson) {
            var propsToReturn = {};
            if (santaProps.propsSelectorsFactory.isSantaTypedComponentReactElement(this)) {
                propsToReturn = defaultBasicProps;
            } else {
                var basicComponentPropNames = ["structure", "pageData", "siteData", "siteAPI", "id", "key", "refInParent", "rootId", "currentUrlPageId", "loadedStyles", "style", "usePreloader"];
                _.assign(propsToReturn, _.pick(defaultBasicProps, basicComponentPropNames));
            }

            var galleryJson = galleryHelpers.buildGalleryJsonFromCkData(compJson, this._compData.innerCompsData, defaultBasicProps.style, this.props.loadedStyles);
            galleryJson.id = calcInnerIdFromDataQuery(galleryJson.dataQuery);
            _.assign(propsToReturn, galleryJson);

            convertImagesToQueriesAndPatchGetDataByQuery(propsToReturn);
            return propsToReturn;
        },
        _createInnerComponentProperties: function (compJson) {
            var props = this._createInnerComponentBasicProperties(compJson, compJson.defaultWidth);

            if (compJson.componentType === "wysiwyg.viewer.components.WPhoto") {
                return validateAndFixImageCompData(this._compData.linkList, props, compJson);
            } else if (compJson.componentType === "wysiwyg.viewer.components.Video") {
                return validateAndFixVideoCompData(props, compJson);
            } else if (galleryHelpers.isGalleryComponent(compJson.componentType)) {
                return this._validateAndFixGalleryCompData(props, compJson);
            }

            this.props.siteAPI.reportBI(errors.MEDIA_RICH_TEXT_UNSUPPORTED_COMPONENT, {wixCompJson: compJson});
            return props;
        },
        _getTextCompWidth: function () {
            return getMeasuredTextWidth.call(this) || this.props.style.width || 20; //some components just need their size
        },
        _createInnerComponentBasicProperties: function (compJson, compActualWidth) {
            var _textCompWidth = this._getTextCompWidth();
            var props = santaProps.componentPropsBuilder.getCompProps(compJson, this.props.siteAPI, null, this.props.loadedStyles);

            //when in wixapps, we do not have data query and the comp data is empty
            props.compData = props.compData || _.get(this._compData.innerCompsData, compJson.dataQuery);
            props.usePreloader = false;

            //the inner components cannot have reference
            delete props.ref;

            //set inner component style
            setInnerCompCommonStyleDefinitions(props, compJson);
            calcInnerComponentStyleByFloatValue(compJson, props);
            this._calcInnerCompWidthAndHeight(compActualWidth, compJson, _textCompWidth, props);

            return props;
        },
        _calcInnerCompWidthAndHeight: function (compActualWidth, compJson, textCompWidth, props) {
            var newWidth = textCompWidth,
                originalImageWidth = props.compData && props.compData.width,
                destWidthInPercentage = compJson.width;

            if (_.isNumber(destWidthInPercentage)) {
                newWidth = this._getWidthMultiplier(compJson) * textCompWidth;
            } else if (_.isNumber(originalImageWidth)) {
                newWidth = Math.min(originalImageWidth, textCompWidth);
            }

            props.style.width = newWidth;
            if (compJson.dimsRatio) {
                props.style.height = props.style.width * compJson.dimsRatio;
            } else if (compJson.componentType === "wysiwyg.viewer.components.Video") {
                //video has to have dimsRatio - sometimes, due to old bug the ratio is missing, use default = 0.5625 (16:9)
                props.style.height = props.style.width * 0.5625;
            }
        },

        /**
         * If in mobile we want the width to always take 100% else what the user chose
         * @param compJson
         * @private
         */
        _getWidthMultiplier: function (compJson) {
            return this.props.siteData.isMobileView() ? 0.99 : compJson.width;
        },
        /**
         * After the component updated we re-render the components so that the events (like click, hover, etc...) will be hooked and binded by react
         */
        _replaceWixCompPlaceholdersWithLiveReactElements: function () {
            var domNode = ReactDOM.findDOMNode(this);
            _.forEach(this.componentDataQueryList, function (dataQuery) {
                var innerCompId = calcInnerIdFromDataQuery(dataQuery);
                if (this.innerComponents[innerCompId]) {
                    var innerCompContainerId = calcInnerContainerIdFromDataQuery(dataQuery),
                        innerClass = this.innerComponents[innerCompId].class,
                        innerProperties = this.innerComponents[innerCompId].props;

                    ReactDOM.render(innerClass(innerProperties), domNode.querySelector("#" + innerCompContainerId));
                } else {
                    //we have component data query in the data list but we do not have a place holder for it in the text inner html
                    this.props.siteAPI.reportBI(
                        errors.MEDIA_RICH_MISSING_COMPONENT_PLACEHOLDER,
                        {
                            dataQuery: dataQuery
                        }
                    );
                }
            }, this);
        },
        componentDidUpdate: function () {
            this._replaceWixCompPlaceholdersWithLiveReactElements();
        },
        componentDidMount: function () {
            this._replaceWixCompPlaceholdersWithLiveReactElements();
        },
        _handleInnerComps: function (compJson, output, tag) {
            if (compJson.componentType === 'htmlComp') {
                this._handleHtmlComp(compJson, output, tag);
            } else {
                this._handleInnerMediaComp(compJson, output, tag);
            }
        },
        _handleInnerMediaComp: function (compJson, output) {
            var innerCompId = calcInnerIdFromDataQuery(compJson.dataQuery);
            var innerContainerId = calcInnerContainerIdFromDataQuery(compJson.dataQuery);
            var innerProps = this._createInnerComponentProperties(compJson);
            var innerClass = utils.compFactory.getCompClass(compJson.componentType);

            this.innerComponents[innerCompId] = {
                'props': innerProps,
                'class': innerClass
            };

            this._addToCompDataListIfMissing(compJson.dataQuery);
            this.toggleRenderToString(true);
            output.push("<div id='" + innerContainerId + "'>" + ReactDOMServer.renderToString(innerClass(innerProps)) + "</div>");
            this.toggleRenderToString(false);
        },

        _handleHtmlComp: function (compJson, output, tag) {
            var permUrl = this.props.siteData.serviceTopology.staticHTMLComponentUrl;
            var tempUrl = '//0.htmlcomponentservice.com/';
            var htmlCompUrl;

            function stripProtocolFromUrl(url) {
                return url.replace(/^(https?:)?\/\//, '');
            }

            if (compJson.type === 'website') {
                htmlCompUrl = '//' + stripProtocolFromUrl(compJson.websiteUrl);
            } else {
                var baseUrl = compJson.urlStatus === 'temp' ? tempUrl : permUrl;
                htmlCompUrl = baseUrl + compJson.relativeUrl;
            }

            var style = '';
            if (compJson.align === 'center') {
                style = 'display: block; clear: both; margin: 0 auto;';
            } else {
                style = 'float:' + compJson.align + ';';
            }

            tag = tag.replace(/src=(".*?")/, 'src="' + htmlCompUrl + '"' + ' style="' + style + '" sandbox="allow-scripts allow-same-origin allow-popups" ');
            tag = tag.replace(/wix-comp=(".*?")/, '');
            if (this.props.siteData.isMobileView() && compJson.dimsRatio) {
                tag = tag.replace(/width=(".*?")/, 'width="99%"');

                if (compJson.dimsRatio > 1) {
                    var calculatedWidth = this._getTextCompWidth() ? parseInt(this._getTextCompWidth(), 10) : 1;
                    var actualHeight = (0.99 * calculatedWidth) * compJson.dimsRatio;

                    tag = tag.replace(/height=(".*?")/, 'height="' + actualHeight + 'px"');
                }
            } else {
                tag = tag.replace(/width=(".*?")/, 'width="' + compJson.width + '"');
            }
            output.push(tag);
        }
    };
});

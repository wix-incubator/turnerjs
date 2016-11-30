/**
 * @class wysiwyg.common.utils.TextStylesMigration
 */
define.Class('wysiwyg.common.utils.TextStylesMigration', function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.utilize(['wysiwyg.common.utils.TextMigrationStylesHelper',
        'wysiwyg.common.utils.TextMigrationDomHelper']);

    def.resources(['W.Utils', 'W.Data', 'W.Config', 'W.Theme']);

    def.fields({
        _changeableTagList:['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div'],
        _deprecatedStyleClass:['font_1', 'font_10']
    });

    def.methods({
        initialize:function () {
            this._domHelper = new this.imports.TextMigrationDomHelper();
            this._styleMap = this.resources.W.Data.getDataByQuery('#CK_EDITOR_FONT_STYLES').get('items');
            var self = this;
            if (this.resources.W.Config.env.$isEditorFrame) {
                this.resource.getResourceValue('W.Preview', function (preview) {
                    preview.getPreviewManagersAsync(self._initViewerManagers, self);
                });

            } else {
                this._initViewerManagers(this.resources.W);
            }
        },

        _initViewerManagers: function(managers){
            this._viewer = {
                theme:managers.Theme,
                data:managers.Data
            };
            this._stylesHelper = new this.imports.TextMigrationStylesHelper(managers.Theme, this._domHelper);
        },

        /**
         *
         * @param element - a block level element, which might contain other block elements
         * @param defaultTag
         * @param defaultClass
         * @private
         */
        migrateElement: function(element, defaultTag, defaultClass){
            var simpleElementsQueue = [];
            var elementChildren =  this._domHelper.collectionToArray(element.childNodes);
            elementChildren.forEach(function(child){
                if (!this._domHelper.isBlockElement(child)) {
                    simpleElementsQueue.push(child);
                }
                else {
                    if (simpleElementsQueue.length > 0) {
                        this._applyStyleOnElements(simpleElementsQueue, defaultTag, defaultClass);
                        simpleElementsQueue = [];
                    }
                    var BlockNotChangeable = !this._changeableTagList.contains(child.tagName.toLowerCase()) || this._domHelper.hasBlockElementChildren(child);
                    if (BlockNotChangeable) {
                        this.migrateElement(child, defaultTag, defaultClass);
                    } else{
                        this._applyStyleOnBlock(child, defaultTag, defaultClass);
                    }
                }
            }, this);
            if (simpleElementsQueue.length > 0) {
                this._applyStyleOnElements(simpleElementsQueue, defaultTag, defaultClass);
            }
        },

        /**
         *
         * @param inlineElements - an array of inline elements or text nodes, which should be wrapped with a block tag
         * @param defaultTag
         * @param defaultClass
         * @private
         */
        _applyStyleOnElements: function(inlineElements, defaultTag, defaultClass){
            if(this._domHelper.isOnlyWhiteSpace(inlineElements)){
                return;
            }
            var wrapper = new Element('p');

            wrapper.inject(inlineElements[0], 'before');
            wrapper.adopt(inlineElements);
            this._applyStyleOnBlock(wrapper, defaultTag, defaultClass);
        },
        /**
         *
         * @param blockElement - a block level element which contains text/inline elements, should be replaced with correct tag
         * @param defaultTag
         * @param defaultClass
         * @private
         */
        _applyStyleOnBlock: function(blockElement, defaultTag, defaultClass){
            //TODO: think what to do here...
            if (blockElement.childNodes.length === 0) {
                LOG.reportError(wixErrors.TEXT_MIGRATION_EMPTY_BLOCK_ELEMENT, "TextStylesMigration", "_applyStyleOnBlock");
                return ;
            }
            this._stylesHelper.flattenStyledSpans(blockElement);
            var blockStyle = null;
            if (this._stylesHelper.isBlockContainUnstyledText(blockElement)) {
                var wrapper = this._replaceBlockWithDefaultTag(blockElement, defaultTag, defaultClass);
                var styledSpans = this._stylesHelper.getStyledSpansRecursive(wrapper, []);
                this._removeStyleClassesReplaceWithInline(null, styledSpans);
            }
            else {
                blockStyle = this._moveStyleClassToBlockParentElement(blockElement);
                if (blockStyle) {
                    this._moveInlineStyleFromOriginalElementToBlockParentElement(blockElement, blockStyle);
                }
            }
            this._verifyNoStyledSpans(blockElement, blockStyle);
        },

        _verifyNoStyledSpans: function(block, blockStyle){
            var spans = block.getElements('span[class*="font_"]');
            if (spans.length) {
                LOG.reportError(wixErrors.TEXT_MIGRATION_MISSED_STYLED_SPANS, "TextStylesMigration", "_applyStyleOnBlock", block.outerHTML);
                this._removeStyleClassesReplaceWithInline(blockStyle, spans);
            }
        },


        _replaceBlockWithDefaultTag:function (element, defaultTag, defaultClass) {
            //TODO: do something if no default tag
            if (!defaultTag || !defaultClass) {
                LOG.reportError(wixErrors.TEXT_MIGRATION_DEFAULT_VALUES_NOT_PROVIDED, "TextStylesMigration", "_replaceBlockWithDefaultTag");
                return;
            }
            //if element is already wrapped...
            if (element && element.tagName === defaultTag && element.hasClass(defaultClass)) {
                return;
            }
            var nodeWithDefaultTag = this._domHelper.renameNode(element, defaultTag);
            nodeWithDefaultTag.addClass(defaultClass);
            return nodeWithDefaultTag;
        },

        /**
         * adds the most common style class on the block element.
         * and changes the styled spans in the block
         * @param {Element} blockElement - contains only styled text
         * @return {String|Null} the most common style
         * @private
         */
        _moveStyleClassToBlockParentElement:function (blockElement) {
            var styledSpans = this._stylesHelper.getStyledSpansRecursive(blockElement, []);
            var mostCommonStyleClass = this._stylesHelper.getMostCommonStyle(styledSpans);
            var oldClass = null;
            if (mostCommonStyleClass) {
                var newStyleClass =  this._replaceDeprecatedStyleIfNeeded(mostCommonStyleClass);
                //deprecated
                if (newStyleClass != mostCommonStyleClass) {
                    oldClass = mostCommonStyleClass;
                    mostCommonStyleClass = newStyleClass;
                }

                //move style to block element
                blockElement.addClass(mostCommonStyleClass);
                this._removeStyleClassesReplaceWithInline(mostCommonStyleClass, styledSpans);
                //deprecated
                if(oldClass){
                    this._addFontSizeOnBlockIfNeeded(blockElement, mostCommonStyleClass, oldClass);
                }
                return mostCommonStyleClass;
            }
            return null;
        },

        _replaceDeprecatedStyleIfNeeded: function(styleClass) {
            if (this._isStyleDeprecated(styleClass)) {
                return this.getReplacingStyle(styleClass);
            }
            return styleClass;
        },

        _addFontSizeOnBlockIfNeeded: function(element, newStyle, oldStyle){
            var oldFontSize = this._viewer.theme.getProperty(oldStyle).getSize();
            var newFontSize = this._viewer.theme.getProperty(newStyle).getSize();
            if(oldFontSize < newFontSize){
                element.setStyle('font-size', oldFontSize);
            }
        },

        getReplacingStyle: function(styleClass) {
            return 'font_8';
        },

        _isStyleDeprecated: function(styleClass) {
            return this._deprecatedStyleClass.contains(styleClass);
        },

        //============================= _removeStyleClassesReplaceWithInline============================

        /**
         * removes the spans that have the blockStyleClass.
         * in other styled spans removed the class attribute and adds the delta between the styles as inline style
         * @param blockStyleClass
         * @param styledSpans
         * @private
         */
        _removeStyleClassesReplaceWithInline: function(blockStyleClass, styledSpans) {
            styledSpans.map(function(element) {
//                if (element.childNodes.length > 0) {
                    var elementStyleClass = this._stylesHelper.getElementStyleClass(element);

                    if(elementStyleClass == blockStyleClass){
                        if(element.childNodes.length === 0){
                            element.destroy();
                        } else{
                            this._removeStyleFromSpan(element, blockStyleClass);
                        }
                    }
                    else {
                        this._domHelper.removeClass(element, elementStyleClass);
                        if(element.getProperty('class').length === 0){
                            element.removeAttribute('class');
                        }
                        this._setStyleOverrides(blockStyleClass, elementStyleClass, element);
                    }
//                }
            },this);
        },
        _removeStyleFromSpan: function(element, styleClass) {
            element.removeClass(styleClass);
            //in case styled span doesn't have more attributes, it's removed.
            if(!this._domHelper.isElementHasAttributes(element)){
                this._domHelper.replaceElementWithItsChildren(element);
            }
        },

        _setStyleOverrides: function(blockStyleClass, elementStyleClass, element) {
            var styleDeltaMap = this._stylesHelper.getStyleDelta(blockStyleClass, elementStyleClass);
            var node = element;
            Object.forEach(styleDeltaMap, function (value, key) {
                node.setStyle(key, value);
            });
            var color = this._stylesHelper.getColorDelta(blockStyleClass, elementStyleClass);
            if(!color){
                return;
            }
            if(color.isRef){
                node.addClass(color.value);
            } else{
                node.setStyle('color', color.value);
            }
        },

        // END=====END=================== _removeStyleClassesReplaceWithInline============================

        _moveInlineStyleFromOriginalElementToBlockParentElement:function (blockElement, blockStyleClass) {
            var lineHeightValue;
            var styleClassThemeProperty = this._viewer.theme.getProperty(blockStyleClass);
            var isFontClass = styleClassThemeProperty.getOriginalClassName() === 'core.utils.css.Font';
            if (isFontClass) {
                lineHeightValue = styleClassThemeProperty.getLineHeight();
            }
            if (lineHeightValue) {

                blockElement.setStyle('line-height', lineHeightValue);

                this._createWrapperSpanWithBlockLineHeight(blockElement, lineHeightValue);

                blockElement = this._setBlockElementTagAccordingToStyle(blockElement, blockStyleClass);
            }

            return blockElement;
        },

        _createWrapperSpanWithBlockLineHeight:function (blockElement, lineHeightValue) {
            var lineHeightElement = document.createElement('span');
            lineHeightElement.setStyle('line-height', lineHeightValue);
            this._domHelper.moveChildren(blockElement, lineHeightElement);
            blockElement.appendChild(lineHeightElement);
        },
        
        _setBlockElementTagAccordingToStyle:function (blockElement, blockStyleClass) {
            var newBlockTag = this._styleMap[blockStyleClass].seoTag;
            return this._domHelper.renameNode(blockElement, newBlockTag);
        }
    });
});
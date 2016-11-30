/**
 * studio migration, doesn't apply line-height on the blocks, and doesn't add the line height span
 */
define.experiment.Class('wysiwyg.common.utils.TextStylesMigration.RichTextMigrationStudio', function(classDefinition){
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.methods({
        migrateElement: function(element, defaultTag, defaultClass){
            this._hasStyleOverrides = false;
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
            return this._hasStyleOverrides;
        },

        _moveInlineStyleFromOriginalElementToBlockParentElement:function (blockElement, blockStyleClass) {
            var styleClassThemeProperty = this._viewer.theme.getProperty(blockStyleClass);
            var isFontClass = styleClassThemeProperty.getOriginalClassName() === 'core.utils.css.Font';
            if (isFontClass) {
                blockElement = this._setBlockElementTagAccordingToStyle(blockElement, blockStyleClass);
            }
            return blockElement;
        },

        _removeStyleClassesReplaceWithInline: function(blockStyleClass, styledSpans, parentBlock) {
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
                    var isSetOverrides = this._setStyleOverrides(blockStyleClass, elementStyleClass, element);
                    if(isSetOverrides){
                        this._hasStyleOverrides = true;
                    }
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
//
        _setStyleOverrides: function(blockStyleClass, elementStyleClass, element) {
            var setOverrides = false;
            var styleDeltaMap = this._stylesHelper.getStyleDelta(blockStyleClass, elementStyleClass);
            var node = element;
            Object.forEach(styleDeltaMap, function (value, key) {
                node.setStyle(key, value);
                setOverrides = true;
            });
            var color = this._stylesHelper.getColorDelta(blockStyleClass, elementStyleClass);
            if(!color){
                return setOverrides;
            }
            if(color.isRef){
                node.addClass(color.value);
                setOverrides = true;
            } else{
                node.setStyle('color', color.value);
                setOverrides = true;
            }
            return setOverrides;
        }
    });

});
/**
 * @class wysiwyg.common.utils.TextMigrationStylesHelper
 */
define.Class('wysiwyg.common.utils.TextMigrationStylesHelper', function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.resources(['tags']);

    def.methods({
        initialize: function(themeManager, domHelper){
            this._theme = themeManager;
            this._domHelper = domHelper;
        },

        getMostCommonStyle:function (styledSpans) {
            var stylesLengthMap = {};
            styledSpans.forEach(function (element) {
                var elementStyle = this.getElementStyleClass(element);
                stylesLengthMap[elementStyle] = stylesLengthMap[elementStyle] || 0;
                stylesLengthMap[elementStyle] += element.get('text').length;
            }, this);

            return this._getEntryWithMaxValue(stylesLengthMap);
        },

        _getEntryWithMaxValue: function(map){
            var max = 0;
            var selectedEntry = null;
            Object.forEach(map, function(value, key){
                if(value > max){
                    max = value;
                    selectedEntry = key;
                }
            });
            return selectedEntry;
        },

        flattenStyledSpans: function(element){
            if(this.getElementStyleClass(element)){
                this._flattenStylesInSpan(element);
            }
            if(!this._isContainStyleSpans(element)){
                return;
            }
            var styledSpansFirstLevel = this.getStyledSpansRecursive(element, []);
            styledSpansFirstLevel.forEach(this._flattenStylesInSpan, this);

        },

        /**
         * for <s1>bla<a><b/><s2><c/></a></s1> - > <s1>bla<a><b/></a></s1> <a><s2/></a> <s1><a><c/></a></s1>
         * @param styledSpan
         * @private
         */
        _flattenStylesInSpan: function(styledSpan){
            if(!this._isContainStyleSpans(styledSpan)){
                return;
            }
            var styledSpanBefore = styledSpan.clone(false); //clone without contents
            var childNodes = this._domHelper.collectionToArray(styledSpan.childNodes);
            for(var i = 0; i< childNodes.length; i++){
                var child = childNodes[i];
                if(!this.getElementStyleClass(child) && !this._isContainStyleSpans(child)){
                    styledSpanBefore.adopt(child);
                } else{  //this is element contains different style
                    var unstyledWrapper = child.clone(false);
                    var wrappedStyledSpan = this._getStyledSpanWithItsParents(child, unstyledWrapper);
                    if(unstyledWrapper.firstChild){
                        styledSpanBefore.adopt(unstyledWrapper);
                    }
                    styledSpanBefore.inject(styledSpan, 'before');
                    wrappedStyledSpan.inject(styledSpan, 'before');
                    this.flattenStyledSpans(wrappedStyledSpan); //s2
                    this._flattenStylesInSpan(styledSpan);  //s1 that is after s2
                    return;
                }
            }
        },

        _getStyledSpanWithItsParents: function(element, unstyledWrapper){
            if(this.getElementStyleClass(element)){
                return element;
            }
            var wrappedStyledSpan = element.clone(false);
            var childNodes = this._domHelper.collectionToArray(element.childNodes);
            for( var i = 0; i< childNodes.length; i++){
                var child = childNodes[i];
                if(!this.getElementStyleClass(child) && !this._isContainStyleSpans(child)){
                    unstyledWrapper.adopt(child);
                }
                else{    //this is element contains different style
                    var childUnstyledWrapper = child.clone(false);
                    var childWrappedStyledSpan = this._getStyledSpanWithItsParents(child, childUnstyledWrapper);
                    wrappedStyledSpan.adopt(childWrappedStyledSpan);
                    if(childUnstyledWrapper.firstChild){
                        unstyledWrapper.adopt(childUnstyledWrapper);
                    }
                    return wrappedStyledSpan;
                }
            }
            return wrappedStyledSpan;
        },

        _isContainStyleSpans: function(element){
            return this._domHelper.isDomElement(element) && element.getElements('span[class*="font_"]').length;
        },

        /**
         * we get here only when all the text in element in styled
         * @param {Element} element
         * @param {Array<Element>} styledSpans - will add the styled spans in element to this param
         * @return {Array<Element>} all the styled spans in element
         * @private
         */
        getStyledSpansRecursive:function (element, styledSpans) {
            //if the element is not text
            if (this._domHelper.isDomElement(element)) {
                var elementStyleClass = this.getElementStyleClass(element);
                if (elementStyleClass && element.tagName.toLowerCase() === 'span') {
                    styledSpans.push(element);
                }
                else {
                    element.getChildren().each(function (child) {
                        styledSpans.concat(this.getStyledSpansRecursive(child, styledSpans));
                    }, this);
                }
            }
            return styledSpans;
        },

        isBlockContainUnstyledText:function (element) {
            if (this._domHelper.isTextNode(element)) {
                return true;
            }
            if (this.getElementStyleClass(element)) {
                return false;
            }
            var children = this._domHelper.collectionToArray(element.childNodes);
            for (var i=0; i< children.length; i++) {
                if (this.isBlockContainUnstyledText(children[i])) {
                    return true;
                }
            }
            return false;
        },

        getElementStyleClass:function (element) {
            var classes = element.classList;
            if (!classes) {
                return null;
            }
            for (var i = 0; i < classes.length; i++) {
                if (classes[i].indexOf("font_") > -1) {
                    return classes[i];
                }
            }
            return null;
        },


        /**
         *
         * @param {String|Null} blockStyleClass - the block style or null in case of default style
         * @param {String} elementStyleClass
         * @return {Object}
         * @private
         */
        getStyleDelta:function (blockStyleClass, elementStyleClass) {
            var blockStyle = blockStyleClass && this._theme.getProperty(blockStyleClass);
            var elementStyle = this._theme.getProperty(elementStyleClass);
            var elementStyleValue = {};
            var styleKeys = ['font-family', 'font-size', 'font-style', 'font-variant', 'font-weight', 'line-height'];
            styleKeys.each(function (key) {
                var keyGetter = this._createStyleKeyGetter(key);
                if (!blockStyle || blockStyle[keyGetter]() != elementStyle[keyGetter]()) {
                    elementStyleValue[key] = elementStyle[keyGetter]();
                }
            }, this);
            return elementStyleValue;
        },

        _createStyleKeyGetter:function (key) {
            var capitalizationIndex = key.indexOf('-') + 1;
            var keyGetter = '';
            if (capitalizationIndex > 0) {
                keyGetter = key.split('-').map(function (word) {
                    return word.charAt(0).toUpperCase() + word.slice(1);
                }).join('');
            }
            else {
                keyGetter = key.charAt(0).toUpperCase() + key.slice(1);
            }
            if (keyGetter.contains('Font') && keyGetter !== 'FontFamily') {
                keyGetter = keyGetter.replace('Font', '');
            }
            return 'get' + keyGetter;
        },

        getColorDelta: function(blockStyleClass, elementStyleClass){
            var blockStyle = blockStyleClass && this._theme.getProperty(blockStyleClass);
            var elementStyle = this._theme.getProperty(elementStyleClass);
            if(!elementStyle){
                return null;
            }
            //color from palette
            var elementColorReference = elementStyle.getColorReference();
            if(elementColorReference){
                if(!blockStyle ||!blockStyle.getColorReference() || blockStyle.getColorReference() !== elementColorReference){
                    return {
                        'isRef' : true,
                        'value': elementColorReference
                    };
                }
            } else if(!blockStyle || blockStyle.getColorReference() || blockStyle.getColor() !== elementStyle.getColor()) {
                return {
                    'isRef' : false,
                    'value': elementStyle.getColor()
                };
            }
            return null;
        }
    });
});
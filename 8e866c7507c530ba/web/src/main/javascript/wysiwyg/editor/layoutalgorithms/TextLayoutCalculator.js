define.Class('wysiwyg.editor.layoutalgorithms.TextLayoutCalculator', function (classDefinition) {

    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.resources(['W.Utils', 'W.Data']);

    def.inherits('wysiwyg.common.utils.TextCalculator');

    def.methods({

        initialize: function(modules) {
        },

        getNodeGlobalPosition: function(node) {
            return W.Preview.getNodeGlobalPosition(node);
        },

        getSiteNode: function() {
            return W.Preview.getSiteNode();
        },

        getPositionOffset: function(){
            return {x: 0, y: W.Editor.getEditorUI().getMainBarHeight()};
        },


        _getPreviewOffset: function(){
            return {x: 0, y: W.Editor.getEditorUI().getMainBarHeight()};
        },

        _setDefaultStyleIfNeeded: function (node, filedName, defValue) {
            if (node.style[filedName] === "") {
                node.style[filedName] = defValue;
            }
        },
        
        _fixRichTextNewSkinStyle: function (node) {
            if (node.nodeName === "P" ||
                node.nodeName === "H1" ||
                node.nodeName === "H2" ||
                node.nodeName === "H3" ||
                node.nodeName === "H4" ||
                node.nodeName === "H5" ||
                node.nodeName === "H6"
                ) {
                this._setDefaultStyleIfNeeded(node, "line-height", "normal");
                this._setDefaultStyleIfNeeded(node, "margin", 0);
                this._setDefaultStyleIfNeeded(node, "letter-spacing", "normal");
            }

            if (node.nodeName === "UL") {
                this._setDefaultStyleIfNeeded(node, "list-style-type", "disc");
                this._setDefaultStyleIfNeeded(node, "padding-left", "1.3em");
                this._setDefaultStyleIfNeeded(node, "margin-left", "0.5em");
                this._setDefaultStyleIfNeeded(node, "line-height", "normal");
                this._setDefaultStyleIfNeeded(node, "letter-spacing", "normal");
                this._setDefaultStyleIfNeeded(node, "list-style-type", "circle");

                if (node.dir="rtl") {
                    this._setDefaultStyleIfNeeded(node, "padding-rigth", "1.3em");
                    this._setDefaultStyleIfNeeded(node, "margin-right", "0.5em");
                }
            }

            if (node.nodeName === "OL") {
                this._setDefaultStyleIfNeeded(node, "list-style-type", "decimal");
                this._setDefaultStyleIfNeeded(node, "padding-left", "1.3em");
                this._setDefaultStyleIfNeeded(node, "margin-left", "0.5em");
                this._setDefaultStyleIfNeeded(node, "line-height", "normal");
                this._setDefaultStyleIfNeeded(node, "letter-spacing", "normal");
                this._setDefaultStyleIfNeeded(node, "list-style-type", "circle");

                if (node.dir="rtl") {
                    this._setDefaultStyleIfNeeded(node, "padding-rigth", "1.3em");
                    this._setDefaultStyleIfNeeded(node, "margin-right", "0.5em");
                }
            }

            if (node.nodeName === "LI") {
                this._setDefaultStyleIfNeeded(node, "color", "inherit");
                this._setDefaultStyleIfNeeded(node, "font-size", "inherit");
                this._setDefaultStyleIfNeeded(node, "font-family", "inherit");
                this._setDefaultStyleIfNeeded(node, "font-style", "inherit");
                this._setDefaultStyleIfNeeded(node, "font-weight", "inherit");
                this._setDefaultStyleIfNeeded(node, "font-height", "normal");
                this._setDefaultStyleIfNeeded(node, "letter-spacing", "normal");
            }
        },
        _convert2originalFontStyle:function(node) {
            if (!node.hasClass) {
                return;
            }

            for (var i = 0; i < W.Preview.getPreviewManagers().Theme.getOriginalFontSizes().length; i++) {
                var fontKey = "font_" + i;
                if (node.hasClass(fontKey)) {
                    var font = W.Preview.getPreviewManagers().Theme.getProperty(fontKey);
                    node.style.font = font.getCssValue();
                    node.style["font-size"] = W.Preview.getPreviewManagers().Theme._originalFontValues[i] + "px";
                    return;
                }
            }
        },
        _wrapTextInSpan:function(element) {
            this._convert2originalFontStyle(element);

            for (var i=0; i<element.childNodes.length; i++) {
                var node = element.childNodes[i];
                if ( this._shouldWrapInSpan(node)) {
                    var newSpan = new Element('span');
                    newSpan.set('html',node.data);
                    element.insertBefore(newSpan, node.nextSibling);
                    element.removeChild(node);
                } else {
                    this._fixRichTextNewSkinStyle(node);
                    this._wrapTextInSpan(node);
                }
            }
        },
        
        _drawDivs:function(rects, relative) {
            if (!relative) {
                relative = {x:0, y:0};
            }
            _.each(
                rects,
                function(rect) {
                    var div = new Element('div');
                    div.style.position="absolute";
                    div.style.visibility="visible";
                    div.style.top=(rect.top+relative.y + window.scrollY + W.Editor.getStateBarSize().y) + "px";
                    div.style.left=(rect.left+relative.x) + "px";
                    div.style.width=rect.width + "px";
                    div.style.height=rect.height + "px";
                    div.style.border = "1px solid";
                    window.document.body.appendChild(div);
                }
            );
        },

        calcAverageCharactersFontSize:function(node) {
            var fontSizesToNumberOfCharacters = this._getFontSizeToNumberOfCharactersMap(node);
            return this._calcAverageFontSize(fontSizesToNumberOfCharacters);
        },

        _calcAverageFontSize: function (fontSizesToNumberOfCharacters) {
            var summury = _.reduce(fontSizesToNumberOfCharacters, function (result, num, key) {
                result.count += num;
                result.sum += num * key;
                return result;
            }, {count: 0, sum: 0});

            return summury.sum / summury.count;
        },

        _getFontSizeToNumberOfCharactersMap: function (node, inheritedFontSize) {
            var map = {};
            if (node.children) {
                for (var childIndex = 0; childIndex< node.children.length; childIndex++) {
                    var child = node.children[childIndex];
                    var childFontSize = this._getNodeFontSize(child, inheritedFontSize);
                    var recursiveCallResultMap = this._getFontSizeToNumberOfCharactersMap(child, childFontSize);
                    this._mergeMaps(
                        recursiveCallResultMap,
                        map
                    );

                    this._addChildNumOfCharactersToMap(child, childFontSize, map);
                }
            }

            return map;
        },

        _addOrUpdate: function (map, key, value) {
            if (map[key]) {
                map[key] += value;
            } else {
                map[key] = value;
            }
        },

        _mergeMaps: function (fromMap, toMap) {
            for (key in fromMap) {
                this._addOrUpdate(toMap, key, fromMap[key]);
            }
        },

        _addChildNumOfCharactersToMap: function (child, childFontSize, fontSizes) {
            if (isNaN(childFontSize)) {
                return;
            }

            var numOfCharsInChild = this.resources.W.Utils.mobile.calcNodeDirectCharacters(child); //calc the direct charectars of a node - they are effected by it's size
            if (numOfCharsInChild > 0) {
                this._addOrUpdate(fontSizes, childFontSize, numOfCharsInChild);
            }
        },

        _getNodeFontSize: function (node, inheritedFontSize) {
            var fontSize = this.resources.W.Utils.mobile.getFontSize(node, W.Preview.getPreviewManagers().Theme);
            if (isNaN(fontSize)) {
                fontSize = inheritedFontSize;
            }

            return fontSize;
        }
    });

});
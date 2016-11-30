define.Class('wysiwyg.common.utils.TextCalculator', function(classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.resources(['W.Utils']);

    def.methods({

        getTextOverallBorders: function(compLogic) {
            var originalTextDiv = compLogic.getViewNode();
            var textDiv;
            if (originalTextDiv.isVisible()) {
                textDiv = originalTextDiv;
            }
            else {
                var textDiv = originalTextDiv.clone();
                this.getSiteNode().adopt(textDiv);
            }

            var textRectangles = this.getEffectiveTextLayout(textDiv);
            if (!textRectangles || textRectangles.length == 0) {
                if (!originalTextDiv.isVisible()) {
                    textDiv.dispose();
                }

                return textRectangles;
            }

            var top = Number.MAX_VALUE;
            var bottom = -Number.MAX_VALUE;
            var left = Number.MAX_VALUE;
            var right = -Number.MAX_VALUE;

            for (var i=0;i<textRectangles.length; i++) {
                var curRectangle = textRectangles[i];
                top = Math.min(top, curRectangle.top);
                bottom = Math.max(bottom, curRectangle.bottom);
                left = Math.min(left, curRectangle.left);
                right = Math.max(right, curRectangle.right);
            }

            var parentComponentNode = compLogic.getViewNode().getParent('[comp]');
            var parentGlobalPosition = this.getNodeGlobalPosition(parentComponentNode);

            var ret = {
                x: Math.round(left),
                y: Math.round(top) + window.pageYOffset,
                width: Math.round(right) - Math.round(left),
                height: Math.round(bottom) - Math.round(top)
            };

            if (originalTextDiv.isVisible()) {
                ret.y = ret.y - (parentGlobalPosition.y - this.getPositionOffset().y);
                ret.x = ret.x - (parentGlobalPosition.x - this.getPositionOffset().x);
            }

            else {
                ret.x = ret.x - this.getSiteNode().getPosition().x;
                textDiv.dispose();
            }
            return ret;
        },

        /*
        should be overridden
         */
        getNodeGlobalPosition: function(node) {},

        /*
         should be overridden
         */
        getSiteNode: function() {},

        /*
         should be overridden
         */
        getPositionOffset: function() {},

        getEffectiveTextLayout:function(textDiv) {
            var textRectangles = this._getSpanRects(textDiv);
            textRectangles = textRectangles.concat(this._getTextOutOfSpanRects(textDiv));
            return textRectangles;
        },

        _getSpanRects:function(element) {
            var spans = _(element.getElements('span'));
            var rectsLists =
                spans.
                    filter(
                    function spanWithOnlyText(span) {
                        return (span.childNodes.length == 1 && span.firstChild.nodeType == 3);
                    }
                ).map(
                    function(span) {
                        return span.getClientRects();
                    }
                ).value();

            var results = [];
            _.forEach(rectsLists, function(rectsList) {
                this._mergeRectsListIntoArray(results, rectsList);
            }.bind(this));
            return results;
        },

        _mergeRectsListIntoArray: function(array, rectsList) {
            _.forEach(rectsList, function(rect){
                array.push(rect);
            });
        },


        _getTextOutOfSpanRects:function(parent) {
            var results = [];

            for (var i=0; i<parent.childNodes.length; i++) {
                var node = parent.childNodes[i];
                if ( this._shouldWrapInSpan(node)) {
                    var newSpan = new Element('span');
                    newSpan.set('html', this.resources.W.Utils.htmlEncode(node.data));

                    this._replaceNode(parent, newSpan, node);
                    this._mergeRectsListIntoArray(results, newSpan.getClientRects());
                    this._replaceNode(parent, node, newSpan);
                } else {
                    results = results.concat(this._getTextOutOfSpanRects(node));
                }
            }

            return results;
        },

        _shouldWrapInSpan: function (node) {
            // IE10 FIX! Text nodes doesnt have parentElement
            var nodeParent = node.parentElement || node.parentNode;
            return node.nodeType === 3 /*TEXT_NODE*/ &&
                (nodeParent.nodeName != "SPAN" || nodeParent.childNodes.length > 1) && //
                node.data.trim() != "";
        },

        _replaceNode: function (parent, oldNode, newNode) {
            parent.insertBefore(oldNode, newNode.nextSibling);
            parent.removeChild(newNode);
        }
    });
});

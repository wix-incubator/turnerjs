/**
 * @class wysiwyg.common.utils.TextMigrationDomHelper
 */
define.Class('wysiwyg.common.utils.TextMigrationDomHelper', function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.fields({
        _blockElementTags:["audio", "dd", "dt", "li", "video", "address", "article", "aside", "blockquote", "details", "div", "dl", "fieldset", "figure", "footer", "form",
            "h1", "h2", "h3", "h4", "h5", "h6", "header", "hgroup", "hr", "menu", "nav", "ol", "p", "pre", "section", "table", "ul", "center", "dir", "noframes"]
    });

    def.methods({
        renameNode: function (node, newTag) {
            // If it's already correct exit here.
            if (node.tagName.toLowerCase() == newTag.toLowerCase()) {
                return node;
            }

            // Create the new node.
            var newNode = new Element(newTag);

            // Copy all attributes.
            var attributeCollection = node.attributes;
            var attributeArray = this.getAllAttributes(node);
            attributeArray.forEach(function (attr) {
                newNode.setAttribute(attr.name, attr.value);
            });

            // Move children to the new node.
            this.moveChildren(node, newNode);

            // Replace the node.
            node.parentNode && node.parentNode.replaceChild(newNode, node);
            return newNode;
        },

        /**
         *  IE8 - mootools bug, when a mootools element there are round 130 attributes, and the copy method makes functions to be string - no good..
         this is a very partial list of attributes, should suffice for the current use of the function
         * @param element
         */
        getAllAttributes: function(element){
            var attributeCollection = element.attributes;
            var attributeArray = [];
            if(attributeCollection.length < 20){
                attributeArray = this.collectionToArray(attributeCollection);
            }
            else{
                var attrMap = element.getProperties('class', 'style', 'dir', 'href', 'background', 'action', 'src', 'data', 'align', 'alt', 'color', 'face', 'label', 'for' , 'link', 'id', 'name', 'value');
                Object.forEach(attrMap, function(value, key){
                    if(key && value){
                        attributeArray.push({
                            'name': key,
                            'value': value
                        });
                    }
                });
            }
            return attributeArray;
        },

        moveChildren: function (from, target) {
            if (from == target) {
                return;
            }

            var child;
            while (( child = from.firstChild )) {
                target.appendChild(from.removeChild(child));
            }
        },

        collectionToArray: function(col) {
            var arr = Array.slice(col, 0);
            //var arr = Array.prototype.slice.call(col, 0);
            //this is for IE8 which kick out the mootools methods from the child nodes
            for(var i =0; i < arr.length; i++){
                var item = arr[i];
                if(item && item.nodeType && item.nodeType === 1){
                    arr[i] = new Element(item);
                }
            }
            return arr;
        },

        isBlockElement:function (element) {
            var elementTag = element.tagName && element.tagName.toLowerCase();
            return this._blockElementTags.contains(elementTag);
        },

        isOnlyWhiteSpace: function(elements){
            return elements.every(function(el){
                return typeOf(el) === 'whitespace';
            });
        },

        isDomElement: function(element){
            return typeOf(element) === 'element';
        },

        /**
         *
         * @param element
         * @return {Boolean} true only if it's a real text node, not only whitespace
         * @private
         */
        isTextNode: function(element) {
            return typeOf(element) === 'textnode';
        },

        hasBlockElementChildren:function (element) {
            return element.getChildren().some(function (child) {
                return this.isBlockElement(child);
            }, this);
        },

        replaceElementWithItsChildren: function(element){
            var parent = element.parentNode;
            var children = this.collectionToArray(element.childNodes);
            children.each(function(childToAppend) {
                parent.insertBefore(childToAppend, element);
            }, this);
            parent.removeChild(element);
        },

        isElementHasAttributes: function(element){
            var attributes = this.getAllAttributes(element);
            if(!attributes){
                return false;
            }
            for(var i = 0; i < attributes.length; i++){
                var attrVal = attributes[i].value;
                //if attribute has value
                if(!!attrVal){
                    return true;
                }
            }
            return false;
        },

        removeClass: function(element, cssClass){
            element.removeClass(cssClass);
            if(!element.getAttribute('class')){
                element.removeAttribute('class');
            }
        }
    });
});
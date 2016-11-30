define.Class('wysiwyg.common.components.basicmenu.viewer.traits.MenuElementsParser', function(classDefinition) {
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.methods({

        parseElement: function(element) {
            var parsedElement = {};
            parsedElement.item = element.tagName.toLowerCase() === 'li' ? element : element.getElement('li');
            parsedElement.label = element.getElement('a');
            parsedElement.list = element.getElement('ul');

            return parsedElement;
        },

        getLabelElement: function(parentNode) {
            var labelElement,
                childNodes = parentNode.getChildren(),
                labelClassName = 'label';

            for (var i=0; i<childNodes.length; i++) {
                var childNode = childNodes[i];
                if (childNode.tagName.toLowerCase() === 'ul') {
                    return null;
                }
                if (childNode.hasClass(labelClassName)) {
                    return childNode;
                }
                if (childNode.getChildren().length) {
                    labelElement = this.getLabelElement(childNode);
                    if (labelElement) {
                        return labelElement;
                    }
                }
            }
            return null;
        },

        getListElement: function(parentNode) {
            var listElement, childNodes = parentNode.getChildren();

            for (var i=0; i<childNodes.length; i++) {
                var childNode = childNodes[i];
                if (childNode.tagName.toLowerCase() === 'ul') {
                    return childNode;
                }
                if (childNode.getChildren().length) {
                    listElement = this.getListElement(childNode);
                    if (listElement) {
                        return listElement;
                    }
                }
            }
            return null;
        }
    });
});
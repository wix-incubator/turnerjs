define(["lodash"], function (_) {
    'use strict';

    function getTemplateByPosition(positionInParent, templates) {
        if (!templates) {
            return {};
        }
        if (positionInParent === "first" && _.has(templates, "first")) {
            return templates.first;
        } else if (positionInParent === "last" && _.has(templates, "last")) {
            return templates.last;
        }
        return templates.item;
    }

    function getPositionInParent(childIndex, childrenCount) {
        if (childIndex === 0) {
            return 'first';
        } else if (childIndex === childrenCount - 1) {
            return 'last';
        }
        return 'middle';
    }

    /**
     * @class proxies.mixins.templateBasedChildrenProxy
     */
    return {
        getChildTemplateDefinition: function (childIndex, childrenCount) {
            var templates = this.getCompProp("templates");
            var positionInParent = getPositionInParent(childIndex, childrenCount);

            return getTemplateByPosition(positionInParent, templates);
        }
    };
});
